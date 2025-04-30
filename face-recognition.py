import os
import time
import json
import logging
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
#from picamera2 import Picamera2
#import libcamera
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np
import pandas as pd
import cv2
from PIL import Image
from datetime import datetime
from io import BytesIO
import base64

app = FastAPI()
origins = [
    "http://localhost:3000",  # frontend origin
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
workers = 0 if os.name == 'nt' else 2

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
if device == 'cpu':
    # Use OpenCL for Intel UHD Graphics (iGPU) if available
    try:
        device = torch.device('opencl:0')
        print(f'Running on device: {device}')
    except RuntimeError:
        print('No OpenCL device found. Running on CPU.')
else:
    print(f'Running on device: {device}')
#print("Running on device: {}".format(device))
mtcnn = MTCNN(
    image_size = 160, margin = 14, min_face_size =48, keep_all = True,
    thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=True,
    device=device
)
#Define the directory where the models are saved
models_dir = "models"

#list all model files in the directory
model_files = os.listdir(models_dir)
#Function to extract date from filename (mm-dd-yyyy)
def stringToImage(base64_string):
    # Remove the data URI prefix if present
    if "data:image" in base64_string:
        base64_string = base64_string.split(",")[1]

    # Decode the Base64 string into bytes
    imgdata = base64.b64decode(base64_string)
    return Image.open(BytesIO(imgdata)).convert("RGB")
def extract_date_from_filename(filename):
    #Split filename and extract the date part based on (mm-dd-yyyy)
    parts = filename.split("_")
    date_str = parts[2]
    date_str = date_str.split(".")[0]
    return datetime.strptime(date_str, "%m-%d-%Y")
def setup_models(device):
    # Initialize MTCNN for face detection
    mtcnn = MTCNN(
        image_size=160, 
        margin=14, 
        min_face_size=48,
        thresholds=[0.6, 0.7, 0.7], 
        factor=0.709, 
        post_process=True,
        device=device
    )
    mtcnn_live = MTCNN(
        image_size=160, 
        margin=14, 
        min_face_size=48,
        thresholds=[0.6, 0.7, 0.7], 
        keep_all= True,
        factor=0.709, 
        post_process=True,
        device=device
    )
    
    # Initialize InceptionResnetV1 model for face recognition
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    
    return mtcnn, mtcnn_live, resnet
    
TRAIN_LOG = "training.json"
load_data = torch.load('data.pt')
embedding_list = load_data[0]
names = load_data[1]
print("Loaded data.pt")
def load_saved_embeddings(saved_faces_path, mtcnn, resnet, device):
    # Load the saved faces dataset
    dataset = datasets.ImageFolder(saved_faces_path)
    idx_to_class = {i: c for c, i in dataset.class_to_idx.items()}
    
    # Create embeddings for saved faces
    saved_embeddings = []
    saved_names = []
    
    for img_path, class_idx in dataset.samples:
        img = datasets.folder.default_loader(img_path)
        face = mtcnn(img)
        
        if face is not None:
            face = face.to(device)
            embedding = resnet(face.unsqueeze(0))
            saved_embeddings.append(embedding.detach().cpu())
            saved_names.append(idx_to_class[class_idx])
    
    return torch.cat(saved_embeddings), saved_names

def load_last_training_record():
    if os.path.exists(TRAIN_LOG):
        with open(TRAIN_LOG, 'r') as config_file:
            config_data = json.load(config_file)
            return config_data.get('Status'), config_data.get('Last_Finetuning')
    return None, None

def find_best_match(embedding, saved_embeddings, saved_names, threshold=1.0):
    # Calculate distances between the detected face and all saved faces
    distances = [(e - embedding).norm().item() for e in saved_embeddings]
    min_dist_idx = np.argmin(distances)
    min_dist = distances[min_dist_idx]
    
    if min_dist < threshold:
        name = saved_names[min_dist_idx]
        accuracy = 1 - (min_dist / 2)  # Convert distance to a similarity score
        return name, accuracy
    
    return "", 0
mtcnn, mtcnn_live, resnet = setup_models(device)
saved_faces_path = 'saved_faces'
saved_embeddings, saved_names = load_saved_embeddings(saved_faces_path, mtcnn, resnet, device)
#Define the directory where the models are saved
models_dir = "models"
model_files = os.listdir(models_dir)
#Find the model file with latest date
latest_model_file = None
latest_date = None
for filename in model_files:
    if filename.endswith(".pt"):
        date = extract_date_from_filename(filename)
        if latest_date is None or date > latest_date:
            latest_model_file = filename
            latest_date = date
data_dir = 'saved_faces'            
dataset = datasets.ImageFolder(data_dir, transform=transforms.Resize((512, 512)))
            
if latest_model_file:
    model_path = os.path.join(models_dir, latest_model_file)
    model = InceptionResnetV1(
        classify = True,
        pretrained='vggface2',
        num_classes=len(dataset.class_to_idx)
    )
    model.load_state_dict(torch.load(f=model_path))
    model.eval().to(device)
    print(f"Loaded model {model_path} to {device}")
else:
    print("No model found in the specified directory")
    
try:
    load_data = torch.load('data.pt')
    embedding_list = load_data[0]
    names = load_data[1]
except IndexError as e:
    print(f"Error accessing data.pt: {e}")
print(f"")
print(f"names: {names}")
print("Loaded data.pt")
# dist_list=[]
# min_dist = float('inf')
# min_dist_idx=-1
name=''
# color=(0,0,0)
# start_time = time.time()
# frame_skip=30
# prev_boxes=None
# face_detected=False
class ImageData(BaseModel):
    image: str  # base64 string
    def decode_image(self):
        try:
            if "data:image" in self.image:
                base64_string = self.image.split(",")[1]

                # Decode the Base64 string into bytes
                imgdata = base64.b64decode(base64_string)
            return Image.open(BytesIO(imgdata)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
@app.post("/inference")
async def inference(request: ImageData):
    try:
        # Extract base64 string
        pil_image = request.decode_image()
        frame = np.array(pil_image)

        face, probs = mtcnn_live(frame, return_prob=True)
        
        if face is not None:
            boxes, _ = mtcnn.detect(frame)
            for i, prob in enumerate(probs):
                if prob > 0.90:
                    embedding = resnet(face[i].unsqueeze(0)).detach().cpu()
                    box = boxes[i]
                    name, accuracy = find_best_match(embedding, saved_embeddings, saved_names)
            
                    detections_data = [
                        {
                            "box0": int(box[0]),
                            "box1": int(box[1]),
                            "box2": int(box[2]),
                            "box3": int(box[3]),
                            "label": name,
                            "confidence": accuracy,
                        }
                    ]
                    return JSONResponse(content=detections_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
