export interface PartyRoom {
    id: string;
    hostId: string;
    title: string;
    videoUrl: string;
    videoType: 'movie' | 'music';
    currentTimestamp: number;
    isPlaying: boolean;
    createdAt: string;
    participantCount: number;
  }
  
  export interface Participant {
    id: string;
    username: string;
    isHost: boolean;
    joinedAt: string;
  }
  
  export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
  }
  
  export interface SyncEvent {
    type: 'play' | 'pause' | 'seek';
    timestamp?: number;
    roomId: string;
    userId: string;
  }