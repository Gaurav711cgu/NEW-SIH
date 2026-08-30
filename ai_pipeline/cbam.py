"""
CBAM — Convolutional Block Attention Module
Paper: Woo et al., ECCV 2018
SSS Relevance: +4-7% mAP50 on SCTD benchmarks (IEEE Oceanic Eng 2024)

Forces backbone to attend to BOTH target highlight AND acoustic shadow.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class ChannelAttention(nn.Module):
    """Channel attention: learns to suppress speckle noise frequencies."""
    def __init__(self, channels: int, reduction: int = 16):
        super().__init__()
        mid = max(channels // reduction, 4)
        self.mlp = nn.Sequential(
            nn.Flatten(),
            nn.Linear(channels, mid, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(mid, channels, bias=False),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        avg = self.mlp(F.adaptive_avg_pool2d(x, 1).squeeze(-1).squeeze(-1))
        mx  = self.mlp(F.adaptive_max_pool2d(x, 1).squeeze(-1).squeeze(-1))
        return x * torch.sigmoid(avg + mx).unsqueeze(-1).unsqueeze(-1)


class SpatialAttention(nn.Module):
    """Spatial attention: explicitly learns highlight-shadow co-occurrence."""
    def __init__(self, kernel_size: int = 7):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size, padding=kernel_size // 2, bias=False)
        self.bn   = nn.BatchNorm2d(1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        avg = x.mean(dim=1, keepdim=True)
        mx, _ = x.max(dim=1, keepdim=True)
        return x * torch.sigmoid(self.bn(self.conv(torch.cat([avg, mx], dim=1))))


class CBAM(nn.Module):
    """Full CBAM: Channel → Spatial in series."""
    def __init__(self, channels: int, reduction: int = 16, kernel_size: int = 7):
        super().__init__()
        self.channel = ChannelAttention(channels, reduction)
        self.spatial = SpatialAttention(kernel_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.spatial(self.channel(x))


class ECABlock(nn.Module):
    """
    ECA-Net (Wang et al., CVPR 2020) — near-zero overhead channel attention.
    Used in 2024 real-time AUV deployment papers (Jiang et al., Ocean Engineering).
    """
    def __init__(self, channels: int):
        super().__init__()
        import math
        t = int(abs(math.log2(channels) / 1 + 1 / 1))
        k = t if t % 2 else t + 1
        self.avg  = nn.AdaptiveAvgPool2d(1)
        self.conv = nn.Conv1d(1, 1, kernel_size=k, padding=k // 2, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        y = self.avg(x).squeeze(-1).transpose(-1, -2)
        y = self.conv(y).transpose(-1, -2).unsqueeze(-1)
        return x * torch.sigmoid(y)


if __name__ == '__main__':
    x = torch.randn(2, 256, 40, 40)
    print('CBAM:', CBAM(256)(x).shape)
    print('ECA: ', ECABlock(256)(x).shape)
    print('Attention modules OK')
