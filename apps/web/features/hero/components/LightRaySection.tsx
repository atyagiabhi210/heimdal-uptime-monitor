"use client";

import { MutableRefObject, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const THRESHOLD = 0.92;
const PARTICLE_COUNT = 120;

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface ScrollProps {
  scrollProgress: MutableRefObject<number>;
}

interface ShaderUniforms {
  uBeamX: THREE.IUniform<number>;
  uRevealWidth: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
}

// ─────────────────────────────────────────────────────────────────
// Shaders
// ─────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uBeamX;
  uniform float uRevealWidth;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p.yyxx + 19.19);
    return fract((p.x + p.y) * p.x);
  }

  void main() {
    float x = vUv.x;

    float dist     = abs(x - uBeamX);
    float beamGlow = smoothstep(uRevealWidth, 0.0, dist);

    float noise   = hash(vec2(x * 40.0, vUv.y * 20.0 + uTime * 0.5));
    float shimmer = beamGlow * noise * 0.3;

    float revealed   = step(x, uBeamX);
    float brightness = max(revealed * 0.85, beamGlow * 2.5 + shimmer);
    brightness = clamp(brightness, 0.0, 1.0);

    float alpha = max(revealed * 0.85, beamGlow * 0.95);
    alpha = clamp(alpha, 0.0, 1.0);

    vec3 warmGold  = vec3(0.98, 0.87, 0.60);
    vec3 beamWhite = vec3(1.00, 0.95, 0.85);
    vec3 color     = mix(warmGold, beamWhite, beamGlow);

    gl_FragColor = vec4(color * brightness, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────
// RevealText
// ─────────────────────────────────────────────────────────────────

function RevealText({ scrollProgress }: ScrollProps) {
  const meshRef =
    useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null);

  const uniforms = useMemo<ShaderUniforms>(
    () => ({
      uBeamX: { value: 0.0 },
      uRevealWidth: { value: 0.18 },
      uTime: { value: 0.0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const p = scrollProgress.current;
    const mat = meshRef.current.material;
    mat.uniforms.uBeamX.value = p >= THRESHOLD ? 1.0 : p;
    mat.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[10, 3.5]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────
// DustParticles
// ─────────────────────────────────────────────────────────────────

function DustParticles({ scrollProgress }: ScrollProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
      speeds[i] = 0.001 + Math.random() * 0.002;
    }
    return { positions, speeds };
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !matRef.current) return;
    const p = scrollProgress.current;
    const attr = pointsRef.current.geometry.attributes.position;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 2) arr[i * 3 + 1] = -2;
    }
    attr.needsUpdate = true;

    matRef.current.opacity = p >= THRESHOLD ? 0 : Math.sin(p * Math.PI) * 0.5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#ffd080"
        size={0.02}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────
// OverlayText
// ─────────────────────────────────────────────────────────────────

function OverlayText({ scrollProgress }: ScrollProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(false);

  useFrame(() => {
    const el = divRef.current;
    if (!el) return;
    const p = scrollProgress.current;

    if (p >= THRESHOLD && !lockedRef.current) {
      lockedRef.current = true;
      el.style.transition = "opacity 0.6s ease";
      el.style.opacity = "1";
      return;
    }

    if (!lockedRef.current) {
      el.style.opacity = String(Math.max(0.08, Math.sin(p * Math.PI)));
    }
  });

  return (
    <Html center>
      <div
        ref={divRef}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(2rem, 6vw, 5rem)",
          color: "#f5e9c0",
          mixBlendMode: "screen",
          textShadow:
            "0 0 60px rgba(255,210,80,0.6), 0 0 120px rgba(255,160,0,0.3)",
          opacity: 0.08,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        Heimdal
      </div>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────
// LightRaySection
// ─────────────────────────────────────────────────────────────────

export default function LightRaySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useRef<number>(0);
  const hintRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
          if (hintRef.current) {
            hintRef.current.style.opacity = String(
              Math.max(0, 1 - self.progress * 8),
            );
          }
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
      />
      <section
        ref={sectionRef}
        style={{ height: "300vh", background: "#080604", position: "relative" }}
      >
        {/* Sticky viewport */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 40%, #080604 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Scroll hint */}
          <div
            ref={hintRef}
            style={{
              position: "absolute",
              bottom: "8rem",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "monospace",
              color: "rgba(255, 220, 120, 0.4)",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            SCROLL ↓
          </div>

          {/* Three.js Canvas */}
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 5], fov: 55 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <color attach="background" args={["#080604"]} />
            <fog attach="fog" args={["#080604", 5, 20]} />

            <RevealText scrollProgress={scrollProgress} />
            <DustParticles scrollProgress={scrollProgress} />
            <OverlayText scrollProgress={scrollProgress} />
          </Canvas>
        </div>
      </section>
    </>
  );
}
