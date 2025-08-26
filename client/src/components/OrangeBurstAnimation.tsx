import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface OrangeBurstAnimationProps {
  className?: string;
}

const OrangeBurstAnimation: React.FC<OrangeBurstAnimationProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Orange sphere
    const orangeGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orangeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff8800, 
      roughness: 0.5,
      metalness: 0.1
    });
    const orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    scene.add(orange);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Load splash textures
    const loader = new THREE.TextureLoader();
    const splashTextures = [
      loader.load("/splash1.png"),
      loader.load("/splash2.png"),
      loader.load("/splash3.png")
    ];

    const splashes: Array<{ mesh: THREE.Mesh; life: number }> = [];

    // Create splash function
    const createSplash = () => {
      const texture = splashTextures[Math.floor(Math.random() * splashTextures.length)];
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      const splash = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);
      splash.rotation.z = Math.random() * Math.PI * 2;
      splash.position.copy(orange.position);
      splashes.push({ mesh: splash, life: 1 });
      scene.add(splash);
      
      // Hide orange temporarily
      orange.visible = false;
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate orange slowly
      orange.rotation.x += 0.005;
      orange.rotation.y += 0.01;

      // Animate splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        splash.life -= 0.02;
        (splash.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(splash.life, 0);
        splash.mesh.scale.setScalar(2 - splash.life);

        if (splash.life <= 0) {
          scene.remove(splash.mesh);
          (splash.mesh.material as THREE.MeshBasicMaterial).dispose();
          splash.mesh.geometry.dispose();
          splashes.splice(i, 1);
          orange.visible = true;
        }
      }

      renderer.render(scene, camera);
    };

    // Auto-burst every 3 seconds
    const burstInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to burst
        createSplash();
      }
    }, 3000);

    // Click handler for manual burst
    const handleClick = () => {
      createSplash();
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.style.cursor = 'pointer';

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      clearInterval(burstInterval);
      
      renderer.domElement.removeEventListener('click', handleClick);
      
      // Clean up splashes
      splashes.forEach(splash => {
        scene.remove(splash.mesh);
        (splash.mesh.material as THREE.MeshBasicMaterial).dispose();
        splash.mesh.geometry.dispose();
      });
      
      // Clean up scene
      scene.remove(orange);
      orange.geometry.dispose();
      orange.material.dispose();
      
      scene.remove(ambientLight);
      scene.remove(pointLight);
      
      renderer.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`inline-block ${className}`}
      style={{ width: '400px', height: '400px' }}
    />
  );
};

export default OrangeBurstAnimation;