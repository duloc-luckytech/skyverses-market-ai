
import React from 'react';
import { motion } from 'framer-motion';
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
    className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 group ${isDanger ? 'text-red-500' : 'text-slate-700 dark:text-gray-200'}`}
  >
    <div className="flex items-center gap-3">
      {icon && <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">{icon}</span>}
      <span className="truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {shortcut && <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-mono">{shortcut}</span>}
      {hasSubmenu && <ChevronRight size={14} className="text-gray-400" />}
    </div>
  </button>
);

const Separator = () => <div className="h-px bg-black/5 dark:bg-white/5 my-1" />;

export const WorkflowContextMenu: React.FC<WorkflowContextMenuProps> = ({ x, y, onClose, onAddNode, onAddGroup }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ top: y, left: x }}
      className="fixed z-[600] w-64 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#444] rounded-lg shadow-2xl py-1.5 overflow-hidden backdrop-blur-md"
    >
      <MenuItem label="Bản đồ quy trình" icon={<MapIcon size={14} />} shortcut="(Shift+m)" />
      <MenuItem label="Dọn dẹp bộ nhớ đồ họa" icon={<Rocket size={14} />} shortcut="(Shift+r)" />
      
      <Separator />
      
      <MenuItem 
        label="Thêm khối mới" icon={<Plus size={14} />} hasSubmenu 
        onClick={() => { onAddNode(); onClose(); }}
      />
      <MenuItem 
        label="Tạo nhóm khối" icon={<Layers size={14} />} 
        onClick={() => { onAddGroup(); onClose(); }}
      />
      <MenuItem label="Chuyển thành khối nhóm" icon={<Layout size={14} />} />
      <MenuItem label="Chạy các khối kết quả đã chọn" />
      
      <Separator />

      <MenuItem label="Lõi quy trình chính" hasSubmenu icon={<Cpu size={14} />} />
      <MenuItem label="Quản lý các nhóm khối" />
      
      <Separator />

      <MenuItem label="Lưu vùng chọn làm mẫu" />
      <MenuItem label="Thư viện mẫu quy trình" hasSubmenu />
      <MenuItem label="Sắp xếp (Căn trái)" />
      <MenuItem label="Sắp xếp (Căn phải)" />

      <Separator />

      <MenuItem label="Theo dõi quá trình chạy" />
      <MenuItem label="Di chuyển tới khối..." hasSubmenu />
      
      <Separator />

      <MenuItem label="Ẩn các liên kết rác" />
      <MenuItem label="Chuẩn hóa toàn bộ liên kết" />
      
      <Separator />

      <MenuItem label="Khối mở rộng" hasSubmenu icon={<Sparkles size={14} />} />
      <MenuItem label="Hình ảnh quy trình" hasSubmenu />
      
      <Separator />

      <MenuItem label="Thoát trình biên tập" isDanger onClick={onClose} />
    </motion.div>
  );
};
