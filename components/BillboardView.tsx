import React from 'react';
import { Advertisement } from '../types';
import AdCard from './AdCard';
import { Settings } from 'lucide-react';

interface BillboardViewProps {
  ads: Advertisement[];
  onOpenAdmin: () => void;
}

const BillboardView: React.FC<BillboardViewProps> = ({ ads, onOpenAdmin }) => {
  return (
    <div className="min-h-screen bg-night-900 relative flex flex-col items-center">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-night-900 to-black pointer-events-none z-0" />

      {/* Header / Marquee */}
      <div className="w-full bg-black border-b border-gray-800 z-10 sticky top-0 bg-opacity-90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 animate-pulse-slow">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">
              TIMES SQUARE LIVE
            </h1>
          </div>
          
          <button 
            onClick={onOpenAdmin}
            className="text-gray-500 hover:text-white transition-colors"
            title="Admin Login"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <main className="w-full max-w-[1600px] p-4 md:p-8 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] gap-4">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
            
            {/* Empty Slots Filler if needed */}
            {ads.length === 0 && (
              <div className="col-span-full h-96 flex items-center justify-center text-gray-500 font-mono border-2 border-dashed border-gray-800 rounded-xl">
                SYSTEM OFFLINE // NO SIGNAL
              </div>
            )}
        </div>
      </main>
      
      {/* Footer / Credits */}
      <footer className="w-full py-8 text-center text-gray-600 text-xs font-mono z-10">
        <p>POWERED BY NEONSQUARE TECH • NYC MANHATTAN VIBE</p>
      </footer>
    </div>
  );
};

export default BillboardView;