
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Sparkles, Globe, 
  User, CheckCircle2, RefreshCw, 
  Activity, Play, Volume2, LayoutGrid,
  MonitorPlay, Fingerprint
} from 'lucide-react';

interface VoiceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voice: any) => void;
}

const VOICES = [
  { id: '1', name: 'Brian', type: 'ElevenLabs', category: 'Professional', gender: 'Nam', tags: ['Trầm ấm', 'MC'] },
  { id: '2', name: 'Sophie', type: 'ElevenLabs', category: 'Voice Design', gender: 'Nữ', tags: ['Ngọt ngào', 'Kể chuyện'] },
  { id: '3', name: 'Max', type: 'Minimax', category: 'Professional', gender: 'Nam', tags: ['Sôi động', 'Ads'] },
];

const VoiceLibraryModal: React.FC<VoiceLibraryModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [activeProvider, setActiveProvider] = useState('ElevenLabs');
  const [activeTab, setActiveTab] = useState('EXPLORE');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#0c0c0e] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-3xl"
      >
        <div className="flex h-full">
           
           {/* LEFT NAV: PROVIDERS */}
           <div className="w-[300px] border-r border-white/5 flex flex-col shrink-0 bg-black/40">
              <div className="p-8 border-b border-white/5">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Thư viện giọng</h2>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Chọn nhà cung cấp giọng nói</p>
              </div>
              <div className="p-4 space-y-3">
                 {[
                   { id: 'ElevenLabs', icon: <Sparkles size={18}/>, desc: 'Tạo giọng nói AI từ mô tả văn bản' },
                   { id: 'Minimax', icon: <Fingerprint size={18}/>, desc: 'Nhân bản giọng nói từ mẫu audio' }
                 ].map(p => (
                    <button 
                      key={p.id} onClick={() => setActiveProvider(p.id)}
                      className={`w-full p-6 border transition-all rounded-xl text-left group ${activeProvider === p.id ? 'border-purple-500 bg-purple-500/10' : 'border-transparent hover:bg-white/5'}`}
                    >
                       <div className="flex items-center gap-4 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeProvider === p.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>{p.icon}</div>
                          <span className={`text-lg font-black italic tracking-tighter ${activeProvider === p.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{p.id}</span>
                       </div>
                       <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">{p.desc}</p>
                    </button>
                 ))}
              </div>
           </div>

           {/* RIGHT CONTENT: VOICES GRID */}
           <div className="flex-grow flex flex-col">
              {/* Header Bar */}
              <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 shrink-0">
                 <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button 
                      onClick={() => setActiveTab('EXPLORE')}
                      className={`flex items-center gap-3 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'EXPLORE' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                    >
                       <Globe size={14}/> Khám phá (Hệ thống)
                    </button>
                    <button 
                      onClick={() => setActiveTab('DESIGN')}
                      className={`flex items-center gap-3 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'DESIGN' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                    >
                       <User size={14}/> Voice Design
                    </button>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                       <span className="text-[9px] font-black text-green-500 uppercase">Sẵn sàng</span>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><RefreshCw size={20}/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-colors ml-4"><X size={24}/></button>
                 </div>
              </div>

              {/* Grid Content */}
              <div className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-10">
                 <div className="relative group max-w-4xl mx-auto w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20} />
                    <input 
                      placeholder="Tìm giọng theo tên, phong cách..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-5 pl-16 pr-8 text-sm font-bold focus:border-purple-500/50 outline-none transition-all shadow-inner"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {VOICES.filter(v => v.type === activeProvider).map(v => (
                       <button 
                         key={v.id} onClick={() => onSelect(v)}
                         className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-purple-500/40 hover:bg-white/[0.04] transition-all group text-left relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Volume2 size={80}/></div>
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-all shadow-inner"><Play size={24} fill="currentColor" className="ml-1"/></div>
                             <span className="text-[8px] font-black uppercase px-2 py-1 bg-black/40 border border-white/10 text-gray-500 rounded-sm">{v.gender}</span>
                          </div>
                          <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">{v.name}</h4>
                          <div className="flex flex-wrap gap-2">
                             {v.tags.map(t => <span key={t} className="text-[7px] font-black uppercase tracking-widest text-gray-500 border border-white/5 px-1.5 py-0.5 rounded-sm">{t}</span>)}
                          </div>
                       </button>
                    ))}
                 </div>

                 {VOICES.filter(v => v.type === activeProvider).length === 0 && (
                   <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                      <Sparkles size={100} strokeWidth={1} />
                      <p className="text-lg font-black uppercase tracking-[0.5em] italic">Không tìm thấy giọng trong danh mục này.</p>
                   </div>
                 )}
              </div>
           </div>

        </div>
      </motion.div>
    </div>
  );
};

export default VoiceLibraryModal;
