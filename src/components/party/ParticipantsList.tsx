import React, { useState, useEffect } from 'react';
import { Users, Crown, Wifi } from 'lucide-react';

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: string;
}

interface ParticipantsListProps {
  partyId: string;
  currentUser: any;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ partyId, currentUser }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Mock data - replace with real data from Go backend
  useEffect(() => {
    const mockParticipants: Participant[] = [
      {
        id: '1',
        username: 'MovieMaster',
        isHost: true,
        isOnline: true,
        joinedAt: new Date().toISOString(),
      },
      {
        id: '2',
        username: 'FilmFanatic',
        isHost: false,
        isOnline: true,
        joinedAt: new Date().toISOString(),
      },
      {
        id: '3',
        username: 'CinemaLover',
        isHost: false,
        isOnline: true,
        joinedAt: new Date().toISOString(),
      },
      {
        id: currentUser?.id || '4',
        username: currentUser?.username || 'You',
        isHost: false,
        isOnline: true,
        joinedAt: new Date().toISOString(),
      },
    ];
    setParticipants(mockParticipants);
  }, [currentUser]);

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Participants ({participants.length})
      </h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              participant.id === currentUser?.id
                ? 'bg-indigo-500/20 border border-indigo-500/30'
                : 'bg-gray-700/50 hover:bg-gray-700'
            }`}
          >
            {/* Online Status */}
            <div className="relative">
              <div
                className={`w-3 h-3 rounded-full ${
                  participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              {participant.isOnline && (
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
              )}
            </div>

            {/* Username */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {participant.username}
                  {participant.id === currentUser?.id && ' (You)'}
                </span>
                {participant.isHost && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                {participant.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Host Badge */}
            {participant.isHost && (
              <div className="bg-yellow-500/20 px-2 py-1 rounded text-xs font-medium text-yellow-300">
                HOST
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection Quality */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-400">Connection Quality</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
            <div className="w-2 h-5 bg-green-500 rounded-sm"></div>
            <div className="w-2 h-3 bg-gray-500 rounded-sm"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsList;