/**
 * @fileoverview Shared audio analysis utilities for voice activity detection and microphone testing.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file contains shared audio analysis functions used across multiple components for
 * voice activity detection, microphone testing, and real-time audio processing. These
 * utilities provide common algorithms for spectral analysis, amplitude calculation,
 * and zero-crossing rate detection.
 *
 * @see {@link src/Hooks/useDetectAudio.ts}
 * @see {@link src/Hooks/useMicTesting.ts}
 *
 * Dependencies:
 * - Web Audio API
 */

/**
 * Calculates spectral centroid from frequency domain data.
 * 
 * The spectral centroid represents the "center of mass" of the spectrum and is a measure
 * of the brightness of a sound. It's calculated as the weighted average of the frequencies
 * present in the signal, with the magnitude of each frequency component serving as the weight.
 * This metric is particularly useful for distinguishing between different types of speech sounds.
 * 
 * @function
 * @param {Uint8Array} frequencyData - Frequency domain data from FFT analysis (0-255 range).
 * @param {number} sampleRate - Audio sample rate in Hz (typically 44100 or 48000).
 * @returns {number} Spectral centroid value in Hz, or 0 if no magnitude data.
 * @example
 * // Calculate spectral centroid from frequency data:
 * const centroid = calculateSpectralCentroid(frequencyArray, 44100);
 * console.log('Spectral centroid:', centroid, 'Hz');
 * 
 * @remarks
 * Algorithm:
 * - Converts frequency data to magnitude values (0-1 range)
 * - Calculates frequency for each bin based on sample rate and FFT size
 * - Computes weighted sum: Σ(frequency * magnitude)
 * - Computes magnitude sum: Σ(magnitude)
 * - Returns weighted sum / magnitude sum
 * 
 * Interpretation for speech:
 * - Low values (200-800 Hz): Vowels, low-frequency sounds
 * - Medium values (800-3000 Hz): Normal speech, consonants
 * - High values (3000-8000 Hz): Sibilants, high-frequency sounds
 * 
 * Performance: O(n) where n is the number of frequency bins
 * 
 * @throws {Error} No errors thrown, returns 0 for invalid input.
 */
export const calculateSpectralCentroid = (
  frequencyData: Uint8Array,
  sampleRate: number
): number => {
  const fftSize = frequencyData.length * 2; // fftSize is twice the frequency bin count.
  const binWidth = sampleRate / fftSize;

  let weightedSum = 0;
  let magnitudeSum = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    const frequency = i * binWidth;
    const magnitude = frequencyData[i] / 255; // Normalize to 0-1 range
    // Calculate weighted sum and magnitude sum
    weightedSum += frequency * magnitude;
    magnitudeSum += magnitude;
  }
  return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
};

/**
 * Calculates average amplitude from time domain audio data.
 * 
 * Amplitude is a measure of the signal strength or volume. This function calculates
 * the average absolute amplitude by sampling the time domain data at regular intervals
 * for efficiency. The result is normalized and scaled to provide a meaningful amplitude value
 * that can be used for voice activity detection.
 * 
 * @function
 * @param {Uint8Array} timeData - Time domain audio data (0-255 range, centered around 128).
 * @returns {number} Average amplitude value, typically between 0-100.
 * @example
 * // Calculate amplitude from time domain data:
 * const amplitude = calculateAmplitude(timeDataArray);
 * console.log('Average amplitude:', amplitude);
 * 
 * @remarks
 * Algorithm:
 * - Centers data around zero by subtracting 128 from each sample
 * - Samples every 4th value for performance optimization
 * - Calculates absolute value of each sample
 * - Normalizes to 0-1 range by dividing by 128
 * - Computes average and scales to 0-100 range
 * 
 * Performance optimization:
 * - Uses sampleStep = 4 to reduce computation by 75%
 * - Maintains accuracy while improving performance
 * 
 * Interpretation for voice detection:
 * - Low values (0-10): Quiet sounds, background noise, silence
 * - Medium values (10-30): Normal speech levels, conversation
 * - High values (30+): Loud sounds, shouting, close microphone
 * 
 * Performance: O(n/4) where n is the length of time data
 * 
 * @throws {Error} No errors thrown, handles edge cases gracefully.
 */
export const calculateAmplitude = (timeData: Uint8Array): number => {
  let sum = 0;
  const length = timeData.length;
  const sampleStep = 4; // Sample every 4th value for efficiency

  for (let i = 0; i < length; i += sampleStep) {
    sum += Math.abs((timeData[i] - 128) / 128);
  }

  return (sum / (length / sampleStep)) * 100;
};

/**
 * Calculates zero-crossing rate from time domain audio data.
 * 
 * The zero-crossing rate is a measure of how many times the signal changes sign,
 * crossing the zero line. It's useful for distinguishing between voiced and unvoiced
 * speech, as well as detecting different types of sounds. Higher values typically
 * indicate more complex or noisy signals, while lower values indicate more tonal sounds.
 * 
 * @function
 * @param {Uint8Array} timeData - Time domain audio data (0-255 range, centered around 128).
 * @returns {number} Zero-crossing rate as a normalized value between 0 and 1.
 * @example
 * // Calculate zero-crossing rate from time domain data:
 * const zcr = calculateZeroCrossingRate(timeDataArray);
 * console.log('Zero-crossing rate:', zcr);
 * 
 * @remarks
 * Algorithm:
 * - Centers data around zero by subtracting 128 from each sample
 * - Counts sign changes between consecutive samples
 * - Normalizes by dividing by total number of samples
 * 
 * Interpretation for speech detection:
 * - Low values (0.05-0.15): Voiced speech, vowels, sustained tones
 * - Medium values (0.15-0.25): Mixed speech, some noise, consonants
 * - High values (0.25-0.35): Unvoiced speech, fricatives, noise
 * - Very high values (0.35+): Pure noise, clicks, artifacts
 * 
 * Performance: O(n) where n is the length of time data
 * 
 * @throws {Error} No errors thrown, handles edge cases gracefully.
 */
export const calculateZeroCrossingRate = (timeData: Uint8Array): number => {
  let crossings = 0;
  const length = timeData.length;

  for (let i = 1; i < length; i++) {
    const current = timeData[i] - 128; // Center around 0
    const previous = timeData[i - 1] - 128;

    if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
      crossings++;
    }
  }

  return crossings / length; // Normalize by length
}; 
