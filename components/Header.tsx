import React from 'react';
import { Trees } from 'lucide-react';

interface HeaderProps {
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isMobile }) => {
  return (
    <header className="bg-brand-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Implementation mimicking the provided image */}
          <div className="flex flex-col items-center leading-none select-none">
            <h1 className="font-script text-4xl text-brand-lime transform -rotate-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              on thyme
            </h1>
            <span className="text-sm font-sans tracking-[0.2em] text-stone-100 uppercase mt-1">
              Landscapes
            </span>
          </div>
        </div>
        <div className={`hidden md:flex items-center space-x-6 text-sm font-medium text-stone-200 ${isMobile ? '!hidden' : ''}`}>
          <span className="flex items-center gap-2 bg-brand-700/50 px-4 py-2 rounded-full border border-brand-600">
            <Trees size={16} className="text-brand-lime" /> 
            <span>Design Visualiser</span>
          </span>
        </div>
      </div>
    </header>
  );
};