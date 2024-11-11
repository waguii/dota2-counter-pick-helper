import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
import numpy as np
import cv2
import pyautogui
import time
from PIL import Image
import os
from pathlib import Path

class Dota2Dataset(Dataset):
    def __init__(self, data_dir, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.classes = sorted([d.name for d in self.data_dir.iterdir() if d.is_dir()])
        self.class_to_idx = {cls: i for i, cls in enumerate(self.classes)}
        
        self.images = []
        self.labels = []
        
        # Carregar imagens e labels
        for class_name in self.classes:
            class_dir = self.data_dir / class_name
            for img_path in class_dir.glob('*.png'):
                self.images.append(str(img_path))
                self.labels.append(self.class_to_idx[class_name])
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        
        image = Image.open(img_path).convert('RGB')
        if self.transform:
            image = self.transform(image)
            
        return image, label
    
dataset = Dota2Dataset(data_dir='/hero_dataset')