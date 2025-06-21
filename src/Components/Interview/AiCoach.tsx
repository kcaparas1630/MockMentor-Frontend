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
} from "./Styles/StyledAICoach";

interface AICoachProps {
  AICoachMessage?: string;
  onQuestionSpoken?: (speechText: string) => void;
}

const AICoach: React.FC<AICoachProps> = ({
  AICoachMessage,
  onQuestionSpoken,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasStarted,] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Store the latest callback refs to avoid stale closures
  const onQuestionSpokenRef = useRef(onQuestionSpoken);
  onQuestionSpokenRef.current = onQuestionSpoken;

  useEffect(() => {
    if (AICoachMessage) {
      AICoachSpeak(AICoachMessage);
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
              {isSpeaking
                ? "AI Coach is speaking. Press to stop."
                : "Click to start AI Coach"}
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
        <AICoachTitle id="coach-title">AI Interview Coach</AICoachTitle>
        <AICoachStatus id="coach-status">
          {isSpeaking
            ? "Speaking question..."
            : hasStarted
              ? "Ready for next question"
              : "Ready to help you practice"}
        </AICoachStatus>
      </AICoachInfo>
      {/* <button
        onClick={handleStartInterview} // This will now be the ONLY way to call it
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Start Interview
      </button>
      {/* Hidden descriptions for screen readers */}
      {/* <div id="next-button-desc" className="sr-only">
        Move to the next interview question
      </div>
      <div id="finish-button-desc" className="sr-only">
        Complete the interview practice session
      </div> */}
    </AICoachContainer>
  );
};

export default AICoach;
