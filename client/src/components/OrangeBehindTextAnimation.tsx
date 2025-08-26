import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface OrangeBehindTextAnimationProps {
  className?: string;
}

const OrangeBehindTextAnimation: React.FC<OrangeBehindTextAnimationProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '1';
    mountRef.current.appendChild(renderer.domElement);

    // Orange sphere (starts behind screen)
    const orangeGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const orangeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6600, 
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0x331100
    });
    const orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    orange.position.set(2, 0, -15); // Start far back and to the right
    scene.add(orange);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffa500, 2, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Load splash textures
    const loader = new THREE.TextureLoader();
    const splashTextures = [
      loader.load("/splash1.png"),
      loader.load("/splash2.png"), 
      loader.load("/splash3.png")
    ];

    const splashes: Array<{ mesh: THREE.Mesh; life: number; velocity: THREE.Vector3 }> = [];
    let orangeAnimationPhase = 0; // 0: moving forward, 1: bursting, 2: reset

    // Create multiple splash particles
    const createBurstSplashes = () => {
      for (let i = 0; i < 8; i++) {
        const texture = splashTextures[Math.floor(Math.random() * splashTextures.length)];
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 1,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        
        const splash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        splash.position.copy(orange.position);
        
        // Random velocity for each splash particle
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          Math.random() * 4 + 2
        );
        
        splash.rotation.z = Math.random() * Math.PI * 2;
        splashes.push({ mesh: splash, life: 1, velocity });
        scene.add(splash);
      }
      
      // Hide orange after burst
      orange.visible = false;
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Orange movement animation
      if (orangeAnimationPhase === 0) {
        // Move orange forward from behind
        orange.position.z += 0.15;
        orange.rotation.x += 0.02;
        orange.rotation.y += 0.03;
        
        // When orange reaches front of screen, trigger burst
        if (orange.position.z > 3) {
          orangeAnimationPhase = 1;
          createBurstSplashes();
        }
      }

      // Animate splash particles
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        splash.life -= 0.015;
        
        // Move splash particles outward
        splash.mesh.position.add(splash.velocity.clone().multiplyScalar(0.1));
        splash.velocity.y -= 0.1; // Add gravity
        
        // Fade and scale
        (splash.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(splash.life, 0);
        splash.mesh.scale.setScalar(1.5 + (1 - splash.life) * 2);

        if (splash.life <= 0) {
          scene.remove(splash.mesh);
          (splash.mesh.material as THREE.MeshBasicMaterial).dispose();
          splash.mesh.geometry.dispose();
          splashes.splice(i, 1);
        }
      }

      // Reset animation after all splashes are gone
      if (orangeAnimationPhase === 1 && splashes.length === 0) {
        setTimeout(() => {
          orange.position.set(2, 0, -15);
          orange.visible = true;
          orangeAnimationPhase = 0;
        }, 4000); // Wait 4 seconds before next animation
      }

      renderer.render(scene, camera);
    };

    // Start first animation after 2 seconds
    setTimeout(() => {
      animate();
    }, 2000);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
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
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

export default OrangeBehindTextAnimation;