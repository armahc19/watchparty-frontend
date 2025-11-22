import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Film, Music, Users } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cinema-dark to-cinema-darker">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WatchParty
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch movies and listen to music together in perfect sync. Create your own cinema room and invite friends!
          </p>
        </header>

        {/* Main Actions */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card border border-border rounded-lg p-8 hover:border-primary transition-colors hover-glow">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Host a Watch Party</h2>
            <p className="text-muted-foreground mb-6">
              Upload your movie or music, create a room, and invite friends to watch together in real-time.
            </p>
            <Button 
              onClick={() => navigate("/host")} 
              className="w-full"
              size="lg"
            >
              Create Party
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:border-accent transition-colors hover-glow">
            <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Join a Party</h2>
            <p className="text-muted-foreground mb-6">
              Have a room code? Join an existing watch party and enjoy synchronized playback with your friends.
            </p>
            <Button 
              onClick={() => navigate("/join")} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Join Party
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-center mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Perfect Sync</h4>
              <p className="text-sm text-muted-foreground">
                Watch together in real-time with perfect playback synchronization
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-4">
                <Music className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-2">Movies & Music</h4>
              <p className="text-sm text-muted-foreground">
                Support for both video and audio content
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-cinema-glow/20 rounded-full mx-auto mb-4">
                <Users className="w-6 h-6 text-cinema-glow" />
              </div>
              <h4 className="font-semibold mb-2">Live Chat</h4>
              <p className="text-sm text-muted-foreground">
                Chat with friends while watching together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;