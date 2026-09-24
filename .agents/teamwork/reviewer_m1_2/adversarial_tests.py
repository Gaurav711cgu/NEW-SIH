"""
Adversarial Stress Test Suite for Milestone 1 Data Pipeline
Executed by Reviewer 2 (Adversarial & Numerical Integrity Reviewer)
"""

import sys
import os
sys.path.insert(0, "/Users/gauravkumarnayak/Desktop/new sih")

import numpy as np
import torch
import pytest

from convectnow.backend.data import (
    QualityControlFilter,
    GridReprojector,
    laea_forward,
    laea_inverse,
    geos_forward,
    geos_inverse,
    polar_to_cartesian,
    cartesian_to_latlon,
    latlon_to_cartesian,
    MOSDACIngester,
    MOSDACProduct,
    IMDGeoServerWorker,
    IMDRadarProduct,
    ConvectDataset,
    create_convect_dataloader
)

print("=== STARTING ADVERSARIAL STRESS TEST SUITE ===")
results = []

def test_case(name):
    def decorator(fn):
        def wrapper():
            print(f"\n--- Testing: {name} ---")
            try:
                fn()
                print(f"[PASS] {name}")
                results.append((name, "PASS", ""))
            except Exception as e:
                print(f"[FAIL] {name}: {type(e).__name__}: {e}")
                results.append((name, "FAIL", f"{type(e).__name__}: {e}"))
        return wrapper
    return decorator


# -----------------------------------------------------------------------------
# 1. Quality Control: NaN, Inf, Extreme Values, Edge Shapes
# -----------------------------------------------------------------------------

@test_case("QC: All NaN input to compute_tdbz_texture and filter_ground_clutter")
def test_qc_all_nan():
    qc = QualityControlFilter()
    dbz = np.full((50, 50), np.nan, dtype=np.float32)
    clean, mask = qc.filter_ground_clutter(dbz)
    assert not np.isnan(clean).any(), "NaNs remained in filtered dbz"
    assert (clean == 0.0).all(), "All-NaN should be sanitized to 0.0"
    assert not mask.any(), "Clutter mask should be all False for all-NaN"

@test_case("QC: All Inf / -Inf input to filter_ground_clutter")
def test_qc_all_inf():
    qc = QualityControlFilter()
    dbz_pos = np.full((50, 50), np.inf, dtype=np.float32)
    clean_pos, mask_pos = qc.filter_ground_clutter(dbz_pos)
    assert not np.isinf(clean_pos).any()
    assert (clean_pos <= qc.max_valid_dbz).all()

    dbz_neg = np.full((50, 50), -np.inf, dtype=np.float32)
    clean_neg, mask_neg = qc.filter_ground_clutter(dbz_neg)
    assert not np.isinf(clean_neg).any()
    assert (clean_neg >= 0.0).all()

@test_case("QC: Extreme values (>1000 dBZ, <-100 dBZ)")
def test_qc_extreme_values():
    qc = QualityControlFilter()
    dbz = np.array([[-500.0, 1e6], [9999.0, 45.0]], dtype=np.float32)
    clean, mask = qc.filter_ground_clutter(dbz)
    assert np.all(clean >= 0.0)
    assert np.all(clean <= qc.max_valid_dbz)

@test_case("QC: All NaN input to apply_full_qc (no prev/next)")
def test_qc_apply_full_qc_all_nan():
    qc = QualityControlFilter()
    dbz = np.full((50, 50), np.nan, dtype=np.float32)
    # Testing if np.nanmax raises ValueError on all-NaN slice
    res = qc.apply_full_qc(dbz)
    assert "clean_dbz" in res
    assert not np.isnan(res["clean_dbz"]).any()

@test_case("QC: All zero frame to apply_full_qc with imputation fallback")
def test_qc_all_zero_imputation():
    qc = QualityControlFilter()
    zero_frame = np.zeros((64, 64), dtype=np.float32)
    prev_f = np.full((64, 64), 30.0, dtype=np.float32)
    next_f = np.full((64, 64), 30.0, dtype=np.float32)
    res = qc.apply_full_qc(zero_frame, prev_dbz=prev_f, next_dbz=next_f)
    assert res["was_imputed"] is True
    assert (res["clean_dbz"] > 25.0).all()

@test_case("QC: Optical flow imputation with identical frames")
def test_qc_optical_flow_identical():
    qc = QualityControlFilter()
    f = np.full((64, 64), 45.0, dtype=np.float32)
    res = qc.impute_missing_frame_optical_flow(f, f, alpha=0.5)
    assert res.shape == (64, 64)
    assert np.isclose(np.mean(res), 45.0, atol=1.0)

