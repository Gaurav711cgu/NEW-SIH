import { useFrame, useThree } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';

export default function CameraManager() {
  const { camera } = useThree();
  const mode = useSimulationStore((s) => s.cameraMode);
  const auvPosition = useSimulationStore((s) => s.auvPosition);
  const auvRotation = useSimulationStore((s) => s.auvRotation);

  // We keep a dummy vector to smooth lookat targets
  const lookAtTarget = new THREE.Vector3();
  const cameraPos = new THREE.Vector3();

  useFrame((_, delta) => {
    const auvVec = new THREE.Vector3(...auvPosition);
    
    if (mode === 'TPP') {
      // Cinematic Orbit: AUV moves, camera loosely follows it from a distance
      const offset = new THREE.Vector3(-6, 3, 5); // behind and to the side
      
      // Calculate target camera pos
      const targetPos = auvVec.clone().add(offset);
      
      cameraPos.lerp(targetPos, delta * 2);
      camera.position.copy(cameraPos);
      
      lookAtTarget.lerp(auvVec, delta * 3);
      camera.lookAt(lookAtTarget);
    } 
    else if (mode === 'FPP') {
      // First Person Point of View (nose camera)
      // Position it at the nose of the AUV (X = 1.2 relative to AUV)
      const euler = new THREE.Euler(...auvRotation);
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
