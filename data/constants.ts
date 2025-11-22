import { Plant, StylePreset, ClimateZone } from '../types';

export const CLIMATE_ZONES: { id: ClimateZone; label: string; locations: string }[] = [
  { id: 'hawkesbury', label: 'Hawkesbury Region', locations: 'Windsor, Richmond, Kurrajong - High summer heat, cool winters' },
  { id: 'tropical', label: 'Tropical', locations: 'North QLD, NT, Northern WA' },
  { id: 'subtropical', label: 'Subtropical', locations: 'Brisbane, Gold Coast, Coffs Harbour' },
  { id: 'temperate', label: 'Temperate', locations: 'Sydney, Perth, Adelaide, Coastal VIC' },
  { id: 'cool', label: 'Cool / Alpine', locations: 'Melbourne, Tasmania, Canberra, Blue Mountains' },
  { id: 'arid', label: 'Arid / Inland', locations: 'Alice Springs, Broken Hill, Inland areas' },
];

export const STYLES: StylePreset[] = [
  { 
    id: 'native', 
    label: 'Native Australian', 
    promptSuffix: 'Use native Australian plants like eucalyptus, banksia, and kangaroo paw. Natural bush rock, crushed granite paths, mulch, and drought-tolerant landscaping.', 
    iconName: 'sprout',
    description: 'Embrace the rugged beauty of the Australian bush with drought-hardy natives.'
  },
  { 
    id: 'modern', 
    label: 'Modern', 
    promptSuffix: 'Clean lines, geometric pavers, manicured lawn, architectural plants, minimal clutter, concrete or rendered planters, and modern fencing.', 
    iconName: 'box',
    description: 'Sleek, sophisticated, and low maintenance with strong architectural lines.'
  },
  { 
    id: 'tropical', 
    label: 'Tropical', 
    promptSuffix: 'Lush greenery, palms, ferns, balinese style statues, dark timber decking, pebbles, and a relaxing resort vibe with dense planting.', 
    iconName: 'sun',
    description: 'A holiday resort in your backyard with lush, large-leafed foliage.'
  },
  { 
    id: 'cottage', 
    label: 'Cottage', 
    promptSuffix: 'A whimsical mix of flowering plants, curved brick or stone paths, picket fences, rose bushes, and a soft, organic layout. Traditional and cozy.', 
    iconName: 'flower',
    description: 'Charming, colourful, and full of life with traditional flowering beds.'
  },
  { 
    id: 'minimalist', 
    label: 'Minimalist', 
    promptSuffix: 'Less is more. gravel or large format pavers, single specimen trees, strong contrast, very few plant varieties, open space, and zen-like simplicity.', 
    iconName: 'circle',
    description: 'Stripped back simplicity focusing on space, texture, and light.'
  },
];

