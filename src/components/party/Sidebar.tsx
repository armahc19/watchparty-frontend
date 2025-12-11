import React from 'react';
import StreamControls from './StreamControls';
import ParticipantsList from './ParticipantsList';
import ChatBox from './ChatBox';

interface SidebarProps {
  partyId: string;
  isHost: boolean;
  currentUser: any;
  onStreamStart?: (stream: MediaStream, type: 'camera' | 'screen') => void;
  onStreamStop?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  partyId, 
  isHost, 
  currentUser,
  onStreamStart,
  onStreamStop 
}) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Stream Controls (Host Only) */}
      {isHost && onStreamStart && onStreamStop && (
        <div className="border-b border-gray-700">
          <StreamControls 
            partyId={partyId}
            onStreamStart={onStreamStart}
            onStreamStop={onStreamStop}
          />
        </div>
      )}

      {/* Participants List */}
      <div className="border-b border-gray-700">
        <ParticipantsList partyId={partyId} currentUser={currentUser} />
      </div>

      {/* Chat Box */}
      <div className="flex-1 min-h-0">
        <ChatBox partyId={partyId} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Sidebar;