import React from 'react';
import { Film, Users } from 'lucide-react';

interface PartyHeaderProps {
  party: any;
  currentUser: any;
  isHost: boolean;
  isConnected: boolean;        // Add this
  syncStatus: 'synced' | 'syncing' | 'out_of_sync';  // Add this
       // Optional: for real viewer count
}

const PartyHeader: React.FC<PartyHeaderProps> = ({ 
  party, 
  currentUser, 
  isHost, 
  isConnected, 
  syncStatus,
}) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Party Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Film className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">WatchParty</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className='mobile-controls'>
              <h2 className="text-lg font-semibold text-white">{party.title}</h2>
              {party.description && (
                <p className="text-sm text-gray-400">{party.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 bg-indigo-600 px-3 py-1 rounded-full ">
              <span className="text-sm font-medium">Room: {party.room_code}</span>
            </div>
          </div>
        </div>

        {/* Right: User & Status Info */}
        <div className="flex items-center space-x-4 ">
          {/* Connection Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            ● {isConnected ? 'Connected' : 'Connecting...'}
          </div>

          {/* Sync Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            syncStatus === 'synced' ? 'bg-green-500/20 text-green-400' :
            syncStatus === 'syncing' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {syncStatus === 'synced' && '🟢 Synced'}
            {syncStatus === 'syncing' && '🔄 Syncing...'}
            {syncStatus === 'out_of_sync' && '⚠️ Out of Sync'}
          </div>

          {/* Host Badge */}
          {isHost && (
            <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
              👑 Host
            </div>
          )}
        </div>
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

             /* MOBILE GOD MODE — FINAL PERFECTION */
@media (max-width: 1024px) {
  .mobile-sidebar { width: 80px !important; }
  .mobile-main { width: calc(100% - 80px) !important; }
  .hide-on-tablet { display: none !important; }
  .text-6xl { font-size: 4rem !important; }
}

@media (max-width: 768px) {
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

  
      `}</style>
    </header>
  );
};

export default PartyHeader;