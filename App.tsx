import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { generateLandscapeDesign } from './services/geminiService';
import { AppState, StylePreset, ClimateZone, GardenAspect, ViewMode } from './types';
import { STYLES, CLIMATE_ZONES } from './data/constants';
import { Wand2, Loader2, Info, X, MapPin, Check, ChevronDown, Flame, Sun, Smartphone, Monitor, Phone, Menu, Flower, Shovel, ArrowRight, Star, Quote } from 'lucide-react';

// --- VISUALISER TOOL COMPONENT (The Original App Logic) ---
interface VisualiserToolProps {
  onBackHome: () => void;
}

const VisualiserTool: React.FC<VisualiserToolProps> = ({ onBackHome }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showViewSwitcher, setShowViewSwitcher] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const isMobile = viewMode === 'mobile';

  // Helper to get params from URL on load
  const getUrlParam = (key: string) => {
    return new URLSearchParams(window.location.search).get(key);
  };

  // Inputs - Initialize from URL if present
  const [prompt, setPrompt] = useState<string>(getUrlParam('prompt') || '');
  
  // Initialize Style from URL
  const urlStyle = getUrlParam('style');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(
    urlStyle && STYLES.some(s => s.id === urlStyle) ? urlStyle : 'native'
  );

  // Initialize Climate from URL
  const urlClimate = getUrlParam('climate');
  const [selectedClimateId, setSelectedClimateId] = useState<ClimateZone>(
    urlClimate && CLIMATE_ZONES.some(c => c.id === urlClimate) 
      ? (urlClimate as ClimateZone) 
      : 'hawkesbury'
  );
  
  // New States
  const [selectedAspect, setSelectedAspect] = useState<GardenAspect>('North');
  const [isBushfireZone, setIsBushfireZone] = useState<boolean>(false);

  // Outputs
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelected = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setAppState(AppState.PREVIEW);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (promptOverride?: string | unknown) => {
    if (!imageFile) return;

    const activePrompt = typeof promptOverride === 'string' ? promptOverride : prompt;

    if (typeof promptOverride === 'string') {
        setPrompt(promptOverride);
    }

    setLoadingMessage('');
    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const style = STYLES.find(s => s.id === selectedStyleId);
      const climate = CLIMATE_ZONES.find(c => c.id === selectedClimateId);
      
      let finalPrompt = `
        Landscape Style: ${style?.label || 'Custom'}.
        Climate Context: ${climate?.label} Australia.
        Specific Instructions: ${activePrompt}.
        Style Description to apply: ${style?.promptSuffix}.
      `;
      
      if (isBushfireZone) {
          finalPrompt += " IMPORTANT: This is a bushfire prone area. Use fire-retardant landscaping, gravel paths near structures, smooth-barked trees, and clear separation between canopies. Avoid highly flammable plants.";
      }

      const resultUrl = await generateLandscapeDesign(imageFile, finalPrompt, isBushfireZone);
      setGeneratedImage(resultUrl);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("We couldn't generate your design at this time. Please try again or check your API key.");
      setAppState(AppState.PREVIEW);
    }
  };

  const handleEvolveGrowth = async () => {
    if (!generatedImage) return;

    setLoadingMessage('Fast-forwarding 5 years of growth...');
    setAppState(AppState.GENERATING);
    setError(null);

    try {
        const style = STYLES.find(s => s.id === selectedStyleId);
        const climate = CLIMATE_ZONES.find(c => c.id === selectedClimateId);

        let evolutionPrompt = `
            Use the provided image as the base.
            Show this exact garden design after 5 years of healthy growth and maintenance.
            Trees should be significantly taller (3-5m growth) with fuller canopies.
            Shrubs should be denser and established.
            Groundcovers should be spreading.
            Maintain the exact hardscaping (paths, decks, walls) as they are in the image.
            Keep the style: ${style?.label}.
            Climate: ${climate?.label}.
        `;

        const resultUrl = await generateLandscapeDesign(generatedImage, evolutionPrompt, isBushfireZone);
        setGeneratedImage(resultUrl);
        setAppState(AppState.SUCCESS);

    } catch (err) {
        console.error(err);
        setError("We couldn't evolve the garden growth at this time.");
        setAppState(AppState.SUCCESS);
    }
  };

  const handleStyleSelect = (preset: StylePreset) => {
    setSelectedStyleId(preset.id);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageFile(null);
    setImagePreview(null);
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
  };

  const handleBackToEdit = () => {
    setAppState(AppState.PREVIEW);
    setGeneratedImage(null);
    setError(null);
  };

  const handleClearPreview = () => {
    setImageFile(null);
    setImagePreview(null);
    setAppState(AppState.IDLE);
  };

  const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (viewMode === 'mobile') {
      return (
        <div className="flex justify-center py-8 min-h-screen bg-stone-100">
          <div className="w-full max-w-[400px] bg-white min-h-[800px] shadow-2xl rounded-[3rem] border-8 border-original-purple overflow-hidden relative flex flex-col">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-original-purple rounded-b-xl z-50"></div>
             <div className="flex-grow overflow-y-auto scrollbar-hide bg-stone-50">
               {children}
             </div>
             <div className="h-1 bg-stone-900 w-1/3 mx-auto rounded-full my-2 opacity-20"></div>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className={`min-h-screen font-sans text-stone-800 transition-colors duration-500 ${appState === AppState.IDLE && viewMode === 'desktop' ? 'bg-original-light' : 'bg-stone-50'}`}>
      
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={() => setShowViewSwitcher(!showViewSwitcher)}
          className="bg-original-purple text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform border border-original-lime"
        >
          {viewMode === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
        </button>
        
        {showViewSwitcher && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-xl shadow-xl border border-stone-200 p-2 w-48 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-xs font-bold text-stone-400 px-3 py-2 uppercase tracking-wider">View Mode</div>
            <button 
              onClick={() => { setViewMode('desktop'); setShowViewSwitcher(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'desktop' ? 'bg-original-light text-original-purple' : 'hover:bg-stone-50'}`}
            >
              <Monitor size={16} /> Desktop
            </button>
            <button 
              onClick={() => { setViewMode('mobile'); setShowViewSwitcher(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'mobile' ? 'bg-original-light text-original-purple' : 'hover:bg-stone-50'}`}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>
        )}
      </div>

      <MobileWrapper>
        <Header isMobile={isMobile} onBackHome={onBackHome} theme="original" />
        
        <main className={`flex-grow ${isMobile ? 'px-4 py-6' : 'px-4 py-8 sm:px-6 lg:px-8'}`}>
          <div className={isMobile ? 'w-full' : 'max-w-5xl mx-auto'}>
            
            {appState === AppState.IDLE && (
              <div className="space-y-10 animate-fade-in py-8">
                <div className="text-center space-y-6">
                  <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-serif font-bold text-original-purple tracking-tight leading-tight`}>
                    Visualise Your <span className="text-original-lime italic">Legacy</span>
                  </h2>
                  <p className={`${isMobile ? 'text-base' : 'text-xl'} text-stone-600 max-w-2xl mx-auto font-light`}>
                    Use our AI Landscape Architect to explore the potential of your estate before breaking ground.
                  </p>
                </div>

                <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} justify-center items-center gap-6 relative z-10`}>
                  <div className="bg-white p-3 pr-8 rounded-sm shadow-lg border-l-4 border-original-lime flex items-center gap-4 w-full md:w-auto hover:shadow-xl transition-shadow">
                    <div className="bg-original-light text-original-purple p-3 rounded-sm">
                      <MapPin size={24} />
                    </div>
                    <div className="flex flex-col text-left w-full">
                      <label className="text-[10px] font-bold text-original-purple uppercase tracking-widest">Region</label>
                      <div className="relative flex items-center w-full">
                         <select 
                          value={selectedClimateId}
                          onChange={(e) => setSelectedClimateId(e.target.value as ClimateZone)}
                          className="appearance-none bg-transparent text-original-purple font-serif font-bold text-xl pr-8 pl-1 cursor-pointer focus:outline-none w-full md:w-64"
                         >
                           {CLIMATE_ZONES.map(zone => (
                             <option key={zone.id} value={zone.id}>{zone.label}</option>
                           ))}
                         </select>
                         <ChevronDown size={16} className="absolute right-0 text-original-purple pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 pr-8 rounded-sm shadow-lg border-l-4 border-original-lime flex items-center gap-4 w-full md:w-auto hover:shadow-xl transition-shadow">
                    <div className="bg-original-light text-original-purple p-3 rounded-sm">
                      <Sun size={24} />
                    </div>
                    <div className="flex flex-col text-left w-full">
                      <label className="text-[10px] font-bold text-original-purple uppercase tracking-widest">Orientation</label>
                      <div className="relative flex items-center w-full">
                         <select 
                          value={selectedAspect}
                          onChange={(e) => setSelectedAspect(e.target.value as GardenAspect)}
                          className="appearance-none bg-transparent text-original-purple font-serif font-bold text-xl pr-8 pl-1 cursor-pointer focus:outline-none w-full md:w-48"
                         >
                           {['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'].map(aspect => (
                             <option key={aspect} value={aspect}>{aspect}</option>
                           ))}
                         </select>
                         <ChevronDown size={16} className="absolute right-0 text-original-purple pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`bg-white ${isMobile ? 'p-4 rounded-xl' : 'p-8 rounded-sm'} shadow-2xl shadow-original-purple/10 border border-stone-100`}>
                  <ImageUploader onImageSelected={handleImageSelected} isMobile={isMobile} />
                </div>

              </div>
            )}

            {(appState === AppState.PREVIEW || appState === AppState.GENERATING) && imagePreview && (
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-12 gap-8'} animate-fade-in`}>
                
                <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-5'} space-y-6`}>
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-100 overflow-hidden relative">
                     <img src={imagePreview} alt="Upload preview" className="w-full h-64 object-cover rounded-lg" />
                     <div className="absolute top-6 right-6">
                       {appState !== AppState.GENERATING && (
                          <button 
                            onClick={handleClearPreview} 
                            className="bg-white/90 backdrop-blur hover:bg-red-50 text-stone-500 hover:text-red-600 p-2 rounded-full shadow-md transition-all"
                          >
                            <X size={20} />
                          </button>
                       )}
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-original-purple uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MapPin size={14}/> Climate
                      </label>
                      <select 
                        value={selectedClimateId}
                        onChange={(e) => setSelectedClimateId(e.target.value as ClimateZone)}
                        disabled={appState === AppState.GENERATING}
                        className="w-full p-3 rounded-sm bg-sandstone-50 border border-stone-200 text-brand-900 font-serif text-lg focus:ring-1 focus:ring-original-lime focus:border-original-lime outline-none transition-all"
                      >
                        {CLIMATE_ZONES.map(zone => (
                          <option key={zone.id} value={zone.id}>{zone.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-original-purple uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Sun size={14}/> Aspect
                        </label>
                        <select 
                          value={selectedAspect}
                          onChange={(e) => setSelectedAspect(e.target.value as GardenAspect)}
                          disabled={appState === AppState.GENERATING}
                          className="w-full p-3 rounded-sm bg-sandstone-50 border border-stone-200 text-brand-900 font-serif text-lg focus:ring-1 focus:ring-original-lime focus:border-original-lime outline-none transition-all"
                        >
                          {['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'].map(a => (
                            <option key={a} value={a}>{a} Facing</option>
                          ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between bg-red-50 p-4 rounded-sm border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isBushfireZone ? 'bg-red-600 text-white' : 'bg-red-100 text-red-400'}`}>
                           <Flame size={18} />
                        </div>
                        <div>
                          <label htmlFor="bushfire-toggle" className="block text-sm font-bold text-original-purple cursor-pointer select-none font-serif">Bushfire Safe Mode</label>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id="bushfire-toggle"
                          type="checkbox" 
                          className="sr-only peer"
                          checked={isBushfireZone}
                          onChange={(e) => setIsBushfireZone(e.target.checked)}
                          disabled={appState === AppState.GENERATING}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-7'} space-y-6`}>
                  
                  <div className={`bg-white ${isMobile ? 'p-5' : 'p-8'} rounded-xl shadow-xl border border-stone-100 relative overflow-hidden min-h-[600px] flex flex-col`}>
                    {appState === AppState.GENERATING && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
                        <div className="relative mb-8">
                          <div className="w-24 h-24 border-4 border-original-light border-t-original-lime rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 size={32} className="text-original-purple animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-serif text-original-purple">
                           {loadingMessage || 'Designing Your Legacy'}
                        </h3>
                        <p className="text-stone-500 mt-3 max-w-xs mx-auto font-light">
                           {loadingMessage ? 'Consulting our archives...' : `Applying ${STYLES.find(s => s.id === selectedStyleId)?.label} principles to your estate...`}
                        </p>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-original-purple font-serif mb-4 border-b border-stone-100 pb-2">Select Aesthetic</h3>
                      
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                        {STYLES.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handleStyleSelect(preset)}
                            disabled={appState === AppState.GENERATING}
                            className={`text-left p-4 rounded-sm border transition-all flex items-start gap-3 relative group ${
                              selectedStyleId === preset.id 
                                ? 'bg-original-purple text-white border-original-purple shadow-md' 
                                : 'border-stone-200 hover:border-original-purple/30 hover:bg-sandstone-50'
                            }`}
                          >
                            {selectedStyleId === preset.id && (
                              <div className="absolute top-2 right-2 text-original-lime">
                                <Check size={14} />
                              </div>
                            )}
                            <div>
                              <span className={`block font-bold font-serif text-lg ${selectedStyleId === preset.id ? 'text-original-lime' : 'text-original-purple'}`}>
                                {preset.label}
                              </span>
                              <span className={`text-xs mt-1 block ${selectedStyleId === preset.id ? 'text-stone-300' : 'text-stone-500'}`}>
                                {preset.description}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-grow space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-original-purple font-serif">Curator Notes (Optional)</h3>
                      </div>
                      <textarea
                        ref={textAreaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={appState === AppState.GENERATING}
                        placeholder="Describe any specific features, restorations, or focal points you wish to include..."
                        className="w-full h-32 p-4 rounded-sm border border-stone-300 focus:border-original-purple focus:ring-1 focus:ring-original-purple outline-none resize-none bg-sandstone-50 text-brand-900 placeholder-stone-400 transition-all"
                      />
                    </div>
                    
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-sm text-sm flex items-center gap-2 border-l-4 border-red-600">
                        <span className="font-bold">Notice:</span> {error}
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-stone-100">
                      <button
                        onClick={() => handleGenerate()}
                        disabled={appState === AppState.GENERATING}
                        className="w-full bg-original-lime hover:bg-[#92b132] disabled:bg-stone-200 disabled:text-stone-400 text-white font-serif font-bold tracking-wide py-4 rounded-sm shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
                      >
                          <Wand2 size={24} /> Create Visualisation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {appState === AppState.SUCCESS && generatedImage && imagePreview && (
              <ResultDisplay 
                originalImage={imagePreview} 
                generatedImage={generatedImage} 
                onReset={handleReset}
                onBack={handleBackToEdit}
                selectedStyleId={selectedStyleId}
                selectedClimateId={selectedClimateId}
                selectedAspect={selectedAspect}
                isBushfireZone={isBushfireZone}
                prompt={prompt}
                onRefine={(newPrompt) => handleGenerate(newPrompt)}
                onEvolveGrowth={handleEvolveGrowth}
                isMobile={isMobile}
              />
            )}

          </div>
        </main>
      </MobileWrapper>
    </div>
  );
};

// --- NEW MARKETING SITE COMPONENT ---

const MarketingSite: React.FC<{ onLaunchVisualiser: () => void }> = ({ onLaunchVisualiser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToPortfolio = () => {
      const element = document.getElementById('portfolio');
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <div className="min-h-screen bg-sandstone-100 font-sans text-stone-700">
      {/* Marketing Header */}
      <Header theme="heritage" onBackHome={() => {}} />

      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[700px] flex items-center bg-brand-900 overflow-hidden">
        {/* Placeholder Hero Image */}
        <img 
          src="https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          alt="Heritage Sandstone Estate"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-brand-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left pt-12">
          <span className="inline-block py-1 px-3 border border-brand-lime text-brand-lime text-xs tracking-[0.2em] uppercase mb-6">Premium Horticultural Services</span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white leading-tight mb-6 max-w-4xl">
            Cultivating Hawkesbury Legacies <br/>
            <span className="text-brand-lime italic">for Five Generations.</span>
          </h2>
          <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mb-10 font-light leading-relaxed">
            Premium landscape construction and horticultural management for the Hawkesbury & Hills District. We don't just maintain gardens; we curate living history.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             <button 
               onClick={onLaunchVisualiser}
               className="bg-brand-lime text-brand-900 px-8 py-4 rounded-sm font-bold text-sm tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] flex items-center justify-center gap-3"
             >
               <Wand2 size={20} /> Launch Garden Visualiser
             </button>
             <button 
                onClick={scrollToPortfolio}
                className="border border-stone-500 text-stone-300 hover:border-white hover:text-white px-8 py-4 rounded-sm font-bold text-sm tracking-widest uppercase transition-all"
             >
               View Our Portfolio
             </button>
          </div>
        </div>
      </section>

      {/* The Authority Block (Lineage) */}
      <section id="heritage" className="py-20 sm:py-32 bg-sandstone-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-brand-lime/30"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop" 
                    alt="Botanical History" 
                    className="w-full h-[500px] object-cover shadow-2xl filter sepia-[0.2]"
                  />
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-brand-lime/30"></div>
                  <div className="absolute bottom-10 left-0 bg-brand-900 p-6 shadow-xl max-w-xs">
                     <p className="font-serif text-brand-lime text-xl italic">"To plant a garden is to believe in tomorrow."</p>
                     <p className="text-stone-400 text-xs mt-2 uppercase tracking-widest">— Jean Stevens, 1942</p>
                  </div>
               </div>
               <div className="space-y-8">
                  <h3 className="text-4xl font-serif text-brand-900">Deep Rooted Knowledge</h3>
                  <p className="text-lg text-stone-600 leading-relaxed">
                    Our horticultural expertise isn't learnt from a textbook; it's inherited. We trace our roots back to <strong className="text-brand-900">Jean Stevens</strong>, the pioneering New Zealand iris breeder and floral hybridiser who redefined botanical standards in the mid-20th century. Jean continued the legacy of her parents and paternal grandparents who were also well respected horticulturalists and floral market gardeners.
                  </p>
                  <p className="text-lg text-stone-600 leading-relaxed">
                    Today, On Thyme Landscapes brings that same obsession with genetics, soil health, and botanical structure to the Hawkesbury. We understand that a true estate garden is a living ecosystem that requires generational thinking, not just weekly mowing.
                  </p>
                  <div className="flex items-center gap-8 pt-4 border-t border-brand-200">
                     <div>
                        <span className="block text-4xl font-serif text-brand-lime">5</span>
                        <span className="text-xs uppercase tracking-widest text-brand-800">Generations</span>
                     </div>
                     <div>
                        <span className="block text-4xl font-serif text-brand-lime">35+</span>
                        <span className="text-xs uppercase tracking-widest text-brand-800">Estates Managed</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <span className="text-brand-lime text-xs tracking-[0.2em] uppercase">What We Do</span>
              <h3 className="text-4xl font-serif mt-4">Curated Services for the Discerning</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Estate Management */}
              <div className="bg-brand-900 p-10 border border-brand-700 hover:border-brand-lime transition-colors group cursor-default">
                 <div className="w-16 h-16 bg-brand-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-lime group-hover:text-brand-900 transition-colors">
                    <Flower size={32} />
                 </div>
                 <h4 className="text-2xl font-serif mb-4 text-sandstone-100">Estate & Acreage Management</h4>
                 <p className="text-stone-400 leading-relaxed mb-6">
                    Beyond maintenance. We offer comprehensive horticultural preservation plans. From soil remediation and large-tree health assessments to seasonal pruning of heritage roses and formal hedges. We are guardians of your garden's future.
                 </p>
                 <ul className="space-y-3 text-sm text-stone-300">
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Soil biology & nutrition plans</li>
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Topiary & formal hedging</li>
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Irrigation audit & water security</li>
                 </ul>
              </div>

              {/* Landscape Construction */}
              <div className="bg-brand-900 p-10 border border-brand-700 hover:border-brand-lime transition-colors group cursor-default">
                 <div className="w-16 h-16 bg-brand-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-lime group-hover:text-brand-900 transition-colors">
                    <Shovel size={32} />
                 </div>
                 <h4 className="text-2xl font-serif mb-4 text-sandstone-100">Landscape Design & Build</h4>
                 <p className="text-stone-400 leading-relaxed mb-6">
                    Building with permanence. We specialise in Hawkesbury Sandstone construction, creating retaining walls, stairs, and terraces that look like they've stood for a century. Our designs prioritize structural integrity and seamless integration with the native bushland.
                 </p>
                 <ul className="space-y-3 text-sm text-stone-300">
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Heritage sandstone masonry</li>
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Mature tree transplanting</li>
                    <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-brand-lime rounded-full"></div> Native architectural planting</li>
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-sandstone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-brand-lime text-xs tracking-[0.2em] uppercase">Recent Projects</span>
              <h3 className="text-4xl font-serif mt-4 text-brand-900">Curated Landscapes</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Project 1 */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden h-80 mb-4">
                  <div className="absolute inset-0 bg-brand-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1592505641468-87e44b202c58?q=80&w=800&auto=format&fit=crop" 
                    alt="Sandstone Estate" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="text-xl font-serif text-brand-900 mb-1">The Richmond Estate</h4>
                <p className="text-xs font-bold text-brand-lime uppercase tracking-widest">Heritage Restoration</p>
              </div>

              {/* Project 2 */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden h-80 mb-4">
                  <div className="absolute inset-0 bg-brand-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1610629362351-c9762f503189?q=80&w=800&auto=format&fit=crop" 
                    alt="Formal Garden" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="text-xl font-serif text-brand-900 mb-1">Windsor Manors</h4>
                <p className="text-xs font-bold text-brand-lime uppercase tracking-widest">Formal Hedging</p>
              </div>

              {/* Project 3 */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden h-80 mb-4">
                  <div className="absolute inset-0 bg-brand-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1584950999125-68a29e492648?q=80&w=800&auto=format&fit=crop" 
                    alt="Native Retreat" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="text-xl font-serif text-brand-900 mb-1">Kurrajong Retreat</h4>
                <p className="text-xs font-bold text-brand-lime uppercase tracking-widest">Native Integration</p>
              </div>
           </div>
        </div>
      </section>

      {/* Visualiser Teaser */}
      <section className="py-24 bg-sandstone-200 relative overflow-hidden">
         <div className="absolute right-0 top-0 w-1/2 h-full bg-brand-900/5 skew-x-12 transform translate-x-20"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white p-12 shadow-2xl flex flex-col lg:flex-row items-center gap-12 border-t-8 border-brand-900">
               <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-serif text-brand-900">Visualise the Potential of Your Estate</h3>
                  <p className="text-lg text-stone-600">
                     Unsure how a modern native garden would look against your heritage sandstone? Our proprietary AI visualiser tool allows you to instantly reimagine your property in five distinct architectural styles.
                  </p>
                  <div className="flex items-center gap-4 text-brand-800 font-bold">
                     <Check className="text-brand-lime" /> Instant Preview
                     <Check className="text-brand-lime" /> Plant Palettes
                     <Check className="text-brand-lime" /> Growth Projections
                  </div>
                  <button 
                    onClick={onLaunchVisualiser}
                    className="inline-flex items-center gap-2 bg-brand-900 text-white px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-brand-800 transition-colors"
                  >
                    Try the Visualiser <ArrowRight size={16} />
                  </button>
               </div>
               <div className="flex-1 relative">
                  <div className="grid grid-cols-2 gap-4">
                     <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop" className="rounded-sm shadow-lg mt-8" alt="Before" />
                     <img src="https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=400&auto=format&fit=crop" className="rounded-sm shadow-lg mb-8" alt="After" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-sandstone-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-serif text-brand-900 mb-12">Trusted by Hawkesbury's Finest</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-8 shadow-sm border border-stone-200 relative">
                  <Quote className="text-brand-lime absolute top-6 left-6 opacity-20" size={40} />
                  <p className="text-stone-600 italic mb-6 relative z-10">"The attention to detail on our acreage in Kurrajong was impeccable. They didn't just mow; they restored the soil health of our orchard."</p>
                  <div className="flex items-center justify-center gap-3">
                     <div className="text-left">
                        <p className="font-bold text-brand-900 text-sm uppercase tracking-wider">Margaret H.</p>
                        <p className="text-xs text-stone-400">Kurrajong Heights</p>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-8 shadow-sm border border-stone-200 relative">
                  <Quote className="text-brand-lime absolute top-6 left-6 opacity-20" size={40} />
                  <p className="text-stone-600 italic mb-6 relative z-10">"Finding a team that understands how to work with 100-year-old sandstone is rare. The retaining wall fits perfectly with our heritage home."</p>
                  <div className="flex items-center justify-center gap-3">
                     <div className="text-left">
                        <p className="font-bold text-brand-900 text-sm uppercase tracking-wider">James & Sarah T.</p>
                        <p className="text-xs text-stone-400">Windsor Downs</p>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-8 shadow-sm border border-stone-200 relative">
                  <Quote className="text-brand-lime absolute top-6 left-6 opacity-20" size={40} />
                  <p className="text-stone-600 italic mb-6 relative z-10">"Their botanical knowledge is unmatched. They identified rare species on our property that other tradesmen would have removed."</p>
                  <div className="flex items-center justify-center gap-3">
                     <div className="text-left">
                        <p className="font-bold text-brand-900 text-sm uppercase tracking-wider">Eleanor R.</p>
                        <p className="text-xs text-stone-400">Richmond Lowlands</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-original-purple text-white py-16 border-t border-original-purple/80">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-2">
                  <h4 className="font-serif text-2xl mb-6">On Thyme <span className="text-original-lime font-script">Landscapes</span></h4>
                  <p className="text-stone-300 max-w-sm leading-relaxed mb-6">
                     Cultivating legacies in the Hawkesbury region. Combining five generations of horticultural expertise with heritage construction techniques.
                  </p>
                  <div className="flex gap-4">
                     <span className="text-original-lime"><Star size={20} fill="currentColor" /></span>
                     <span className="text-original-lime"><Star size={20} fill="currentColor" /></span>
                     <span className="text-original-lime"><Star size={20} fill="currentColor" /></span>
                     <span className="text-original-lime"><Star size={20} fill="currentColor" /></span>
                     <span className="text-original-lime"><Star size={20} fill="currentColor" /></span>
                  </div>
               </div>
               <div>
                  <h5 className="font-bold text-sm uppercase tracking-widest text-original-lime mb-6">Services</h5>
                  <ul className="space-y-3 text-stone-300">
                     <li><a href="#" className="hover:text-white transition-colors">Estate Management</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Landscape Construction</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Horticultural Consultation</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Soil Remediation</a></li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-bold text-sm uppercase tracking-widest text-original-lime mb-6">Contact</h5>
                  <ul className="space-y-3 text-stone-300">
                     <li className="flex items-center gap-2"><Phone size={16} /> 0400 123 456</li>
                     <li className="flex items-center gap-2"><MapPin size={16} /> Hawkesbury, NSW</li>
                     <li className="flex items-center gap-2"><Check size={16} /> Licence #311555C</li>
                  </ul>
               </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
               <p>&copy; 2025 On Thyme Landscapes. All rights reserved.</p>
               <p className="mt-2 md:mt-0">Licence #311555C | ABN 12 345 678 901</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

// --- MAIN APP ENTRY POINT ---
const App: React.FC = () => {
  const [showVisualiser, setShowVisualiser] = useState(false);

  if (showVisualiser) {
    return <VisualiserTool onBackHome={() => setShowVisualiser(false)} />;
  }

  return <MarketingSite onLaunchVisualiser={() => setShowVisualiser(true)} />;
};

export default App;