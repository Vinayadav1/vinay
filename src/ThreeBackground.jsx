import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const values = new Float32Array(260 * 3);

    for (let index = 0; index < values.length; index += 3) {
      values[index] = (Math.random() - 0.5) * 10;
      values[index + 1] = (Math.random() - 0.5) * 6;
      values[index + 2] = (Math.random() - 0.5) * 5;
    }

    return values;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ff124f"
        size={0.018}
        transparent
        opacity={0.58}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]}>
      <Float speed={0.8} rotationIntensity={0.18} floatIntensity={0.35}>
        <ParticleField />
      </Float>
    </Canvas>
  );
}
