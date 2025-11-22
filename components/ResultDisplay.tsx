import React, { useState, useRef, useEffect } from 'react';
import { Download, ArrowLeft, RefreshCw, Share2, X, Wand2, Mail, Link as LinkIcon, Check, Sparkles, ChevronsLeftRight, DollarSign, Clock } from 'lucide-react';
import { PlantSuggestions } from './PlantSuggestions';
import { LeadCaptureModal } from './LeadCaptureModal';
import { QuoteModal } from './QuoteModal';
import { ClimateZone, GardenAspect } from '../types';
import { STYLES, CLIMATE_ZONES } from '../data/constants';

// Brand Icons (Lucide does not support brands)
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.928 1.27-2.928 3.49v1.484h3.925l-.532 3.667h-3.393v7.98h-4.947z" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 2.163a3.999 3.999 0 1 1 0 7.998 3.999 3.999 0 0 1 0-7.998zm5.338-3.205a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88z" />
  </svg>
);

interface ResultDisplayProps {
  originalImage: string;
  generatedImage: string;
  onReset: () => void;
  onBack: () => void;
  selectedStyleId: string;
  selectedClimateId: ClimateZone;
  selectedAspect?: GardenAspect;
  isBushfireZone?: boolean;
  prompt: string;
  onRefine: (newPrompt: string) => void;
  onEvolveGrowth?: () => void;
  isMobile?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  originalImage, 
  generatedImage, 
  onReset,
  onBack,
  selectedStyleId,
  selectedClimateId,
  selectedAspect,
  isBushfireZone,
  prompt,
  onRefine,
  onEvolveGrowth,
  isMobile = false
}) => {
  // Comparison Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Refine State
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState(prompt);

  // Lead Capture State
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Get formatted labels for display
  const styleLabel = STYLES.find(s => s.id === selectedStyleId)?.label || selectedStyleId;
  const climateLabel = CLIMATE_ZONES.find(c => c.id === selectedClimateId)?.label || selectedClimateId;

  // Slider Logic
  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    }
  };

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  // Add global event listeners for dragging to handle moving outside the component
  useEffect(() => {
    const handleWindowMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };
    const handleWindowUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMove);
      window.addEventListener('mouseup', handleWindowUp);
      window.addEventListener('touchmove', handleWindowTouchMove);
      window.addEventListener('touchend', handleWindowUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowUp);
    };
  }, [isDragging]);

  // Handle local clicks on the container to jump the slider
  const handleContainerClick = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  // Trigger Lead Capture instead of direct download
  const handleDownloadClick = () => {
    setShowLeadModal(true);
  };

  // Execute actual download
  const executeDownload = (filenameSuffix: string = '') => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `OnThyme-Design${filenameSuffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for Lead Modal
  const handleLeadSubmit = (name: string, email: string) => {
    // Simulate API Call
    console.log(`Lead Captured: ${name} (${email}) - Style: ${selectedStyleId}, Climate: ${selectedClimateId}`);
    
    executeDownload('-HighRes');
    setShowLeadModal(false);
  };

  const handleLeadSkip = () => {
    executeDownload('-Preview');
    setShowLeadModal(false);
  };

  const submitRefine = () => {
    onRefine(refinedPrompt);
    setIsRefining(false);
  };

  // Share Logic Helpers
  const generateShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('style', selectedStyleId);
    url.searchParams.set('climate', selectedClimateId);
    if (prompt) {
      url.searchParams.set('prompt', prompt);
    } else {
      url.searchParams.delete('prompt');
    }
    return url.toString();
  };

  // Share Handlers
  const handleFacebookShare = () => {
    const shareUrl = generateShareUrl();
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleEmailShare = () => {
    const shareUrl = generateShareUrl();
    const subject = encodeURIComponent("My OnThyme Garden Design");
    const body = encodeURIComponent(`Check out this garden transformation I designed with OnThyme Landscapes!\n\nStyle: ${styleLabel}\nClimate: ${climateLabel}\n\nView the tool and this configuration here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    // For Instagram, we often need to download the image first
    handleDownloadClick();
  };

  return (
    <div className={`space-y-8 animate-fade-in pb-12 relative ${isMobile ? 'px-2' : ''}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-brand-900">Your New Oasis</h2>
          <p className="text-stone-500 text-sm">Drag the slider to compare before & after</p>
        </div>
        
        <div className={`flex flex-wrap items-center justify-center gap-3 lg:w-auto ${isMobile ? 'w-full flex-col' : 'w-full'}`}>
           <button 
             onClick={onBack}
             className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-medium text-sm ${isMobile ? 'w-full' : ''}`}
           >
             <ArrowLeft size={16} /> Change Style
           </button>
           <button 
             onClick={() => setIsRefining(true)}
             className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors font-medium text-sm ${isMobile ? 'w-full' : ''}`}
           >
             <Sparkles size={16} /> Magic Edit
           </button>
           {onEvolveGrowth && (
             <button 
               onClick={onEvolveGrowth}
               className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors font-medium text-sm ${isMobile ? 'w-full' : ''}`}
             >
               <Clock size={16} /> +5 Years Growth
             </button>
           )}
           <button 
             onClick={() => setShowShareModal(true)}
             className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-medium text-sm ${isMobile ? 'w-full' : ''}`}
           >
             <Share2 size={16} /> Share
           </button>
           <button 
            onClick={onReset}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors font-medium text-sm ${isMobile ? 'w-full' : ''}`}
          >
            <RefreshCw size={16} /> New Design
          </button>
        </div>
      </div>

      <div className={`bg-white p-4 rounded-2xl shadow-lg border border-stone-100 ${isMobile ? 'p-2' : ''}`}>
        {/* Comparison Slider Container */}
        <div 
          ref={containerRef}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-200 group cursor-col-resize select-none touch-none"
          onMouseDown={onMouseDown}
          onClick={handleContainerClick}
          onTouchStart={onMouseDown}
        >
          {/* Base Image: Generated (Right Side) */}
          <img 
            src={generatedImage} 
            alt="Generated design" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Overlay Image: Original (Left Side) - Clipped */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src={originalImage} 
              alt="Original property" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-20"
            style={{ left: `${sliderPosition}%` }}
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-brand-100 text-brand-500">
               <ChevronsLeftRight size={20} />
             </div>
          </div>

          {/* Labels */}
          <div 
            className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-bold z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: sliderPosition < 10 ? 0 : 1 }}
          >
            Original
          </div>
          <div 
            className="absolute bottom-4 right-4 bg-brand-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-bold z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: sliderPosition > 90 ? 0 : 1 }}
          >
            New Design
          </div>

          {/* Watermark */}
          <div className="absolute top-4 right-4 bg-brand-900/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold z-10 pointer-events-none hidden sm:flex items-center gap-1">
             <span className="font-script text-sm text-brand-lime">on thyme</span> Visualiser
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleDownloadClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-12 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Download size={20} /> Download High-Res Image
        </button>
      </div>

      {/* Plant Suggestions Engine */}
      <PlantSuggestions 
        styleId={selectedStyleId} 
        climateId={selectedClimateId} 
        generatedImage={generatedImage}
        aspect={selectedAspect}
        isBushfireZone={isBushfireZone}
      />
      
      <div className="bg-stone-100 rounded-xl p-6 text-center flex flex-col items-center">
        <p className="text-stone-600 mb-4 font-medium text-lg">
          Love what you see? Our team can bring this exact vision to life.
        </p>
        <button 
          onClick={() => setShowQuoteModal(true)}
          className="inline-flex items-center gap-2 bg-brand-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-900 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <DollarSign size={18} className="text-brand-lime" />
          Get Quote for this Look
        </button>
      </div>

      {/* Refine Modal */}
      {isRefining && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
                <Sparkles size={20} /> Magic Edit
              </h3>
              <button 
                onClick={() => setIsRefining(false)}
                className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-grow overflow-y-auto">
              <p className="text-sm text-stone-500">
                Update your instructions to tweak the design or use Magic Edit to make specific changes. The style <strong>({styleLabel})</strong> and climate <strong>({climateLabel})</strong> will remain the same.
              </p>
              <textarea
                value={refinedPrompt}
                onChange={(e) => setRefinedPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro filter', 'Remove the person in the background', 'Make the pool smaller'..."
                className="w-full h-40 p-4 rounded-xl border border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/50 outline-none resize-none bg-brand-800 text-white placeholder-brand-300/50 transition-all"
                autoFocus
              />
            </div>

            <div className="p-5 border-t border-stone-100 flex justify-end gap-3 bg-stone-50 rounded-b-2xl">
               <button 
                 onClick={() => setIsRefining(false)}
                 className="px-5 py-2.5 rounded-xl text-stone-600 font-bold hover:bg-stone-200 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={submitRefine}
                 className="px-6 py-2.5 rounded-xl bg-brand-lime text-brand-900 font-bold shadow-md hover:shadow-lg hover:bg-[#b4d639] transition-all flex items-center gap-2"
               >
                 <Wand2 size={18} /> Regenerate
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleLeadSubmit}
        onSkip={handleLeadSkip}
      />
      
      {/* Quote Request Modal */}
      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        designContext={{
          style: styleLabel,
          climate: climateLabel,
          prompt: prompt
        }}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
                <Share2 size={20} /> Share Design
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              <button 
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2] text-white font-bold hover:bg-[#166fe5] transition-colors shadow-sm"
              >
                <FacebookIcon size={24} /> Facebook
              </button>
              
              <button 
                onClick={handleInstagramShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                <InstagramIcon size={24} /> Instagram (Download)
              </button>
              
              <button 
                onClick={handleEmailShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors border border-stone-200"
              >
                <Mail size={24} /> Email
              </button>
              
              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors border border-stone-200 group"
              >
                {linkCopied ? <Check size={24} className="text-green-600" /> : <LinkIcon size={24} />} 
                {linkCopied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
            
            <div className="p-3 bg-stone-50 text-center text-xs text-stone-400 border-t border-stone-100">
              Share your vision with OnThyme Landscapes
            </div>
          </div>
        </div>
      )}

    </div>
  );
};