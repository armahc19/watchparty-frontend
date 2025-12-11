import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSync } from '../hooks/useSync';
import PartyHeader from '../components/party/PartyHeader';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '../hooks/useWebSocket'; 
import { useAuth } from '../contexts/AuthContext';  // ← ADD THIS  // ← ADD THIS LINE
import { Users } from 'lucide-react';
import { X } from 'lucide-react';

interface PartyData {
  id: string;
  title: string;
  host_id: string;
  room_code: string;
  is_live: boolean;
  activity_type: string;
}

interface PlaylistItem {
  id: string;
  name: string;
  url: string;
  type: string;
  duration: number;
  kind: 'video' | 'audio';
}

const MovieNightRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();  // ← THIS IS THE REAL USER WITH NAME
  // This is the correct way — Supabase puts metadata here
  const userMetadata = (authUser as any)?.user_metadata;
  const userEmail = authUser?.email;

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState<PlaylistItem | null>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([
    { 
      id: '1', 
      name: 'Sample Movie 1', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
      type: 'video/mp4', 
      duration: 596 ,
      kind: 'video'
    },
    { 
      id: '2', 
      name: 'Sample Movie 2', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
      type: 'video/mp4', 
      duration: 653 ,
      kind: 'video'
    },
    { 
      id: '3', 
      name: 'Sample Music', 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      type: 'audio/mp3',
      duration: 213,
      kind: 'audio'
    }
  ]);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
const [uploadProgress, setUploadProgress] = useState(0);
  const [isHost, setIsHost] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [partyData, setPartyData] = useState<PartyData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liveReactions, setLiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  let typingTimeout: NodeJS.Timeout;
  const [flyingMessages, setFlyingMessages] = useState<{ id: string; text: string; user: string }[]>([]);
  const [joinTimer, setJoinTimer] = useState(60);

  const getUserName = () => {
    if (!authUser) return 'Guest';
  
    const metadata = (authUser as any).user_metadata;
  
    return (
      metadata?.full_name ||
      metadata?.name ||
      metadata?.display_name ||
      metadata?.username ||
      authUser.email?.split('@')[0] ||
      'Guest'
    );
  };

  const participants = [
    { name: 'MovieMaster', isHost: true },
    { name: 'FilmFanatic', isHost: false },
    { name: 'CinemaLover', isHost: false },
    { name: 'You', isHost: false }
  ];

  const chatMessages = [
    { user: 'FilmFanatic', message: 'This scene! 🔥', time: '2m ago' },
    { user: 'CinemaLover', message: 'I love Neo! ❤️', time: '1m ago' }
  ];

  const reactions = ['🍿', '😂', '❤️', '🔥', '😴', '💔'];
  // Change to:
  //const partyId = roomId; // or use roomId everywhere

  // ——— WEB SOCKET (for chat, reactions, typing) ———
 // const { sendSyncMessage, lastMessage, isConnected } = useWebSocket(roomId!);
// Change to:
//onst { sendSyncMessage, lastMessage, isConnected } = useWebSocket(
///  roomId || ''  // ✅ Use roomId from URL (same as WebSocket server expects)
//);
// In movie.tsx, update the WebSocket hook usage:
const { 
  sendSyncMessage, 
  lastMessage, 
  isConnected  // Make sure this is being extracted
} = useWebSocket(roomId || '');


  // Get current media element based on file type
 const getCurrentMediaRef = () => {
  return currentFile?.kind === 'video' ? videoRef.current : audioRef.current;
};
  
  const {
  sendPlay,
  sendPause,
  sendSeek,
  sendFileChanged,
  isSyncing,
  syncStatus
} = useSync({
  roomId: roomId!,
  isHost,
  mediaRef: { current: getCurrentMediaRef() }, // Pass dynamic ref
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onFileChanged: (fileData) => {
    console.log('onFileChanged triggered →', fileData.file_id, '(Host:', isHost, ')');
    
    const targetFile = playlist.find(item => item.id === fileData.file_id);
    if (!targetFile) {
      console.error('File not found in playlist:', fileData.file_id);
      return;
    }
    
    // Switch to new file
    setCurrentFile(targetFile);
    setCurrentTime(0);
    
    // Handle based on media type
    if (targetFile.kind === 'video') {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.load();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
      }
    }
    
    if (!isHost) {
      toast({
        title: "Host changed media",
        description: targetFile.name,
      });
    }
  },
   // ✅ ADD THESE 3 LINES:
   sendSyncMessage,    // Pass the send function
   lastMessage,        // Pass the messages
   isConnected         // Pass the connection state
});



  useEffect(() => {
    if (roomId) {
      loadPartyData();
      fetchPartyFiles();
    }
  }, [roomId]);

  useEffect(() => {
    if (playlist.length > 0 && !currentFile) {
      setCurrentFile(playlist[0]);
    }
  }, [playlist, currentFile]);

  // AUTO COUNTDOWN FOR AUDIENCE — ONLY WHEN WAITING FOR HOST
