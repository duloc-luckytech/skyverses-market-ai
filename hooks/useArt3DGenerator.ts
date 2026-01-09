import { useState } from 'react';

export interface Art3DAsset {
  id: string;
  name: string;
  thumb: string;
  type: 'Textured' | 'Untextured';
  faces: string;
  vertices: string;
}

export const useArt3DGenerator = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Viewport States
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [zoom, setZoom] = useState(1.0); // Reset to 1.0 for normal default zoom
  const [showGrid, useStateGrid] = useState(true);
  const [showAxisGizmo, setShowAxisGizmo] = useState(true);
  const [showTopologyInfo, setShowTopologyInfo] = useState(true);
  
  // Material States
  const [shading, setShading] = useState<'Flat' | 'Smooth'>('Smooth');
  const [isPBR, setIsPBR] = useState(true);
  const [metallic, setMetallic] = useState(0.8);
  const [roughness, setRoughness] = useState(0.4);
  const [activeMaterial, setActiveMaterial] = useState(1);

  // Model Info
  const [prompt, setPrompt] = useState('A highly detailed damaged space helmet, worn and weathered textures, cinematic lighting, industrial design');
  const [modelName, setModelName] = useState('Battleworn_Helmet_v1');

  // Assets - Updated to the requested Damaged Helmet model metadata
  const [assets, setAssets] = useState<Art3DAsset[]>([
    { 
      id: 'as-1', 
      name: 'Battleworn_Helmet_v1', 
      thumb: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/Screenshot/Screenshot.png',
      type: 'Textured',
      faces: '15,422',
      vertices: '12,154'
    }
  ]);

  return {
    isStudioOpen, setIsStudioOpen,
    activeTab, setActiveTab,
    rotationX, setRotationX,
    rotationY, setRotationY,
    rotationZ, setRotationZ,
    zoom, setZoom,
    showGrid: showGrid, 
    setShowGrid: useStateGrid,
    showAxisGizmo, setShowAxisGizmo,
    showTopologyInfo, setShowTopologyInfo,
    shading, setShading,
    isPBR, setIsPBR,
    metallic, setMetallic,
    roughness, setRoughness,
    activeMaterial, setActiveMaterial,
    prompt, setPrompt,
    modelName, setModelName,
    assets,
    setAssets 
  };
};