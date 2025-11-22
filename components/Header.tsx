import React from 'react';
import { Trees, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  isMobile?: boolean;
  onBackHome?: () => void;
  theme?: 'heritage' | 'original';
}

export const Header: React.FC<HeaderProps> = ({ isMobile, onBackHome, theme = 'heritage' }) => {
  
  // Theme Configurations
  const isHeritage = theme === 'heritage';
  
  const containerClass = isHeritage 
    ? "bg-brand-900 text-white border-brand-lime/30" 
    : "bg-original-purple text-white border-original-lime/30"; // Original Purple
    
  const accentTextClass = isHeritage
    ? "text-brand-lime" // Gold
    : "text-original-lime"; // Neon Lime

  const buttonHoverClass = isHeritage
    ? "hover:bg-brand-800 text-brand-lime"
    : "hover:bg-white/10 text-original-lime";

  const badgeClass = isHeritage
    ? "bg-brand-800 border-brand-700 text-brand-lime"
    : "bg-white/10 border-white/20 text-original-lime";

  return (
    <header className={`${containerClass} shadow-md sticky top-0 z-50 border-b transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {onBackHome && (
            <button 
              onClick={onBackHome}
              className={`p-2 rounded-full transition-colors ${buttonHoverClass}`}
              title="Return to Website"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          
          {/* Logo Implementation */}
          <div className="flex flex-col items-start leading-none select-none cursor-pointer" onClick={onBackHome}>
            <h1 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
              On Thyme <span className={`${accentTextClass} font-script text-2xl ml-1`}>Landscapes</span>
            </h1>
            <span className={`text-[10px] font-sans tracking-[0.3em] ${isHeritage ? 'text-brand-lime/80' : 'text-original-lime/80'} uppercase mt-1`}>
              Est. 2016
            </span>
          </div>
        </div>

        <div className={`hidden md:flex items-center space-x-6 text-sm font-medium text-stone-200 ${isMobile ? '!hidden' : ''}`}>
          <span className={`flex items-center gap-2 px-5 py-2 rounded-sm border shadow-inner ${badgeClass}`}>
            <Trees size={16} className={isHeritage ? "text-brand-lime" : "text-original-lime"} /> 
            <span className="tracking-widest uppercase text-xs font-bold">Visualiser Tool</span>
          </span>
        </div>
      </div>
    </header>
  );
};