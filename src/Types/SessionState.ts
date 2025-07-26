interface SessionState {
  userReady: boolean;
  waitingForUserAnswer: boolean;
  userAnsweredQuestion: boolean;
  currentQuestionIndex: number;
}
export default SessionState;
