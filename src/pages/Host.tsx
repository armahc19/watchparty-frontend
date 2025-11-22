import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { mockStore } from "@/lib/mockStore";
import { Film, Music, Upload, ArrowLeft } from "lucide-react";

const Host = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'movie' | 'music'>('movie');
  const [videoUrl, setVideoUrl] = useState("");
  const [username, setUsername] = useState("");

  const handleCreateParty = () => {
    if (!title.trim() || !videoUrl.trim() || !username.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const party = mockStore.createParty(title, type, videoUrl, username);
    
    toast({
      title: "Party Created!",
      description: `Room ID: ${party.id}`,
    });

    // Navigate to the party room
    navigate(`/party/${party.id}?username=${username}&host=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cinema-dark to-cinema-darker py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-border hover-glow">
          <CardHeader>
            <CardTitle className="text-3xl">Create Watch Party</CardTitle>
            <CardDescription>
              Set up your room and invite friends to watch together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Your Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Party Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Party Title</Label>
              <Input
                id="title"
                placeholder="Movie Night, Chill Vibes, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setType('movie')}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    type === 'movie' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Film className="w-8 h-8" />
                  <span className="font-medium">Movie</span>
                </button>
                <button
                  onClick={() => setType('music')}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    type === 'music' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Music className="w-8 h-8" />
                  <span className="font-medium">Music</span>
                </button>
              </div>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video/Music URL</Label>
              <Input
                id="videoUrl"
                placeholder="https://example.com/video.mp4 or YouTube URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct video link or YouTube URL (for demo purposes)
              </p>
            </div>

            {/* Mock File Upload UI */}
            <div className="space-y-2">
              <Label>Or Upload File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (File upload is simulated in this demo)
                </p>
              </div>
            </div>

            {/* Create Button */}
            <Button 
              onClick={handleCreateParty}
              className="w-full"
              size="lg"
            >
              Create Watch Party
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Host;