from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

def setup_models(device):
    # Initialize MTCNN for face detection
    mtcnn = MTCNN(
        image_size=160, 
        margin=14, 
        min_face_size=20,
        thresholds=[0.6, 0.7, 0.7], 
        # keep_all= True,
        factor=0.709, 
        post_process=True,
        device=device
    )
    mtcnn_live = MTCNN(
        image_size=160, 
        margin=14, 
        min_face_size=20,
        thresholds=[0.6, 0.7, 0.7], 
        keep_all= True,
        factor=0.709, 
        post_process=True,
        device=device
    )
    
    # Initialize InceptionResnetV1 model for face recognition
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    
    return mtcnn, mtcnn_live, resnet