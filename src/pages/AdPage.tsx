// pages/WelcomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Users, Clock, Zap, MessageCircle ,Crown,AlertTriangleIcon} from 'lucide-react';

export default function WelcomeScreen() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Auto-progress bar + redirect after 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate('/login'); // or '/create-room' or wherever you want
          return 100;
        }
        return prev + 2;
      });
    }, 500); // ~8 seconds total

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-6 inline-block">
              <Film className="w-20 h-20 text-purple-400" />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WATCHPARTY
          </h1>
          <p className="text-xl md:text-2xl mt-4 text-gray-300">
            Watch together. Anywhere. Anytime.
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* FREE ROOM */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <Zap className="w-12 h-12 text-yellow-400" />
              <h2 className="text-3xl font-bold">Free Room</h2>
            </div>
            <ul className="space-y-4 text-lg">
            
              <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-orange-400" /> Expires in 30 minutes</li>
              <li className="flex items-center gap-3"><AlertTriangleIcon className="w-20 h-20 text-orange-400" /> Till under developer if you come across any bug or issue please kindly report</li>
              <div className="flex items-center gap-3 bg-black/30 rounded-full px-6 py-4 inline-block">
                <MessageCircle className="w-8 h-8 text-pink-200" />
                <span className="text-md">REPORT @GadScript on X</span>
              </div>
            </ul>
            <div className="mt-8 text-2xl font-bold text-green-400">
              Starting automatically...
            </div>
          </div>

          {/* VIP ROOM */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-4 mb-6">
              <Crown className="w-12 h-12 text-yellow-500" />
              <h2 className="text-3xl font-bold">VIP Room</h2>
            </div>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-yellow-400" /> Long expiry date</li>
              <li className="flex items-center gap-3"><AlertTriangleIcon className="w-20 h-20 text-orange-400" /> Till under developer if you come across any bug or issue please kindly report</li>
            </ul>
            <div className="mt-8">
              <div className="text-2xl font-bold text-pink-400 mb-2">
                Want this?
              </div>
              <div className="flex items-center gap-3 bg-black/30 rounded-full px-6 py-4 inline-block">
                <MessageCircle className="w-8 h-8 text-pink-200" />
                <span className="text-md">DM @GadScript on X</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="text-center mb-4 text-xl font-medium">
            Creating your free room... {progress}%
          </div>
          <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out flex items-center justify-end pr-4"
              style={{ width: `${progress}%` }}
            >
              <span className="text-black font-bold text-lg">
                {progress < 100 ? 'Loading...' : 'Done!'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400">
         {/* <p className="text-sm">
            Free room auto-starts in a few seconds • No sign-up needed
          </p>*/}
          <p className="text-xs mt-4 font-semibold text-purple-400">
            Made with <span className="text-red-500">❤️</span> by <span className="underline">@GadScript</span>
          </p>
        </div>
      </div>
    </div>
  );
}