
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, EyeOff, Map as MapIcon, ChevronRight, ChevronLeft, 
  Folder, FolderOpen, Box, Grid, RefreshCw, Layers, Sliders,
  CheckCircle2, ChevronDown, ListTree, Package
} from 'lucide-react';
import { Node } from '@xyflow/react';

interface NodesMapSidebarProps {
  nodes: Node[];
  onToggleVisibility: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface LibraryFolder {
  id: string;
  name: string;
  count: number;
  isOpen: boolean;
  children?: { name: string; type: 'node' | 'folder' }[];
}

export const NodesMapSidebar: React.FC<NodesMapSidebarProps> = ({ nodes, onToggleVisibility, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'LIBRARY' | 'MAP'>('LIBRARY');

  const [folders, setFolders] = useState<LibraryFolder[]>([
    { 
      id: 'bdx', 
      name: 'BDXNodes', 
      count: 2, 
      isOpen: false,
      children: [
        { name: 'BDX Model Loader', type: 'node' },
        { name: 'BDX Control Net', type: 'node' }
      ]
    },
    { 
      id: 'sampling', 
      name: 'sampling', 
      count: 141, 
      isOpen: true,
      children: [
        { name: 'KSampler', type: 'node' },
        { name: 'KSampler (Advanced)', type: 'node' },
        { name: 'LCM Sampler', type: 'node' },
        { name: 'custom_sampling', type: 'folder' },
        { name: 'video_models', type: 'folder' },
        { name: 'schedulers', type: 'folder' }
      ]
    },
    { id: 'loaders', name: 'loaders', count: 12, isOpen: false },
    { id: 'conditioning', name: 'conditioning', count: 8, isOpen: false },
    { id: 'upscaling', name: 'upscaling', count: 15, isOpen: false }
  ]);

  const toggleFolder = (id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
  };

  const filteredNodes = nodes.filter(node => 
    node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.data?.label as string)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 320 : 0 }}
      className="relative border-r border-white/5 bg-[#0f0f11] flex flex-col shrink-0 z-50 shadow-2xl transition-all duration-300"
    >
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
            className="w-[320px] flex flex-col h-full overflow-hidden"
          >
            {/* TABS SELECTOR */}
            <div className="flex bg-black/40 p-1 shrink-0">
               <button 
                 onClick={() => setActiveMenu('LIBRARY')}
                 className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-md ${activeMenu === 'LIBRARY' ? 'bg-white/10 text-brand-blue' : 'text-gray-500 hover:text-white'}`}
               >
                 Node Library
               </button>
               <button 
                 onClick={() => setActiveMenu('MAP')}
                 className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-md ${activeMenu === 'MAP' ? 'bg-white/10 text-brand-blue' : 'text-gray-500 hover:text-white'}`}
               >
                 Nodes Map
               </button>
            </div>

            <div className="p-5 border-b border-white/5 bg-black/20 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeMenu === 'LIBRARY' ? <Package size={16} className="text-brand-blue" /> : <MapIcon size={16} className="text-brand-blue" />}
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">
                    {activeMenu === 'LIBRARY' ? 'NODE LIBRARY' : 'NODES MAP'}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                   <button className="text-gray-500 hover:text-white transition-colors"><RefreshCw size={12} /></button>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeMenu === 'LIBRARY' ? "Search Nodes..." : "Search Instances..."}
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 pl-9 pr-4 text-[10px] font-bold text-gray-300 outline-none focus:border-brand-blue/50 transition-all placeholder:text-gray-700 shadow-inner"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar">
               {activeMenu === 'LIBRARY' ? (
                 /* NODE LIBRARY VIEW */
                 <div className="p-2 space-y-1">
                    {folders.map(folder => (
                       <div key={folder.id} className="space-y-1">
                          <button 
                            onClick={() => toggleFolder(folder.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                {folder.isOpen ? <FolderOpen size={14} className="text-brand-blue" /> : <Folder size={14} className="text-gray-500" />}
                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tight">{folder.name}</span>
                             </div>
                             <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full text-gray-600">{folder.count}</span>
                          </button>
                          
                          <AnimatePresence>
                             {folder.isOpen && folder.children && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="ml-6 space-y-0.5 overflow-hidden"
                                >
                                   {folder.children.map((child, idx) => (
                                      <button 
                                        key={idx}
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg transition-all text-left group"
                                      >
                                         <div className={`w-1.5 h-1.5 rounded-full ${child.type === 'node' ? 'bg-gray-600 group-hover:bg-brand-blue shadow-[0_0_8px_transparent] group-hover:shadow-brand-blue' : 'bg-transparent border border-gray-600 group-hover:border-brand-blue'}`}></div>
                                         <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">{child.name}</span>
                                      </button>
                                   ))}
                                </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                    ))}
                 </div>
               ) : (
                 /* NODES MAP VIEW */
                 <div className="p-2 space-y-1">
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
               )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-gray-600 tracking-widest italic">
                <span>Total Nodes: {nodes.length}</span>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span>System Secure</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
