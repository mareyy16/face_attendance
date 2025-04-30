from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization, training    
import torch
import sys
from torch.utils.data import DataLoader, SubsetRandomSampler
from torch import optim
from torch.optim.lr_scheduler import MultiStepLR
from torch.utils.tensorboard import SummaryWriter
from torchvision import datasets, transforms
from datetime import datetime
from pathlib import Path
import time
import pytz
import numpy as np
import os
import json
import random
TRAIN_LOG = "training.json"
def save_training_record(fineTuningStartTime, status):
    training_record = {
        "Last_Finetuning": fineTuningStartTime,
        "Status": status
    }
    with open(TRAIN_LOG, "w") as train_conf:
        json.dump(training_record, train_conf, indent=4)
    print("Saved training log in json file")
def count_immediate_folders(parent_folder):
    try:
        # List all entries in the parent_folder
        entries = os.listdir(parent_folder)
        
        # Filter only directories
        subfolders = [entry for entry in entries if os.path.isdir(os.path.join(parent_folder, entry))]
        
        # Count and return the number of subfolders
        return len(subfolders)
    except FileNotFoundError:
        print(f"The folder '{parent_folder}' does not exist.")
        return 0
    except Exception as e:
        print(f"An error occurred: {e}")
        return 0
def main():
    # global batch_count
    # print(f"Batch count: {batch_count}")
    status = "Failed"
    start = datetime.now(pytz.timezone('Asia/Manila')).strftime("%m/%d/%Y %H:%M:%S")
    try:
        global started_training
        started_training = "started training..."
        print(started_training)
        global startTraining
        global needToTrain
        now = datetime.now()
        formatted_date = now.strftime("%m-%d-%Y")
        model_filename = f"model_trained_{formatted_date}.pt"
        model_path = Path("models")
        model_path.mkdir(parents=True, exist_ok=True)
        model_save_path = model_path / model_filename
        data_dir = './saved_faces'
        batch_size = 10#count_immediate_folders(data_dir)#32
        epochs = 15#count_immediate_folders(data_dir)*3#32
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
        #print('Running on device: {}'.format(device))
        mtcnn = MTCNN(
            image_size=160, margin=14, min_face_size=100,
            thresholds=[0.6, 0.7, 0.7], factor=0.709, post_process=True,
            device=device
        )
        dataset = datasets.ImageFolder(data_dir, transform=transforms.Resize((512, 512)))
        dataset.samples = [
            (p, p.replace(data_dir, data_dir + '_cropped'))
            for p, _ in dataset.samples
        ]
        loader = DataLoader(
            dataset,
            num_workers=workers,
            batch_size=batch_size,
            collate_fn=training.collate_pil
        )
        for i, (x, y) in enumerate(loader):
            mtcnn(x, save_path=y)
            print('\rBatch {} of {}'.format(i+1, len(loader)), end='')
            # print(f"Image {i+1} - Filename: {dataset.samples[i][0]}")
        #Remove mtcnn to reduce GPU memory usage
        del mtcnn

        resnet = InceptionResnetV1(
            classify = True,
            pretrained='vggface2',
            num_classes=len(dataset.class_to_idx)
        ).to(device)
        print(f"\nClasses: {dataset.class_to_idx}")
        optimizer = optim.Adam(resnet.parameters(), lr=0.001)
        scheduler = MultiStepLR(optimizer, [5, 10])

        trans = transforms.Compose([
            np.float32,
            transforms.ToTensor(),
            fixed_image_standardization
        ])
        dataset = datasets.ImageFolder(data_dir + '_cropped', transform=trans)
        img_inds = np.arange(len(dataset))
        np.random.shuffle(img_inds)
        train_inds = img_inds[:int(0.8 * len(img_inds))]
        val_inds = img_inds[int(0.8 * len(img_inds)):]
        train_loader = DataLoader(
            dataset,
            num_workers = workers,
            batch_size = batch_size,
            sampler = SubsetRandomSampler(train_inds)
        )
        # for i, (inputs, targets) in enumerate(train_loader):
        #     print(f"Batch {i+1} - Targets: {targets}")
        val_loader = DataLoader(
            dataset,
            num_workers = workers,
            batch_size = batch_size,
            sampler = SubsetRandomSampler(val_inds)
        )

        loss_fn = torch.nn.CrossEntropyLoss()
        metrics = {
            'fps': training.BatchTimer(),
            'acc': training.accuracy
        }
        #Train model
        # writer = SummaryWriter()
        # writer.iteration, writer.interval = 0, 10
        time_now = datetime.now()
        formatted_time = time_now.strftime("%H-%M-%S")
        log_filename = f'fine-tuning-training-logs-{formatted_date}_{formatted_time}.txt'
        log_path = Path("Training-Logs")
        log_path.mkdir(parents=True, exist_ok=True)
        log_save_path = log_path / log_filename
        sys.stdout = open(log_save_path, 'w')     
        print("\nTraining Start time: ", formatted_time)

        print('\n\nInitial')
        print('-' * 10)

        print('Training Parameters:')
        print(f"batch_size = {batch_size}")
        print(f"epochs = {epochs}")
        print(f"workers = {workers}")
        print(f"device = {device}\n")
        print('-' * 10)

        resnet.eval()

        training.pass_epoch(
            resnet, loss_fn, val_loader,
            batch_metrics = metrics, show_running = True, device = device,
            # writer = writer
        )
        for epoch in range(epochs):
            print('\nEpoch {}/{}'.format(epoch + 1, epochs))
            print('-' * 10)
            #training mode
            resnet.train()
            training.pass_epoch(
                resnet, loss_fn, train_loader, optimizer, scheduler,
                batch_metrics = metrics, show_running = True, device = device,
                # writer = writer
            )
            #evaluation mode
            resnet.eval()
            training.pass_epoch(
                resnet, loss_fn, val_loader,
                batch_metrics = metrics, show_running = True, device = device,
                # writer = writer
            )
        time_now = datetime.now()
        formatted_time = time_now.strftime("%H-%M-%S")
        print("\nTraining time finished: ", formatted_time)    
        sys.stdout.close()
        sys.stdout = sys.__stdout__
        # writer.close()
        #Saving our finetuned model
        torch.save(obj=resnet.state_dict(), f=model_save_path)
        print(f'\nModel state dictionary saved to {model_save_path}')
        mtcnn = MTCNN(
            image_size = 160, margin = 14, min_face_size = 20,
            thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=True,
            device=device
        )
        started_training = None

        def collate_fn(x):
            return x[0]

        data = datasets.ImageFolder('saved_faces')
        data.idx_to_class = {i:c for c, i in data.class_to_idx.items()}
        data_loader = DataLoader(data, collate_fn = collate_fn, num_workers = workers)
        aligned = []
        names = []
        for x, y in data_loader:
            x_aligned, prob = mtcnn(x, return_prob=True)
            if x_aligned is not None:
                emb = resnet(x_aligned.unsqueeze(0))
                aligned.append(emb)
                names.append(data.idx_to_class[y])

        save_data = [aligned, names]
        torch.save(save_data, 'data.pt')
        print('Data saved as data.pt')
        startTraining = False
        needToTrain = False
        print("finished training...")
        status = "Successful"
        global number_of_faces_registered
        number_of_faces_registered = count_immediate_folders(data_dir)
        save_training_record(start,status)
    except Exception as e:
        print(f"Error encountered during training: {e}")
        status = "Failed"
        save_training_record(start,status)
        return (f'Error encountered during training: {e}')
    finally:
        return status

if __name__ == "__main__":
    # Call the main function
    main()