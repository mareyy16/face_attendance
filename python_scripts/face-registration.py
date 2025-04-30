from facenet_pytorch import MTCNN
import torch
import cv2
from PIL import Image, ImageEnhance
import numpy as np
import os
import sys
import base64
import json
from PIL import Image
from io import BytesIO
import io
import random
### SETUP:
# python -m venv .venv
# .venv/Scripts/activate
# pip install facenet-pytorch
# pip3 install torch torchvision tensorboard opencv-python pandas pillow
# python.exe -m pip install --upgrade pip
# pip install fastapi uvicorn opencv-python

TRAIN_LOG = "training.json"
# Take in base64 string and return PIL image
def stringToImage(base64_string):
    # Remove the data URI prefix if present
    if "data:image" in base64_string:
        base64_string = base64_string.split(",")[1]

    # Decode the Base64 string into bytes
    imgdata = base64.b64decode(base64_string)
    return Image.open(BytesIO(imgdata))

def save_training_record(fineTuningStartTime, status):
    global number_of_faces_registered

    training_record = {
        "Last_Finetuning": fineTuningStartTime,
        "Status": status,
        "FaceCount": number_of_faces_registered
    }
    with open(TRAIN_LOG, "w") as train_conf:
        json.dump(training_record, train_conf, indent=4)
    print("Saved training log in json file")

def process_and_save_face(label, frames): #label is the username of the peer (tenant), farmes is the frames sent by the peer
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    # print ('Running on device: {}'.format(device))
    # Load MTCNN for face detection
    mtcnn = MTCNN(margin=6, select_largest=False, post_process=False, device=device)
    base_folder = "saved_faces"
    frame_number = 1
    rand_angle = -24
    for i, frame_data in enumerate(frames):
        # print("Data type of frame_data:", type(frame_data)) 
        try:
            if frame_data == "data:,":
                # print(f"Skipping empty frame {i + 1}")
                continue 
                
            pil_image = stringToImage(frame_data)
            frame = np.array(pil_image) 
            
            folder_path = os.path.join(base_folder, label)
            try:
                os.mkdir(folder_path)
                # print(f"Folder '{label}' created successfully in '{base_folder}'.")
            except:
                # print(f"Folder '{label}' already exists in 'base_folder'.")
                pass
            img_cropped_list, probs = mtcnn(frame, return_prob=True)
            if img_cropped_list is not None:
                if probs > 0.9999:
                    rand_angle = rand_angle + random.randint(6, 10)
                    image = Image.fromarray(frame)
                    rotated_image = image.rotate(rand_angle)
                    rotated_frame = np.array(rotated_image)
                    save_paths=[f'{folder_path}/image_{frame_number}.jpeg']
                    faces = mtcnn(frame, save_path=save_paths)
                    for path in save_paths:
                        if frame_number < 6:
                            save_paths_rot=[f'{folder_path}/rotated_image_{frame_number}.jpeg']
                            faces_rotated = mtcnn(rotated_frame, save_path=save_paths_rot)
                        faceImage = Image.open(path)
                        enhancer = ImageEnhance.Brightness(faceImage)
                        factor = 1.2
                        brightImage = enhancer.enhance(factor)
                        brightImage.save(f'{folder_path}/brighter_image_{frame_number}.jpeg')
                        factor = 0.8
                        darkImage = enhancer.enhance(factor)
                        darkImage.save(f'{folder_path}/darker_image_{frame_number}.jpeg')
                    if frame_number >= 5:
                        return "Face registered successfully!"
                    frame_number += 1
                else:
                    return "Face registration failed."
                    
        except Exception as e:
            return f"Error processing frame {i + 1}: {e}"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        # print("Usage: python python_script.py <label>", file=sys.stderr)
        sys.exit(1)  # Exit with an error code

    label = sys.argv[1]
    frames = [] 

    # Read frames from stdin
    for line in sys.stdin:
        frame_data = line.strip()
        frames.append(frame_data)
    
    result = process_and_save_face(label, frames)
    print(result)