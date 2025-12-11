import React, { useRef, useEffect } from 'react';

interface VideoAreaProps {
  partyId: string;
  isHost: boolean;
  currentUser: any;
  currentStream?: MediaStream | null;
}

const VideoArea: React.FC<VideoAreaProps> = ({ 
  partyId, 
  isHost, 
  currentUser,
  currentStream 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video source when stream changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentStream) {
      video.srcObject = currentStream;
      video.classList.remove('hidden');
    } else if (video) {
      video.srcObject = null;
      video.classList.add('hidden');
    }
  }, [currentStream]);

  const handlePlay = () => {
    // TODO: Send play command to all viewers via WebSocket
    console.log('Play command sent');
  };

  const handlePause = () => {
    // TODO: Send pause command to all viewers via WebSocket
    console.log('Pause command sent');
  };

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Main Video Display */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Empty State - No active stream */}
        {!currentStream && (
          <div className="text-center text-gray-400">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Stream</h3>
            <p className="text-gray-500">
              {isHost ? 'Choose a streaming source to get started' : 'Waiting for host to start streaming'}
            </p>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain hidden"
          autoPlay
          playsInline
          controls={false}
          muted={isHost} // Host mutes their own stream
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Controls - Only for host and when streaming */}
            {isHost && currentStream && (
              <>
                <button
                  onClick={handlePlay}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold"
                >
                  ▶️ Play
                </button>
                <button
                  onClick={handlePause}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-semibold"
                >
                  ⏸️ Pause
                </button>
              </>
            )}
            
            {/* Viewer message when not host */}
            {!isHost && currentStream && (
              <div className="text-gray-300 text-sm">
                Watching live stream - controls disabled
              </div>
            )}
          </div>

          {/* Stream Info */}
          {currentStream && (
            <div className="text-gray-300 font-mono text-sm">
              ● LIVE {isHost && '(You are streaming)'}
            </div>
          )}

          {/* Volume Control - Only for viewers */}
          {!isHost && currentStream && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                className="w-24"
                onChange={(e) => {
                  if (videoRef.current) {
                    videoRef.current.volume = parseInt(e.target.value) / 100;
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoArea;