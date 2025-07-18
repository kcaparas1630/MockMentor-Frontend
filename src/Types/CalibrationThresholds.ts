/**
 * @fileoverview Calibration thresholds interface for audio calibration.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file defines the interface for calibration thresholds used in
 * the audio calibration system.
 */

export default interface CalibrationThresholds {
  amplitudeThreshold: number;
  spectralCentroidMin: number;
  spectralCentroidMax: number;
  zcrMin: number;
  zcrMax: number;
}
