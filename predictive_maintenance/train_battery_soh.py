import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
PLOTS_DIR = os.path.join(BASE_DIR, 'plots')
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

class BatterySoHPredictor(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(4, 16, kernel_size=7, padding=3),
            nn.ReLU(),
            nn.Conv1d(16, 32, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.Conv1d(32, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        self.fc = nn.Sequential(
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.conv(x)
        x = x.squeeze(-1)
        x = self.fc(x)
        return x

def train():
    X = np.load(os.path.join(DATA_DIR, 'battery_X.npy'))
    y = np.load(os.path.join(DATA_DIR, 'battery_y.npy'))
    
    split_idx = int(len(X) * 0.8)
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_val, y_val = X[split_idx:], y[split_idx:]
    
    train_ds = TensorDataset(torch.FloatTensor(X_train), torch.FloatTensor(y_train))
    val_ds = TensorDataset(torch.FloatTensor(X_val), torch.FloatTensor(y_val))
    
    train_loader = DataLoader(train_ds, batch_size=64, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=64)
    
    model = BatterySoHPredictor().cuda() if torch.cuda.is_available() else BatterySoHPredictor()
    device = next(model.parameters()).device
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 100
    train_losses = []
    
    print("Training Battery SoH Predictor...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            out = model(batch_x)
            loss = criterion(out, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        train_loss /= len(train_loader)
        train_losses.append(train_loss)
        if (epoch+1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} | Loss: {train_loss:.4f}")
            
    torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'battery_soh.pt'))
    
    model.eval()
    all_preds, all_targets = [], []
    with torch.no_grad():
        for batch_x, batch_y in val_loader:
            batch_x = batch_x.to(device)
            preds = model(batch_x).cpu()
            all_preds.append(preds)
            all_targets.append(batch_y)
            
    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)
    
    plt.figure()
    plt.plot(train_losses)
    plt.title('Battery SoH Training Loss')
    plt.savefig(os.path.join(PLOTS_DIR, 'battery_training_loss.png'))
    plt.close()
    
    plt.figure()
    plt.scatter(all_targets.numpy(), all_preds.numpy(), alpha=0.5)
    plt.plot([0, 1], [0, 1], 'r--')
    plt.xlabel('Actual SoH')
    plt.ylabel('Predicted SoH')
    plt.title('Battery Predicted vs Actual SoH')
    plt.savefig(os.path.join(PLOTS_DIR, 'battery_soh_scatter.png'))
    plt.close()

if __name__ == "__main__":
    train()
