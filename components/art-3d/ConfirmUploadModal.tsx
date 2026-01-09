import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, HelpCircle, Check, X as XIcon, Sparkles, Loader2, AlertCircle, MousePointer2, Move, ShieldCheck, Box } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ConfirmUploadModalProps {
  file: File | null;
  onClose: () => void;
  onConfirm: (settings: any) => void;
}

export const ConfirmUploadModal: React.FC<ConfirmUploadModalProps> = ({ file, onClose, onConfirm }) => {
  const [useOriginalUV, setUseOriginalUV] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Viewport states for UI feedback
  const [uiRotation, setUiRotation] = useState({ x: 19, y: 183 });
  const [uiZoom, setUiZoom] = useState(1);
  
  // Refs for current values accessible in async loops
  const rotationRef = useRef({ x: 19, y: 183 });
  const zoomRef = useRef(1);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  const examples = [
    { id: 1, good: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400', bad: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400' },
    { id: 2, good: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400', bad: 'https://images.unsplash.com/photo-1635236066249-724441e62102?auto=format&fit=crop&q=80&w=400' },
    { id: 3, good: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400', bad: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const mount = mountRef.current;
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      preserveDrawingBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pivot = new THREE.Group();
    scene.add(pivot);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Grid Helper
    const grid = new THREE.GridHelper(20, 40, 0x333333, 0x1a1a1a);
    grid.position.y = -1.5;
    scene.add(grid);

    // --- MODEL LOADING ---
    let modelUrl: string | null = null;
    let currentModel: THREE.Group | null = null;

    if (file) {
      setLoading(true);
      setError(null);
      const loader = new GLTFLoader();
      modelUrl = URL.createObjectURL(file);

      loader.load(
        modelUrl,
        (gltf: { scene: THREE.Group }) => {
          currentModel = gltf.scene;
          
          if (currentModel) {
            // Auto-center and Scale
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            currentModel.position.x -= center.x;
            currentModel.position.y -= center.y;
            currentModel.position.z -= center.z;
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.0 / (maxDim || 1); 
            currentModel.scale.setScalar(scale);

            currentModel.traverse((child: THREE.Object3D) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            pivot.add(currentModel);
          }
          setLoading(false);
        },
        undefined,
        (err: ErrorEvent | Error | unknown) => {
          console.error("Error loading 3D asset:", err);
          setError("LỖI TẢI TỆP: Vui lòng đảm bảo tệp 3D (GLB/GLTF) hợp lệ.");
          setLoading(false);
        }
      );
    }

    // --- ANIMATION LOOP ---
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      pivot.rotation.x = THREE.MathUtils.degToRad(rotationRef.current.x);
      pivot.rotation.y = THREE.MathUtils.degToRad(rotationRef.current.y);
      camera.position.z = 5 / (zoomRef.current || 1);
      
      renderer.render(scene, camera);
    };
    animate();

    // --- RESIZE HANDLER ---
    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mount);

    // --- INTERACTION ---
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      
      const newX = rotationRef.current.x + deltaY * 0.5;
      const newY = rotationRef.current.y + deltaX * 0.5;
      
      rotationRef.current = { x: newX, y: newY };
      setUiRotation({ x: newX, y: newY });
      
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newZoom = Math.max(0.1, Math.min(5, zoomRef.current - e.deltaY * 0.001));
      zoomRef.current = newZoom;
      setUiZoom(newZoom);
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('mousedown', onMouseDown);
      mount.removeEventListener('wheel', onWheel);
      
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (modelUrl) URL.revokeObjectURL(modelUrl);
    };
  }, [file]);

  const handleInternalConfirm = () => {
    let screenshot: string | null = null;
    if (rendererRef.current) {
      screenshot = rendererRef.current.domElement.toDataURL('image/png');
    }
    onConfirm({ rotation: rotationRef.current, zoom: zoomRef.current, useOriginalUV, screenshot });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-7xl h-[90vh] bg-[#121214] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-3xl"
      >
        {/* Header */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <Box size={18} />
             </div>
             <div className="flex flex-col">
                <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Xác nhận tải lên mô hình 3D</h2>
                <p className="text-[7px] font-black text-brand-blue uppercase tracking-[0.4em]">Công cụ quản lý tài sản 3D chuyên nghiệp</p>
             </div>
             <HelpCircle size={16} className="text-gray-500 ml-4" />
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Left Panel: Examples */}
          <div className="w-[320px] border-r border-white/5 bg-black/20 p-8 overflow-y-auto no-scrollbar space-y-8 shrink-0">
             <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Hướng dẫn góc nhìn</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  Đảm bảo góc nhìn bao quát được các chi tiết hình học quan trọng để tối ưu hóa việc hiển thị và xử lý tài sản.
                </p>
             </div>
             <div className="space-y-6">
                {examples.map(ex => (
                   <div key={ex.id} className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                         <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            <img src={ex.good} className="w-full h-full object-cover grayscale opacity-60" alt="Hợp lệ" />
                         </div>
                         <div className="flex justify-center"><Check className="text-emerald-500" size={16} /></div>
                      </div>
                      <div className="space-y-2">
                         <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            <img src={ex.bad} className="w-full h-full object-cover grayscale opacity-20" alt="Không hợp lệ" />
                         </div>
                         <div className="flex justify-center"><XIcon className="text-red-500" size={16} /></div>
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="pt-8 border-t border-white/5 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic leading-relaxed">
                  "Sản xuất tài sản 3D chất lượng cao. Quy trình sáng tạo và quản lý thông minh."
                </p>
             </div>
          </div>

          {/* Right Panel: Interactive Viewport */}
          <div className="flex-grow relative bg-[#0a0a0c] flex flex-col items-center justify-center">
             {loading && (
               <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                 <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Đang tải mô hình...</p>
               </div>
             )}
             
             {error && (
               <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black">
                 <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 space-y-4">
                   <AlertCircle className="mx-auto" size={48} />
                   <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                   <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-black uppercase">Thử lại</button>
                 </div>
               </div>
             )}

             <div ref={mountRef} className="w-full h-full cursor-move" />
             
             {/* HUD Overlays */}
             <div className="absolute top-10 left-10 flex items-center gap-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                   <MousePointer2 size={12} className="text-brand-blue" />
                   <span className="text-[9px] font-black uppercase text-white/80">Điều khiển xoay</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                   <Move size={12} className="text-brand-blue" />
                   <span className="text-[9px] font-black uppercase text-white/80">Cuộn để phóng to</span>
                </div>
             </div>

             <div className="absolute bottom-10 right-10 bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center gap-8 shadow-2xl">
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Tọa độ xoay</span>
                   <span className="text-[11px] font-mono font-bold text-white whitespace-nowrap">{Math.round(uiRotation.x)}°, {Math.round(uiRotation.y)}°</span>
                </div>
                <div className="h-5 w-px bg-white/10"></div>
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Tỷ lệ</span>
                   <span className="text-[11px] font-mono font-bold text-white whitespace-nowrap">x{uiZoom.toFixed(2)}</span>
                </div>
             </div>

             <div className="absolute top-10 right-10 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-widest italic shadow-xl">
               {file ? file.name : "Vật_thể_chưa_định_danh.glb"}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-24 px-10 border-t border-white/5 flex items-center justify-between bg-black/20 shrink-0">
           <div className="flex items-center gap-10">
              <div className="flex items-center gap-6">
                 <div className="space-y-0.5">
                    <p className="text-[11px] font-black uppercase text-white tracking-widest italic">Duy trì UV gốc</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest italic opacity-60">Bảo toàn sơ đồ kết cấu nguyên bản của mô hình</p>
                 </div>
                 <button 
                   onClick={() => setUseOriginalUV(!useOriginalUV)}
                   className={`w-14 h-7 rounded-full relative transition-colors ${useOriginalUV ? 'bg-brand-blue shadow-[0_0_20px_rgba(0,144,255,0.4)]' : 'bg-white/10'}`}
                 >
                    <motion.div animate={{ x: useOriginalUV ? 28 : 2 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-8">
             <button onClick={onClose} className="px-10 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Hủy bỏ</button>
             <button 
               onClick={handleInternalConfirm}
               disabled={loading || !!error}
               className="px-20 py-4 bg-brand-blue text-white rounded-full font-black uppercase text-xs tracking-[0.4em] hover:brightness-110 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
             >
                <ShieldCheck size={18} />
                Xác nhận tải lên
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