@test_case("QC: Optical flow imputation with alpha at boundaries (0.0 and 1.0)")
def test_qc_optical_flow_boundary_alpha():
    qc = QualityControlFilter()
    f1 = np.full((64, 64), 20.0, dtype=np.float32)
    f2 = np.full((64, 64), 60.0, dtype=np.float32)
    res0 = qc.impute_missing_frame_optical_flow(f1, f2, alpha=0.0)
    res1 = qc.impute_missing_frame_optical_flow(f1, f2, alpha=1.0)
    assert not np.isnan(res0).any()
    assert not np.isnan(res1).any()

@test_case("QC: AP ducting gate with shape mismatch")
def test_qc_ap_shape_mismatch():
    qc = QualityControlFilter()
    dbz = np.zeros((50, 50), dtype=np.float32)
    sat = np.zeros((40, 40), dtype=np.float32)
    with pytest.raises(ValueError):
        qc.filter_ap_ducting(dbz, sat)

@test_case("QC: Inpaint with empty blockage mask")
def test_qc_inpaint_empty_mask():
    qc = QualityControlFilter()
    dbz = np.full((50, 50), 30.0, dtype=np.float32)
    mask = np.zeros((50, 50), dtype=np.uint8)
    inpainted = qc.inpaint_beam_blockage(dbz, mask)
    assert np.allclose(dbz, inpainted, atol=1.0)

@test_case("QC: Inpaint with 100% blockage mask (entire frame blocked)")
def test_qc_inpaint_full_mask():
    qc = QualityControlFilter()
    dbz = np.full((50, 50), 30.0, dtype=np.float32)
    mask = np.ones((50, 50), dtype=np.uint8)
    inpainted = qc.inpaint_beam_blockage(dbz, mask)
    assert inpainted.shape == (50, 50)
    assert not np.isnan(inpainted).any()


# -----------------------------------------------------------------------------
# 2. Projection & Coordinate Transforms: Singularities & Edge Cases
# -----------------------------------------------------------------------------

@test_case("LAEA: Antipodal point (cos_c == -1.0)")
def test_laea_antipodal():
    # lat_0 = 38.0, lon_0 = -98.0
    # Antipodal: lat = -38.0, lon = 82.0 (-98 + 180)
    x, y = laea_forward(-38.0, 82.0, lat_0=38.0, lon_0=-98.0)
    assert not np.isnan(x) and not np.isnan(y)
    assert not np.isinf(x) and not np.isinf(y)

@test_case("LAEA: Exact Center Point (lat_0, lon_0)")
def test_laea_center():
    x, y = laea_forward(38.0, -98.0, lat_0=38.0, lon_0=-98.0)
    assert np.isclose(x, 0.0, atol=1e-3)
    assert np.isclose(y, 0.0, atol=1e-3)
    lat, lon = laea_inverse(0.0, 0.0, lat_0=38.0, lon_0=-98.0)
    assert np.isclose(lat, 38.0, atol=1e-5)
    assert np.isclose(lon, -98.0, atol=1e-5)

@test_case("LAEA: Poles (lat = 90.0 and -90.0)")
def test_laea_poles():
    for lat in [90.0, -90.0]:
        x, y = laea_forward(lat, 0.0, lat_0=38.0, lon_0=-98.0)
        assert not np.isnan(x) and not np.isnan(y)
        rec_lat, rec_lon = laea_inverse(x, y, lat_0=38.0, lon_0=-98.0)
        assert np.isclose(rec_lat, lat, atol=1e-4)

@test_case("LAEA: Extreme rho in inverse (beyond 2*R)")
def test_laea_extreme_rho():
    R = 6370997.0
    # rho = 3 * R (outside sphere projection disc)
    lat, lon = laea_inverse(3.0 * R, 0.0, lat_0=38.0, lon_0=-98.0)
    assert not np.isnan(lat) and not np.isnan(lon)
    assert -90.0 <= lat <= 90.0
    assert -180.0 <= lon <= 180.0

@test_case("GEOS: Off-disk ray (looking into deep space)")
def test_geos_deep_space():
    # Scan angles far exceeding Earth disk (~0.15 rad is disc edge)
    sx = np.array([0.5, -0.5, 0.0])
    sy = np.array([0.0, 0.0, 0.5])
    lat, lon, valid = geos_inverse(sx, sy, lon_0=74.0)
    assert (valid == False).all(), "Deep space rays should have valid == False"
    assert not np.isnan(lat).any() and not np.isnan(lon).any()

