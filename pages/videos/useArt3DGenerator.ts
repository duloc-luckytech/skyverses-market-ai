
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
  const [zoom, setZoom] = useState(0.2); // Deeper minimum zoom start
  const [showGrid, setShowGrid] = useState(true);
  const [showAxisGizmo, setShowAxisGizmo] = useState(true);
  const [showTopologyInfo, setShowTopologyInfo] = useState(true);
  
  // Material States
  const [shading, setShading] = useState<'Flat' | 'Smooth'>('Smooth');
  const [isPBR, setIsPBR] = useState(true);
  const [metallic, setMetallic] = useState(0.8);
  const [roughness, setRoughness] = useState(0.4);
  const [activeMaterial, setActiveMaterial] = useState(1);

  // Model Info
  const [prompt, setPrompt] = useState('An armored cyborg warrior with glowing purple energy cores, cinematic lighting, highly detailed mechanical joints');
  const [modelName, setModelName] = useState('Cyber_Ronin_Executioner_v4');

  // Assets
  const [assets, setAssets] = useState<Art3DAsset[]>([
    { 
      id: 'as-1', 
      name: 'Cyber_Ronin_v4', 
      thumb: 'https://d8j0ntlcm91z4.cloudfront.net/user_2wktMsxjtKgSKtgICToGYmGGjfw/955c04bf-959f-4832-843a-dfbaad2d82a3_min.webp',
      type: 'Textured',
      faces: '1,922,553',
      vertices: '1,022,860'
    },
    { 
      id: 'as-2', 
      name: 'Mecha_Guard_v1', 
      thumb: 'https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/6571fcff-b67e-4537-98fe-0301d9051c57_min.webp',
      type: 'Untextured',
      faces: '840,210',
      vertices: '420,105'
    }
  ]);

  return {
    isStudioOpen, setIsStudioOpen,
    activeTab, setActiveTab,
    rotationX, setRotationX,
    rotationY, setRotationY,
    rotationZ, setRotationZ,
    zoom, setZoom,
    showGrid, setShowGrid,
    showAxisGizmo, setShowAxisGizmo,
    showTopologyInfo, setShowTopologyInfo,
    shading, setShading,
    isPBR, setIsPBR,
    metallic, setMetallic,
    roughness, setRoughness,
    activeMaterial, setActiveMaterial,
    prompt, setPrompt,
    modelName, setModelName,
    assets
  };
};
