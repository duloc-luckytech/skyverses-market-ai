
export interface Subject { id: string; name: string; img: string; }
export interface Scene { id: string; name: string; img: string; }
export interface Style { id: string; name: string; img: string; }

export const SUBJECTS: Subject[] = [
  { id: 's1', name: 'Cyber Ronin', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&h=400&fit=crop' },
  { id: 's2', name: 'Void Astronaut', img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400&h=400&fit=crop' },
  { id: 's3', name: 'Luxury Chronos', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=400&fit=crop' },
  { id: 's4', name: 'Mythic Beast', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&h=400&fit=crop' },
  { id: 's5', name: 'Neo-Gothic Avatar', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=400&fit=crop' },
  { id: 's6', name: 'Robotic Sentinel', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&h=400&fit=crop' }
];

export const SCENES: Scene[] = [
  { id: 'sc1', name: 'Neo-Tokyo Rooftop', img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&h=400&fit=crop' },
  { id: 'sc2', name: 'Deep Nebula Void', img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&h=400&fit=crop' },
  { id: 'sc3', name: 'Ancient Temple', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&h=400&fit=crop' },
  { id: 'sc4', name: 'Hyper-Modern Lab', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=600&h=400&fit=crop' }
];

export const STYLES: Style[] = [
  { id: 'st1', name: 'Hyper-Realistic', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&h=400&fit=crop' },
  { id: 'st2', name: 'Cyber-Synth', img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=600&h=400&fit=crop' },
  { id: 'st3', name: 'Anime Cinematic', img: 'https://images.unsplash.com/photo-1578632738981-63806a624da5?q=80&w=600&h=400&fit=crop' },
  { id: 'st4', name: 'Abstract Liquid', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&h=400&fit=crop' },
  { id: 'st5', name: 'Unreal Engine 5', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&h=400&fit=crop' }
];