@test_case("GEOS: Sub-satellite point (sx=0, sy=0)")
def test_geos_sub_satellite():
    lat, lon, valid = geos_inverse(0.0, 0.0, lon_0=74.0)
    assert bool(valid) is True
    assert np.isclose(lat, 0.0, atol=1e-4)
    assert np.isclose(lon, 74.0, atol=1e-4)

@test_case("GEOS: Visible horizon boundary")
def test_geos_horizon():
    # Scan angle near Earth limb (~0.151 rad)
    sx = 0.150
    sy = 0.0
    lat, lon, valid = geos_inverse(sx, sy, lon_0=74.0)
    assert not np.isnan(lat) and not np.isnan(lon)

@test_case("Polar to Cartesian: Extreme Azimuths (negative, >360, huge)")
def test_polar_extreme_azimuth():
    reprojector = GridReprojector()
    polar = np.ones((50, 360), dtype=np.float32) * 20.0
    cart = reprojector.reproject_polar_to_cartesian(polar, max_range_km=100.0, out_shape=(64, 64))
    assert cart.shape == (64, 64)
    assert not np.isnan(cart).any()

@test_case("Radar to EPSG:4326: Small or zero grid")
def test_radar_to_epsg_resample():
    reprojector = GridReprojector()
    radar = np.full((100, 100), 25.0, dtype=np.float32)
    grid, lats, lons = reprojector.reproject_radar_to_epsg4326(
        radar, station_lat=28.588, station_lon=77.218, max_range_km=100.0, target_shape=(32, 32)
    )
    assert grid.shape == (32, 32)
    assert not np.isnan(grid).any()


# -----------------------------------------------------------------------------
# 3. MOSDAC Thermodynamic Planck Calibration
# -----------------------------------------------------------------------------

@test_case("Planck: Zero and Negative Temperatures")
def test_planck_zero_negative_t():
    ingester = MOSDACIngester()
    rad_zero = ingester.planck_radiance(0.0, 10.8)
    rad_neg = ingester.planck_radiance(-50.0, 10.8)
    assert not np.isnan(rad_zero) and not np.isnan(rad_neg)
    assert rad_zero >= 0.0 and rad_neg >= 0.0

@test_case("Planck: Zero and Negative Radiances")
def test_planck_zero_negative_rad():
    ingester = MOSDACIngester()
    tb_zero = ingester.planck_temperature(0.0, 10.8)
    tb_neg = ingester.planck_temperature(-10.0, 10.8)
    assert not np.isnan(tb_zero) and not np.isnan(tb_neg)
    assert not np.isinf(tb_zero) and not np.isinf(tb_neg)

@test_case("Planck: Extreme high temperature (10,000 K)")
def test_planck_extreme_high_t():
    ingester = MOSDACIngester()
    rad = ingester.planck_radiance(10000.0, 10.8)
    assert not np.isnan(rad) and not np.isinf(rad)
    tb = ingester.planck_temperature(rad, 10.8)
    assert not np.isnan(tb) and not np.isinf(tb)

@test_case("MOSDAC: Unknown Channel Name")
def test_mosdac_unknown_channel():
    ingester = MOSDACIngester()
    raw = np.zeros((10, 10), dtype=np.uint16)
    with pytest.raises(ValueError):
        ingester.calibrate_channel(raw, "UNKNOWN_BAND")

@test_case("MOSDAC: VIS channel calibration")
def test_mosdac_vis_channel():
    ingester = MOSDACIngester()
    raw = np.array([[0, 500], [1000, 1023]], dtype=np.uint16)
    prod = ingester.calibrate_channel(raw, "VIS")
    assert prod.channel == "VIS"
    assert 0.0 <= np.min(prod.tb_k) and np.max(prod.tb_k) <= 1.0


# -----------------------------------------------------------------------------
# 4. IMD Radar Ingestion: Corrupt inputs & Palette mapping
# -----------------------------------------------------------------------------

@test_case("IMD: Decode nonexistent file")
def test_imd_nonexistent():
    worker = IMDGeoServerWorker()
    with pytest.raises(FileNotFoundError):
        worker.decode_radar_gif("nonexistent_radar_file.gif")

@test_case("IMD: Palette quantization with unknown colors")
def test_imd_unknown_colors():
    worker = IMDGeoServerWorker()
    from convectnow.backend.data.ingester_imd import REFLECTIVITY_PALETTE, REFLECTIVITY_VALUES
    # Random RGB noise
    noise_rgb = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    grid = worker._decode_palette_grid(noise_rgb, REFLECTIVITY_PALETTE, REFLECTIVITY_VALUES)
    assert grid.shape == (100, 100)
    assert not np.isnan(grid).any()
    assert (grid >= 0.0).all()


