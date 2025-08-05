interface InitialInterviewData {
  session_id: string;
  user_name: string;
  jobRole: string | undefined;
  jobLevel: string;
  questionType: string;
  aiInstructions?: string;
}

export default InitialInterviewData;
