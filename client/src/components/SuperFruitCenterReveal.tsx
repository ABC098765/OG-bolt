import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const SuperFruitCenterReveal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const [textVisible, setTextVisible] = useState(false);

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
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '10';
    mountRef.current.appendChild(renderer.domElement);

    // Orange sphere (starts behind screen)
    const orangeGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const orangeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6600, 
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x331100
    });
    const orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    orange.position.set(0, 0, -20); // Start far back
    scene.add(orange);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffa500, 3, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Load splash textures
    const loader = new THREE.TextureLoader();
    const splashTextures = [
      loader.load("/splash1.png"),
      loader.load("/splash2.png"), 
      loader.load("/splash3.png")
    ];

    const splashes: Array<{ 
      mesh: THREE.Mesh; 
      life: number; 
      velocity: THREE.Vector3; 
      frameIndex: number;
      frameTimer: number;
    }> = [];
    
    let animationPhase = 0; // 0: waiting, 1: moving forward, 2: bursting, 3: finished
    let waitTimer = 0;

    // Create burst splashes with frame animation
    const createBurstSplashes = () => {
      for (let i = 0; i < 12; i++) {
        const material = new THREE.MeshBasicMaterial({
          map: splashTextures[0],
          transparent: true,
          opacity: 1,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        
        const splash = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);
        splash.position.copy(orange.position);
        
        // Radial velocity pattern for better burst effect
        const angle = (i / 12) * Math.PI * 2;
        const speed = 5 + Math.random() * 3;
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          Math.random() * 2 + 1
        );
        
        splash.rotation.z = Math.random() * Math.PI * 2;
        splashes.push({ 
          mesh: splash, 
          life: 1.5, 
          velocity, 
          frameIndex: 0,
          frameTimer: 0
        });
        scene.add(splash);
      }
      
      // Hide orange and reveal text
      orange.visible = false;
      setTextVisible(true);
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (animationPhase === 0) {
        // Wait 3 seconds before starting
        waitTimer += 0.016;
        if (waitTimer >= 3) {
          animationPhase = 1;
        }
      } else if (animationPhase === 1) {
        // Orange moving forward with rotation
        orange.position.z += 0.25;
        orange.rotation.x += 0.04;
        orange.rotation.y += 0.06;
        
        // Add some wobble for dramatic effect
        orange.position.x = Math.sin(orange.position.z * 0.1) * 0.3;
        orange.position.y = Math.cos(orange.position.z * 0.15) * 0.2;
        
        // When orange reaches screen, burst
        if (orange.position.z > 5) {
          animationPhase = 2;
          createBurstSplashes();
        }
      }

      // Animate splash particles with frame cycling
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        splash.life -= 0.01;
        
        // Move splash particles outward with physics
        splash.mesh.position.add(splash.velocity.clone().multiplyScalar(0.12));
        splash.velocity.y -= 0.08; // Gravity
        splash.velocity.multiplyScalar(0.98); // Air resistance
        
        // Cycle through animation frames
        splash.frameTimer += 0.016;
        if (splash.frameTimer >= 0.08) { // Faster frame rate for better animation
          splash.frameTimer = 0;
          splash.frameIndex = (splash.frameIndex + 1) % splashTextures.length;
          (splash.mesh.material as THREE.MeshBasicMaterial).map = splashTextures[splash.frameIndex];
          (splash.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
        
        // Fade out and scale up
        (splash.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(splash.life / 1.5, 0);
        const scale = 1 + (1.5 - splash.life) * 1.5;
        splash.mesh.scale.setScalar(scale);

        if (splash.life <= 0) {
          scene.remove(splash.mesh);
          (splash.mesh.material as THREE.MeshBasicMaterial).dispose();
          splash.mesh.geometry.dispose();
          splashes.splice(i, 1);
        }
      }

      // Reset animation when all splashes are gone
      if (animationPhase === 2 && splashes.length === 0) {
        animationPhase = 3;
        setTimeout(() => {
          // Reset for next cycle
          orange.position.set(0, 0, -20);
          orange.visible = true;
          setTextVisible(false);
          animationPhase = 0;
          waitTimer = 0;
        }, 8000); // Wait 8 seconds before next cycle
      }

      renderer.render(scene, camera);
    };

    animate();

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
      
      splashes.forEach(splash => {
        scene.remove(splash.mesh);
        (splash.mesh.material as THREE.MeshBasicMaterial).dispose();
        splash.mesh.geometry.dispose();
      });
      
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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* 3D Animation Canvas */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* Hidden Text That Reveals */}
      <div className="relative z-20 text-center">
        <h1 
          className={`text-6xl sm:text-7xl lg:text-9xl font-black transition-all duration-2000 transform ${
            textVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-8'
          }`}
          style={{
            backgroundImage: textVisible 
              ? 'linear-gradient(45deg, #ff6600, #ff9500, #ffb800, #ff6600)'
              : 'none',
            backgroundSize: '400% 400%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: textVisible ? 'gradientShift 3s ease-in-out infinite' : 'none',
            textShadow: textVisible ? '0 0 30px rgba(255, 102, 0, 0.5)' : 'none',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              backgroundImage: textVisible 
                ? 'linear-gradient(45deg, #16a34a, #22c55e, #4ade80, #16a34a)'
                : 'none',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: textVisible ? 'gradientShift 3s ease-in-out infinite reverse' : 'none',
            }}
          >
            CENTER
          </span>
        </h1>
      </div>

      {/* Custom styles are handled by Tailwind and inline styles */}
    </section>
  );
};

export default SuperFruitCenterReveal;