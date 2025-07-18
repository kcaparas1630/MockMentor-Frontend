/**
 * @fileoverview Calibration context definition.
 */

import { createContext } from 'react';
import CalibrationThresholds from '../Types/CalibrationThresholds';

// Context interface
export interface CalibrationContextType {
  thresholds: CalibrationThresholds | null;
  setThresholds: (thresholds: CalibrationThresholds) => void;
  clearThresholds: () => void;
}

// Create and export context
export const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined); 
