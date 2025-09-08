import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Animation constants
const ANIMATION_CONFIG = {
  orangeEntryDuration: 2000,
  burstDelay: 500,
  splashDuration: 3000,
  splashCount: 100,
  splashSpeed: 10,
  gravity: 9.8,
  bounceAmplitude: 2,
  bounceFrequency: 4,
  bounceDamping: 0.15,
  maxSplashes: 150,
  isMobile: typeof window !== 'undefined' && window.innerWidth < 768
};

interface Splash {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  opacity: number;
  size: number;
  startTime: number;
}

// Orange with physics bounce
const Orange: React.FC<{ 
  phase: 'entering' | 'bouncing' | 'bursting' | 'hidden';
  onBurstComplete: () => void;
}> = ({ phase, onBurstComplete }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [startTime] = useState(Date.now());
  
  useFrame(() => {
    if (!meshRef.current || phase === 'hidden') return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    
    if (phase === 'entering' || phase === 'bouncing') {
      // Damped bounce
      const y = ANIMATION_CONFIG.bounceAmplitude * 
                Math.cos(ANIMATION_CONFIG.bounceFrequency * elapsed) * 
                Math.exp(-ANIMATION_CONFIG.bounceDamping * elapsed);
      
      const squash = 1 + 0.1 * Math.sin(ANIMATION_CONFIG.bounceFrequency * elapsed) * 
                     Math.exp(-ANIMATION_CONFIG.bounceDamping * elapsed);
      
      meshRef.current.position.y = y;
      meshRef.current.scale.set(1/squash, squash, 1/squash);
      
      // Trigger burst
      if (elapsed > ANIMATION_CONFIG.orangeEntryDuration / 1000 && phase === 'bouncing') {
        setTimeout(onBurstComplete, ANIMATION_CONFIG.burstDelay);
      }
    }
    
    if (phase === 'bursting') {
      const burstProgress = Math.min(elapsed * 3, 1);
      const scale = Math.max(0, 1 - burstProgress);
      meshRef.current.scale.setScalar(scale);
      
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.opacity = scale;
        meshRef.current.material.transparent = true;
      }
    }
  });
  
  if (phase === 'hidden') return null;
  
  return (
    <mesh ref={meshRef} position={[0, 5, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial 
        color="#ff8c00"
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

// Splash particle system
const SplashSystem: React.FC<{
  isActive: boolean;
  onTextHit: (strength: number) => void;
}> = ({ isActive, onTextHit }) => {
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [startTime, setStartTime] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (isActive && splashes.length === 0) {
      const newSplashes: Splash[] = [];
      const now = Date.now();
      setStartTime(now);
      
      for (let i = 0; i < ANIMATION_CONFIG.splashCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = ANIMATION_CONFIG.splashSpeed * (0.5 + Math.random() * 0.5);
        
        const velocity = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 5,
          Math.cos(phi) * speed
        );
        
        newSplashes.push({
          position: new THREE.Vector3(0, 0, 0),
          velocity,
          opacity: 1,
          size: 0.05 + Math.random() * 0.05,
          startTime: now
        });
      }
      
      setSplashes(newSplashes);
    }
  }, [isActive]);
  
  useFrame(() => {
    if (!isActive) return;
    
    const currentTime = Date.now();
    const deltaTime = 0.016; // 60fps
    
    setSplashes(prevSplashes => {
      return prevSplashes.map(splash => {
        const elapsed = (currentTime - splash.startTime) / 1000;
        
        // Physics
        splash.velocity.y -= ANIMATION_CONFIG.gravity * deltaTime;
        splash.velocity.multiplyScalar(0.995); // drag
        
        splash.position.add(splash.velocity.clone().multiplyScalar(deltaTime));
        splash.opacity = Math.max(0, 1 - elapsed / (ANIMATION_CONFIG.splashDuration / 1000));
        
        // Text collision
        const distance = splash.position.length();
        if (distance < 3 && splash.opacity > 0.1) {
          const strength = Math.exp(-distance * distance / 2);
          onTextHit(strength);
        }
        
        return splash;
      }).filter(splash => splash.opacity > 0.01);
    });
  });
  
  if (!isActive || splashes.length === 0) return null;
  
  return (
    <group ref={groupRef}>
      {splashes.slice(0, ANIMATION_CONFIG.maxSplashes).map((splash, index) => (
        <mesh
          key={index}
          position={[splash.position.x, splash.position.y, splash.position.z]}
          scale={[splash.size, splash.size, splash.size]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color="#ff6600"
            transparent
            opacity={splash.opacity}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Text with coloring
const ColorableText: React.FC<{
  colorStrength: number;
  isVisible: boolean;
}> = ({ colorStrength, isVisible }) => {
  const textGroupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!textGroupRef.current || !isVisible) return;
    
    textGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const targetColor = new THREE.Color().lerpColors(
          new THREE.Color(0x333333),
          new THREE.Color(0xff6600),
          Math.min(colorStrength, 1)
        );
        
        child.material.color.lerp(targetColor, 0.1);
        child.material.opacity = Math.min(1, colorStrength * 2);
        child.material.transparent = true;
      }
    });
  });
  
  if (!isVisible) return null;
  
  return (
    <group ref={textGroupRef} position={[0, 0, 0]}>
      {/* SUPER FRUIT */}
      <group position={[0, 0.5, 0]}>
        {['S', 'U', 'P', 'E', 'R'].map((char, i) => (
          <mesh key={i} position={[(i - 2) * 1.2, 0, 0]}>
            <boxGeometry args={[0.8, 1, 0.2]} />
            <meshStandardMaterial
              color="#333333"
              transparent
              opacity={0}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        ))}
        <group position={[0, -1.2, 0]}>
          {['F', 'R', 'U', 'I', 'T'].map((char, i) => (
            <mesh key={i} position={[(i - 2) * 1.2, 0, 0]}>
              <boxGeometry args={[0.8, 1, 0.2]} />
              <meshStandardMaterial
                color="#333333"
                transparent
                opacity={0}
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>
      </group>
      
      {/* CENTER */}
      <group position={[0, -2.5, 0]}>
        {['C', 'E', 'N', 'T', 'E', 'R'].map((char, i) => (
          <mesh key={i} position={[(i - 2.5) * 0.8, 0, 0]}>
            <boxGeometry args={[0.6, 0.8, 0.15]} />
            <meshStandardMaterial
              color="#333333"
              transparent
              opacity={0}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Main Scene
const Scene: React.FC = () => {
  const { camera } = useThree();
  const [phase, setPhase] = useState<'entering' | 'bouncing' | 'bursting' | 'splash' | 'reveal'>('entering');
  const [textColorStrength, setTextColorStrength] = useState(0);
  
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    
    const timer1 = setTimeout(() => setPhase('bouncing'), 100);
    const timer2 = setTimeout(() => setPhase('splash'), ANIMATION_CONFIG.orangeEntryDuration);
    const timer3 = setTimeout(() => setPhase('reveal'), 
      ANIMATION_CONFIG.orangeEntryDuration + ANIMATION_CONFIG.splashDuration);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [camera]);
  
  const handleBurstComplete = () => {
    setPhase('bursting');
    setTimeout(() => setPhase('splash'), ANIMATION_CONFIG.burstDelay);
  };
  
  const handleTextHit = (strength: number) => {
    setTextColorStrength(prev => Math.min(1, prev + strength * 0.01));
  };
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <Orange 
        phase={phase === 'entering' || phase === 'bouncing' ? phase : 
               phase === 'bursting' ? 'bursting' : 'hidden'}
        onBurstComplete={handleBurstComplete}
      />
      
      <SplashSystem 
        isActive={phase === 'splash'}
        onTextHit={handleTextHit}
      />
      
      <ColorableText 
        colorStrength={textColorStrength}
        isVisible={phase === 'reveal'}
      />
    </>
  );
};

// Main component
const ThreeJsOrangeBurst: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ 
          antialias: !ANIMATION_CONFIG.isMobile,
          alpha: true
        }}
        dpr={ANIMATION_CONFIG.isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
      >
        <Scene />
      </Canvas>
      
      {/* Overlay text for better fallback */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text opacity-20 animate-pulse">
            SUPER FRUIT<br />CENTER
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ThreeJsOrangeBurst;