import React, { useMemo } from 'react';
import { Advertisement, AdType, AdSize } from '../types';
import { getYouTubeId } from '../utils';

interface AdCardProps {
  ad: Advertisement;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const sizeClasses = useMemo(() => {
    switch (ad.size) {
      case AdSize.LARGE: return 'col-span-1 md:col-span-2 row-span-2';
      case AdSize.WIDE: return 'col-span-1 md:col-span-2 row-span-1';
      case AdSize.TALL: return 'col-span-1 row-span-2';
      case AdSize.SMALL: default: return 'col-span-1 row-span-1';
    }
  }, [ad.size]);

  // Generate random neon border color for effect
  const glowColor = useMemo(() => {
    const colors = ['border-neon-pink', 'border-neon-blue', 'border-neon-purple', 'border-neon-yellow', 'border-white'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const renderContent = () => {
    if (ad.type === AdType.VIDEO) {
      const videoId = getYouTubeId(ad.url);
      if (!videoId) {
        return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-red-500">
            Invalid Video URL
          </div>
        );
      }
      return (
        <div className="w-full h-full relative overflow-hidden group">
          <iframe
            className="w-full h-full absolute inset-0 pointer-events-none scale-125 group-hover:scale-110 transition-transform duration-700"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`}
            title={ad.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Overlay to prevent interaction and add tint */}
          <div className="absolute inset-0 bg-transparent" />
        </div>
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden group">
        <img 
          src={ad.url} 
          alt={ad.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s] ease-in-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-800 border-2 ${glowColor} shadow-[0_0_15px_rgba(0,0,0,0.5)] group ${sizeClasses}`}>
      {renderContent()}
      
      {/* Title/Brand Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-bold text-lg uppercase tracking-wider font-mono shadow-black drop-shadow-md">
          {ad.title}
        </h3>
        {ad.description && (
          <p className="text-gray-300 text-xs mt-1 truncate">{ad.description}</p>
        )}
      </div>

      {/* Screen Mesh Effect */}
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/8c/Standard_grid.svg')] bg-[length:4px_4px] opacity-10 pointer-events-none mix-blend-overlay" />
      
      {/* Glass Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default AdCard;