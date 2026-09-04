# Edge AI Marine Debris Model

## Goal
Build, train, validate, and export a Deep Learning model (YOLOv8s / RT-DETR) capable of detecting marine debris (Ghost Nets, Shipwrecks, Pipelines) from side-scan sonar images. The model must be exportable to run on Edge AI devices (ESP32/Raspberry Pi) for real-time inference on the AUV.

## Requirements
1. **Data Prep**: Create or download a baseline dataset (sonar imagery).
2. **Training**: Train the YOLOv8s and RT-DETR-L architectures.
3. **Validation**: Run proper mAP50 precision-recall validation on the trained weights.
4. **Edge Export**: Export the trained model to INT8 TFLite and FP16 NCNN formats for the ESP32.

## Output
A highly compressed `.tflite` or `.ncnn` model ready for the AUV's edge compute module, and an ablation report validating its accuracy.
