 {/*import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Components we'll create
import PartyHeader from '../components/party/PartyHeader';
import VideoArea from '..//components/party/VideoArea';
import Sidebar from '../components/party/Sidebar';
import { toast } from '@/hooks/use-toast';
import StreamControls from '@/components/party/StreamControls';
import ParticipantsList from '../components/party/ParticipantsList';
import ChatBox from '../components/party/ChatBox';

interface PartyData {
  id: string;
  title: string;
  host_id: string;
  room_code: string;
  is_live: boolean;
}

const PartyRoom: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const [partyData, setPartyData] = useState<PartyData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add this state to PartyRoom component
const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

// Add these handler functions
const handleStreamStart = (stream: MediaStream, type: 'camera' | 'screen' | 'file') => {
  console.log('✅ Stream started successfully!', type);
  setCurrentStream(stream);

    // Update UI based on stream type
    if (type === 'file') {
      console.log('File streaming started - ready for WebRTC');
    }  

  alert(`Stream started: ${type}`);
  // TODO: Start WebRTC connection to backend
  // TODO: Notify other participants
};

const handleStreamStop = () => {
  console.log('🛑 Stream stopped');
  setCurrentStream(null);
  alert('Stream stopped');
  // TODO: Stop WebRTC connection
  // TODO: Notify other participants
};

  useEffect(() => {
    loadPartyData();
  }, [partyId]);

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
      
      if (session && partyId) {
        console.log('🔍 Calling Go backend for party:', partyId);
        
        const response = await fetch(`http://localhost:8081/api/party/${partyId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
  
        console.log('🔍 Go backend response status:', response.status);
        
        if (response.ok) {
          const partyResult = await response.json();
          console.log('🔍 Party data received:', partyResult);
          setPartyData(partyResult.party);
          setIsHost(partyResult.is_host);
        } else {
          const errorText = await response.text();
          console.error('🔍 Go backend error:', errorText);
        }
      } else {
        console.log('🔍 No session or partyId:', { session, partyId });
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
    
      <PartyHeader 
  party={partyData}
  currentUser={currentUser}
  isHost={isHost}
  isConnected={isConnected}      // Add this
  syncStatus={syncStatus}        // Add this
/>

     
      <div className="flex-1 flex overflow-hidden">
        
        <div className="flex-1 flex flex-col">
        <VideoArea 
  partyId={partyId!}
  isHost={isHost}
  currentUser={currentUser}
  currentStream={currentStream}
/>
        </div>

       
        <div className="w-80 border-l border-gray-700 flex flex-col">
          <Sidebar 
            partyId={partyId!}
            isHost={isHost}
            currentUser={currentUser}
            onStreamStart={handleStreamStart}  // Pass handlers here
            onStreamStop={handleStreamStop}    // Pass handlers here
          />
        </div>
      </div>
    </div>
  );
};

export default PartyRoom; */}