
import React from 'react';
import PromptArchitectInterface from './PromptArchitectInterface';
import NebulaDemoInterface from './NebulaDemoInterface';
import MotionCraftInterface from './MotionCraftInterface';
import AetherFlowInterface from './AetherFlowInterface';
import { AlertCircle } from 'lucide-react';

interface DemoInterfaceProps {
  type: 'text' | 'image' | 'video' | 'automation';
}

const DemoInterface: React.FC<DemoInterfaceProps> = ({ type }) => {
  switch (type) {
    case 'text':
      return <PromptArchitectInterface />;
    case 'image':
      return <NebulaDemoInterface />;
    case 'video':
      return <MotionCraftInterface />;
    case 'automation':
      return <AetherFlowInterface />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 opacity-40 italic">
          <AlertCircle size={48} />
          <p className="text-sm font-black uppercase tracking-[0.4em]">Node_Protocol_Not_Supported</p>
        </div>
      );
  }
};

export default DemoInterface;
