import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Activity, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AxisGizmo } from './AxisGizmo';

interface ViewportProps {
  logic: any;
  activeAsset: any;
  onMouseDown: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  modelUrl?: string | null;
  onLoadStart?: () => void;
  onLoadComplete?: (thumbnailUrl: string) => void;
  children?: React.ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({ 
  logic, 
  activeAsset, 
  onMouseDown, 
  onWheel, 
  modelUrl, 
  onLoadStart,
  onLoadComplete,
  children 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const pivotGroupRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const skeletonRef = useRef<THREE.SkeletonHelper | null>(null);

  const [topologyStats, setTopologyStats] = useState({ faces: 0, vertices: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Track current loading operation to prevent race conditions
  const loadingIdRef = useRef<number>(0);

  const calculateTopology = (object: THREE.Object3D) => {
    let faces = 0;
    let vertices = 0;
    object.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry;
        if (geometry.index) {
          faces += geometry.index.count / 3;
        } else {
          faces += geometry.attributes.position.count / 3;
        }
        vertices += geometry.attributes.position.count;
      }
    });
    return { faces, vertices };
  };

  // Helper to dispose of geometries and materials to prevent memory leaks
  const disposeObject = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Enable THREE cache
    THREE.Cache.enabled = true;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pivot = new THREE.Group();
    pivotGroupRef.current = pivot;
    scene.add(pivot);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    pivot.add(modelGroup);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(500, 100, 0x444444, 0x222222);
    gridHelper.position.y = -1.5; 
    pivot.add(gridHelper);
    gridHelperRef.current = gridHelper;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      if (width === 0 || height === 0) return;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (pivotGroupRef.current) disposeObject(pivotGroupRef.current);
      renderer.dispose();
    };
  }, []);

  // Effect to load GLB model from URL
  useEffect(() => {
    if (!sceneRef.current || !modelUrl || !rendererRef.current || !cameraRef.current || !modelGroupRef.current) return;
    
    // Increment loading ID to invalidate previous pending loads
    const currentLoadingId = ++loadingIdRef.current;
    
    setIsLoading(true);
    setLoadProgress(0);
    setLoadError(null);
    onLoadStart?.();

    // Clear previous model from scene
    disposeObject(modelGroupRef.current);
    while(modelGroupRef.current.children.length > 0){ 
      modelGroupRef.current.remove(modelGroupRef.current.children[0]); 
    }

    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (currentLoadingId === loadingIdRef.current) {
        setLoadProgress(Math.round((itemsLoaded / itemsTotal) * 100));
      }
    };

    manager.onError = (url) => {
      if (currentLoadingId === loadingIdRef.current) {
        console.error('LoadingManager error on:', url);
        setLoadError(`Không thể tải tài nguyên: ${url.split('/').pop()}`);
      }
    };

    loader.load(
      modelUrl, 
      (gltf: { scene: THREE.Group }) => {
        // Only proceed if this is still the most recent load request
        if (currentLoadingId !== loadingIdRef.current) return;

        const model = gltf.scene;
        
        // Auto-Center logic
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / (maxDim || 1);
        model.scale.setScalar(scale);

        model.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
            
            // Apply logic-based material properties
            if (m.material) {
              const materials = Array.isArray(m.material) ? m.material : [m.material];
              materials.forEach((mat: any) => {
                if (mat.isMeshStandardMaterial) {
                  mat.roughness = logic.roughness;
                  mat.metalness = logic.metallic;
                  mat.flatShading = logic.shading === 'Flat';
                  mat.needsUpdate = true;
                }
              });
            }
          }
        });

        if (modelGroupRef.current) {
          modelGroupRef.current.add(model);
        }
        
        if (gridHelperRef.current) {
          gridHelperRef.current.position.y = - (size.y * scale / 2) - 0.1;
        }
        
        setTopologyStats(calculateTopology(model));
        
        // Final render to capture thumbnail
        requestAnimationFrame(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current && pivotGroupRef.current && currentLoadingId === loadingIdRef.current) {
            // Save state
            const savedZoom = logic.zoom;
            const originalRotationX = pivotGroupRef.current.rotation.x;
            const originalRotationY = pivotGroupRef.current.rotation.y;
            
            // Set for thumbnail capture
            cameraRef.current.position.z = 4.5;
            pivotGroupRef.current.rotation.x = THREE.MathUtils.degToRad(15);
            pivotGroupRef.current.rotation.y = THREE.MathUtils.degToRad(35);
            
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            const thumb = rendererRef.current.domElement.toDataURL('image/png');
            
            // Restore state
            cameraRef.current.position.z = 5 / (savedZoom || 1);
            pivotGroupRef.current.rotation.x = originalRotationX;
            pivotGroupRef.current.rotation.y = originalRotationY;
            
            onLoadComplete?.(thumb);
            setIsLoading(false);
          }
        });
      },
      (xhr: ProgressEvent) => {
        if (xhr.lengthComputable && currentLoadingId === loadingIdRef.current) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error: ErrorEvent | Error | unknown) => {
        if (currentLoadingId === loadingIdRef.current) {
          console.error('GLTFLoader error:', error);
          setLoadError("Lỗi giải mã mô hình 3D. Vui lòng kiểm tra định dạng tệp.");
          setIsLoading(false);
        }
      }
    );
  }, [modelUrl]);

  // Sync transformations from logic
  useEffect(() => {
    if (!pivotGroupRef.current || !cameraRef.current || !modelGroupRef.current) return;
    pivotGroupRef.current.rotation.x = THREE.MathUtils.degToRad(logic.rotationX);
    pivotGroupRef.current.rotation.y = THREE.MathUtils.degToRad(logic.rotationY);
    pivotGroupRef.current.rotation.z = THREE.MathUtils.degToRad(logic.rotationZ || 0);
    cameraRef.current.position.z = 5 / (logic.zoom || 1);
    
    if (gridHelperRef.current) gridHelperRef.current.visible = logic.showGrid;

    const updateMaterial = (obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mat = (obj as THREE.Mesh).material;
        const materials = Array.isArray(mat) ? mat : [mat];
        materials.forEach((m: any) => {
          if (m && m.isMeshStandardMaterial) {
            m.roughness = logic.roughness;
            m.metalness = logic.metallic;
            m.flatShading = logic.shading === 'Flat';
            m.wireframe = logic.activeTab === 'Retopology';
            m.needsUpdate = true;
          }
        });
      }
      obj.children.forEach(updateMaterial);
    };
    updateMaterial(modelGroupRef.current);

    if (logic.activeTab === 'Rigging') {
        modelGroupRef.current.visible = true; // Still visible but with skeleton
        if (!skeletonRef.current) {
            const helper = new THREE.SkeletonHelper(modelGroupRef.current);
            sceneRef.current?.add(helper);
            skeletonRef.current = helper;
        }
        skeletonRef.current.visible = true;
    } else {
        modelGroupRef.current.visible = true;
        if (skeletonRef.current) skeletonRef.current.visible = false;
    }
  }, [logic.rotationX, logic.rotationY, logic.rotationZ, logic.zoom, logic.showGrid, logic.roughness, logic.metallic, logic.shading, logic.activeTab]);

  const handleSnap = (view: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT') => {
    switch(view) {
        case 'FRONT': logic.setRotationX(0); logic.setRotationY(0); logic.setRotationZ(0); break;
        case 'BACK': logic.setRotationX(0); logic.setRotationY(180); logic.setRotationZ(0); break;
        case 'TOP': logic.setRotationX(90); logic.setRotationY(0); logic.setRotationZ(0); break;
        case 'BOTTOM': logic.setRotationX(-90); logic.setRotationY(0); logic.setRotationZ(0); break;
        case 'RIGHT': logic.setRotationX(0); logic.setRotationY(90); logic.setRotationZ(0); break;
        case 'LEFT': logic.setRotationX(0); logic.setRotationY(-90); logic.setRotationZ(0); break;
    }
  };

  return (
    <main 
      className="flex-grow relative bg-[#222327] flex flex-col items-center justify-center overflow-hidden cursor-move"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000" style={{ 
        background: `radial-gradient(circle at 50% 50%, #3a3b3f 0%, #1a1b1e 100%)`
      }}></div>
      
      <div ref={mountRef} className="absolute inset-0 z-10 w-full h-full" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-[#141519]/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-brand-blue animate-spin" strokeWidth={1} />
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/30 animate-pulse" size={24} />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white animate-pulse">Syncing Mesh Lattice</h3>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  className="h-full bg-brand-blue shadow-[0_0_15px_rgba(0,144,255,0.8)]"
                />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{loadProgress}% Complete</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {loadError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[210] bg-black/60 backdrop-blur-md flex items-center justify-center p-8"
          >
             <div className="bg-[#1a1b1e] border border-red-500/20 rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-6 shadow-3xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                   <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-black uppercase tracking-tight text-white">Lỗi nạp mô hình</h4>
                   <p className="text-sm text-gray-400 leading-relaxed">{loadError}</p>
                </div>
                <button 
                  onClick={() => setLoadError(null)}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                   Đóng thông báo
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {logic.showAxisGizmo && (
        <AxisGizmo 
          rotationX={logic.rotationX} 
          rotationY={logic.rotationY} 
          rotationZ={logic.rotationZ} 
          onSnap={handleSnap}
        />
      )}

      <AnimatePresence>
        {logic.activeTab === 'Retopology' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-screen bg-repeat"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logic.showTopologyInfo && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 left-6 text-left font-mono text-[10px] text-gray-500 space-y-1 p-5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl z-30 pointer-events-none"
          >
            <p className="flex justify-between gap-8 text-brand-blue font-black tracking-widest uppercase italic">Topology_Monitor</p>
            <p className="flex justify-between gap-8 pt-2">Topology: <span className="text-brand-blue">Triangle</span></p>
            <p className="flex justify-between gap-8">Faces: <span className="text-white">{topologyStats.faces.toLocaleString()}</span></p>
            <p className="flex justify-between gap-8">Vertices: <span className="text-white">{topologyStats.vertices.toLocaleString()}</span></p>
            <p className="flex justify-between gap-8 pt-2 text-[8px] opacity-40">NODE_UPLINK: ACTIVE</p>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </main>
  );
};
