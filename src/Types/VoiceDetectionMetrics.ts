/**
 * @fileoverview Voice detection metrics interface for audio analysis.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file defines the interface for voice detection metrics used in
 * the audio analysis system.
 */

export default interface VoiceDetectionMetrics {
  amplitude: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  currentTime: number;
}
