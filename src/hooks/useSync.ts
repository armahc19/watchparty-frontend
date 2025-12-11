import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './useWebSocket';

// Add this type for HTML media elements
type HTMLMediaElementRef = React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;

interface UseSyncProps {
  roomId: string;
  isHost: boolean;
  mediaRef: HTMLMediaElementRef;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onFileChanged?: (fileData: any) => void;
  // ADD THESE OPTIONAL PROPS:
  sendSyncMessage?: (message: any) => void;
  lastMessage?: any;
  isConnected?: boolean;
}



export const useSync = ({
  roomId,
  isHost,
  mediaRef,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onFileChanged,
  // GET THESE FROM PROPS
  sendSyncMessage: externalSendSyncMessage,
  lastMessage: externalLastMessage,
  isConnected: externalIsConnected
}: UseSyncProps) => {
  // Create internal WebSocket ONLY if NO external props are provided
  const shouldUseInternal = !externalSendSyncMessage && !externalLastMessage && !externalIsConnected;
  const internalWebSocket = shouldUseInternal ? useWebSocket(roomId) : null;
  
  // Use external if provided, otherwise use internal
  const sendSyncMessage = externalSendSyncMessage || internalWebSocket?.sendSyncMessage;
  const lastMessage = externalLastMessage || internalWebSocket?.lastMessage;
  const isConnected = externalIsConnected !== undefined 
    ? externalIsConnected 
    : internalWebSocket?.isConnected || false;
  
  //const { isConnected, sendSyncMessage, lastMessage } = useWebSocket(roomId);
  const isSyncing = useRef(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'out_of_sync'>('synced');

  // Get the current media element
  const getMediaElement = () => {
    return mediaRef.current;
  };

  // Handle incoming sync messages
  useEffect(() => {
    if (!lastMessage || !mediaRef.current || isSyncing.current) return;
    if ((lastMessage as any)._processed) return;

     // ✅ ADD THIS FILTER - Only process sync messages
  const syncTypes = ['play', 'pause', 'seek', 'sync_request', 'sync_response', 'file_changed'];
  if (!syncTypes.includes(lastMessage.type)) {
    return; // Skip chat/reaction/typing messages
  }


    (lastMessage as any)._processed = true;
    const media = getMediaElement();
    if (!media) return;

    isSyncing.current = true;
    setSyncStatus('syncing');
    
    console.log('Processing sync message:', lastMessage);

    switch (lastMessage.type) {
      case 'play':
        if (!isHost && media && !isPlaying) {
          media.play().catch(() => {});
          setIsPlaying(true);
        }
        break;
        
      case 'pause':
        if (!isHost && media && isPlaying) {
          media.pause();
          setIsPlaying(false);
        }
        break;
        
      case 'seek':
        if (lastMessage.timestamp !== undefined && media && Math.abs(media.currentTime - lastMessage.timestamp) > 1) {
          media.currentTime = lastMessage.timestamp;
          setCurrentTime(lastMessage.timestamp);
        }
        break;
        
      case 'sync_request':
        // Host sends current state to late joiner
        if (isHost && media) {
          sendSyncMessage({
            type: 'sync_response',
            timestamp: media.currentTime,
            isPlaying: !media.paused,
          });
        }
        break;
        
      case 'sync_response':
        // Late joiner syncs to host
        if (!isHost && lastMessage.timestamp !== undefined && media) {
          media.currentTime = lastMessage.timestamp;
          setCurrentTime(lastMessage.timestamp);
          
          if (lastMessage.isPlaying && media.paused) {
            media.play().catch(err => console.error('Sync play failed:', err));
            setIsPlaying(true);
          } else if (!lastMessage.isPlaying && !media.paused) {
            media.pause();
            setIsPlaying(false);
          }
        }
        break;
        
      case 'file_changed':
        if (!isHost && lastMessage.fileData) {
          console.log('AUDIENCE: file_changed received!', lastMessage.fileData);
          onFileChanged?.(lastMessage.fileData);
        } else if (!isHost) {
          console.log('file_changed received but FileData missing:', lastMessage);
        }
        break;
    }

    // Reset sync flag after operation
    setTimeout(() => {
      isSyncing.current = false;
      setSyncStatus('synced');
    }, 500);
  }, [lastMessage, isHost, sendSyncMessage, onFileChanged, mediaRef.current]);

  // Send sync events (host only)
  const sendPlay = () => {
    console.log('sendPlay called:', {
      isHost,
      isSyncing: isSyncing.current,
      isConnected,
      hasSendSyncMessage: !!sendSyncMessage
    });
    
    if (isHost && !isSyncing.current && isConnected && sendSyncMessage) {
      sendSyncMessage({ type: 'play' });
      console.log('Host sent play command');
    } else {
      console.log('sendPlay blocked:', {
        isHost,
        isSyncing: isSyncing.current,
        isConnected,
        hasSendSyncMessage: !!sendSyncMessage
      });
    }
  };
  
  const sendPause = () => {
    if (isHost && !isSyncing.current && isConnected) {
      sendSyncMessage({ type: 'pause' });
      console.log('Host sent pause command');
    }
  };

  const sendSeek = (timestamp: number) => {
    if (isHost && !isSyncing.current && isConnected) {
      sendSyncMessage({ type: 'seek', timestamp });
      console.log('Host sent seek command:', timestamp);
    }
  };

  const sendFileChanged = (fileData: {
    file_id: string;
    file_name: string;
    file_type: string;
    duration: number;
  }) => {
    if (isHost && isConnected && !isSyncing.current) {
      console.log('HOST IS BROADCASTING FILE_CHANGE NOW');
      sendSyncMessage({
        type: 'file_changed',
        fileData: {
          file_id: fileData.file_id,
          file_name: fileData.file_name,
          file_type: fileData.file_type,
          duration: fileData.duration
        }
      });
    }
  };

  // Request sync when joining (non-hosts)
  useEffect(() => {
    if (!isHost && isConnected && mediaRef.current) {
      console.log('Viewer requesting sync...');
      sendSyncMessage({ type: 'sync_request' });
    }
  }, [isConnected, isHost, sendSyncMessage]);

  // Auto-detect out-of-sync state
  useEffect(() => {
    if (!lastMessage || isSyncing.current || !mediaRef.current) return;
    
    const media = getMediaElement();
    if (!media) return;

    const checkSync = () => {
      if (isHost || isSyncing.current) return;
      
      // If we haven't received a sync message in a while and we're playing,
      // we might be out of sync
      const timeSinceLastSync = Date.now() - (lastMessage as any)._receivedAt;
      if (timeSinceLastSync > 10000 && !media.paused) {
        setSyncStatus('out_of_sync');
      }
    };

    const interval = setInterval(checkSync, 5000);
    return () => clearInterval(interval);
  }, [lastMessage, isHost, isPlaying, setIsPlaying, setCurrentTime, sendSyncMessage, onFileChanged, mediaRef]);

  return {
    isConnected,
    sendPlay,
    sendPause,
    sendSeek,
    sendFileChanged,
    isSyncing: isSyncing.current,
    syncStatus,
  };
};