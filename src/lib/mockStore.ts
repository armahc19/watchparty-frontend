// Mock store for simulating real-time features without backend

export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

export interface WatchParty {
  id: string;
  title: string;
  type: 'movie' | 'music';
  videoUrl: string;
  hostUsername: string;
  isPlaying: boolean;
  currentTime: number;
  participants: string[];
  messages: Message[];
}

class MockStore {
  private parties: Map<string, WatchParty> = new Map();
  private listeners: Map<string, Set<(party: WatchParty) => void>> = new Map();

  generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createParty(title: string, type: 'movie' | 'music', videoUrl: string, hostUsername: string): WatchParty {
    const id = this.generateRoomId();
    const party: WatchParty = {
      id,
      title,
      type,
      videoUrl,
      hostUsername,
      isPlaying: false,
      currentTime: 0,
      participants: [hostUsername],
      messages: [],
    };
    this.parties.set(id, party);
    return party;
  }

  getParty(id: string): WatchParty | undefined {
    return this.parties.get(id);
  }

  joinParty(id: string, username: string): boolean {
    const party = this.parties.get(id);
    if (!party) return false;
    
    if (!party.participants.includes(username)) {
      party.participants.push(username);
      this.notifyListeners(id, party);
    }
    return true;
  }

  leaveParty(id: string, username: string): void {
    const party = this.parties.get(id);
    if (!party) return;
    
    party.participants = party.participants.filter(p => p !== username);
    this.notifyListeners(id, party);
  }

  updatePlaybackState(id: string, isPlaying: boolean, currentTime: number): void {
    const party = this.parties.get(id);
    if (!party) return;
    
    party.isPlaying = isPlaying;
    party.currentTime = currentTime;
    this.notifyListeners(id, party);
  }

  sendMessage(id: string, username: string, text: string): void {
    const party = this.parties.get(id);
    if (!party) return;
    
    const message: Message = {
      id: Math.random().toString(36).substring(2, 9),
      username,
      text,
      timestamp: new Date(),
    };
    party.messages.push(message);
    this.notifyListeners(id, party);
  }

  subscribe(partyId: string, callback: (party: WatchParty) => void): () => void {
    if (!this.listeners.has(partyId)) {
      this.listeners.set(partyId, new Set());
    }
    this.listeners.get(partyId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(partyId);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  private notifyListeners(partyId: string, party: WatchParty): void {
    const listeners = this.listeners.get(partyId);
    if (listeners) {
      listeners.forEach(callback => callback(party));
    }
  }
}

export const mockStore = new MockStore();