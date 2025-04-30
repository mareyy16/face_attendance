import cv2
import torch
import numpy as np

def find_best_match(embedding, saved_embeddings, saved_names, threshold=1.0):
    # Calculate distances between the detected face and all saved faces
    distances = [(e - embedding).norm().item() for e in saved_embeddings]
    min_dist_idx = np.argmin(distances)
    min_dist = distances[min_dist_idx]
    
    if min_dist < threshold:
        name = saved_names[min_dist_idx]
        accuracy = 1 - (min_dist / 2)  # Convert distance to a similarity score
        return name, accuracy, min_dist
    
    return "Unknown", 0, min_dist

def run_face_recognition(mtcnn, mtcnn_live, resnet, saved_embeddings, saved_names, device):
    # Initialize webcam
    camera = cv2.VideoCapture(0)
    camera.set(3, 854)
    camera.set(4, 480)
    
    try:
        while True:
            ret, frame = camera.read()
            if not ret:
                continue
                
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Detect face and get embedding
            face, probs = mtcnn_live(rgb_frame, return_prob=True)
            if face is not None:
                boxes, _ = mtcnn.detect(rgb_frame)
                for i, prob in enumerate(probs):
                    if prob > 0.93:
                        face = face.to(device)
                        embedding = resnet(face[i].unsqueeze(0)).detach().cpu()
                        box = boxes[i]
                        # Find best match
                        name, accuracy, distance = find_best_match(
                            embedding, 
                            saved_embeddings, 
                            saved_names
                        )
                        
                        # Display results
                        text = f"Name: {name}| Confidence: {distance:.2%}" #distance:.2f Accuracy: {accuracy:.2%} 
                        cv2.putText(
                            frame, 
                            text, 
                            (int(box[0]),int(box[1])), 
                            cv2.FONT_HERSHEY_SIMPLEX, 
                            0.6, 
                            (0, 255, 0), 
                            2
                        )
                        frame = cv2.rectangle(
                            frame, 
                            (int(box[0]),int(box[1])),(int(box[2]),int(box[3])),
                            (0, 255, 0),
                            2
                        ) 
            
            cv2.imshow('Face Recognition', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        camera.release()
        cv2.destroyAllWindows()