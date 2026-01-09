
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Box, MousePointer2, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ThreeDPreviewProps {
  modelUrl: string;
}

const ThreeDPreview: React.FC<ThreeDPreviewProps> = ({ modelUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;

    loader.load(
      modelUrl,
      (gltf) => {
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / (maxDim || 1);
        model.scale.setScalar(scale);

        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error(err);
        setError("Không thể nạp mô hình 3D");
        setLoading(false);
      }
    );

    let frameId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (model && !isDragging) {
        model.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !model) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      model.rotation.y += deltaMove.x * 0.01;
      model.rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('mousedown', handleMouseDown);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue animate-pulse italic">Đang nạp thực thể 3D...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 text-red-500">
           <AlertTriangle size={32} />
           <span className="text-xs font-black uppercase tracking-widest">{error}</span>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {!loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 pointer-events-none">
          <div className="flex items-center gap-2">
            <MousePointer2 size={12} className="text-brand-blue" />
            <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">Kéo để xoay</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <Box size={12} className="text-brand-blue" />
            <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">Mô hình tương tác</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDPreview;
