//**
//* Detects if there is audio in the given MediaStream.
//* @param stream - MediaStream to analyze
//* @returns boolean indicating if audio is detected

import { useCallback, useRef } from "react";
import {
  loadRnnoise,
  RnnoiseWorkletNode,
  NoiseGateWorkletNode
} from '@sapphi-red/web-noise-suppressor';
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url';
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url';
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url';
import rnnoiseWasmSimdPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url';

interface UseDetectAudioReturn {
  startDetectingAudio: (stream: MediaStream, onSpeakingChange?: (isSpeaking: boolean) => void) => Promise<void>;
  stopDetectingAudio: () => void;
}

export const useDetectAudio = (): UseDetectAudioReturn => {
  // REFERENCES TO AUDIO
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const stateRef = useRef<{
    isSpeaking: boolean;
    silenceStartTime: number;
  }>({
    isSpeaking: false,
    silenceStartTime: 0,
  });
  const speakingChangeCallbackRef = useRef<((isSpeaking: boolean) => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rrnoiseRef = useRef<RnnoiseWorkletNode | null>(null);
  const noiseGateRef = useRef<NoiseGateWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  // Pre-allocate arrays to avoid GC pressure
  const timeDataArrayRef = useRef<Uint8Array | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  // CONSTANTS
  const VAD_THRESHOLD: number = 15; // Threshold for minimum amplitude before it's considered voice
  const ANALYSIS_INTERVAL_MS: number = 50;
  const SILENCE_INTERVAL_MS: number = 1000; // 1 second of silence before considering user stopped speaking

  const analyzeAudio = useCallback(() => {
    // check if not null
    if (!analyserRef.current || !audioContextRef.current) {
      return;
    }
    // Get current time.
    const currentTime = performance.now();
    // Throttle analysis to reduce CPU usage
    if (currentTime - lastAnalysisTimeRef.current < ANALYSIS_INTERVAL_MS) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }
    lastAnalysisTimeRef.current = currentTime;
    let sum = 0;
    // Reuse pre-allocated array
    const timeDataArray = timeDataArrayRef.current;
    if (timeDataArray) {
      analyserRef.current.getByteTimeDomainData(timeDataArray);
      // Optimized amplitude calculation
      const length = timeDataArray.length;

      // Unrolled loop for better performance (process 4 samples at once)
      let i = 0;
      for (; i < length - 3; i += 4) {
        const v1 = Math.abs((timeDataArray[i] - 128) / 128);
        const v2 = Math.abs((timeDataArray[i + 1] - 128) / 128);
        const v3 = Math.abs((timeDataArray[i + 2] - 128) / 128);
        const v4 = Math.abs((timeDataArray[i + 3] - 128) / 128);
        sum += v1 + v2 + v3 + v4;
      }

      // Handle remaining samples
      for (; i < length; i++) {
        sum += Math.abs((timeDataArray[i] - 128) / 128);
      }
    }

    const averageAmplitude = (sum / length) * 100; // Convert to percentage

    if (averageAmplitude > VAD_THRESHOLD) {
      // Voice detected
      if (!stateRef.current.isSpeaking) {
        console.log("Voice detected");
        stateRef.current.isSpeaking = true;
        speakingChangeCallbackRef.current?.(true);
        stateRef.current.silenceStartTime = 0; // Reset silence timer
      }
      stateRef.current.silenceStartTime = currentTime; // Update silence timer
    } else {
      // No voice detected
      if (stateRef.current.isSpeaking) {
        console.log("User stopped speaking. Silence timer started.");
        stateRef.current.isSpeaking = false;
        stateRef.current.silenceStartTime = currentTime; // Start silence timer
      } else if (
        currentTime - stateRef.current.silenceStartTime >
        SILENCE_INTERVAL_MS
      ) {
        // If silence exceeds threshold, consider user stopped speaking
        console.log("User has stopped speaking for a while.");
        stateRef.current.isSpeaking = false; // Reset speaking state
        speakingChangeCallbackRef.current?.(false);
        stateRef.current.silenceStartTime = 0; // Reset silence timer
      }
    }
    // Continue analyzing audio
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);
  const startDetectingAudio = async (stream: MediaStream, onSpeakingChange?: (isSpeaking: boolean) => void) => {
    speakingChangeCallbackRef.current = onSpeakingChange || null;
    const audioTracks = stream.getAudioTracks();

    if (!audioTracks || audioTracks.length === 0) {
      return; // No audio tracks found
    }
    try {
      // create audiocontext
      audioContextRef.current = new AudioContext();
      // Resume if suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      // TODO: setup sapphi-red noise suppression.
      // load wasm binaries and worklets
      const [rrnoiseWasmBinary] = await Promise.all([
        loadRnnoise({ url: rnnoiseWasmPath, simdUrl: rnnoiseWasmSimdPath }),
        audioContextRef.current.audioWorklet.addModule(noiseGateWorkletPath),
        audioContextRef.current.audioWorklet.addModule(rnnoiseWorkletPath),
      ])
      // create nodes
      const ctx = audioContextRef.current;
      sourceRef.current = ctx.createMediaStreamSource(stream);
      
      // Suppresion types
      const rrnoise = new RnnoiseWorkletNode(ctx, {
        wasmBinary: rrnoiseWasmBinary,
        maxChannels: 1,
      });
      const noiseGate = new NoiseGateWorkletNode(ctx, {
        openThreshold: -50,
        closeThreshold: -60,
        holdMs: 90,
        maxChannels: 1,
      });

      // create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;
      analyserRef.current.minDecibels = -100;
      analyserRef.current.maxDecibels = -10;

      sourceRef.current.connect(rrnoise);
      rrnoise.connect(noiseGate);
      noiseGate.connect(analyserRef.current);

      // Pre-allocate the data array once
      timeDataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );

      console.log("Audio detection started with optimizations:");
      console.log("- FFT Size:", analyserRef.current.fftSize);
      console.log("- Analysis interval:", ANALYSIS_INTERVAL_MS + "ms");
      console.log(
        "- Buffer size:",
        analyserRef.current.frequencyBinCount,
        "samples"
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
      analyzeAudio();
    } catch (error) {
      console.error("Error starting audio detection:", error);
    }
  };

  const stopDetectingAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (rrnoiseRef.current) {
      rrnoiseRef.current.disconnect();
      rrnoiseRef.current = null;
    }
    if (noiseGateRef.current) {
      noiseGateRef.current.disconnect();
      noiseGateRef.current = null;
    }
    analyserRef.current = null;
    timeDataArrayRef.current = null;
    stateRef.current = {
      isSpeaking: false,
      silenceStartTime: 0,
    };
    speakingChangeCallbackRef.current = null;
    console.log("Audio detection stopped and resources cleaned up.");
  };

  return {
    startDetectingAudio,
    stopDetectingAudio,
  };
};
