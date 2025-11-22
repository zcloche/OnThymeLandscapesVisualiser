import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { generateLandscapeDesign } from './services/geminiService';
import { AppState, StylePreset, ClimateZone } from './types';
import { STYLES, CLIMATE_ZONES } from './data/constants';
import { Wand2, Loader2, Info, X, MapPin, Check, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Inputs
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('modern');
  const [selectedClimateId, setSelectedClimateId] = useState<ClimateZone>('hawkesbury');
  
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

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      // Combine user prompt with style context
      const style = STYLES.find(s => s.id === selectedStyleId);
      const climate = CLIMATE_ZONES.find(c => c.id === selectedClimateId);
      
      // Build a rich prompt
      const finalPrompt = `
        Landscape Style: ${style?.label || 'Custom'}.
        Climate Context: ${climate?.label} Australia.
        Specific Instructions: ${activePrompt}.
        Style Description to apply: ${style?.promptSuffix}.
      `;

      const resultUrl = await generateLandscapeDesign(imageFile, finalPrompt);
      setGeneratedImage(resultUrl);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("We couldn't generate your design at this time. Please try again or check your API key.");
      setAppState(AppState.PREVIEW);
    }
  };

  const handleStyleSelect = (preset: StylePreset) => {
    setSelectedStyleId(preset.id);
    // We no longer auto-append text, we handle it in the final prompt generation to keep the UI clean
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

  return (
    <div className={`min-h-screen flex flex-col font-sans text-stone-800 transition-colors duration-500 ${appState === AppState.IDLE ? 'bg-brand-purple-light' : 'bg-stone-50'}`}>
      <Header />
      
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* IDLE STATE: Welcome & Upload */}
          {appState === AppState.IDLE && (
            <div className="space-y-12 animate-fade-in py-8">
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-extrabold text-brand-800 tracking-tight sm:text-5xl">
                  Visualise Your <span className="text-brand-lime drop-shadow-sm font-script text-6xl relative top-2">Dream Garden</span>
                </h2>
                <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Upload a photo of your current house or garden and let our AI Landscape Architect show you the potential.
                </p>
              </div>

              {/* Climate Zone Selector - Prominent on Start Page */}
              <div className="flex justify-center relative z-10">
                <div className="bg-white p-2 pr-8 rounded-full shadow-xl border-2 border-brand-100 hover:border-brand-300 transition-all flex items-center gap-4 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-brand-100 text-brand-600 p-3 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">I am located in</label>
                    <div className="relative flex items-center">
                       <select 
                        value={selectedClimateId}
                        onChange={(e) => setSelectedClimateId(e.target.value as ClimateZone)}
                        className="appearance-none bg-transparent text-brand-900 font-bold text-lg pr-8 pl-1 cursor-pointer focus:outline-none w-full sm:w-64"
                       >
                         {CLIMATE_ZONES.map(zone => (
                           <option key={zone.id} value={zone.id}>{zone.label}</option>
                         ))}
                       </select>
                       <ChevronDown size={16} className="absolute right-0 text-brand-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-1 sm:p-8 rounded-[2rem] shadow-xl shadow-brand-900/5 border border-brand-100">
                <ImageUploader onImageSelected={handleImageSelected} />
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Column: Preview */}
              <div className="lg:col-span-5 space-y-6">
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

                {/* Climate Selector */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
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
              </div>

              {/* Right Column: Controls */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-100 relative overflow-hidden min-h-[600px] flex flex-col">
                  {appState === AppState.GENERATING && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                      <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-lime rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Wand2 size={24} className="text-brand-600 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-brand-800">Designing Your Sanctuary</h3>
                      <p className="text-stone-500 mt-2 max-w-xs mx-auto">
                        Applying {STYLES.find(s => s.id === selectedStyleId)?.label} aesthetics to your {CLIMATE_ZONES.find(c => c.id === selectedClimateId)?.label} garden...
                      </p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-brand-800 mb-1">Select a Style</h3>
                    <p className="text-sm text-stone-500 mb-4">Choose the aesthetic for your transformation.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="e.g., Add a timber deck, remove the old shed, and add screening plants along the back fence."
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
                      onClick={handleGenerate}
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
              prompt={prompt}
              onRefine={(newPrompt) => handleGenerate(newPrompt)}
            />
          )}

        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
};

export default App;