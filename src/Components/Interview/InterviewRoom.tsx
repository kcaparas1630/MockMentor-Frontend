import { FC } from "react";
import { Route } from "../../routes/interview-room/$sessionId";

const InterviewRoom: FC = () => {
    const { sessionId } = Route.useParams();
    
    return (
        <div>
            <h1>Interview Room</h1>
            <p>Session ID: {sessionId}</p>
        </div>
    )
}

export default InterviewRoom;
