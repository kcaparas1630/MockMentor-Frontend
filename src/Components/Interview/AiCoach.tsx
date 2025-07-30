/**
 * @fileoverview AI Coach component that provides speech synthesis and visual feedback for interview guidance.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file implements an AI coach interface with speech synthesis capabilities and animated visual audio feedback.
 * It handles text-to-speech conversion, professional voice selection, and provides callbacks for parent components to coordinate interview flow. The component uses the Web Speech API for text-to-speech and simulates audio visualization through animated elements that respond to speaking state. It is accessible, supports ARIA labels, and is designed for integration in interview room experiences.
 *
 * Plays a crucial role in providing interactive, accessible, and engaging AI-driven interview guidance within the interview room interface.
 *
 * @see {@link src/Components/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/InterviewRoom/VideoDisplay.tsx}
 * @see {@link src/Components/InterviewRoom/Styles/StyledAICoach.ts}
 *
 * Dependencies:
 * - React (useState, useEffect, useRef)
 * - Lucide React Icons (Volume2)
 * - Web Speech API (speechSynthesis)
 * - Web Audio API (AudioContext, AnalyserNode)
 * - Styled Components
 */
import React, { useState, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import {
  AICoachContainer,
  AICoachCircle,
  IconWrapper,
  RippleContainer,
  RippleRing,
  RippleRingSecondary,
  AICoachInfo,
  AICoachTitle,
  AICoachStatus,
  VisuallyHidden,
  AICoachQuestionContainer,
  AICoachQuestionHeader,
  AICoachQuestionText,
} from "./Styles/StyledAICoach";
import SessionState from "@/Types/SessionState";

/**
 * AI Coach Message state interface
 *
 * @interface
 * @property {boolean} isAISpeaking - Whether AI is currently speaking
 * @property {boolean} isWaitingForAI - Whether system is waiting for AI to start speaking
 * @property {string} [text] - Text message to be spoken by the AI coach
 */
export interface AICoachMessageState {
  isAISpeaking: boolean;
  isWaitingForAI: boolean;
  text?: string;
}

/**
 * Props interface for the AICoach component.
 *
 * @interface
 * @property {AICoachMessageState} [AICoachMessage] - AI coach state object containing speaking states and text
 * Constraints/Format: Must contain valid boolean values for state flags and optional text for speech synthesis
 * @property {function} [onQuestionSpoken] - Callback triggered when AI finishes speaking.
 * Constraints/Format: Function that accepts speechText string parameter
 * @property {function} [onTranscriptionEnd] - Callback triggered to signal transcription should start.
 * Constraints/Format: Function with no parameters, called after speech ends
 */
interface AICoachProps {
  AICoachMessage?: AICoachMessageState;
  currentQuestionText?: string;
  sessionState?: SessionState;
  onQuestionSpoken?: (speechText: string) => void;
  onTranscriptionEnd?: () => void;
}

/**
 * AI Coach component that provides speech synthesis and visual feedback for interview guidance.
 *
 * @component
 * @param {AICoachProps} props - Component props for AI coach configuration.
 * @returns {JSX.Element} The rendered AI coach interface with speech and visual feedback.
 * @example
 * // Basic usage:
 * <AICoach
 *   AICoachMessage="Hello, let's begin your technical interview"
 *   onQuestionSpoken={handleSpeechComplete}
 *   onTranscriptionEnd={startUserRecording}
 * />
 *
 * @throws {Error} May throw if Web Speech API is not supported or audio context fails.
 * @remarks
 * Side Effects:
 * - Uses Web Speech API for text-to-speech synthesis
 * - Creates and manages AudioContext for audio visualization
 * - Modifies speechSynthesis global state
 * - Uses requestAnimationFrame for smooth animations
 * - Triggers parent callbacks for speech lifecycle events
 *
 * Known Issues/Limitations:
 * - Requires Web Speech API support (not available in all browsers)
 * - Speech synthesis may be limited by browser voice availability
 * - Audio visualization is simulated (not based on actual audio analysis)
 * - No speech rate/pitch user controls
 * - Limited error recovery for speech synthesis failures
 *
 * Design Decisions/Rationale:
 * - Uses useRef for callback storage to prevent stale closures
 * - Implements simulated audio visualization for consistent feedback
 * - Provides comprehensive accessibility features
 * - Automatically selects professional voices when available
 * - Separates speech synthesis from audio visualization for modularity
 */

const AICoach: React.FC<AICoachProps> = ({
  AICoachMessage,
  currentQuestionText,
  sessionState,
  onQuestionSpoken,
  onTranscriptionEnd,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Store the latest callback refs to avoid stale closures
  const onQuestionSpokenRef = useRef(onQuestionSpoken);
  onQuestionSpokenRef.current = onQuestionSpoken;

  const onTranscriptionEndRef = useRef(onTranscriptionEnd);
  onTranscriptionEndRef.current = onTranscriptionEnd;
  const isVisible = sessionState?.userReady;

  useEffect(() => {
    if (AICoachMessage?.text && AICoachMessage.isAISpeaking) {
      AICoachSpeak(AICoachMessage.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AICoachMessage]);
  /**
   * Initialize the audio context for the AI coach.
   * @returns void
   */
  const initializeAudioContext = async (): Promise<void> => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  };

  /**
   * AI Coach Speak.
   * @param text - The text to speak. This is the AI generated speech
   * @returns void
   */
  const AICoachSpeak = async (text: string): Promise<void> => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    await initializeAudioContext();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Use a more professional voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Microsoft") ||
        voice.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsAnimating(true);
      startVisualization();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsAnimating(false);
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Notify parent that speech has ended.
      if (onQuestionSpokenRef.current && text) {
        onQuestionSpokenRef.current(text);
      }
      // Notify parent when transcription starts
      if (onTranscriptionEndRef.current) {
        onTranscriptionEndRef.current();
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      setIsAnimating(false);
      setAudioLevel(0);
    };

    speechSynthesis.speak(utterance);
  };

  /**
   * Start the visualization for the AI coach.
   * @returns void
   */
  const startVisualization = (): void => {
    const animate = () => {
      // Simulate audio level for speech synthesis
      if (isAnimating && isSpeaking) {
        const simulatedLevel =
          Math.sin(Date.now() * 0.01) * 30 + 50 + Math.random() * 20;
        setAudioLevel(Math.max(0, Math.min(100, simulatedLevel)));
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  return (
    <AICoachContainer role="region" aria-label="AI Interview Coach">
      {/* AI Coach Circle with ARIA labels */}
      <div className="relative">
        <AICoachCircle
          isAnimating={isAnimating}
          audioLevel={audioLevel}
          aria-label={`AI Coach ${isSpeaking ? "speaking" : "ready"}`}
          aria-describedby="coach-status"
        >
          <IconWrapper audioLevel={audioLevel}>
            <Volume2 aria-hidden="true" />
            <VisuallyHidden>
              {AICoachMessage?.isAISpeaking
                ? "AI Coach is speaking."
                : AICoachMessage?.isWaitingForAI
                  ? "Waiting for AI Coach."
                  : "User is speaking."}
            </VisuallyHidden>
          </IconWrapper>
        </AICoachCircle>

        {/* Ripple effects for visual feedback */}
        {isAnimating && (
          <RippleContainer aria-hidden="true">
            <RippleRing />
            <RippleRingSecondary delay="0.5s" />
          </RippleContainer>
        )}
      </div>

      {/* AI Coach Information */}
      <AICoachInfo>
        <AICoachTitle id="coach-title">MockMentor</AICoachTitle>
        <AICoachStatus id="coach-status">
          <span className="text">
            {AICoachMessage?.isAISpeaking
              ? "AI is Speaking"
              : AICoachMessage?.isWaitingForAI
                ? "Waiting for AI"
                : "Your turn to speak"}
          </span>
          <div className="animated-bars">
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
        </AICoachStatus>
        {currentQuestionText && (
          <AICoachQuestionContainer isVisible={isVisible}>
            <AICoachQuestionHeader isVisible={isVisible}>
              Question:
            </AICoachQuestionHeader>
            <AICoachQuestionText isVisible={isVisible}>
              {currentQuestionText}
            </AICoachQuestionText>
          </AICoachQuestionContainer>
        )}
      </AICoachInfo>
    </AICoachContainer>
  );
};

export default AICoach;
