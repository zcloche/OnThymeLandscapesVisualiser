import React, { useState, useEffect } from 'react';
import { Plant, ClimateZone } from '../types';
import { PLANT_DATABASE, STYLES, CLIMATE_ZONES } from '../data/constants';
import { Leaf, MapPin, Plus, Trash2, RefreshCw, X, Save } from 'lucide-react';

interface PlantSuggestionsProps {
  styleId: string;
  climateId: ClimateZone;
}

export const PlantSuggestions: React.FC<PlantSuggestionsProps> = ({ styleId, climateId }) => {
  const [currentPlants, setCurrentPlants] = useState<Plant[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantDesc, setNewPlantDesc] = useState('');

  const styleName = STYLES.find(s => s.id === styleId)?.label || 'Custom';
  const climateName = CLIMATE_ZONES.find(c => c.id === climateId)?.label || 'General';

  // Initialize plants when style/climate changes
  useEffect(() => {
    // Filter logic:
    // 1. Must match Climate
    // 2. Sort by: Matches Style (Priority) -> Others
    const recommendedPlants = PLANT_DATABASE.filter(plant => 
      plant.suitableClimates.includes(climateId) && plant.suitableStyles.includes(styleId)
    );
    
    // If we don't have enough specific matches, fill with climate-appropriate plants
    const fillerPlants = PLANT_DATABASE.filter(plant => 
      plant.suitableClimates.includes(climateId) && !plant.suitableStyles.includes(styleId)
    );

    // Initial set: top 10
    setCurrentPlants([...recommendedPlants, ...fillerPlants].slice(0, 10));
  }, [styleId, climateId]);

  const handleRemove = (indexToRemove: number) => {
    setCurrentPlants(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (indexToChange: number) => {
    // Find candidates that are NOT currently displayed and match the climate
    const currentNames = currentPlants.map(p => p.name);
    const candidates = PLANT_DATABASE.filter(p => 
      !currentNames.includes(p.name) && 
      p.suitableClimates.includes(climateId)
    );

    if (candidates.length === 0) {
      alert("No other suitable plants found in the database for this climate.");
      return;
    }

    // Prioritize those that match the style
    const styleMatches = candidates.filter(p => p.suitableStyles.includes(styleId));
    const pool = styleMatches.length > 0 ? styleMatches : candidates;

    // Pick random
    const newPlant = pool[Math.floor(Math.random() * pool.length)];

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
      suitableStyles: [styleId], // Assume it fits current style
      suitableClimates: [climateId] // Assume it fits current climate
    };

    setCurrentPlants(prev => [...prev, customPlant]);
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8 relative">
      <div className="bg-brand-50 p-6 border-b border-brand-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-brand-800 flex items-center gap-2">
            <Leaf size={20} className="text-brand-500" />
            Recommended Planting Palette
          </h3>
          <p className="text-stone-600 mt-1 text-sm">
            Based on your <span className="font-semibold text-brand-700">{styleName}</span> design in a <span className="font-semibold text-brand-700">{climateName}</span> climate.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs text-stone-500">
              <MapPin size={12} /> {climateName} Zone
           </div>
           <button 
             onClick={handleAddClick}
             className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
           >
             <Plus size={16} /> Add Plant
           </button>
        </div>
      </div>
      
      <div className="p-6">
        {currentPlants.length === 0 ? (
            <div className="text-center py-8 text-stone-500">No plants selected. Click "Add Plant" to build your list.</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlants.map((plant, index) => (
                <div key={`${plant.name}-${index}`} className="group relative p-4 rounded-xl border border-stone-100 hover:border-brand-300 hover:shadow-md transition-all bg-stone-50 hover:bg-white">
                
                {/* Action Buttons (Visible on hover or focus) */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm z-10">
                    <button 
                        onClick={() => handleChange(index)} 
                        title="Swap with another plant"
                        className="p-1.5 text-stone-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button 
                        onClick={() => handleRemove(index)} 
                        title="Remove plant"
                        className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="flex justify-between items-start mb-2 pr-16">
                    <h4 className="font-bold text-stone-800 group-hover:text-brand-600 transition-colors">{plant.name}</h4>
                </div>
                
                <div className="mb-2">
                    {plant.suitableStyles.includes(styleId) && (
                    <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Perfect Match
                    </span>
                    )}
                </div>

                <p className="text-sm text-stone-500 leading-relaxed">
                    {plant.description}
                </p>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* Add Plant Modal */}
      {isAdding && (
        <div className="absolute inset-0 z-20 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
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