useEffect(() => {
  if (!isHost && !currentFile) {
    // Start countdown from 60 seconds
    setJoinTimer(60);
    
    const interval = setInterval(() => {
      setJoinTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  } else {
    // Reset timer when video loads
    setJoinTimer(60);
  }
}, [isHost, currentFile]);

  // Fetch party details from backend
  const loadPartyData = async () => {
    try {
      console.log('🔍 Starting to load party data...');
      
      // Get current user
      const userData = localStorage.getItem('currentUser');
      console.log('🔍 User data from localStorage:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
  
      // Get party details from Go backend
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Supabase session:', session);
      
      if (session && roomId) {
        console.log('🔍 Calling Go backend for party:', roomId);
        
        const response = await fetch(`http://localhost:8081/api/party/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
  
        console.log('🔍 Go backend response status:', response.status);
        
        if (response.ok) {
          const partyResult = await response.json();
          console.log('🔍 Party data received:', partyResult);

          // ADD THIS CHECK:
          if (partyResult.party.activity_type !== 'free') {
            console.log('❌ Wrong activity type, redirecting...');
            toast({
              title: "Wrong Room Type",
              description: "This is not a movie party room",
              variant: "destructive",
            });
            navigate('/select-activity'); // Redirect to activity selection
            return; // Important: stop execution
          }

          setPartyData(partyResult.party);
          setIsHost(partyResult.is_host);
        } else {
          const errorText = await response.text();
          console.error('🔍 Go backend error:', errorText);
        }
      } else {
        console.log('🔍 No session or partyId:', { session, roomId});
      }
    } catch (error) {
      console.error('🔍 Failed to load party:', error);
      toast({
        title: "Error",
        description: "Failed to load party room",
        variant: "destructive",
      });
    } finally {
      console.log('🔍 Setting loading to false');
      setIsLoading(false);
    }
  };
  

  // ——— HANDLE INCOMING REACTIONS & TYPING ———
useEffect(() => {
  if (!lastMessage) return;

  switch (lastMessage.type) {
    case 'reaction':
      if (lastMessage.emoji) {
        const id = Date.now().toString();
        const x = Math.random() * 70 + 15;
        setLiveReactions(prev => [...prev, { id, emoji: lastMessage.emoji, x }]);
        setTimeout(() => setLiveReactions(prev => prev.filter(r => r.id !== id)), 3000);
      }
      break;

    case 'typing_start':
      if (lastMessage.user && !typingUsers.includes(lastMessage.user)) {
        setTypingUsers(prev => [...prev, lastMessage.user]);
      }
      break;

    case 'typing_stop':
      if (lastMessage.user) {
        setTypingUsers(prev => prev.filter(u => u !== lastMessage.user));
      }
      break;
      case 'chat_message':
        if (lastMessage.message) {
          const id = Date.now().toString();
          setFlyingMessages(prev => [...prev, { 
            id, 
            text: lastMessage.message, 
            user: lastMessage.user || 'Someone' 
          }]);
          setTimeout(() => {
            setFlyingMessages(prev => prev.filter(m => m.id !== id));
          }, 4000);
        }
        break;
  }
}, [lastMessage]);

      // Real-time viewers from your existing tables
      useEffect(() => {
        if (!roomId) return;
      
        const fetchViewers = async () => {
          // First get all participants
          const { data: participants, error: pError } = await supabase
            .from('party_participants')
            .select('user_id')
            .eq('party_id', roomId);
        
          if (pError || !participants || participants.length === 0) {
            setViewers([]);
            return;
          }
        
          // Then get their profiles in one query
          const userIds = participants.map(p => p.user_id);
        
          const { data: profiles, error: profError } = await supabase
            .from('profiles')
            .select('id, username, email')
            .in('id', userIds);
        
          if (profError || !profiles) {
            setViewers([]);
            return;
          }
        
          // Combine them
          const formatted = participants.map(part => {
            const profile = profiles.find(p => p.id === part.user_id);
            return {
              id: part.user_id,
              name: profile?.username || 
                    profile?.email?.split('@')[0] || 
                    'Guest'
            };
          });
        
          setViewers(formatted);
        };
      
        fetchViewers();
      
        // Real-time updates
        const channel = supabase
          .channel(`viewers-${roomId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'party_participants',
            filter: `party_id=eq.${roomId}`
          }, () => {
            fetchViewers();
          })
          .subscribe();
      
        return () => {
          supabase.removeChannel(channel);
        };
      }, [roomId]);
       

      useEffect(() => {
        console.log('🎬 Movie.tsx WebSocket state:', {
          isConnected,
          roomId,
          hasSendSyncMessage: !!sendSyncMessage
        });
      }, [isConnected]);


  // Media event handlers
  const handlePlay = () => {
  console.log('handlePlay called', {
    isHost,
    isSyncing,
    hasSendPlay: !!sendPlay
  });
  
  const media = getCurrentMediaRef();
  if (media) {
    media.play().catch(console.error);
    if (isHost && !isSyncing) {
      console.log('Calling sendPlay...');
      sendPlay();  // ← Is this being called?
    }
    setIsPlaying(true);
  }
};

  const handlePause = () => {
    const media = getCurrentMediaRef();
    if (media) {
      media.pause();
      if (isHost && !isSyncing) {
        sendPause();
      }
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleTimeUpdate = () => {
    const media = getCurrentMediaRef();
    if (media) {
      setCurrentTime(media.currentTime);
      setDuration(media.duration || 0);
    }
  };

  const handleSeeked = () => {
    if (!isSyncing) {
      const media = getCurrentMediaRef();
      if (media && isHost) {
        sendSeek(media.currentTime);
      }
    }
  };

  const handleSeek = (seconds: number) => {
    const media = getCurrentMediaRef();
    if (media) {
      const newTime = Math.max(0, Math.min(media.currentTime + seconds, duration));
      media.currentTime = newTime;
      if (isHost && !isSyncing) {
        sendSeek(newTime);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const msgText = message.trim();
    const userName = getUserName();
  
    // 1. Show flying message locally
    const id = Date.now().toString();
    setFlyingMessages(prev => [...prev, { 
      id, 
      text: msgText, 
      user: userName
    }]);
  
    // 2. Send to everyone via WebSocket
    sendSyncMessage({ 
      type: 'chat_message', 
      message: msgText, 
      user: userName
    });
  
    // 3. Remove after 4 seconds
    setTimeout(() => {
      setFlyingMessages(prev => prev.filter(m => m.id !== id));
    }, 4000);
  
    setMessage('');
  };

  const playFile = (file: PlaylistItem) => {
    // Pause current media
    const currentMedia = getCurrentMediaRef();
    if (currentMedia) {
      currentMedia.pause();
    }
    
    // Set new file
    setCurrentFile(file);
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Load new media
    if (file.kind === 'video' && videoRef.current) {
      videoRef.current.load();
    } else if (file.kind === 'audio' && audioRef.current) {
      audioRef.current.load();
    }
    
    // Broadcast if host
    if (isHost && sendFileChanged) {
      sendFileChanged({
        file_id: file.id,
        file_name: file.name,
        file_type: file.type,
        duration: file.duration
      });
    }
  };


  const fetchPartyFiles = async () => {
    if (!roomId) return;
    
    const { data: files, error } = await supabase
      .from('party_files')
      .select('*')
      .eq('party_id', roomId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching files:', error);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('No files found for this party');
      return;
    }
    
    console.log('Files from database:', files);
    
    // Process each file
    const playlistItems: PlaylistItem[] = [];
    
    for (const file of files) {
      try {
        // Check if it's a public URL or needs signed URL
        let finalUrl = file.file_url;
        
        // If it's a Supabase storage path (starts with 'party-')
        if (file.file_url.includes('party-')) {
          // Extract the path from the URL or use the stored path
          const pathParts = file.file_url.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const storagePath = `party-${roomId}/${fileName}`;
          
          console.log('Getting signed URL for path:', storagePath);
          
          const { data: signedUrlData, error: signedError } = await supabase.storage
            .from('party-files')
            .createSignedUrl(storagePath, 60 * 60 * 24); // 24 hours
          
          if (signedError) {
            console.error('Signed URL error for', storagePath, ':', signedError);
            continue;
          }
          
          if (signedUrlData) {
            finalUrl = signedUrlData.signedUrl;
            console.log('Got signed URL:', finalUrl);
          }
        }
        
        // Detect file type
        const isVideo = file.file_type === 'video' || 
                       file.file_type.startsWith('video/') ||
                       ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v'].some(ext => 
                         file.file_name.toLowerCase().endsWith(`.${ext}`)
                       );
        
        const playlistItem: PlaylistItem = {
          id: file.id,
          name: file.file_name,
          url: finalUrl,
          type: isVideo ? 'video/mp4' : 'audio/mpeg',
          duration: file.duration || 0,
          kind: isVideo ? 'video' : 'audio'
        };
        
        playlistItems.push(playlistItem);
        
      } catch (err) {
        console.error('Error processing file:', file.file_name, err);
      }
    }
    
    console.log('Processed playlist items:', playlistItems);
    setPlaylist(playlistItems);
    
    if (playlistItems.length > 0 && !currentFile) {
      playFile(playlistItems[0]);
    }
  };


  const handleUploadAndQueue = async (file: File) => {
    if (!file) return;
  
    setUploadStatus('uploading');
    setUploadProgress(0);
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId || !roomId) throw new Error("Not authenticated");
  
      const filePath = `party-${roomId}/${Date.now()}_${file.name}`;
  
      // FAKE SMOOTH PROGRESS (feels real!)
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        setUploadProgress(Math.round(progress));
      }, 200);
  
      // ACTUAL UPLOAD
      const { error: uploadError } = await supabase.storage
        .from('party-files')
        .upload(filePath, file, { upsert: true });
  
      clearInterval(interval);
      setUploadProgress(100);
  
      if (uploadError) throw uploadError;
  
      // Save to DB
      const { error: dbError } = await supabase
        .from('party_files')
        .insert({
          party_id: roomId,
          file_name: file.name,
          file_url: filePath,
          file_type: file.type.startsWith('video') ? 'video' : 'audio',
          file_size: file.size,
          uploaded_by: userId
        });
  
      if (dbError) throw dbError;
  
      // Success!
      setUploadStatus('success');
      await fetchPartyFiles();
  
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
  
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error.message || "Try again",
        variant: "destructive",
      });
  
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);
    }
  };


const removeFromQueue = async (fileId: string) => {
  try {
    // Delete from database
    const { error } = await supabase
      .from('party_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;

    // Remove from local state
    setPlaylist(prev => prev.filter(item => item.id !== fileId));
    
    // If we're removing the currently playing file, clear it
    if (currentFile?.id === fileId) {
      setCurrentFile(null);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    toast({
      title: "File removed",
      description: "File removed from playlist",
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    toast({
      title: "Delete Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};

const handleReaction = (emoji: string) => {
  const id = Date.now().toString();
  const x = Math.random() * 70 + 15;

  setLiveReactions(prev => [...prev, { id, emoji, x }]);

  sendSyncMessage({
    type: 'reaction',
    emoji,
    user: currentUser?.name || 'Someone'
  });

  setTimeout(() => {
    setLiveReactions(prev => prev.filter(r => r.id !== id));
  }, 3000);
};

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading party room...</div>
      </div>
    );
  }

  if (!partyData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Party not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      {/* Header */}
      <PartyHeader 
        party={partyData}
        currentUser={currentUser}
        isHost={isHost}
        isConnected={isConnected}
        syncStatus={syncStatus}
      />
      {/* Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Floating Sidebar Toggle - ONLY ON MOBILE */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed left-4 top-20 z-50 bg-gray-800/90 backdrop-blur-md p-3 rounded-full shadow-2xl md:hidden"
          >
            <Users className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {viewers.length}
            </span>
          </button>

          {/* THIS IS THE MAGIC — LOADING SCREEN FOR AUDIENCE */}
      {!isHost && !currentFile && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-24 h-24 border-8 border-gray-800 border-t-green-500 rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-4xl font-bold text-white mb-4">Host is preparing the party...</h2>
            <p className="text-2xl text-gray-400 mb-4">Starting in</p>
            <div className="text-8xl font-bold text-green-400 mb-6">
              {joinTimer}s
            </div>
            <p className="text-xl text-gray-500">Grab a drink, we’re almost ready</p>
          </div>
        </div>
      )}

        {/* Video Player - 75% */}
        <div className="w-3/4 flex flex-col border-r border-gray-700 mobile-main">
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            {/* Hidden media elements */}
            {currentFile?.kind === 'video' && (
              <video
                key={currentFile.id}
                ref={videoRef}
                controls={false}
                className="w-full h-full object-contain"
                preload="auto"
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                onSeeked={handleSeeked}
                onEnded={() => {
                  setIsPlaying(false);
                  // Optional: auto-play next in playlist
                }}
              >
                <source src={currentFile.url} type={currentFile.type} />
                Your browser does not support the video tag.
              </video>
            )}
            
            {currentFile?.kind === 'audio' && (
              <>
                {/* Audio element (hidden) */}
                <audio
                  key={currentFile.id}
                  ref={audioRef}
                  className="hidden"
                  preload="auto"
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeked={handleSeeked}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={currentFile.url} type={currentFile.type} />
                  Your browser does not support the audio element.
                </audio>
                
                
                {/* Audio Visualizer UI */}
                <div className="w-full max-w-2xl p-8 text-center">
                  {/* Album Art */}
                  <div className="mb-8 mx-auto w-64 h-64 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-9xl">♪</span>
                      <p className="mt-4 text-lg text-white/80">Now Playing</p>
                    </div>
                  </div>

                  {/* Track Info */}
                  <h2 className="text-4xl font-bold text-white mb-2 truncate px-4">
                    {currentFile.name.replace(/\.[^/.]+$/, '')}
                  </h2>
                  <p className="text-gray-400 text-lg mb-8">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>

                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center space-x-1 h-24 mb-8">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                        style={{
                          height: `${20 + Math.sin(i + (currentTime || 0)) * 40}px`,
                          animation: isPlaying ? 'bounce 1s infinite' : 'none',
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-20 mobile-controls">
              <div className="max-w-6xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <button 
                      onClick={() => handleSeek(-10)} 
                      className="text-white hover:scale-110 transition hover:text-green-400"
                      title="Rewind 10s"
                    >
                      <span className="text-4xl">⏮</span>
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="bg-white/30 hover:bg-white/50 backdrop-blur p-5 rounded-full hover:scale-105 transition"
                    >
                      <span className="text-6xl">
                        {isPlaying ? '⏸' : '▶'}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleSeek(10)} 
                      className="text-white hover:scale-110 transition hover:text-green-400"
                      title="Forward 10s"
                    >
                      <span className="text-4xl">⏭</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full font-bold ${
                      isConnected ? 'bg-green-900/80 text-green-400' : 'bg-red-900/80 text-red-400'
                    }`}>
                      {isConnected ? 'SYNCED' : 'DISCONNECTED'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentFile?.kind === 'video' ? '🎬 Movie' : '🎵 Music'}
                    </div>
                  </div>
                  {/* FLYING CHAT MESSAGES */}
                      {flyingMessages.map(msg => (
                        <div
                          key={msg.id}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                        >
                          <div className="bg-black/80 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border border-white/20 animate-fly-up-fade">
                            <p className="text-4xl font-bold text-white mb-2">{msg.text}</p>
                            <p className="text-xl text-gray-300">— {msg.user}</p>
                          </div>
                        </div>
                      ))}
                  {/* Floating Reactions */}
                    {liveReactions.map(reaction => (
                      <div
                        key={reaction.id}
                        className="absolute text-6xl pointer-events-none animate-float-up select-none"
                        style={{ left: `${reaction.x}%`, bottom: '20%' }}
                      >
                        {reaction.emoji}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 25% */}
        {/* Sidebar - Slide in/out on mobile */}
          <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 md:relative md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
        <div className="h-full flex flex-col pt-16 md:pt-0 overflow-y-auto">

          {/* Chat - 60% of sidebar */}
          <div className="flex-1 flex flex-col border-b border-gray-700">
            {/* REAL-TIME VIEWERS LIST */}
            <div className="flex-1 flex flex-col border-b border-gray-700">
              <div className="h-10 flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm hide-on-tablet">VIEWERS ({viewers.length})</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {viewers.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">No one here yet...</p>
                ) : (
                  viewers.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {v.name[0]?.toUpperCase() || '?'}
                      </div>
                      <p className="text-sm text-white truncate max-w-[140px]">{v.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Message Input */}
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-3 py-1 text-sm text-gray-400 italic animate-pulse">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div className="h-12 flex-shrink-0 p-2 border-t border-gray-700">
            <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);

                  sendSyncMessage({ type: 'typing_start', user: currentUser?.name || 'Someone' });

                  clearTimeout(typingTimeout);
                  typingTimeout = setTimeout(() => {
                    sendSyncMessage({ type: 'typing_stop', user: currentUser?.name || 'Someone' });
                  }, 1500);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message... (Enter to send)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 text-sm focus:outline-none focus:border-green-500"
              />
                            
            </div>
          </div>

          {/* Sidebar Content - 40% of sidebar */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Current Playing */}
            <div className="h-12 flex-shrink-0 border-b border-gray-700 p-2">
              <div className="text-xs text-gray-400 mb-1 hide-on-tablet">CURRENT PLAYING</div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🎬 {currentFile?.name}</span>
                <span className="text-xs text-gray-500">2h 16m left</span>
              </div>
            </div>

            {/* Playlist Queue */}
            <div className="flex-1 border-b border-gray-700 p-2">
              <div className="text-xs text-gray-400 mb-2 hide-on-tablet">PLAYLIST QUEUE</div>
              <div className="space-y-1">
                {playlist.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex justify-between items-center text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
                      currentFile?.id === item.id 
                        ? 'bg-green-900 border border-green-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => playFile(item)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{index + 1}.</span>
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      {currentFile?.id === item.id && (
                        <span className="text-green-400 text-xs">▶️ Playing</span>
                      )}
                    </div>
                    {isHost && (
                      <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(item.id); // Pass file ID instead of index
                      }} 
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                    )}
                  </div>
                ))}
                {playlist.length < 3 && (
                  <div className="text-sm text-gray-500 px-2 py-1 italic">
                    {playlist.length + 1}. [Empty Slot]
                  </div>
                )}
              </div>
            </div>
            
               {/* Reactions */}
            <div className="h-16 flex-shrink-0 p-2">
              <div className="text-xs text-gray-400 mb-1 hide-on-tablet">QUICK REACTIONS</div>
              <div className="flex flex-wrap gap-1">
                {reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(reaction)}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-sm transition-colors"
                  >
                    {reaction}
                  </button>
                ))}
              </div>
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="relative p-6 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 hover:border-green-500 transition-all">
                {/* Upload Status Overlay */}
                {uploadStatus !== 'idle' && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    {uploadStatus === 'uploading' && (
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-green-400 font-bold text-xl">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                    {uploadStatus === 'success' && (
                      <div className="text-center">
                        <span className="text-6xl">✅</span>
                        <p className="text-green-400 font-bold text-xl mt-4">Uploaded!</p>
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <div className="text-center">
                        <span className="text-6xl">❌</span>
                        <p className="text-red-400 font-bold text-xl mt-4">Failed!</p>
                      </div>
                    )}
                  </div>
                )}

                <label className="cursor-pointer">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">⬆</span>
                    </div>
                    <p className="text-lg font-bold text-white">Drop your movie or music here</p>
                    <p className="text-sm text-gray-400 mt-2">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => e.target.files?.[0] && handleUploadAndQueue(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            
          </div>
        </div>
        {/* Close button inside sidebar (mobile only) */}
  <button
    onClick={() => setSidebarOpen(false)}
    className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
  >
    <X className="w-6 h-6" />
  </button>
</div>

{/* Overlay when sidebar open on mobile */}
{sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    className="fixed inset-0 bg-black/50 z-30 md:hidden"
  />
)}
      </div>
       {/* Add CSS animation for waveform */}
       <style>{`
              @keyframes float-up {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                20% { transform: translateY(-50px) scale(1.2); opacity: 1; }
                100% { transform: translateY(-400px) scale(1); opacity: 0; }
              }

              .animate-float-up {
                animation: float-up 3s ease-out forwards;
              }

              @keyframes fly-up-fade {
                0%   { transform: translateY(100px) scale(0.8); opacity: 0; }
                20%  { transform: translateY(0) scale(1.1); opacity: 1; }
                80%  { transform: translateY(-30px) scale(1); opacity: 1; }
                100% { transform: translateY(-100px) scale(0.9); opacity: 0; }
              }

              .animate-fly-up-fade {
                animation: fly-up-fade 4s ease-out forwards;
              }

             /* MOBILE GOD MODE — FINAL PERFECTION */
@media (max-width: 1024px) {
  .mobile-sidebar { width: 80px !important; }
  .mobile-main { width: calc(100% - 80px) !important; }
  .hide-on-tablet { display: none !important; }
  .text-6xl { font-size: 4rem !important; }
}

@media (max-width: 768px) {
  .mobile-sidebar { display: none !important; }
  .mobile-main { width: 100% !important; }

  /* SMALLER, CLEANER CONTROLS */
  .mobile-controls {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.95), transparent) !important;
    padding: 1rem !important;
    z-index: 999 !important;
  }

  /* Smaller play button — still easy to tap */
  .mobile-controls .text-6xl {
    font-size: 1.5rem !important;
  }

  /* Smaller rewind/forward */
  .mobile-controls .text-4xl {
    font-size: 1.5rem !important;
  }

  /* Compact progress bar */
  .mobile-controls .mb-6 { margin-bottom: 0.5rem !important; }
  .mobile-controls .h-1 { height: 4px !important; }

  /* Hide text labels on mobile */
  .mobile-controls .text-sm, 
  .mobile-controls .text-xs {
    display: none !important;
  }

  /* Flying reactions — perfect size */
  .animate-float-up { font-size: 5rem !important; }
  .animate-fly-up-fade { transform: scale(1.2) !important; }
      `}</style>
    </div>
  );
};

export default MovieNightRoom;

