/**
 * @fileoverview Calibration provider component for storing audio calibration thresholds.
 */

import React, { useState, useEffect, ReactNode } from 'react';
import CalibrationThresholds from '../Types/CalibrationThresholds';
import { CalibrationContext } from './CalibrationContext';

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

 