# -----------------------------------------------------------------------------
# 5. PyTorch ConvectDataset & DataLoader: Stress & Multi-worker
# -----------------------------------------------------------------------------

@test_case("ConvectDataset: Negative and out-of-bounds indexing")
def test_dataset_indexing():
    ds = ConvectDataset(split="train")
    # Negative indexing (Python supported)
    item_last, t_last = ds[-1]
    assert item_last.shape == (4, 12, 128, 128)

    # Out of bounds should raise IndexError
    with pytest.raises(IndexError):
        _ = ds[len(ds) + 10]

@test_case("ConvectDataset: Nonexistent file raises FileNotFoundError")
def test_dataset_nonexistent_file():
    with pytest.raises(FileNotFoundError):
        ConvectDataset(vil_path="datasets/nonexistent/vil.h5")

@test_case("ConvectDataset: Custom crop sizes (e.g. 64x64 and 256x256)")
def test_dataset_custom_crop():
    ds_small = ConvectDataset(split="train", crop_size=(64, 64))
    t_sm, _ = ds_small[0]
    assert t_sm.shape == (4, 12, 64, 64)

    ds_large = ConvectDataset(split="train", crop_size=(256, 256))
    t_lg, _ = ds_large[0]
    assert t_lg.shape == (4, 12, 256, 256)

@test_case("ConvectDataset: Multi-worker DataLoader (num_workers=2)")
def test_dataset_multiworker():
    ds = ConvectDataset(split="train")
    loader = create_convect_dataloader(ds, batch_size=2, num_workers=2, shuffle=False)
    for bx, by in loader:
        assert bx.shape == (2, 4, 12, 128, 128)
        assert not torch.isnan(bx).any()
        break

@test_case("ConvectDataset: Numerical bounds across 20 consecutive samples")
def test_dataset_sample_distribution():
    ds = ConvectDataset(split="train")
    n_test = min(20, len(ds))
    for i in range(n_test):
        t, tgts = ds[i]
        assert not torch.isnan(t).any()
        assert not torch.isinf(t).any()
        assert 0.0 <= t[0].min() and t[0].max() <= 1.0
        assert -1.0 <= t[1].min() and t[1].max() <= 1.0
        assert 0.0 <= t[2].min() and t[2].max() <= 1.0
        assert 0.0 <= t[3].min() and t[3].max() <= 1.0
        for k in ["posh", "mesh_mm", "cloudburst_flag", "rain_rate_mmh", "gust_kmh", "ci_prob"]:
            v = float(tgts[k])
            assert not np.isnan(v) and not np.isinf(v)


# -----------------------------------------------------------------------------
# RUN ALL
# -----------------------------------------------------------------------------
tests = [
    test_qc_all_nan,
    test_qc_all_inf,
    test_qc_extreme_values,
    test_qc_apply_full_qc_all_nan,
    test_qc_all_zero_imputation,
    test_qc_optical_flow_identical,
    test_qc_optical_flow_boundary_alpha,
    test_qc_ap_shape_mismatch,
    test_qc_inpaint_empty_mask,
    test_qc_inpaint_full_mask,
    test_laea_antipodal,
    test_laea_center,
    test_laea_poles,
    test_laea_extreme_rho,
    test_geos_deep_space,
    test_geos_sub_satellite,
    test_geos_horizon,
    test_polar_extreme_azimuth,
    test_radar_to_epsg_resample,
    test_planck_zero_negative_t,
    test_planck_zero_negative_rad,
    test_planck_extreme_high_t,
    test_mosdac_unknown_channel,
    test_mosdac_vis_channel,
    test_imd_nonexistent,
    test_imd_unknown_colors,
    test_dataset_indexing,
    test_dataset_nonexistent_file,
    test_dataset_custom_crop,
    test_dataset_multiworker,
    test_dataset_sample_distribution,
]

if __name__ == "__main__":
    for t in tests:
        t()

    print("\n" + "="*50)
    print(f"ADVERSARIAL STRESS TEST SUMMARY: {len([r for r in results if r[1] == 'PASS'])}/{len(results)} PASSED")
    failures = [r for r in results if r[1] == 'FAIL']
    if failures:
        print(f"FAILURES ({len(failures)}):")
        for f in failures:
            print(f"  - {f[0]}: {f[2]}")
    else:
        print("ALL ADVERSARIAL STRESS TESTS PASSED.")
    print("="*50)
