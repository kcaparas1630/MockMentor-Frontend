/**
 * @fileoverview Custom hook for accessing calibration context.
 */

import { useContext } from 'react';
import { CalibrationContext, CalibrationContextType } from '../Context/CalibrationContext.ts';

/**
 * Custom hook to use the calibration context.
 * 
 * @function
 * @returns {CalibrationContextType} The calibration context with thresholds and methods.
 * @throws {Error} Throws error if used outside of CalibrationProvider.
 * @example
 * // Usage in components:
 * const { thresholds, setThresholds, clearThresholds } = useCalibration();
 * 
 * // Access thresholds
 * console.log('Current thresholds:', thresholds);
 * 
 * // Update thresholds
 * setThresholds(newThresholds);
 * 
 * // Clear thresholds
 * clearThresholds();
 */
export const useCalibration = (): CalibrationContextType => {
  const context = useContext(CalibrationContext);
  if (context === undefined) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
}; 
