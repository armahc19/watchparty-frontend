import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { mockStore } from "@/lib/mockStore";
import { ArrowLeft } from "lucide-react";

const Join = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoinParty = () => {
    if (!roomId.trim() || !username.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Room ID and Username",
        variant: "destructive",
      });
      return;
    }

    const party = mockStore.getParty(roomId.toUpperCase());
    
    if (!party) {
      toast({
        title: "Room Not Found",
        description: "Please check the Room ID and try again",
        variant: "destructive",
      });
      return;
    }

    const joined = mockStore.joinParty(roomId.toUpperCase(), username);
    
    if (joined) {
      toast({
        title: "Joined Party!",
        description: `Welcome to ${party.title}`,
      });
      navigate(`/party/${roomId.toUpperCase()}?username=${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cinema-dark to-cinema-darker py-12 flex items-center">
      <div className="container mx-auto px-4 max-w-md">
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
            <CardTitle className="text-3xl">Join Watch Party</CardTitle>
            <CardDescription>
              Enter the room code to join the party
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

            {/* Room ID */}
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                placeholder="e.g., ABC123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Ask the host for the 6-character room code
              </p>
            </div>

            {/* Join Button */}
            <Button 
              onClick={handleJoinParty}
              className="w-full"
              size="lg"
            >
              Join Party
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Join;