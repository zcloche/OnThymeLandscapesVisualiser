
export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PREVIEW = 'PREVIEW',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedImageResult {
  originalImage: string;
  generatedImage: string;
  promptUsed: string;
}

export type ClimateZone = 'tropical' | 'subtropical' | 'temperate' | 'cool' | 'arid' | 'hawkesbury';

export type GardenAspect = 'North' | 'North-East' | 'East' | 'South-East' | 'South' | 'South-West' | 'West' | 'North-West';

export type SunExposure = 'full-sun' | 'part-shade' | 'shade';

export type ViewMode = 'desktop' | 'mobile';

export interface StylePreset {
  id: string;
  label: string;
  promptSuffix: string;
  iconName: string;
  description: string;
}

export interface Plant {
  name: string;
  description: string;
  suitableStyles: string[];
  suitableClimates: ClimateZone[];
  sunNeeds?: SunExposure[];
  fireResistant?: boolean;
  imageUrl: string;
}
