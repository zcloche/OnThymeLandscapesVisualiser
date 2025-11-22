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
}