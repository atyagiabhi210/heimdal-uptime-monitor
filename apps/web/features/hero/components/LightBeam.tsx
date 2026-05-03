import { RefObject, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, BoxGeometry, MeshStandardMaterial } from "three";
import { extend } from "@react-three/fiber";
extend({ Mesh, BoxGeometry, MeshStandardMaterial });

import * as THREE from "three";

interface ScrollProps {
  scrollProgress: RefObject<number>;
}

export function LightBeam({ scrollProgress }: ScrollProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Cone geometry pointing along Z axis
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.08, 6, 32, 1, true);
    geo.rotateZ(-Math.PI / 2); // point horizontally
    return geo;
  }, []);

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return;

    // Map scrollProgress (0→1) to X position sweeping from left to right
    const x = THREE.MathUtils.lerp(-5, 5, scrollProgress.current);
    meshRef.current.position.x = x;
    // Fade in and out at edges for polish
    const fade = Math.sin(scrollProgress.current * Math.PI);
    matRef.current.opacity = THREE.MathUtils.clamp(fade * 0.85, 0, 0.85);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.5]}>
      <primitive object={geometry} />
      <meshBasicMaterial
        ref={matRef}
        color="#f0c060"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
