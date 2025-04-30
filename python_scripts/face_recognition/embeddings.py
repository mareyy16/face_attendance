import torch
from torchvision import datasets
from torch.utils.data import DataLoader
import os

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