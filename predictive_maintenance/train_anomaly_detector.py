import os
import json
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

class LSTMAutoencoder(nn.Module):
    def __init__(self, n_features, hidden_dim=64, latent_dim=32):
        super().__init__()
        self.encoder1 = nn.LSTM(n_features, hidden_dim, batch_first=True)
        self.encoder2 = nn.LSTM(hidden_dim, latent_dim, batch_first=True)
        
        self.decoder1 = nn.LSTM(latent_dim, hidden_dim, batch_first=True)
        self.decoder2 = nn.LSTM(hidden_dim, n_features, batch_first=True)
        
    def forward(self, x):
        x, _ = self.encoder1(x)
        x, (hidden, _) = self.encoder2(x)
        
        seq_len = x.shape[1]
        hidden = hidden[-1].unsqueeze(1).repeat(1, seq_len, 1)
        
        x, _ = self.decoder1(hidden)
        x, _ = self.decoder2(x)
        return x

def train():
    X = np.load(os.path.join(DATA_DIR, 'X_healthy.npy'))
    X = torch.FloatTensor(X)
    
    dataset = TensorDataset(X, X)
    loader = DataLoader(dataset, batch_size=64, shuffle=True)
    
    model = LSTMAutoencoder(n_features=X.shape[2]).cuda() if torch.cuda.is_available() else LSTMAutoencoder(n_features=X.shape[2])
    device = next(model.parameters()).device
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 50
    patience = 10
    best_loss = float('inf')
    early_stop_counter = 0
    
    losses = []
    print("Training Anomaly Detector...")
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        for batch_x, _ in loader:
            batch_x = batch_x.to(device)
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_x)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
        avg_loss = epoch_loss / len(loader)
        losses.append(avg_loss)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.6f}")
        
        if avg_loss < best_loss:
            best_loss = avg_loss
            early_stop_counter = 0
            torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'anomaly_detector.pt'))
        else:
            early_stop_counter += 1
            if early_stop_counter >= patience:
                print("Early stopping triggered")
                break
                
    # Calculate threshold
    model.load_state_dict(torch.load(os.path.join(MODELS_DIR, 'anomaly_detector.pt'), map_location=device))
    model.eval()
    with torch.no_grad():
        X_device = X.to(device)
        recon = model(X_device)
        errors = torch.mean((recon - X_device)**2, dim=(1,2)).cpu().numpy()
        
    threshold = np.percentile(errors, 99)
    print(f"Anomaly threshold (99th percentile): {threshold:.6f}")
    
    with open(os.path.join(MODELS_DIR, 'anomaly_threshold.json'), 'w') as f:
        json.dump({'threshold': float(threshold)}, f)
        
    # Plot loss
    plt.figure()
    plt.plot(losses)
    plt.title('Training Loss (Anomaly Detector)')
    plt.savefig(os.path.join(PLOTS_DIR, 'anomaly_training_loss.png'))
    plt.close()
    
    # Plot error dist
    plt.figure()
    plt.hist(errors, bins=50)
    plt.axvline(threshold, color='r', linestyle='dashed', linewidth=2)
    plt.title('Reconstruction Error Distribution')
    plt.savefig(os.path.join(PLOTS_DIR, 'anomaly_error_dist.png'))
    plt.close()

if __name__ == "__main__":
    train()
