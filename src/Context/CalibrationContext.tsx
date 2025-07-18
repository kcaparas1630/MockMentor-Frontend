/**
 * @fileoverview Simple calibration context for storing audio calibration thresholds.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CalibrationThresholds from '../Types/CalibrationThresholds';

// Context interface
interface CalibrationContextType {
  thresholds: CalibrationThresholds | null;
  setThresholds: (thresholds: CalibrationThresholds) => void;
  clearThresholds: () => void;
}

// Create context
const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'audio_calibration_thresholds';

// Provider component
interface CalibrationProviderProps {
  children: ReactNode;
}

export const CalibrationProvider: React.FC<CalibrationProviderProps> = ({ children }) => {
  const [thresholds, setThresholdsState] = useState<CalibrationThresholds | null>(null);

  // Load thresholds from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setThresholdsState(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load calibration thresholds:', error);
    }
  }, []);

  // Save thresholds to localStorage when they change
  useEffect(() => {
    if (thresholds) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
      } catch (error) {
        console.warn('Failed to save calibration thresholds:', error);
      }
    }
  }, [thresholds]);

  const setThresholds = (newThresholds: CalibrationThresholds) => {
    setThresholdsState(newThresholds);
  };

  const clearThresholds = () => {
    setThresholdsState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CalibrationContext.Provider value={{ thresholds, setThresholds, clearThresholds }}>
      {children}
    </CalibrationContext.Provider>
  );
};

// Custom hook to use the calibration context
export const useCalibration = (): CalibrationContextType => {
  const context = useContext(CalibrationContext);
  if (context === undefined) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
};

 
