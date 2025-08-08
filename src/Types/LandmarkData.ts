export interface LandmarkItem {
  landmarkItem: {
    landmarks: Array<Array<{
      x: number;
      y: number;
      z?: number;
      visibility?: number;
    }>>;
    confidence: number;
    timestamp: number;
  };
  timeStamp: number;
}

export type LandmarkBuffer = LandmarkItem[];