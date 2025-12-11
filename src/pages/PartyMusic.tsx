import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const PartyMusic: React.FC = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Daft Punk - Get Lucky');
  const [playlist, setPlaylist] = useState(['Track 1', 'Track 2', 'Track 3']);
  const [isHost, setIsHost] = useState(true);

  const participants = [
    { name: 'DJMaster', isHost: true },
    { name: 'VibeChecker', isHost: false },
    { name: 'MusicLover', isHost: false },
    { name: 'You', isHost: false }
  ];

  const chatMessages = [
    { user: 'VibeChecker', message: 'This slaps! 🔥', time: '1m ago' },
    { user: 'MusicLover', message: 'Add to playlist! 🎵', time: '30s ago' }
  ];

  const musicReactions = ['🎵', '🔥', '💃', '🎶', '⏭️', '🔁'];
  const visualizerBars = [20, 35, 50, 65, 80, 95, 75, 60, 45, 30, 55, 70, 85, 65, 40];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
  };

  const handleReaction = (reaction: string) => console.log('Reaction:', reaction);
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleMicToggle = () => setIsMicOn(!isMicOn);
  const handleUpload = () => console.log('Upload music');
  const removeFromQueue = (index: number) => setPlaylist(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-8 flex-shrink-0 bg-black/50 border-b border-purple-500 flex items-center justify-center">
        <div className="text-sm text-purple-400 font-semibold">🎵 VIBE MODE 🎵</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Side - 40% */}
        <div className="w-2/5 flex flex-col border-r border-purple-500/30">
          {/* Album Art */}
          <div className="h-1/2 flex-shrink-0 flex items-center justify-center p-4">
            <div className="w-40 h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center border-4 border-white/20">
              <div className="text-3xl">🎵</div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="h-1/2 flex-shrink-0 flex flex-col justify-center p-4">
            <div className="text-center mb-4">
              <div className="text-lg font-bold">{currentTrack}</div>
              <div className="text-purple-300 text-sm">Now Playing</div>
            </div>

            <div className="flex items-end justify-center space-x-1 h-16">
              {visualizerBars.map((height, index) => (
                <div
                  key={index}
                  className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - 60% */}
        <div className="w-3/5 flex flex-col min-h-0">
          {/* Controls */}
          <div className="h-16 flex-shrink-0 border-b border-purple-500/30 flex items-center justify-center">
            <div className="flex space-x-3">
              <button className="text-xl hover:bg-purple-600/30 p-2 rounded-full">⏮️</button>
              <button onClick={handlePlayPause} className="text-xl hover:bg-purple-600/30 p-2 rounded-full">
                {isPlaying ? '⏸️' : '⏯️'}
              </button>
              <button className="text-xl hover:bg-purple-600/30 p-2 rounded-full">⏭️</button>
              <button className="text-xl hover:bg-purple-600/30 p-2 rounded-full">🔀</button>
              <button className="text-xl hover:bg-purple-600/30 p-2 rounded-full">🔁</button>
              <button className="text-xl hover:bg-purple-600/30 p-2 rounded-full">🔊</button>
              <button 
                onClick={handleMicToggle}
                className={`text-xl p-2 rounded-full ${isMicOn ? 'bg-green-500/30' : 'hover:bg-purple-600/30'}`}
              >
                🎤
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-1 flex min-h-0">
            {/* Chat - 50% */}
            <div className="w-1/2 flex flex-col border-r border-purple-500/30">
              <div className="h-8 flex-shrink-0 bg-black/30 border-b border-purple-500/30 flex items-center px-3">
                <h3 className="font-semibold text-sm text-purple-300">CHAT</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-yellow-300">{msg.user}:</span>
                      <span className="text-purple-400 text-xs">{msg.time}</span>
                    </div>
                    <p className="text-gray-200 mt-1">{msg.message}</p>
                  </div>
                ))}
                {isMicOn && <div className="text-xs text-green-400 italic">👤 You: [🎤 Listening...]</div>}
              </div>

              <div className="h-12 flex-shrink-0 p-2 border-t border-purple-500/30">
                <form onSubmit={handleSendMessage} className="flex space-x-2 h-full">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-purple-900/30 border border-purple-500/50 rounded px-3 text-sm focus:outline-none focus:border-purple-400"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-3 rounded text-sm font-semibold">
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Right Sidebar - 50% */}
            <div className="w-1/2 flex flex-col min-h-0">
              {/* Participants */}
              <div className="h-16 flex-shrink-0 border-b border-purple-500/30 p-2">
                <div className="text-xs text-purple-300 mb-1">PARTICIPANTS</div>
                <div className="space-y-1">
                  {participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs">
                      <span>{p.isHost ? '👑' : '🎧'}</span>
                      <span className={p.isHost ? 'text-yellow-300' : 'text-gray-300'}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playlist */}
              <div className="flex-1 border-b border-purple-500/30 p-2">
                <div className="text-xs text-purple-300 mb-2">PLAYLIST</div>
                <div className="space-y-1">
                  {playlist.map((track, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-purple-900/30 px-2 py-1 rounded">
                      <span>{index + 1}. {track}</span>
                      {isHost && (
                        <button onClick={() => removeFromQueue(index)} className="text-red-400 hover:text-red-300 text-xs">
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Controls */}
              {isHost && (
                <div className="h-12 flex-shrink-0 border-b border-purple-500/30 p-2">
                  <div className="text-xs text-purple-300 mb-1">HOST CONTROLS</div>
                  <button onClick={handleUpload} className="w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm">
                    📁 Upload Music
                  </button>
                </div>
              )}

              {/* Reactions */}
              <div className="h-16 flex-shrink-0 p-2">
                <div className="text-xs text-purple-300 mb-1">MUSIC REACTIONS</div>
                <div className="flex flex-wrap gap-1">
                  {musicReactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => handleReaction(reaction)}
                      className="w-7 h-7 bg-purple-600/30 hover:bg-purple-500/50 rounded flex items-center justify-center text-sm border border-purple-400/30"
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push to Talk */}
              <div className="h-10 flex-shrink-0 p-2 border-t border-purple-500/30 bg-black/20">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-green-400">🎤</span>
                  <span className="text-gray-300">Push to Talk</span>
                  <kbd className="bg-purple-600/30 text-purple-300 px-1 py-0.5 rounded text-xs">SPACE</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyMusic;