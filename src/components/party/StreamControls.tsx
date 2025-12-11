import React, { useState, useRef } from 'react';
import { Upload, Video, Monitor, StopCircle, FileVideo, X } from 'lucide-react';

interface StreamControlsProps {
  partyId: string;
  onStreamStart: (stream: MediaStream, type: 'camera' | 'screen' | 'file') => void;
  onStreamStop: () => void;
}

const StreamControls: React.FC<StreamControlsProps> = ({ 
  partyId, 
  onStreamStart, 
  onStreamStop 
}) => {
  const [selectedSource, setSelectedSource] = useState<'file' | 'camera' | 'screen' | null>(null);
  const [isLoading, setIsLoading] = useState<'camera' | 'screen' | 'file' | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      alert('Please select a video file (MP4, WebM, MOV, AVI, MKV)');
      return;
    }

    setSelectedFile(file);
    
    // Create object URL for the file
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setShowVideoPlayer(true);
    
    console.log('File ready for streaming:', file.name);
  };

  const handleStreamFile = async () => {
    if (!selectedFile || !showVideoPlayer) return;

    setIsLoading('file');

    try {
      console.log('Starting screen share for file:', selectedFile.name);
      
      // Get screen stream - specifically target the video player element
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          cursor: 'never', // Hide cursor for cleaner video
          displaySurface: 'browser' // Prefer browser window
        },
        audio: true
      });

      // Handle when user stops sharing via browser UI
      stream.getTracks().forEach(track => {
        track.onended = () => {
          handleStreamStop();
        };
      });

      setCurrentStream(stream);
      setSelectedSource('file');
      onStreamStart(stream, 'file');
      
      console.log('File streaming started successfully via screen share');

      // Instructions for user
      alert('Please select the "WatchParty - Video Player" window/tab to share just the video player.');

    } catch (error: any) {
      console.error('Screen share error for file:', error);
      if (error.name !== 'NotAllowedError') {
        alert(`Failed to share screen: ${error.message}`);
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleCameraStart = async () => {
    try {
      setIsLoading('camera');
      console.log('Starting camera stream...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      setCurrentStream(stream);
      setSelectedSource('camera');
      onStreamStart(stream, 'camera');
      
      console.log('Camera stream started successfully');
    } catch (error: any) {
      console.error('Camera error:', error);
      alert(`Failed to access camera: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleScreenShare = async () => {
    try {
      setIsLoading('screen');
      console.log('Starting screen share...');
      
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'window'
        },
        audio: true
      });

      stream.getTracks().forEach(track => {
        track.onended = () => {
          handleStreamStop();
        };
      });

      setCurrentStream(stream);
      setSelectedSource('screen');
      onStreamStart(stream, 'screen');
      
      console.log('Screen share started successfully');
    } catch (error: any) {
      console.error('Screen share error:', error);
      if (error.name !== 'NotAllowedError') {
        alert(`Failed to share screen: ${error.message}`);
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleStreamStop = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    
    // Clean up
    if (selectedSource === 'file') {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl('');
      }
      setShowVideoPlayer(false);
      setSelectedFile(null);
    }
    
    setSelectedSource(null);
    onStreamStop();
    console.log('Stream stopped');
  };

  const clearFileSelection = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl('');
    }
    setSelectedFile(null);
    setShowVideoPlayer(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Video Player Popup */}
      {showVideoPlayer && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                🎬 Video Player - {selectedFile.name}
              </h3>
              <button
                onClick={clearFileSelection}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <video
                controls
                autoPlay
                className="w-full h-96 bg-black rounded-lg"
                src={fileUrl}
              >
                Your browser does not support the video tag.
              </video>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleStreamFile}
                  disabled={isLoading === 'file'}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading === 'file' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting Stream...
                    </>
                  ) : (
                    <>
                      <Monitor className="w-5 h-5" />
                      🎬 Start Streaming This Video
                    </>
                  )}
                </button>
                
                <button
                  onClick={clearFileSelection}
                  className="px-6 py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>How to stream:</strong> Click "Start Streaming This Video", then select 
                  this "WatchParty - Video Player" window when asked to share your screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream Controls */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span>🎮</span>
          Stream Controls
        </h3>

        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept="video/*,.mp4,.webm,.mov,.avi,.mkv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedSource === 'file' 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-gray-600 hover:border-indigo-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-5 h-5" />
              <div>
                <div className="font-medium">📁 Choose Video File</div>
                <div className="text-xs text-gray-400">MP4, WebM, MOV, AVI, MKV</div>
              </div>
            </label>
          </div>

          {/* Camera & Screen buttons remain the same */}
          <button
            onClick={selectedSource === 'camera' ? handleStreamStop : handleCameraStart}
            disabled={isLoading && isLoading !== 'camera'}
            className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
              selectedSource === 'camera'
                ? 'border-red-500 bg-red-500/10 hover:border-red-600'
                : 'border-gray-600 hover:border-indigo-400'
            } ${(isLoading && isLoading !== 'camera') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedSource === 'camera' ? (
              <StopCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Video className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {selectedSource === 'camera' ? '🎥 Stop Camera' : '🎥 Camera'}
              </div>
              <div className="text-xs text-gray-400">
                {selectedSource === 'camera' ? 'Stop camera stream' : 'Stream your camera'}
              </div>
            </div>
            {isLoading === 'camera' && (
              <div className="ml-auto w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
            )}
          </button>

          <button
            onClick={selectedSource === 'screen' ? handleStreamStop : handleScreenShare}
            disabled={isLoading && isLoading !== 'screen'}
            className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
              selectedSource === 'screen'
                ? 'border-red-500 bg-red-500/10 hover:border-red-600'
                : 'border-gray-600 hover:border-indigo-400'
            } ${(isLoading && isLoading !== 'screen') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedSource === 'screen' ? (
              <StopCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {selectedSource === 'screen' ? '🖥️ Stop Screen Share' : '🖥️ Screen'}
              </div>
              <div className="text-xs text-gray-400">
                {selectedSource === 'screen' ? 'Stop screen sharing' : 'Share your screen'}
              </div>
            </div>
            {isLoading === 'screen' && (
              <div className="ml-auto w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
            )}
          </button>
        </div>

        {/* Current Stream Status */}
        {selectedSource && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Streaming: {
                  selectedSource === 'file' ? `File: ${selectedFile?.name}` : 
                  selectedSource === 'camera' ? 'Camera' : 'Screen'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StreamControls;