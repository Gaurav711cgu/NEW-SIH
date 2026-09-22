import { useFrame, useThree } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export default function CameraManager() {
  const { camera } = useThree();
  
  // We keep vectors to smooth lookat targets
  const lookAtTarget = useRef(new THREE.Vector3(0, 2, 0));
  const cameraPos = useRef(new THREE.Vector3(-6, 5, 5));
  
  useEffect(() => {
    // Initial camera setup to prevent NaN singularity
    camera.position.copy(cameraPos.current);
    camera.lookAt(lookAtTarget.current);
  }, [camera]);

  useFrame((_, delta) => {
    const mode = useSimulationStore.getState().cameraMode;
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    
    const auvVec = new THREE.Vector3(auvPosition[0], auvPosition[1], auvPosition[2]);
    
    if (mode === 'CINEMATIC') {
      // Slow rotating orbit around the AUV
      const time = Date.now() * 0.0005;
      const radius = 8;
      const targetPos = new THREE.Vector3(
        auvVec.x + Math.cos(time) * radius,
        auvVec.y + 2 + Math.sin(time * 0.5) * 1,
        auvVec.z + Math.sin(time) * radius
      );
      
      cameraPos.current.lerp(targetPos, delta * 2);
      camera.position.copy(cameraPos.current);
      
      lookAtTarget.current.lerp(auvVec, delta * 3);
      camera.lookAt(lookAtTarget.current);
    }
    else if (mode === 'TPP') {
      // Cinematic Orbit: AUV moves, camera loosely follows it from a distance
      const offset = new THREE.Vector3(-6, 3, 5); // behind and to the side
      
      // Calculate target camera pos
      const targetPos = auvVec.clone().add(offset);
      
      cameraPos.current.lerp(targetPos, delta * 2);
      camera.position.copy(cameraPos.current);
      
      lookAtTarget.current.lerp(auvVec, delta * 3);
      camera.lookAt(lookAtTarget.current);
    } 
    else if (mode === 'FPP') {
      // First Person Point of View (nose camera)
      const euler = new THREE.Euler(auvRotation[0], auvRotation[1], auvRotation[2]);
      const direction = new THREE.Vector3(1, 0, 0).applyEuler(euler);
      
      const noseOffset = new THREE.Vector3(1.4, 0, 0).applyEuler(euler);
      const targetPos = auvVec.clone().add(noseOffset);
      
      camera.position.copy(targetPos);
      
      // Look forward
      const lookTarget = targetPos.clone().add(direction.multiplyScalar(10));
      camera.lookAt(lookTarget);
    }
  });

  return null;
}
