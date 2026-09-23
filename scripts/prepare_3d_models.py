#!/usr/bin/env python3
"""
scripts/prepare_3d_models.py
Generates and downloads AAA 3D models for AQUILA Antarctic Simulation.
All assets stored in frontend/public/models/
"""
import os, sys, json, struct, urllib.request, tarfile, io
import numpy as np

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/public/models'))
os.makedirs(MODELS_DIR, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0'}

def prepare_iceberg():
    out_path = os.path.join(MODELS_DIR, 'iceberg.glb')
    if os.path.exists(out_path) and os.path.getsize(out_path) > 100000:
        print(f"[OK] iceberg.glb already exists ({os.path.getsize(out_path)} bytes)")
        return
    print("[1/3] Downloading realistic Antarctic iceberg from @aleyan/iceberg...")
    url = 'https://registry.npmjs.org/@aleyan/iceberg/-/iceberg-0.1.0.tgz'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        tar = tarfile.open(fileobj=io.BytesIO(resp.read()), mode='r:gz')
        glb_data = tar.extractfile('package/assets/models/iceberg-web.glb').read()
    with open(out_path, 'wb') as f:
        f.write(glb_data)
    print(f" -> Saved {out_path} ({len(glb_data)} bytes)")

def prepare_abyssal_rock():
    out_path = os.path.join(MODELS_DIR, 'abyssal_rock.glb')
    if os.path.exists(out_path) and os.path.getsize(out_path) > 100000:
        print(f"[OK] abyssal_rock.glb already exists ({os.path.getsize(out_path)} bytes)")
        return
    print("[2/3] Fetching CC0 photogrammetry rock from Poly Haven...")
    meta_url = 'https://api.polyhaven.com/files/moon_rock_01'
    req = urllib.request.Request(meta_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        meta = json.load(resp)
    gltf_info = meta['gltf']['1k']['gltf']
    
    tmp_dir = '/tmp/polyhaven_rock'
    os.makedirs(os.path.join(tmp_dir, 'textures'), exist_ok=True)
    
    with urllib.request.urlopen(urllib.request.Request(gltf_info['url'], headers=HEADERS), timeout=30) as resp:
        with open(os.path.join(tmp_dir, 'rock.gltf'), 'wb') as f:
            f.write(resp.read())
            
    for rel_path, item in gltf_info['include'].items():
        dest = os.path.join(tmp_dir, rel_path)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with urllib.request.urlopen(urllib.request.Request(item['url'], headers=HEADERS), timeout=30) as resp:
            with open(dest, 'wb') as f:
                f.write(resp.read())
                
    # Pack into single GLB via gltf-pipeline
    import subprocess
    cmd = f'npx --yes gltf-pipeline -i "{tmp_dir}/rock.gltf" -b -o "{out_path}"'
    subprocess.check_call(cmd, shell=True)
    print(f" -> Packed {out_path} ({os.path.getsize(out_path)} bytes)")

def prepare_seabed():
    out_path = os.path.join(MODELS_DIR, 'seabed.glb')
    if os.path.exists(out_path) and os.path.getsize(out_path) > 100000:
        print(f"[OK] seabed.glb already exists ({os.path.getsize(out_path)} bytes)")
        return
    print("[3/3] Generating AAA bathymetric seabed model...")
    # High-density grid with multi-octave FBM bathymetry
    grid_size = 180
    extent = 450.0  # 450m x 450m
    x = np.linspace(-extent/2, extent/2, grid_size, dtype=np.float32)
    z = np.linspace(-extent/2, extent/2, grid_size, dtype=np.float32)
    xv, zv = np.meshgrid(x, z)
    
    # Natural benthic topography: rolling mounds + continental ridge + trench
    yv = (
        np.sin(xv * 0.015) * 4.5 + np.cos(zv * 0.012) * 5.0 +
        np.sin((xv + zv) * 0.03) * 2.2 +
        np.sin(xv * 0.08) * np.cos(zv * 0.08) * 1.0 -
        # Trench depression near target coordinates [30, z, 10]
        5.0 * np.exp(-((xv - 30)**2 + (zv - 10)**2) / 1200.0)
    ).astype(np.float32)
    
    positions = np.stack([xv, yv, zv], axis=-1).reshape(-1, 3).astype(np.float32)
    
    # Compute normals via gradient
    dz_dx = np.gradient(yv, x, axis=1)
    dz_dz = np.gradient(yv, z, axis=0)
    nx = -dz_dx
    ny = np.ones_like(yv)
    nz = -dz_dz
    norm = np.sqrt(nx**2 + ny**2 + nz**2)
    normals = np.stack([nx/norm, ny/norm, nz/norm], axis=-1).reshape(-1, 3).astype(np.float32)
    
    # UVs
    u = np.linspace(0, 15, grid_size, dtype=np.float32)
    v = np.linspace(0, 15, grid_size, dtype=np.float32)
    ux, vy = np.meshgrid(u, v)
    uvs = np.stack([ux, vy], axis=-1).reshape(-1, 2).astype(np.float32)
    
    # Triangle indices (CCW winding viewed from +Y looking down)
    indices = []
    for i in range(grid_size - 1):
        for j in range(grid_size - 1):
            idx = i * grid_size + j
            indices.extend([idx, idx + grid_size, idx + 1])
            indices.extend([idx + 1, idx + grid_size, idx + grid_size + 1])
    indices = np.array(indices, dtype=np.uint32)
    
    pos_b = positions.tobytes()
    norm_b = normals.tobytes()
    uv_b = uvs.tobytes()
    idx_b = indices.tobytes()
    
    bin_data = pos_b + norm_b + uv_b + idx_b
    pad = (4 - (len(bin_data) % 4)) % 4
    bin_data += b'\x00' * pad
    
    gltf = {
        'asset': {'version': '2.0', 'generator': 'AQUILA DeepSea Bathymetry Exporter'},
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0, 'name': 'Abyssal_Seafloor_Mesh'}],
        'materials': [{
            'name': 'Benthic_Silt_PBR',
            'pbrMetallicRoughness': {
                'baseColorFactor': [0.18, 0.30, 0.42, 1.0], # Visible Antarctic benthic silt
                'metallicFactor': 0.08,
                'roughnessFactor': 0.82
            },
            'doubleSided': True
        }],
        'meshes': [{
            'name': 'Seafloor_Bathymetry',
            'primitives': [{
                'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2},
                'indices': 3,
                'material': 0,
                'mode': 4
            }]
        }],
        'accessors': [
            {'bufferView': 0, 'byteOffset': 0, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3', 'min': positions.min(axis=0).tolist(), 'max': positions.max(axis=0).tolist()},
            {'bufferView': 1, 'byteOffset': 0, 'componentType': 5126, 'count': len(normals), 'type': 'VEC3', 'min': normals.min(axis=0).tolist(), 'max': normals.max(axis=0).tolist()},
            {'bufferView': 2, 'byteOffset': 0, 'componentType': 5126, 'count': len(uvs), 'type': 'VEC2', 'min': uvs.min(axis=0).tolist(), 'max': uvs.max(axis=0).tolist()},
            {'bufferView': 3, 'byteOffset': 0, 'componentType': 5125, 'count': len(indices), 'type': 'SCALAR', 'min': [int(indices.min())], 'max': [int(indices.max())]}
        ],
        'bufferViews': [
            {'buffer': 0, 'byteOffset': 0, 'byteLength': len(pos_b), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pos_b), 'byteLength': len(norm_b), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pos_b) + len(norm_b), 'byteLength': len(uv_b), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pos_b) + len(norm_b) + len(uv_b), 'byteLength': len(idx_b), 'target': 34963}
        ],
        'buffers': [{'byteLength': len(bin_data)}]
    }
    
    json_bytes = json.dumps(gltf).encode('utf-8')
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_pad
    
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    hdr = struct.pack('<4sII', b'glTF', 2, total_len)
    c0 = struct.pack('<II', len(json_bytes), 0x4E4F534A)
    c1 = struct.pack('<II', len(bin_data), 0x004E4942)
    
    with open(out_path, 'wb') as f:
        f.write(hdr + c0 + json_bytes + c1 + bin_data)
    print(f" -> Generated {out_path} ({os.path.getsize(out_path)} bytes, {len(indices)//3} tris)")

if __name__ == '__main__':
    prepare_iceberg()
    prepare_abyssal_rock()
    prepare_seabed()
    print("All models ready in frontend/public/models/!")
