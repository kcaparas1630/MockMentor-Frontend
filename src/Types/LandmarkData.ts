export interface SimpleLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface LandmarkItem {
  landmarks: SimpleLandmark[][];
  confidence: number;
  timeStamp: number;
}

export type LandmarkBuffer = LandmarkItem[];
