import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  joinedAt: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

const WatchPartyRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock party data - using the roomId from URL
  const [partyData, setPartyData] = useState({
    title: `Movie Night #${roomId}`,
    host: 'MovieMaster',
    isPlaying: false,
    currentTime: 0,
    duration: 596, // Big Buck Bunny duration in seconds
    participantCount: 4,
  });

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', username: 'MovieMaster', isHost: true, joinedAt: new Date().toISOString() },
    { id: '2', username: 'FilmFanatic', isHost: false, joinedAt: new Date().toISOString() },
    { id: '3', username: 'CinemaLover', isHost: false, joinedAt: new Date().toISOString() },
    { id: '4', username: user?.username || 'You', isHost: false, joinedAt: new Date().toISOString() },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      userId: '1', 
      username: 'MovieMaster', 
      message: `Welcome to Watch Party #${roomId}! 🎬`, 
      timestamp: new Date(Date.now() - 300000).toISOString() 
    },
    { 
      id: '2', 
      userId: '2', 
      username: 'FilmFanatic', 
      message: 'Thanks for hosting! Ready to watch!', 
      timestamp: new Date(Date.now() - 240000).toISOString() 
    },
    { 
      id: '3', 
      userId: '3', 
      username: 'CinemaLover', 
      message: 'This is my first watch party, excited! 🍿', 
      timestamp: new Date(Date.now() - 180000).toISOString() 
    },
    { 
      id: '4', 
      userId: '1', 
      username: 'MovieMaster', 
      message: "Let's start in 2 minutes! Get your snacks ready!", 
      timestamp: new Date(Date.now() - 120000).toISOString() 
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isHost, setIsHost] = useState(false);

  // Check if current user is host
  useEffect(() => {
    if (user && user.username === 'MovieMaster') {
      setIsHost(true);
    }
  }, [user]);

  // Simulate video sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (partyData.isPlaying && videoRef.current) {
        setPartyData(prev => ({
          ...prev,
          currentTime: Math.min(prev.currentTime + 1, prev.duration)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [partyData.isPlaying]);

  const handlePlay = () => {
    setPartyData(prev => ({ ...prev, isPlaying: true }));
    console.log('🎬 Host played the video - all viewers synced!');
  };

  const handlePause = () => {
    setPartyData(prev => ({ ...prev, isPlaying: false }));
    console.log('⏸️ Host paused the video - all viewers paused!');
  };

  const handleSeek = (newTime: number) => {
    setPartyData(prev => ({ ...prev, currentTime: newTime }));
    console.log(`⏩ Host seeked to ${formatTime(newTime)} - all viewers synced!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickSeek = (seconds: number) => {
    const newTime = Math.max(0, Math.min(partyData.currentTime + seconds, partyData.duration));
    handleSeek(newTime);
  };

  // Mock video URL (Big Buck Bunny - public domain)
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Home</span>
              </button>
              <h1 className="text-xl font-bold">{partyData.title}</h1>
              <span className="bg-indigo-600 px-2 py-1 rounded text-sm">
                Room: {roomId}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                👥 {partyData.participantCount} viewers
              </div>
              {isHost && (
                <span className="bg-green-600 px-2 py-1 rounded text-sm">
                  🎮 You are Host
                </span>
              )}
              <div className={`w-3 h-3 rounded-full ${partyData.isPlaying ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-300">
                {partyData.isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player Section - 3/4 width */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[70vh]"
                src={videoUrl}
                poster="https://peach.blender.org/wp-content/uploads/bbb-splash.png?x11217"
              >
                Your browser does not support the video tag.
              </video>
              
              {/* Overlay Status */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-2 rounded-lg">
                <div className="text-sm">
                  <span className={partyData.isPlaying ? 'text-green-400' : 'text-yellow-400'}>
                    ● {partyData.isPlaying ? 'PLAYING' : 'PAUSED'}
                  </span>
                  <span className="text-gray-300 ml-2">
                    {formatTime(partyData.currentTime)} / {formatTime(partyData.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {isHost ? (
                    <>
                      <button
                        onClick={handlePlay}
                        disabled={partyData.isPlaying}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
                      >
                        <span>▶️</span>
                        <span>Play</span>
                      </button>
                      <button
                        onClick={handlePause}
                        disabled={!partyData.isPlaying}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
                      >
                        <span>⏸️</span>
                        <span>Pause</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-lg">
                      {partyData.isPlaying ? '🎬 Watching together' : '⏸️ Video paused by host'}
                    </div>
                  )}
                </div>
                
                <div className="text-lg font-mono bg-gray-700 px-3 py-2 rounded">
                  {formatTime(partyData.currentTime)}
                </div>
              </div>

              {/* Seek Bar */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm text-gray-400">0:00</span>
                <input
                  type="range"
                  min="0"
                  max={partyData.duration}
                  value={partyData.currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!isHost}
                />
                <span className="text-sm text-gray-400">
                  {formatTime(partyData.duration)}
                </span>
              </div>

              {/* Quick Seek Buttons */}
              {isHost && (
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => quickSeek(-30)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <span>⏪</span>
                    <span>30s</span>
                  </button>
                  <button
                    onClick={() => quickSeek(-10)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <span>◀️</span>
                    <span>10s</span>
                  </button>
                  <button
                    onClick={() => handleSeek(0)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Restart</span>
                  </button>
                  <button
                    onClick={() => quickSeek(10)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <span>▶️</span>
                    <span>10s</span>
                  </button>
                  <button
                    onClick={() => quickSeek(30)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <span>⏩</span>
                    <span>30s</span>
                  </button>
                </div>
              )}
            </div>

            {/* Demo Notice */}
            <div className="mt-4 bg-blue-900 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="font-semibold">Demo Mode Active</h4>
                  <p className="text-sm text-blue-200">
                    This is a mock watch party. In production, video playback would be synchronized in real-time across all viewers using WebSockets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants Panel */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-3 text-lg flex items-center space-x-2">
                <span>👥</span>
                <span>Participants ({participants.length})</span>
              </h3>
              <div className="space-y-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      participant.isHost ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      participant.isHost ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                    <span className="flex-1 font-medium">
                      {participant.username}
                      {participant.isHost && ' 👑'}
                    </span>
                    {participant.username === user?.username && (
                      <span className="text-xs bg-indigo-600 px-2 py-1 rounded">You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-[500px] shadow-lg">
              <h3 className="font-semibold mb-3 text-lg flex items-center space-x-2">
                <span>💬</span>
                <span>Live Chat</span>
              </h3>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${
                      message.userId === user?.id 
                        ? 'bg-indigo-900 border border-indigo-700' 
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold ${
                        message.userId === user?.id ? 'text-indigo-200' : 'text-green-300'
                      }`}>
                        {message.username}
                        {message.userId === user?.id && ' (You)'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2 mt-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold text-sm flex items-center space-x-2"
                >
                  <span>📨</span>
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${isHost ? '#4f46e5' : '#6b7280'};
          cursor: ${isHost ? 'pointer' : 'not-allowed'};
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${isHost ? '#4f46e5' : '#6b7280'};
          cursor: ${isHost ? 'pointer' : 'not-allowed'};
          border: none;
        }
      `}</style>
    </div>
  );
};

export default WatchPartyRoom;