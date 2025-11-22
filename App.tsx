import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { generateLandscapeDesign } from './services/geminiService';
import { AppState, StylePreset, ClimateZone, GardenAspect, ViewMode } from './types';
import { STYLES, CLIMATE_ZONES } from './data/constants';
import { Wand2, Loader2, Info, X, MapPin, Check, ChevronDown, Flame, Sun, Smartphone, Monitor } from 'lucide-react';

const App: React.FC = () => {
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

    // Determine effective prompt: use override if string, otherwise use state
    const activePrompt = typeof promptOverride === 'string' ? promptOverride : prompt;

    // If we have a specific override, update state so it matches
    if (typeof promptOverride === 'string') {
        setPrompt(promptOverride);
    }

    setLoadingMessage('');
    setAppState(AppState.GENERATING);
    setError(null);

    try {
      // Combine user prompt with style context
      const style = STYLES.find(s => s.id === selectedStyleId);
      const climate = CLIMATE_ZONES.find(c => c.id === selectedClimateId);
      
      // Build a rich prompt
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

        // Pass the generated image string (base64) instead of the original file
        const resultUrl = await generateLandscapeDesign(generatedImage, evolutionPrompt, isBushfireZone);
        setGeneratedImage(resultUrl);
        setAppState(AppState.SUCCESS);

    } catch (err) {
        console.error(err);
        setError("We couldn't evolve the garden growth at this time.");
        setAppState(AppState.SUCCESS); // Go back to showing the previous result
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

  // Mobile Container Wrapper
  const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (viewMode === 'mobile') {
      return (
        <div className="flex justify-center py-8 min-h-screen bg-stone-100">
          <div className="w-full max-w-[400px] bg-white min-h-[800px] shadow-2xl rounded-[3rem] border-8 border-stone-800 overflow-hidden relative flex flex-col">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-xl z-50"></div>
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
    <div className={`min-h-screen font-sans text-stone-800 transition-colors duration-500 ${appState === AppState.IDLE && viewMode === 'desktop' ? 'bg-brand-purple-light' : 'bg-stone-50'}`}>
      
      {/* View Switcher - Fixed Button */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={() => setShowViewSwitcher(!showViewSwitcher)}
          className="bg-stone-800 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          {viewMode === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
        </button>
        
        {showViewSwitcher && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-xl shadow-xl border border-stone-200 p-2 w-48 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-xs font-bold text-stone-400 px-3 py-2 uppercase tracking-wider">View Mode</div>
            <button 
              onClick={() => { setViewMode('desktop'); setShowViewSwitcher(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'desktop' ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'}`}
            >
              <Monitor size={16} /> Desktop
            </button>
            <button 
              onClick={() => { setViewMode('mobile'); setShowViewSwitcher(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'mobile' ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'}`}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>
        )}
      </div>

      <MobileWrapper>
        <Header isMobile={isMobile} />
        
        <main className={`flex-grow ${isMobile ? 'px-4 py-6' : 'px-4 py-8 sm:px-6 lg:px-8'}`}>
          <div className={isMobile ? 'w-full' : 'max-w-5xl mx-auto'}>
            
            {/* IDLE STATE: Welcome & Upload */}
            {appState === AppState.IDLE && (
              <div className="space-y-8 animate-fade-in py-4">
                <div className="text-center space-y-4">
                  <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-extrabold text-brand-800 tracking-tight`}>
                    Visualise Your <span className={`text-brand-lime drop-shadow-sm font-script ${isMobile ? 'text-4xl block mt-2' : 'text-6xl relative top-2'}`}>Dream Garden</span>
                  </h2>
                  <p className={`${isMobile ? 'text-base' : 'text-xl'} text-stone-600 max-w-2xl mx-auto leading-relaxed`}>
                    Upload a photo of your current house or garden and let our AI Landscape Architect show you the potential.
                  </p>
                </div>

                {/* Climate Zone & Aspect Selector - Prominent on Start Page */}
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} justify-center items-center gap-4 relative z-10`}>
                  
                  {/* Climate Zone */}
                  <div className="bg-white p-2 pr-8 rounded-full shadow-xl border-2 border-brand-100 hover:border-brand-300 transition-all flex items-center gap-4 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700 w-full md:w-auto">
                    <div className="bg-brand-100 text-brand-600 p-3 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <MapPin size={24} />
                    </div>
                    <div className="flex flex-col text-left w-full">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">I am located in</label>
                      <div className="relative flex items-center w-full">
                         <select 
                          value={selectedClimateId}
                          onChange={(e) => setSelectedClimateId(e.target.value as ClimateZone)}
                          className="appearance-none bg-transparent text-brand-900 font-bold text-lg pr-8 pl-1 cursor-pointer focus:outline-none w-full md:w-64 truncate"
                         >
                           {CLIMATE_ZONES.map(zone => (
                             <option key={zone.id} value={zone.id}>{zone.label}</option>
                           ))}
                         </select>
                         <ChevronDown size={16} className="absolute right-0 text-brand-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Garden Aspect */}
                  <div className="bg-white p-2 pr-8 rounded-full shadow-xl border-2 border-brand-100 hover:border-brand-300 transition-all flex items-center gap-4 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 w-full md:w-auto">
                    <div className="bg-brand-100 text-brand-600 p-3 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Sun size={24} />
                    </div>
                    <div className="flex flex-col text-left w-full">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">Garden Facing</label>
                      <div className="relative flex items-center w-full">
                         <select 
                          value={selectedAspect}
                          onChange={(e) => setSelectedAspect(e.target.value as GardenAspect)}
                          className="appearance-none bg-transparent text-brand-900 font-bold text-lg pr-8 pl-1 cursor-pointer focus:outline-none w-full md:w-48"
                         >
                           {['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'].map(aspect => (
                             <option key={aspect} value={aspect}>{aspect}</option>
                           ))}
                         </select>
                         <ChevronDown size={16} className="absolute right-0 text-brand-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                </div>

                <div className={`bg-white ${isMobile ? 'p-4 rounded-3xl' : 'p-1 sm:p-8 rounded-[2rem]'} shadow-xl shadow-brand-900/5 border border-brand-100`}>
                  <ImageUploader onImageSelected={handleImageSelected} isMobile={isMobile} />
                </div>

                {/* Feature Highlights */}
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'} px-4`}>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapPin size={24} />
                    </div>
                    <h3 className="font-bold text-brand-800">Australian Native</h3>
                    <p className="text-sm text-stone-500">Optimised for local climates and native plant palettes.</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Wand2 size={24} />
                    </div>
                    <h3 className="font-bold text-brand-800">Instant Redesign</h3>
                    <p className="text-sm text-stone-500">See 5 different architectural styles in seconds.</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check size={24} />
                    </div>
                    <h3 className="font-bold text-brand-800">Plant Lists</h3>
                    <p className="text-sm text-stone-500">Get tailored plant recommendations for your new look.</p>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIG STATE */}
            {(appState === AppState.PREVIEW || appState === AppState.GENERATING) && imagePreview && (
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-12 gap-8'} animate-fade-in`}>
                
                {/* Left Column: Preview */}
                <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-5'} space-y-6`}>
                  <div className="bg-white p-4 rounded-3xl shadow-lg border border-brand-100 overflow-hidden relative">
                     <img src={imagePreview} alt="Upload preview" className="w-full h-64 object-cover rounded-2xl" />
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
                     <div className="mt-4 px-2">
                       <p className="font-bold text-brand-800">Current View</p>
                       <p className="text-sm text-stone-500">The canvas for your new design.</p>
                     </div>
                  </div>

                  {/* Climate & Site Conditions Selector */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-brand-800 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-brand-500"/> 
                        Your Location / Climate
                      </label>
                      <select 
                        value={selectedClimateId}
                        onChange={(e) => setSelectedClimateId(e.target.value as ClimateZone)}
                        disabled={appState === AppState.GENERATING}
                        className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                      >
                        {CLIMATE_ZONES.map(zone => (
                          <option key={zone.id} value={zone.id}>{zone.label} - {zone.locations}</option>
                        ))}
                      </select>
                    </div>

                    {/* Garden Aspect */}
                    <div>
                       <label className="block text-sm font-bold text-brand-800 mb-3 flex items-center gap-2">
                          <Sun size={16} className="text-brand-500"/> 
                          Garden Aspect <span className="text-[10px] font-normal text-stone-400 ml-1">(Southern Hemisphere)</span>
                        </label>
                        <select 
                          value={selectedAspect}
                          onChange={(e) => setSelectedAspect(e.target.value as GardenAspect)}
                          disabled={appState === AppState.GENERATING}
                          className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        >
                          {['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'].map(a => (
                            <option key={a} value={a}>{a} Facing</option>
                          ))}
                        </select>
                    </div>

                    {/* Bushfire Toggle */}
                    <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isBushfireZone ? 'bg-red-500 text-white' : 'bg-red-100 text-red-400'}`}>
                           <Flame size={18} />
                        </div>
                        <div>
                          <label htmlFor="bushfire-toggle" className="block text-sm font-bold text-brand-900 cursor-pointer select-none">Bushfire Safe Mode</label>
                          <p className="text-[10px] text-stone-500">Prioritise fire-retardant plants</p>
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
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Controls */}
                <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-7'} space-y-6`}>
                  
                  <div className={`bg-white ${isMobile ? 'p-5' : 'p-6 sm:p-8'} rounded-3xl shadow-xl border border-brand-100 relative overflow-hidden min-h-[600px] flex flex-col`}>
                    {appState === AppState.GENERATING && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                        <div className="relative mb-8">
                          <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-lime rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 size={24} className="text-brand-600 animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-brand-800">
                           {loadingMessage || 'Designing Your Sanctuary'}
                        </h3>
                        <p className="text-stone-500 mt-2 max-w-xs mx-auto">
                           {loadingMessage ? 'Our AI is projecting future growth...' : `Applying ${STYLES.find(s => s.id === selectedStyleId)?.label} aesthetics to your ${CLIMATE_ZONES.find(c => c.id === selectedClimateId)?.label} garden...`}
                        </p>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-brand-800 mb-1">Select a Style</h3>
                      <p className="text-sm text-stone-500 mb-4">Choose the aesthetic for your transformation.</p>
                      
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                        {STYLES.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handleStyleSelect(preset)}
                            disabled={appState === AppState.GENERATING}
                            className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                              selectedStyleId === preset.id 
                                ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' 
                                : 'border-stone-200 hover:border-brand-300 hover:bg-stone-50'
                            }`}
                          >
                            {selectedStyleId === preset.id && (
                              <div className="absolute top-0 right-0 bg-brand-500 text-white p-1 rounded-bl-lg">
                                <Check size={12} />
                              </div>
                            )}
                            <div>
                              <span className={`block font-bold text-sm ${selectedStyleId === preset.id ? 'text-brand-700' : 'text-stone-700'}`}>
                                {preset.label}
                              </span>
                              <span className="text-xs text-stone-500 line-clamp-2 mt-1">{preset.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-brand-800">Additional Instructions (Optional)</h3>
                        <div className="group relative">
                          <Info size={16} className="text-stone-400 cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 w-64 bg-brand-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Specific features like 'fire pit', 'swimming pool', 'timber deck', or specific plants you love.
                          </div>
                        </div>
                      </div>
                      <textarea
                        ref={textAreaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={appState === AppState.GENERATING}
                        placeholder="e.g., 'Add a retro filter', 'Remove the person in the background', 'Make the pool smaller'..."
                        className="w-full h-32 p-4 rounded-xl border border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/50 outline-none resize-none bg-brand-800 text-white placeholder-brand-300/50 transition-all"
                      />
                    </div>
                    
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                        <span className="font-bold">Error:</span> {error}
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-stone-100">
                      <button
                        onClick={() => handleGenerate()}
                        disabled={appState === AppState.GENERATING}
                        className="w-full bg-brand-lime hover:bg-[#b4d639] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-brand-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
                      >
                          <Wand2 size={24} /> Generate Transformation
                      </button>
                      <p className="text-center text-xs text-stone-400 mt-3">
                        AI generation takes approx. 10-15 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
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

        <footer className="bg-stone-100 py-10 mt-auto border-t border-stone-200">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="font-script text-2xl text-brand-800 mb-4">on thyme <span className="font-sans text-xs tracking-widest uppercase ml-2">Landscapes</span></h2>
            <p className="text-stone-500 text-sm">
              &copy; {new Date().getFullYear()} OnThymeLandscapes. All rights reserved.
            </p>
            <p className="text-stone-400 text-xs mt-2 max-w-md mx-auto">
              This tool uses Artificial Intelligence to visualise landscaping concepts. 
              Actual results may vary based on site conditions, measurements, and materials.
            </p>
          </div>
        </footer>
      </MobileWrapper>
    </div>
  );
};

export default App;