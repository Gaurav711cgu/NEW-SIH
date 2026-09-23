import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export default function CameraManager() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Track previous AUV position to compute frame displacement delta
  const prevAuvPos = useRef<THREE.Vector3 | null>(null);
  
  // Vectors for cinematic smoothing fallback
  const lookAtTarget = useRef(new THREE.Vector3(0, 2, 0));
  const cameraPos = useRef(new THREE.Vector3(-6, 5, 5));
  
  const cameraMode = useSimulationStore((s) => s.cameraMode);

  useEffect(() => {
    // Initial camera position relative to origin
    const initialAuv = useSimulationStore.getState().auvPosition;
    const initialVec = new THREE.Vector3(initialAuv[0], initialAuv[1], initialAuv[2]);
    const initialOffset = new THREE.Vector3(-6, 3, 5);
    
    camera.position.copy(initialVec.clone().add(initialOffset));
    camera.lookAt(initialVec);
    
    if (controlsRef.current) {
      controlsRef.current.target.copy(initialVec);
      controlsRef.current.update();
    }
  }, [camera]);

  useFrame((_, delta) => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    
    const currentAuvPos = new THREE.Vector3(auvPosition[0], auvPosition[1], auvPosition[2]);
    
    if (!prevAuvPos.current) {
      prevAuvPos.current = currentAuvPos.clone();
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentAuvPos);
        controlsRef.current.update();
      }
    }
    
    // Displacement of AUV since last frame
    const deltaAuv = currentAuvPos.clone().sub(prevAuvPos.current);
    
    if (cameraMode === 'TPP' || cameraMode === 'FREE') {
      // Shift both the orbit target and the camera by the displacement delta of the moving AUV
      // This preserves user 360-degree rotation, pitch, and zoom without rigid per-frame position overwriting
      if (controlsRef.current) {
        controlsRef.current.target.add(deltaAuv);
        camera.position.add(deltaAuv);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'CINEMATIC') {
      // Slow rotating cinematic orbit around the AUV
      const time = Date.now() * 0.0005;
      const radius = 8;
      const targetPos = new THREE.Vector3(
        currentAuvPos.x + Math.cos(time) * radius,
        currentAuvPos.y + 2 + Math.sin(time * 0.5) * 1,
        currentAuvPos.z + Math.sin(time) * radius
      );
      
      cameraPos.current.lerp(targetPos, delta * 2);
      camera.position.copy(cameraPos.current);
      lookAtTarget.current.lerp(currentAuvPos, delta * 3);
      camera.lookAt(lookAtTarget.current);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentAuvPos);
      }
    } else if (cameraMode === 'FPP') {
      // First Person Point of View (nose camera)
      const euler = new THREE.Euler(auvRotation[0], auvRotation[1], auvRotation[2]);
      const direction = new THREE.Vector3(1, 0, 0).applyEuler(euler);
      
      const noseOffset = new THREE.Vector3(1.4, 0, 0).applyEuler(euler);
      const targetPos = currentAuvPos.clone().add(noseOffset);
      
      camera.position.copy(targetPos);
      
      const lookTarget = targetPos.clone().add(direction.multiplyScalar(10));
      camera.lookAt(lookTarget);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(lookTarget);
      }
    }
    
    prevAuvPos.current.copy(currentAuvPos);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={cameraMode === 'TPP' || cameraMode === 'FREE'}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={2.5}
      maxDistance={60}
      maxPolarAngle={Math.PI - 0.05}
      minPolarAngle={0.05}
    />
  );
}
