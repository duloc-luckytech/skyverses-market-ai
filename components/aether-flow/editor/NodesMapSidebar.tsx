
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, EyeOff, Map as MapIcon, ChevronRight, ChevronLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Node } from '@xyflow/react';

interface NodesMapSidebarProps {
  nodes: Node[];
  onToggleVisibility: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const NodesMapSidebar: React.FC<NodesMapSidebarProps> = ({ nodes, onToggleVisibility, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodes.filter(node => 
    node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.data?.label as string)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 300 : 0 }}
      className="relative border-r border-white/5 bg-[#0f0f11] flex flex-col shrink-0 z-50 shadow-2xl transition-all duration-300"
    >
      {/* Toggle Button Container */}
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-[60]">
        <button 
          onClick={onToggle}
          className="w-8 h-12 bg-[#1a1b23] border border-white/10 border-l-0 rounded-r-xl flex items-center justify-center text-gray-400 hover:text-brand-blue transition-all shadow-xl"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-[300px] flex flex-col h-full overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-black/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapIcon size={16} className="text-brand-blue" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Nodes Map</h3>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Node ID/Name..."
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 pl-9 pr-4 text-[10px] font-bold text-gray-300 outline-none focus:border-brand-blue/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar p-2">
              <div className="space-y-1">
                {filteredNodes.length > 0 ? (
                  filteredNodes.map((node) => (
                    <div 
                      key={node.id}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 ${node.hidden ? 'opacity-40' : 'opacity-100'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-6 h-6 bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center rounded text-[10px] font-black text-emerald-400 shrink-0">
                          {node.id}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-white truncate uppercase tracking-tight">
                          {node.data?.label as string}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => onToggleVisibility(node.id)}
                        className="p-2 text-gray-500 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/10"
                      >
                        {node.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-10">
                    <Search size={32} className="mx-auto mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-widest">No Nodes Found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-gray-600 tracking-widest italic">
                <span>Active Nodes: {nodes.filter(n => !n.hidden).length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
