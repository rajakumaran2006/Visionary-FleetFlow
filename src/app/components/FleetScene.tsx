'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial, Line } from '@react-three/drei';
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import styles from '../page.module.css';

// Cargo container box
function CargoBox({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.15;
    }
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale} castShadow>
        <boxGeometry args={[1, 0.6, 0.5]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.3} />
        {/* Container ridges */}
        <mesh position={[0, 0, 0.26]} scale={[0.95, 0.55, 0.02]}>
          <boxGeometry />
          <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.2} />
        </mesh>
      </mesh>
    </Float>
  );
}

// Cargo ship in black/white
function Boat({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Hull */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.4, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Hull bottom */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[2.0, 0.15, 0.6]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Deck */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Bridge / cabin */}
      <mesh position={[-0.6, 0.55, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Bridge window */}
      <mesh position={[-0.6, 0.6, 0.26]} castShadow>
        <boxGeometry args={[0.35, 0.2, 0.02]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} emissive="#666666" emissiveIntensity={0.2} />
      </mesh>
      {/* Containers on deck */}
      <mesh position={[0.3, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.45, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#333333" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, 0.75, 0]} castShadow>
        <boxGeometry args={[0.55, 0.25, 0.35]} />
        <meshStandardMaterial color="#999999" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Smokestack */}
      <mesh position={[-0.6, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Truck in black/white
function Truck({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + 2) * 0.12;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Cab */}
        <mesh position={[-0.5, 0.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.45]} />
          <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Windshield */}
        <mesh position={[-0.76, 0.2, 0]} castShadow>
          <boxGeometry args={[0.02, 0.25, 0.35]} />
          <meshStandardMaterial color="#bbbbbb" metalness={0.9} roughness={0.1} emissive="#888888" emissiveIntensity={0.15} />
        </mesh>
        {/* Trailer */}
        <mesh position={[0.3, 0.2, 0]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.5]} />
          <meshStandardMaterial color="#f5f5f5" metalness={0.2} roughness={0.4} />
        </mesh>
        {/* Trailer accent strip */}
        <mesh position={[0.3, 0.05, 0.26]} castShadow>
          <boxGeometry args={[1.05, 0.06, 0.02]} />
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Wheels */}
        {[[-0.5, -0.18, 0.25], [-0.5, -0.18, -0.25], [0.1, -0.18, 0.25], [0.1, -0.18, -0.25], [0.6, -0.18, 0.25], [0.6, -0.18, -0.25]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Location pin in white/black
function LocationPin({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={meshRef} position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} emissive="#ffffff" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      </group>
    </Float>
  );
}

// Floating orb particles
function GlowOrb({ position, size = 0.06 }: { position: [number, number, number]; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.5 + Math.random() * 1.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.3;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7 + offset) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.4} />
    </mesh>
  );
}

// Route line in white
function RouteLine() {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, -0.8, 0),
      new THREE.Vector3(-1.5, 0.8, 0.8),
      new THREE.Vector3(0.8, -0.3, -0.5),
      new THREE.Vector3(3.5, 1.2, 0.4),
    ]);
    return curve.getPoints(50);
  }, []);

  return (
    <Line
      points={points}
      color="#ffffff"
      lineWidth={1}
      transparent
      opacity={0.15}
    />
  );
}

// Water/ground plane
function WaterPlane() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.1, 0, 0]} position={[0, -2.8, -2.0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <MeshDistortMaterial
        color="#ffffff"
        transparent
        opacity={0.06}
        distort={0.4}
        speed={1.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow color="#ffffff" />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color="#ffffff" />
      <pointLight position={[3, -2, -2]} intensity={0.3} color="#cccccc" />

      {/* Group holding all scene items - shifted down to anchor at the bottom */}
      <group position={[0, -2.5, 0]}>
        {/* Main cargo ship */}
        <Boat position={[0, 0.4, 0]} scale={1.8} />

        {/* Floating containers */}
        <CargoBox position={[-2.8, 1.8, -0.6]} scale={1.2} speed={0.8} />
        <CargoBox position={[2.6, 1.5, 0.4]} scale={1.0} speed={1.2} />
        <CargoBox position={[-1.8, -1.0, 1.0]} scale={0.9} speed={0.9} />

        {/* Truck */}
        <Truck position={[2.2, -0.6, -0.6]} scale={1.3} />

        {/* Location pins */}
        <LocationPin position={[-3.0, 0.8, 0.8]} />
        <LocationPin position={[3.0, 1.2, -0.4]} />
        <LocationPin position={[0.8, 2.2, 0.8]} />

        {/* Route lines */}
        <RouteLine />

        {/* Floating glow particles */}
        <GlowOrb position={[-1.5, 2.5, 0.8]} size={0.06} />
        <GlowOrb position={[2.2, 2.2, -0.4]} size={0.08} />
        <GlowOrb position={[-2.8, -0.8, 0.5]} size={0.05} />
        <GlowOrb position={[1.2, -2.0, 1.2]} size={0.06} />
        <GlowOrb position={[-0.8, 1.8, -1.2]} size={0.055} />
        <GlowOrb position={[2.8, 0.5, 0.9]} size={0.07} />
        <GlowOrb position={[-2.5, 1.5, -0.6]} size={0.05} />

        {/* Water plane */}
        <WaterPlane />
      </group>

      <Environment preset="night" />
    </>
  );
}

export default function FleetScene() {
  return (
    <Canvas
      className={styles.fleetCanvas}
      camera={{ position: [0, -0.5, 4.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <React.Suspense fallback={null}>
        <Scene />
      </React.Suspense>
    </Canvas>
  );
}