export const PLANT_DATABASE: Plant[] = [
  // Hawkesbury Specific Additions
  {
    name: 'Spotted Gum (Corymbia maculata)',
    description: 'Iconic tall tree with mottled bark. Thrives in the clay soils of the basin and tolerates dry heat.',
    suitableStyles: ['native', 'modern', 'minimalist'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'Snow-in-Summer (Melaleuca linariifolia)',
    description: 'Local paperbark with masses of white fluffy flowers. Excellent for flood-prone or damp areas.',
    suitableStyles: ['native', 'cottage'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'River She-Oak (Casuarina cunninghamiana)',
    description: 'Fast-growing, graceful tree perfect for windbreaks against the Southerly Buster. Stabilises riverbanks.',
    suitableStyles: ['native', 'minimalist'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'Forest Red Gum (Eucalyptus tereticornis)',
    description: 'The signature tree of the Cumberland Plain. majestic and hardy, tolerating both drought and waterlogging.',
    suitableStyles: ['native'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'Native Sarsaparilla (Hardenbergia violacea)',
    description: 'Vigorous local climber with purple flowers in winter/spring. Handles clay soil and frost well.',
    suitableStyles: ['native', 'cottage', 'modern'],
    suitableClimates: ['hawkesbury', 'temperate', 'cool', 'subtropical', 'arid'],
  },
  {
    name: 'Kurrajong (Brachychiton populneus)',
    description: 'Drought-deciduous tree with a stout trunk. Excellent shade tree that handles the western heat.',
    suitableStyles: ['native', 'modern', 'arid'],
    suitableClimates: ['hawkesbury', 'arid', 'temperate', 'subtropical'],
  },
  {
    name: 'Gymea Lily (Doryanthes excelsa)',
    description: 'Massive rosette with a spectacular red flower spike. A bold structural plant for large gardens.',
    suitableStyles: ['native', 'modern', 'tropical'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'Creeping Boobialla (Myoporum parvifolium)',
    description: 'Tough groundcover that forms a dense mat. Weed suppressing and handles extreme heat.',
    suitableStyles: ['native', 'modern', 'minimalist'],
    suitableClimates: ['hawkesbury', 'arid', 'temperate', 'subtropical'],
  },
  {
    name: 'Grey Myrtle (Backhousia myrtifolia)',
    description: 'Rainforest shrub found in local gullies. Cinnamon-scented leaves and creamy flowers.',
    suitableStyles: ['native', 'cottage', 'tropical'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },
  {
    name: 'Water Gum (Tristaniopsis laurina)',
    description: 'Stream-side tree with smooth bark and yellow flowers. Great shade tree for lawn areas.',
    suitableStyles: ['native', 'modern', 'tropical'],
    suitableClimates: ['hawkesbury', 'temperate', 'subtropical'],
  },

  // Existing Plants (Updated with Hawkesbury suitability)
  {
    name: 'Kangaroo Paw',
    description: 'Iconic Australian native with velvety, paw-shaped flowers. Adds height and vibrant colour.',
    suitableStyles: ['native', 'modern', 'minimalist'],
    suitableClimates: ['temperate', 'subtropical', 'arid', 'tropical', 'hawkesbury'],
  },
  {
    name: 'Banksia',
    description: 'Distinctive cylindrical flower spikes and serrated leaves. Attracts native birds.',
    suitableStyles: ['native', 'cottage'],
    suitableClimates: ['temperate', 'subtropical', 'cool', 'arid', 'hawkesbury'],
  },
  {
    name: 'Lilly Pilly',
    description: 'Fast-growing evergreen perfect for hedging and screening. Produces edible berries.',
    suitableStyles: ['native', 'modern', 'cottage', 'tropical'],
    suitableClimates: ['tropical', 'subtropical', 'temperate', 'cool', 'hawkesbury'],
  },
  {
    name: 'Golden Wattle',
    description: 'Australia’s floral emblem. Bright yellow fluffy flowers that light up the garden in spring.',
    suitableStyles: ['native', 'cottage'],
    suitableClimates: ['temperate', 'subtropical', 'arid', 'hawkesbury'],
  },
  {
    name: 'Bird of Paradise',
    description: 'Structural plant with spectacular orange and blue flowers. Very hardy.',
    suitableStyles: ['tropical', 'modern'],
    suitableClimates: ['tropical', 'subtropical', 'temperate'],
  },
  {
    name: 'Magnolia Little Gem',
    description: 'Compact evergreen tree with glossy leaves and large, fragrant white flowers.',
    suitableStyles: ['modern', 'cottage', 'minimalist'],
    suitableClimates: ['temperate', 'subtropical', 'cool', 'hawkesbury'],
  },
  {
    name: 'Frangipani',
    description: 'Small tree with incredibly fragrant, waxy flowers. Defines the tropical look.',
    suitableStyles: ['tropical', 'modern', 'cottage'],
    suitableClimates: ['tropical', 'subtropical', 'temperate'],
  },
  {
    name: 'Lomandra (Mat Rush)',
    description: 'Extremely hardy grass-like plant. Perfect for borders and mass planting.',
    suitableStyles: ['native', 'modern', 'minimalist'],
    suitableClimates: ['arid', 'temperate', 'subtropical', 'cool', 'tropical', 'hawkesbury'],
  },
  {
    name: 'Agave Attenuata',
    description: 'Succulent rosette that makes a bold architectural statement without thorns.',
    suitableStyles: ['modern', 'minimalist', 'tropical'],
    suitableClimates: ['arid', 'temperate', 'subtropical'],
  },
  {
    name: 'Star Jasmine',
    description: 'Versatile climber with glossy leaves and scented white flowers. Great groundcover too.',
    suitableStyles: ['modern', 'cottage', 'tropical'],
    suitableClimates: ['temperate', 'subtropical', 'tropical', 'cool', 'hawkesbury'],
  },
  {
    name: 'Tree Fern',
    description: 'Ancient-looking fern with a trunk. Needs shade and moisture. Very dramatic.',
    suitableStyles: ['tropical', 'native', 'cottage'],
    suitableClimates: ['tropical', 'subtropical', 'temperate', 'cool', 'hawkesbury'],
  },
  {
    name: 'Lavender',
    description: 'Classic fragrant purple shrub. loves full sun and well-drained soil.',
    suitableStyles: ['cottage', 'modern'],
    suitableClimates: ['temperate', 'cool', 'arid', 'hawkesbury'],
  },
  {
    name: 'Yucca',
    description: 'Tough, spiky architectural plant that survives neglect and heat.',
    suitableStyles: ['modern', 'minimalist', 'arid'],
    suitableClimates: ['arid', 'temperate', 'subtropical'],
  },
  {
    name: 'Bottlebrush (Callistemon)',
    description: 'Hardy shrub with brilliant red brush-like flowers that attract birds.',
    suitableStyles: ['native', 'cottage', 'modern'],
    suitableClimates: ['temperate', 'subtropical', 'tropical', 'arid', 'hawkesbury'],
  },
  {
    name: 'Japanese Maple',
    description: 'Deciduous small tree with stunning autumn foliage colours. Needs protection from hot wind.',
    suitableStyles: ['minimalist', 'cottage', 'modern'],
    suitableClimates: ['cool', 'temperate'],
  }
];