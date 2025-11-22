
import React, { useState, useEffect, useCallback } from 'react';
import { Plant, ClimateZone, GardenAspect, SunExposure } from '../types';
import { PLANT_DATABASE, STYLES, CLIMATE_ZONES } from '../data/constants';
import { Leaf, Plus, Trash2, RefreshCw, X, Save, AlertTriangle, Flame, Sun, Sparkles, ImageOff, Camera, RotateCcw, ScanEye, Check } from 'lucide-react';
import { identifyPlantsInImage } from '../services/geminiService';

interface PlantSuggestionsProps {
  styleId: string;
  climateId: ClimateZone;
  generatedImage?: string;
  aspect?: GardenAspect;
  isBushfireZone?: boolean;
}

type ImageStatus = 'loading' | 'success' | 'error';

interface PlantImageState {
  status: ImageStatus;
  retryKey: number;
}

// Fallback image URL (Generic Garden)
const FALLBACK_IMAGE = 'https://loremflickr.com/400/300/garden,foliage,nature/all';

export const PlantSuggestions: React.FC<PlantSuggestionsProps> = ({ 
  styleId, 
  climateId, 
  generatedImage, 
  aspect,
  isBushfireZone 
}) => {
  const [currentPlants, setCurrentPlants] = useState<Plant[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantDesc, setNewPlantDesc] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetectedPlants, setAiDetectedPlants] = useState<string[]>([]);

  // Image Validation State: Map plant name to its image status and retry key
  const [imageStates, setImageStates] = useState<Record<string, PlantImageState>>({});

  const styleName = STYLES.find(s => s.id === styleId)?.label || 'Custom';
  const climateName = CLIMATE_ZONES.find(c => c.id === climateId)?.label || 'General';

  // Map Aspect to Sun Needs - OPTIMISED FOR AUSTRALIA (Southern Hemisphere)
  const getAspectSunNeeds = (aspect: GardenAspect | undefined): SunExposure[] => {
    if (!aspect) return ['full-sun', 'part-shade', 'shade']; // No filter
    
    switch (aspect) {
      // HOT / HARSH SECTORS
      case 'North':      // Midday sun (hottest)
      case 'North-West': // Midday + Afternoon sun (very hot)
      case 'West':       // Afternoon sun (hottest/harshest)
        return ['full-sun']; 
      
      // SUNNY BUT GENTLER
      case 'North-East': // Morning + Midday sun
        return ['full-sun', 'part-shade'];
        
      // MORNING SUN
      case 'East':       // Morning sun only (cool afternoons)
        return ['part-shade', 'full-sun'];

      // COOLER / SHADY SECTORS
      case 'South-East': // Limited morning sun
        return ['part-shade', 'shade'];
        
      case 'South':      // No direct sun in winter, limited in summer (Deep Shade)
        return ['shade', 'part-shade'];
        
      case 'South-West': // Cool, but potential for late harsh sun. Generally shade/part-shade plants.
        return ['part-shade', 'shade'];

      default:
        return ['full-sun', 'part-shade', 'shade'];
    }
  };

  const triggerAnalysis = useCallback(async () => {
    if (generatedImage) {
      setIsAnalyzing(true);
      try {
        const plants = await identifyPlantsInImage(generatedImage);
        setAiDetectedPlants(plants);
      } catch (error) {
        console.error("Analysis failed", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [generatedImage]);

  // Identify plants automatically when generated image changes
  useEffect(() => {
    triggerAnalysis();
  }, [triggerAnalysis]);

  // Initialize/Filter plants
  useEffect(() => {
    const sunConditions = getAspectSunNeeds(aspect);

    // Helper to check plant viability
    const isPlantSuitable = (plant: Plant) => {
      // 1. Climate Check
      if (!plant.suitableClimates.includes(climateId)) return false;
      
      // 2. Bushfire Check
      if (isBushfireZone && plant.fireResistant === false) return false;
      
      // 3. Sun/Aspect Check
      // Check if plant's needs overlap with provided sun conditions
      if (plant.sunNeeds && !plant.sunNeeds.some(need => sunConditions.includes(need))) return false;
      
      return true;
    };

    let pool = PLANT_DATABASE.filter(isPlantSuitable);
    
    // Sort by Relevance
    pool.sort((a, b) => {
      const aMatchesAI = aiDetectedPlants.some(k => a.name.toLowerCase().includes(k.toLowerCase()) || a.description.toLowerCase().includes(k.toLowerCase()));
      const bMatchesAI = aiDetectedPlants.some(k => b.name.toLowerCase().includes(k.toLowerCase()) || b.description.toLowerCase().includes(k.toLowerCase()));
      
      if (aMatchesAI && !bMatchesAI) return -1;
      if (!aMatchesAI && bMatchesAI) return 1;

      const aMatchesStyle = a.suitableStyles.includes(styleId);
      const bMatchesStyle = b.suitableStyles.includes(styleId);

      if (aMatchesStyle && !bMatchesStyle) return -1;
      if (!aMatchesStyle && bMatchesStyle) return 1;
      
      return 0;
    });

    const newPlants = pool.slice(0, 10);
    setCurrentPlants(newPlants);

    // Initialize states for new plants if not exists
    setImageStates(prev => {
        const next = { ...prev };
        newPlants.forEach(p => {
            if (!next[p.name]) {
                next[p.name] = { status: 'loading', retryKey: Date.now() };
            }
        });
        return next;
    });

  }, [styleId, climateId, aiDetectedPlants, isBushfireZone, aspect]);

  const handleRemove = (indexToRemove: number) => {
    setCurrentPlants(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (indexToChange: number) => {
    const sunConditions = getAspectSunNeeds(aspect);

    // Find candidates that are NOT currently displayed and match criteria
    const currentNames = currentPlants.map(p => p.name);
    const candidates = PLANT_DATABASE.filter(p => 
      !currentNames.includes(p.name) && 
      p.suitableClimates.includes(climateId) &&
      (!isBushfireZone || p.fireResistant !== false) &&
      (!p.sunNeeds || p.sunNeeds.some(need => sunConditions.includes(need)))
    );

    if (candidates.length === 0) {
      alert("No other suitable plants found matching these strict criteria.");
      return;
    }

    // Prioritize those that match the style
    const styleMatches = candidates.filter(p => p.suitableStyles.includes(styleId));
    const pool = styleMatches.length > 0 ? styleMatches : candidates;

    // Pick random
    const newPlant = pool[Math.floor(Math.random() * pool.length)];

    // Initialize image state for new plant
    setImageStates(prev => ({
        ...prev,
        [newPlant.name]: { status: 'loading', retryKey: Date.now() }
    }));

    setCurrentPlants(prev => {
      const newList = [...prev];
      newList[indexToChange] = newPlant;
      return newList;
    });
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setNewPlantName('');
    setNewPlantDesc('');
  };

  const handleSaveNewPlant = () => {
    if (!newPlantName.trim()) return;

    const customPlant: Plant = {
      name: newPlantName,
      description: newPlantDesc || 'Custom addition',
      suitableStyles: [styleId],
      suitableClimates: [climateId],
      fireResistant: true,
      imageUrl: 'https://placehold.co/400x300/e3ebe5/3d5c4b?text=' + encodeURIComponent(newPlantName)
    };

    setImageStates(prev => ({
        ...prev,
        [customPlant.name]: { status: 'loading', retryKey: Date.now() }
    }));

    setCurrentPlants(prev => [...prev, customPlant]);
    setIsAdding(false);
  };

  // Handle adding an AI detected plant to the list
  const handleAddDetectedPlant = (tag: string) => {
    // Check if already exists
    if (currentPlants.some(p => p.name.toLowerCase().includes(tag.toLowerCase()))) {
      return;
    }

    // Attempt to find in database
    // We loosen filters slightly to allow adding a detected plant even if it wasn't in the strict initial recommendation
    // provided it fits the climate at least.
    const match = PLANT_DATABASE.find(p => 
      (p.name.toLowerCase().includes(tag.toLowerCase()) || p.description.toLowerCase().includes(tag.toLowerCase())) &&
      p.suitableClimates.includes(climateId)
    );

    if (match) {
      setCurrentPlants(prev => [match, ...prev]);
      setImageStates(prev => ({
          ...prev,
          [match.name]: { status: 'loading', retryKey: Date.now() }
      }));
    } else {
      // If no DB match, pre-fill custom add modal
      setNewPlantName(tag);
      setNewPlantDesc(`AI detected ${tag} in your design.`);
      setIsAdding(true);
    }
  };

  // Image Handling
  const handleImageLoad = (plantName: string) => {
    setImageStates(prev => ({
        ...prev,
        [plantName]: { ...prev[plantName], status: 'success' }
    }));
  };

  const handleImageError = (plantName: string) => {
    setImageStates(prev => ({
        ...prev,
        [plantName]: { ...prev[plantName], status: 'error' }
    }));
  };

  const handleImageRefresh = (plantName: string) => {
    setImageStates(prev => ({
        ...prev,
        [plantName]: { status: 'loading', retryKey: Date.now() }
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8 relative">
      <div className="bg-brand-50 p-6 border-b border-brand-100 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-brand-800 flex items-center gap-2">
              {isAnalyzing ? (
                <RefreshCw size={20} className="text-brand-500 animate-spin" />
              ) : (
                <Leaf size={20} className="text-brand-500" />
              )}
              Recommended Planting Palette
            </h3>
            <p className="text-stone-600 mt-1 text-sm">
              {isAnalyzing ? 'AI is analyzing your design for matches...' : `Tailored for ${styleName} style in ${climateName}.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Scan Image Button with Tooltip */}
            <div className="group relative">
              <button 
                onClick={triggerAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <ScanEye size={16} /> {isAnalyzing ? 'Scanning...' : 'Scan Image'}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-800 text-white text-[10px] p-2 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-center leading-tight">
                Analyze the generated image to find and match specific plants.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-800"></div>
              </div>
            </div>
            
            {isBushfireZone && (
               <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-xs text-red-700 font-bold">
                  <Flame size={12} /> Bushfire Safe
               </div>
            )}
            {aspect && (
               <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 font-bold">
                  <Sun size={12} /> {aspect} Aspect
               </div>
            )}
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={16} /> Add Plant
            </button>
          </div>
        </div>
        
        {/* AI Detection Results */}
        {aiDetectedPlants.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-500" /> AI Identified:
            </span>
            {aiDetectedPlants.map((tag, i) => {
              const isAdded = currentPlants.some(p => p.name.toLowerCase().includes(tag.toLowerCase()));
              return (
                <span key={i} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs pl-2 pr-1 py-0.5 rounded-md flex items-center gap-1 transition-colors hover:bg-indigo-100 group">
                  {tag}
                  {isAdded ? (
                    <Check size={12} className="text-brand-500" />
                  ) : (
                    <button 
                      onClick={() => handleAddDetectedPlant(tag)}
                      className="hover:bg-indigo-200 rounded-full p-0.5 text-indigo-500 transition-colors"
                      title="Add matching plant to palette"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Warnings / Info */}
        {isBushfireZone && (
           <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2">
             <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
             <p>Bushfire Safe Mode is active. High-flammability plants (like oil-rich Eucalypts) have been hidden. Recommendations focus on fire-retardant and smooth-barked options.</p>
           </div>
        )}
      </div>
      
      <div className="p-6">
        {currentPlants.length === 0 ? (
            <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
              <Leaf size={48} className="mx-auto text-stone-300 mb-4" />
              <p>No specific plants match all your criteria (Style + Climate + Aspect + Fire Safety).</p>
              <button onClick={handleAddClick} className="text-brand-600 font-bold hover:underline mt-2">Add a custom plant</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlants.map((plant, index) => {
                const imageState = imageStates[plant.name] || { status: 'loading', retryKey: 0 };
                
                // Determine which image URL to use: specific with lock, or fallback if error
                const displayUrl = imageState.status === 'error' 
                    ? FALLBACK_IMAGE 
                    : `${plant.imageUrl}?lock=${imageState.retryKey}`;

                return (
                <div key={`${plant.name}-${index}`} className="group relative rounded-xl border border-stone-100 hover:border-brand-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-stone-50 hover:bg-white overflow-hidden flex flex-col">
                
                {/* Plant Image Container */}
                <div className="relative h-40 w-full bg-stone-200 overflow-hidden">
                  
                  {/* Image Source */}
                  {plant.imageUrl && (
                    <img 
                      src={displayUrl} 
                      alt={plant.name} 
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageState.status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => handleImageLoad(plant.name)}
                      onError={() => handleImageError(plant.name)}
                    />
                  )}

                  {/* Loading Skeleton */}
                  {imageState.status === 'loading' && (
                      <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
                          <Leaf size={24} className="text-stone-300 animate-bounce" />
                      </div>
                  )}
                  
                  {/* Overlay Gradient (Only if loaded or fallback) */}
                  {(imageState.status === 'success' || imageState.status === 'error') && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                  )}
                  
                  {/* Error State Overlay Text */}
                  {imageState.status === 'error' && (
                      <div className="absolute bottom-2 left-2 text-[10px] text-white/80 font-medium">
                          Image unavailable
                      </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm z-20">
                      {/* Image Refresh Button */}
                      <button 
                          onClick={() => handleImageRefresh(plant.name)} 
                          title="Find new image"
                          className="p-1.5 text-stone-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                      >
                          {imageState.status === 'error' ? <RotateCcw size={14} /> : <Camera size={14} />}
                      </button>
                      {/* Swap Plant Button */}
                      <button 
                          onClick={() => handleChange(index)} 
                          title="Swap with another plant"
                          className="p-1.5 text-stone-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                      >
                          <RefreshCw size={14} />
                      </button>
                      {/* Remove Button */}
                      <button 
                          onClick={() => handleRemove(index)} 
                          title="Remove plant"
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-800 group-hover:text-brand-600 transition-colors line-clamp-1" title={plant.name}>{plant.name}</h4>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap gap-1">
                        {aiDetectedPlants.some(k => plant.name.toLowerCase().includes(k.toLowerCase())) && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={8} /> AI Detected
                            </span>
                        )}
                        {plant.suitableStyles.includes(styleId) && (
                        <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Style Match
                        </span>
                        )}
                        {plant.fireResistant && isBushfireZone && (
                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                          <Flame size={8} /> Fire Safe
                        </span>
                        )}
                    </div>

                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
                        {plant.description}
                    </p>
                </div>
                </div>
            )})}
            </div>
        )}
      </div>

      {/* Add Plant Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-brand-800">Add Custom Plant</h4>
              <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Plant Name</label>
                <input 
                  type="text" 
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  placeholder="e.g. Golden Wattle"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea 
                  value={newPlantDesc}
                  onChange={(e) => setNewPlantDesc(e.target.value)}
                  placeholder="Brief description of the plant..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-stone-600 font-medium hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNewPlant}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2"
                >
                  <Save size={16} /> Save Plant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
