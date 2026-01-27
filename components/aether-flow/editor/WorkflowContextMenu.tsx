import React from 'react';
import { motion } from 'framer-motion';
// Fixed: Moved Sparkles to top-level imports from lucide-react
import { 
  Plus, 
  Layers, 
  Map as MapIcon, 
  Rocket, 
  ChevronRight, 
  Layout, 
  Settings, 
  Trash2,
  Cpu,
  Sparkles
} from 'lucide-react';

interface WorkflowContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: () => void;
  onAddGroup: () => void;
}

const MenuItem = ({ label, icon, shortcut, hasSubmenu, onClick, isDanger = false }: any) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/10 group ${isDanger ? 'text-red-400' : 'text-gray-200'}`}
  >
    <div className="flex items-center gap-3">
      {icon && <span className="text-gray-500 group-hover:text-white transition-colors">{icon}</span>}
      <span className="truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {shortcut && <span className="text-[10px] text-gray-600 group-hover:text-gray-400 font-mono">{shortcut}</span>}
      {hasSubmenu && (
        <div className="flex items-center">
          <ChevronRight size={14} className="text-gray-600" />
          <div className="w-1 h-4 bg-brand-blue ml-1 rounded-sm opacity-60"></div>
        </div>
      )}
    </div>
  </button>
);

const Separator = () => <div className="h-px bg-white/5 my-1" />;

export const WorkflowContextMenu: React.FC<WorkflowContextMenuProps> = ({ x, y, onClose, onAddNode, onAddGroup }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ top: y, left: x }}
      className="fixed z-[600] w-64 bg-[#222222] border border-[#444444] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)] py-1.5 overflow-hidden backdrop-blur-md"
    >
      <MenuItem 
        label="Nodes Map" 
        icon={<MapIcon size={14} />} 
        shortcut="(Shift+m)" 
      />
      <MenuItem 
        label="Cleanup Of VRAM Usage" 
        icon={<Rocket size={14} />} 
        shortcut="(Shift+r)" 
      />
      
      <Separator />
      
      <MenuItem 
        label="Add Node" 
        icon={<Plus size={14} />} 
        hasSubmenu 
        onClick={() => {
          onAddNode();
          onClose();
        }}
      />
      <MenuItem 
        label="Add Group" 
        icon={<Layers size={14} />} 
        onClick={() => {
          onAddGroup();
          onClose();
        }}
      />
      <MenuItem label="Convert to Group Node" icon={<Layout size={14} />} />
      <MenuItem label="Queue Selected Output Nodes" />
      <MenuItem label="Queue Group Output Nodes" />

      <Separator />

      <MenuItem label="aether-flow-core" hasSubmenu icon={<Cpu size={14} />} />
      <MenuItem label="Manage Group Nodes" />
      
      <Separator />

      <MenuItem label="Save Selected as Template" />
      <MenuItem label="Node Templates" hasSubmenu />
      <MenuItem label="Arrange (float left)" />
      <MenuItem label="Arrange (float right)" />

      <Separator />

      <MenuItem label="Follow execution" />
      <MenuItem label="Go to node" hasSubmenu />
      
      <Separator />

      <MenuItem label="Hide UE links" />
      <MenuItem label="Convert all UEs to real links" />
      
      <Separator />

      <MenuItem label="skyverses-nodes" hasSubmenu icon={<Sparkles size={14} />} />
      <MenuItem label="Workflow Image" hasSubmenu />
      
      <Separator />

      <MenuItem label="Nodes Map Mixlab" isDanger />
    </motion.div>
  );
};