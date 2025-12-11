import { useNavigate } from "react-router-dom";
import { Film, Music, Globe, Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SelectActivity = () => {
  const navigate = useNavigate();

  const activities = [
    {
      name: "Movie Night",
      icon: Film,
      color: "text-primary",
      description: "A classic shared experience. Stream movies together with perfect sync, real-time chat, and a cinematic vibe that makes everyone feel like they’re in the same room.",
      bg: "bg-primary/10",
      route: "/host?type=movie",  // Changed from mode to type
    },
    {
      name: "Music Party",
      icon: Music,
      color: "text-accent",
      description:"Turn your session into a live playlist hangout. Guests vibe together while tracks play in sync — perfect for chill sessions, study groups, or discovering music with friends.",
      bg: "bg-accent/10",
      route: "/host?type=music",  // Changed from mode to type
    },
    
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cinema-dark to-cinema-darker">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Activity
          </h1>
          <p className="text-muted-foreground mt-2">
            Pick how you want to host your session
          </p>
        </header>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {activities.map((a) => (
            <Card
              key={a.name}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary transition-colors hover-glow cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${a.bg} rounded-full flex items-center justify-center mb-4`}>
                  <a.icon className={`w-8 h-8 ${a.color}`} />
                </div>
                <h2 className="text-xl font-semibold mb-3">{a.name}</h2>
                <p className="text-muted-foreground mb-6">{a.description}</p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate(a.route)}
                >
                  Start
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectActivity;
