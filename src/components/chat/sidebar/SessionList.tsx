
import React from "react";
import SessionItem from "./SessionItem";

interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: any[];
}

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
}

const SessionList = ({ sessions, currentSessionId, onSelectSession }: SessionListProps) => {
  // Get most recent sessions for the sidebar (limit to 10)
  const recentSessions = [...sessions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {recentSessions.map((session) => (
        <SessionItem
          key={session.id}
          id={session.id}
          title={session.title}
          isActive={currentSessionId === session.id}
          onClick={() => onSelectSession(session.id)}
        />
      ))}
    </div>
  );
};

export default SessionList;
