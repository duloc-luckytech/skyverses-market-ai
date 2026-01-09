
import React from 'react';
import { motion } from 'framer-motion';
import { Solution } from '../../types';

interface LogsTabProps {
  remoteSolutions: Solution[];
}

export const LogsTab: React.FC<LogsTabProps> = ({ remoteSolutions }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-0">
      <div className="grid grid-cols-1 divide-y divide-black/5 dark:divide-white/10 font-mono text-[10px]">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <div key={i} className="px-12 py-6 flex items-center gap-8 group hover:bg-brand-blue/[0.02] transition-colors">
            <span className="text-gray-400 dark:text-gray-600 shrink-0 font-bold tracking-tighter">#{1024 + i}</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${i % 4 === 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {i % 4 === 0 ? 'CRITICAL' : 'EVENT'}
            </span>
            <span className="text-black dark:text-white font-bold opacity-80 flex-grow truncate">
              Node Synchronization: Solution Registry "{remoteSolutions[i % (remoteSolutions.length || 1)]?.slug || 'system_core'}" verified and updated via operational uplink.
            </span>
            <span className="text-gray-400 dark:text-gray-600 text-right shrink-0 italic">{new Date().toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
