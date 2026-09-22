import torch
import torch.nn as nn
import torch.optim as optim
import itertools

# ==========================================
# 1. GENERATOR (ResNet-9 block architecture)
# Converts Domain A (Optical) -> Domain B (Sonar)
# ==========================================
class ResidualBlock(nn.Module):
    def __init__(self, in_features):
        super(ResidualBlock, self).__init__()
        self.block = nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(in_features, in_features, 3),
            nn.InstanceNorm2d(in_features),
            nn.ReLU(inplace=True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(in_features, in_features, 3),
            nn.InstanceNorm2d(in_features)
        )

    def forward(self, x):
        return x + self.block(x)

class Generator(nn.Module):
    def __init__(self, input_nc=3, output_nc=3, n_residual_blocks=9):
        super(Generator, self).__init__()
        # Initial convolution block
        model = [
            nn.ReflectionPad2d(3),
            nn.Conv2d(input_nc, 64, 7),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True)
        ]
        # Downsampling
        in_features = 64
        out_features = in_features * 2
        for _ in range(2):
            model += [
                nn.Conv2d(in_features, out_features, 3, stride=2, padding=1),
                nn.InstanceNorm2d(out_features),
                nn.ReLU(inplace=True)
            ]
            in_features = out_features
            out_features = in_features * 2
        # Residual blocks
        for _ in range(n_residual_blocks):
            model += [ResidualBlock(in_features)]
        # Upsampling
        out_features = in_features // 2
        for _ in range(2):
            model += [
                nn.ConvTranspose2d(in_features, out_features, 3, stride=2, padding=1, output_padding=1),
                nn.InstanceNorm2d(out_features),
                nn.ReLU(inplace=True)
            ]
            in_features = out_features
            out_features = in_features // 2
        # Output layer
        model += [nn.ReflectionPad2d(3), nn.Conv2d(64, output_nc, 7), nn.Tanh()]
        self.model = nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

# ==========================================
# 2. DISCRIMINATOR (PatchGAN)
# Checks if an image is real sonar or fake synthetic
# ==========================================
class Discriminator(nn.Module):
    def __init__(self, input_nc=3):
        super(Discriminator, self).__init__()
        model = [
            nn.Conv2d(input_nc, 64, 4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True)
        ]
        model += [
            nn.Conv2d(64, 128, 4, stride=2, padding=1),
            nn.InstanceNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True)
        ]
        model += [
            nn.Conv2d(128, 256, 4, stride=2, padding=1),
            nn.InstanceNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True)
        ]
        model += [
            nn.Conv2d(256, 512, 4, padding=1),
            nn.InstanceNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True)
        ]
        # Output 1-channel prediction map (PatchGAN)
        model += [nn.Conv2d(512, 1, 4, padding=1)]
        self.model = nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

# ==========================================
# 3. MOCK TRAINING LOOP EXPLANATION
# ==========================================
if __name__ == "__main__":
    print("CYCLEGAN ARCHITECTURE INITIALIZED.")
    print("To train this model on Unreal Engine -> Sonar Images:")
    print("1. Initialize G_AB (Optical->Sonar) and G_BA (Sonar->Optical)")
    print("2. Initialize D_A (Optical Discriminator) and D_B (Sonar Discriminator)")
    print("3. Define Losses: Adversarial Loss (MSE), Cycle Consistency Loss (L1), Identity Loss (L1)")
    print("4. Use Adam optimizer with lr=0.0002")
    
    # Example initialization:
    G_AB = Generator()
    D_B = Discriminator()
    print(f"Generator Parameters: {sum(p.numel() for p in G_AB.parameters())}")
    print(f"Discriminator Parameters: {sum(p.numel() for p in D_B.parameters())}")
