import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
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
  ControlsSection,
  PrimaryButton,
  SecondaryButton,
  QuestionDisplay,
  QuestionText,
  VisuallyHidden,
} from './Styles/StyledAICoach';

interface AICoachProps {
  isActive?: boolean;
  onQuestionSpoken?: (question: string, questionIndex: number) => void;
  onInterviewStart?: () => void;
  onInterviewEnd?: () => void;
}

const AICoach: React.FC<AICoachProps> = ({ 
  onQuestionSpoken,
  onInterviewStart,
  onInterviewEnd
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const questions = [
    "Hello! Welcome to your interview practice session. Could you please tell me about yourself?",
    "What interests you most about this position and our company?",
    "Can you describe a challenging situation you've faced in your career and how you handled it?",
    "Tell me about a time when you had to work with a difficult team member. How did you manage the situation?",
    "Where do you see yourself in five years, and how does this role align with those goals?",
    "What are your greatest strengths and how would they benefit our team?",
    "Describe a project you're particularly proud of and your role in its success.",
    "How do you handle stress and tight deadlines?",
    "What questions do you have for me about the role or our company?"
  ];

  const initializeAudioContext = async (): Promise<void> => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const speakQuestion = async (text: string): Promise<void> => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
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
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
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
      
      // Notify parent component
      if (onQuestionSpoken) {
        onQuestionSpoken(text, currentQuestion);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsAnimating(false);
      setAudioLevel(0);
    };

    speechSynthesis.speak(utterance);
  };

  const startVisualization = (): void => {
    const animate = () => {
      // Simulate audio level for speech synthesis (since we can't directly analyze it)
      if (isAnimating && isSpeaking) {
        const simulatedLevel = Math.sin(Date.now() * 0.01) * 30 + 50 + Math.random() * 20;
        setAudioLevel(Math.max(0, Math.min(100, simulatedLevel)));
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleStartInterview = async (): Promise<void> => {
    if (!hasStarted) {
      setHasStarted(true);
      if (onInterviewStart) {
        onInterviewStart();
      }
    }
    
    await speakQuestion(questions[currentQuestion]);
  };

  const handleNextQuestion = async (): Promise<void> => {
    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      await speakQuestion(questions[nextIndex]);
    } else {
      // Interview completed
      if (onInterviewEnd) {
        onInterviewEnd();
      }
    }
  };

  const handleStopSpeaking = (): void => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsAnimating(false);
    setAudioLevel(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
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

  const isLastQuestion = currentQuestion === questions.length - 1;
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <AICoachContainer role="region" aria-label="AI Interview Coach">
      {/* AI Coach Circle with ARIA labels */}
      <div className="relative">
        <AICoachCircle 
          isAnimating={isAnimating} 
          audioLevel={audioLevel}
          role="button"
          tabIndex={0}
          aria-label={`AI Coach ${isSpeaking ? 'speaking' : 'ready'}`}
          aria-describedby="coach-status"
          onClick={!isSpeaking ? handleStartInterview : handleStopSpeaking}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isSpeaking) {
                handleStartInterview();
              } else {
                handleStopSpeaking();
              }
            }
          }}
        >
          <IconWrapper audioLevel={audioLevel}>
            <Volume2 aria-hidden="true" />
            <VisuallyHidden>
              {isSpeaking ? 'AI Coach is speaking. Press to stop.' : 'Click to start AI Coach'}
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
            ? 'Speaking question...' 
            : hasStarted 
            ? 'Ready for next question' 
            : 'Ready to help you practice'
          }
        </AICoachStatus>
        
        {/* Progress indicator */}
        {hasStarted && (
          <div 
            style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.75rem', 
              color: '#64748b' 
            }}
            aria-label={`Interview progress: ${currentQuestion + 1} of ${questions.length} questions`}
          >
            Question {currentQuestion + 1} of {questions.length}
            <div 
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e2e8f0',
                borderRadius: '2px',
                marginTop: '4px',
                overflow: 'hidden'
              }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Interview progress"
            >
              <div 
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </AICoachInfo>

      {/* Controls */}
      <ControlsSection>
        {!isSpeaking ? (
          <>
            <PrimaryButton
              isAnimating={false}
              onClick={handleStartInterview}
              aria-describedby="primary-button-desc"
            >
              {!hasStarted 
                ? 'Start Interview Practice' 
                : 'Repeat Current Question'
              }
            </PrimaryButton>
            <div id="primary-button-desc" className="sr-only">
              {!hasStarted 
                ? 'Begin the interview practice session with the first question'
                : `Repeat question ${currentQuestion + 1}: ${questions[currentQuestion]}`
              }
            </div>
            
            {hasStarted && !isLastQuestion && (
              <SecondaryButton
                isAnimating={false}
                onClick={handleNextQuestion}
                aria-describedby="next-button-desc"
              >
                Next Question ({currentQuestion + 2}/{questions.length})
              </SecondaryButton>
            )}
            
            {hasStarted && isLastQuestion && (
              <SecondaryButton
                isAnimating={false}
                onClick={onInterviewEnd}
                aria-describedby="finish-button-desc"
              >
                Finish Interview
              </SecondaryButton>
            )}
          </>
        ) : (
          <SecondaryButton
            isAnimating={true}
            onClick={handleStopSpeaking}
            aria-label="Stop AI Coach from speaking"
          >
            Stop Speaking
          </SecondaryButton>
        )}
      </ControlsSection>

      {/* Current Question Display */}
      {hasStarted && (
        <QuestionDisplay>
          <QuestionText>
            <strong>Current Question:</strong> "{questions[currentQuestion]}"
          </QuestionText>
        </QuestionDisplay>
      )}

      {/* Hidden descriptions for screen readers */}
      <div id="next-button-desc" className="sr-only">
        Move to the next interview question
      </div>
      <div id="finish-button-desc" className="sr-only">
        Complete the interview practice session
      </div>
    </AICoachContainer>
  );
};

export default AICoach;
