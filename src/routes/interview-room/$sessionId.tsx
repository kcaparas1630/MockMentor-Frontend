import { createRoute } from "@tanstack/react-router";
import rootRoute from "../__root";
import AuthGuard from "../../Components/AuthGuard";
import InterviewRoom from "../../Components/Interview/InterviewRoom/InterviewRoom";

interface SearchParams {
  jobLevel: string;
  interviewType: string;
  currentQuestion?: string;
  currentQuestionId?: string;
  questionNumber?: number;
}

const ProtectedInterviewRoom = () => {
  return (
    <AuthGuard>
      <InterviewRoom />
    </AuthGuard>
  );
};

export const Route = createRoute({
  path: "/interview-room/$sessionId",
  component: ProtectedInterviewRoom,
  getParentRoute: () => rootRoute,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    if (!search.jobLevel || typeof search.jobLevel !== "string") {
      throw new Error("Missing required parameter: jobLevel");
    }
    if (!search.interviewType || typeof search.interviewType !== "string") {
      throw new Error("Missing required parameter: interviewType");
    }
    return {
      jobLevel: search.jobLevel,
      interviewType: search.interviewType,
      currentQuestionId:
        typeof search.currentQuestionId === "string"
          ? search.currentQuestionId
          : undefined,
      currentQuestion:
        typeof search.currentQuestion === "string"
          ? search.currentQuestion
          : undefined,
      questionNumber: search.questionNumber
        ? Number(search.questionNumber)
        : undefined,
    };
  },
  loader: ({ params }) => {
    return {
      sessionId: params.sessionId,
    };
  },
});

export default Route;
