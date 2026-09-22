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

def asymmetric_mse(pred, target):
    diff = pred - target
    weights = torch.where(diff < 0, 2.0, 1.0)
    return (weights * diff ** 2).mean()

def nasa_score(pred, target):
    diff = pred - target
    score = torch.where(diff < 0, torch.exp(-diff/13.0) - 1, torch.exp(diff/10.0) - 1)
    return score.sum().item()

class CNNLSTM_RUL(nn.Module):
    def __init__(self, n_features, seq_len=50):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(n_features, 32, kernel_size=5, padding=2),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(2)
        )
        self.lstm = nn.LSTM(64, 128, num_layers=2, dropout=0.3, batch_first=True)
        self.fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1)
        )
        
    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.conv(x)
        x = x.transpose(1, 2)
        _, (h, _) = self.lstm(x)
        out = self.fc(h[-1])
        return out

def train():
    X_train = np.load(os.path.join(DATA_DIR, 'X_train.npy'))
    y_train = np.load(os.path.join(DATA_DIR, 'y_train.npy'))
    X_val = np.load(os.path.join(DATA_DIR, 'X_val.npy'))
    y_val = np.load(os.path.join(DATA_DIR, 'y_val.npy'))
    
    train_ds = TensorDataset(torch.FloatTensor(X_train), torch.FloatTensor(y_train))
    val_ds = TensorDataset(torch.FloatTensor(X_val), torch.FloatTensor(y_val))
    
    train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=128)
    
    model = CNNLSTM_RUL(n_features=X_train.shape[2]).cuda() if torch.cuda.is_available() else CNNLSTM_RUL(n_features=X_train.shape[2])
    device = next(model.parameters()).device
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5)
    
    epochs = 80
    patience = 15
    best_val_loss = float('inf')
    early_stop_counter = 0
    
    train_losses = []
    val_losses = []
    
    print("Training RUL Predictor...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            out = model(batch_x)
            loss = asymmetric_mse(out, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        train_loss /= len(train_loader)
        train_losses.append(train_loss)
        
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                out = model(batch_x)
                loss = asymmetric_mse(out, batch_y)
                val_loss += loss.item()
                
        val_loss /= len(val_loader)
        val_losses.append(val_loss)
        scheduler.step(val_loss)
        
        print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            early_stop_counter = 0
            torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'rul_predictor.pt'))
        else:
            early_stop_counter += 1
            if early_stop_counter >= patience:
                print("Early stopping triggered")
                break
                
    model.load_state_dict(torch.load(os.path.join(MODELS_DIR, 'rul_predictor.pt'), map_location=device))
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
    
    rmse = torch.sqrt(torch.mean((all_preds - all_targets)**2)).item()
    mae = torch.mean(torch.abs(all_preds - all_targets)).item()
    score = nasa_score(all_preds, all_targets)
    
    print(f"Validation RMSE: {rmse:.4f}")
    print(f"Validation MAE: {mae:.4f}")
    print(f"Validation NASA Score: {score:.4f}")
    
    plt.figure()
    plt.plot(train_losses, label='Train')
    plt.plot(val_losses, label='Validation')
    plt.legend()
    plt.title('RUL Training Loss')
    plt.savefig(os.path.join(PLOTS_DIR, 'rul_training_loss.png'))
    plt.close()
    
    plt.figure()
    plt.scatter(all_targets.numpy(), all_preds.numpy(), alpha=0.5)
    plt.plot([0, 125], [0, 125], 'r--')
    plt.xlabel('Actual RUL')
    plt.ylabel('Predicted RUL')
    plt.title('Predicted vs Actual RUL')
    plt.savefig(os.path.join(PLOTS_DIR, 'rul_scatter.png'))
    plt.close()
    
    plt.figure()
    for i in range(3):
        start_idx = i * 200 
        end_idx = min((i+1)*200, len(all_targets))
        if start_idx >= len(all_targets): break
        plt.plot(all_targets[start_idx:end_idx].numpy(), label=f'Actual {i}')
        plt.plot(all_preds[start_idx:end_idx].numpy(), label=f'Pred {i}', linestyle='dashed')
    plt.legend()
    plt.title('RUL Timeline Sample')
    plt.savefig(os.path.join(PLOTS_DIR, 'rul_timeline.png'))
    plt.close()

if __name__ == "__main__":
    train()
