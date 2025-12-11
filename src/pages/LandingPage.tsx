import React from 'react';
import { Film, Users, MessageCircle, Sparkles, Play, Globe, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400/30" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
              WatchParty
            </h1>
            <p className="text-2xl md:text-4xl mb-8 text-gray-200">
              Watch movies & music together — perfectly synced, anywhere in the world
            </p>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              The ultimate watch-together experience. Real-time sync, reactions, chat, and crystal-clear streaming — all in one beautiful app.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="/welcome"
                className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-bold hover:scale-110 transition-all duration-300 shadow-2xl flex items-center gap-3"
              >
                <Play className="w-6 h-6 group-hover:translate-x-1 transition" />
                Start Watching Now
              </a>
             {/* <a
                href="/create"
                className="px-10 py-5 border-2 border-white/50 rounded-full text-xl font-bold hover:bg-white/10 transition-all backdrop-blur"
              >
                Create a Room
              </a>*/}
            </div>
          </div>

          {/* Hero Image */}
           {/* HERO MOCKUP — CINEMATIC MASTERPIECE */}
<div className="mt-20 relative">
  <div className="max-w-7xl mx-auto px-6">
    {/* Floating Devices Mockup */}
    <div className="relative">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main TV Screen */}
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-3xl p-4 shadow-2xl border border-purple-500/50">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* YOUR IMAGE GOES HERE — REPLACE THE URL BELOW */}
            <img
              src="https://images.unsplash.com/photo-1714978444538-9097293e5b20?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGVvcGxlJTIwd2F0Y2hpbmclMjB0b2dldGhlciUyMHR2fGVufDB8fDB8fHww"
              alt="WatchParty in action"
              className="w-full h-auto object-cover"
            />
            
            {/* TV Stand Effect */}
            <div className="h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-4">
              <div className="w-48 h-8 bg-gray-800 rounded-t-lg shadow-2xl"></div>
            </div>
          </div>
        </div>

        {/* Floating Phones Around It */}
        <div className="absolute -top-10 -left-20 animate-bounce delay-300">
          <div className="bg-black/90 rounded-3xl p-2 shadow-2xl border border-purple-500/30 rotate-12">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-center">
              <Users className="w-12 h-12 mx-auto text-white mb-2" />
              <p className="text-white font-bold">12 watching</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-16 -right-16 animate-bounce delay-700">
          <div className="bg-black/90 rounded-3xl p-2 shadow-2xl border border-cyan-500/30 -rotate-12">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-4 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-white mb-2" />
              <p className="text-white font-bold">Live chat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="text-center mt-12">
        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Perfectly synced. Everywhere.
        </p>
        <p className="text-xl text-gray-400 mt-4">
          Movies, music, reactions — all in real-time with friends worldwide.
        </p>
      </div>
    </div>
  </div>
</div>
   </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Why Everyone Loves WatchParty
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="w-12 h-12" />,
                title: "Lightning Fast Sync",
                desc: "Millisecond-perfect playback. No lag, no drift — ever."
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Watch With Anyone",
                desc: "Invite friends from anywhere. Works on phone, tablet, or laptop."
              },
              {
                icon: <MessageCircle className="w-12 h-12" />,
                title: "Live Chat & Reactions",
                desc: "React with emojis, flying messages, and real-time typing indicators."
              },
              {
                icon: <Globe className="w-12 h-12" />,
                title: "Movies + Music",
                desc: "One app for Netflix-style movie nights and Spotify-style music parties."
              },
              {
                icon: <Film className="w-12 h-12" />,
                title: "Crystal Clear Quality",
                desc: "Direct streaming with signed URLs. No buffering, no quality loss."
              },
              {
                icon: <Sparkles className="w-12 h-12" />,
                title: "Beautiful Design",
                desc: "Feels like a premium app. Dark mode, animations, and pure joy."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 backdrop-blur"
              >
                <div className="text-purple-400 mb-4 group-hover:scale-125 transition">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-gradient-to-t from-purple-900 to-black">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Start Watching Together?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands who are already watching with friends — right now.
          </p>
          <a
            href="/welcome"
            className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-2xl font-bold hover:scale-110 transition-all shadow-2xl"
          >
            <Play className="w-8 h-8" />
            Start Your WatchParty
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-black/50 text-center text-gray-400">
        <p>Made with ❤️ for people who love watching together</p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 15s infinite ease-in-out;
        }
          @keyframes float-up {
            0% { transform: translateY(100px) scale(0); opacity: 0; }
            20% { transform: translateY(0) scale(1.3); opacity: 1; }
            100% { transform: translateY(-300px) scale(1); opacity: 0; }
            }
            .animate-float-up {
            animation: float-up 4s ease-out forwards;
            }
      `}</style>
    </>
  );
}