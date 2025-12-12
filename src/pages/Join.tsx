import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/lib/supabase'; // Import your supabase client


const Join = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinParty = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a Room Code",
        variant: "destructive",
      });
      return;
    }
  
    if (!user) {
      toast({
        title: "Not Logged In", 
        description: "Please log in to join a party",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Get JWT token
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error("Please log in to join a party");
      }
  
      const token = session.access_token;
  
      if (!token) {
        throw new Error("Not authenticated");
      }
  
      // Call Go backend to join party
      const response = await fetch('https://watchparty-backend-nnww.onrender.com/api/party/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_code: roomCode.toUpperCase(),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join party');
      }
  
      const result = await response.json();
  
      toast({
        title: "Joined Party!",
        description: `Welcome to ${result.party.title}`,
      });
  
      const party = result.party;
      const isHost = party.host_id === user.id;

      let redirectPath = '';

      // DEBUG: Log what we actually got
      console.log("Party data:", party);
      console.log("Current user ID:", user.id);
      console.log("Is host?", isHost);
      console.log("Activity type:", party.activity_type);

      // FIXED LOGIC — case-insensitive + safe check
      const isFreeRoom = party.activity_type?.toLowerCase() === 'free';

      if (isHost) {
        redirectPath = isFreeRoom ? `/host/free/${party.id}` : `/party/${party.id}`;
      } else {
        redirectPath = isFreeRoom ? `/party/${party.id}` : `/party/${party.id}`;
      }

      console.log(`Redirecting to: ${redirectPath}`);

      navigate(redirectPath);
    } catch (error: any) {
      console.error('Join party error:', error);
      toast({
        title: "Failed to Join Party",
        description: error.message || "Room not found or you don't have access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-cinema-dark to-cinema-darker py-12 flex items-center">
      <div className="container mx-auto px-4 max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-border hover-glow">
          <CardHeader>
            <CardTitle className="text-3xl">Join Watch Party</CardTitle>
            <CardDescription>
              Enter the room code to join an existing party
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
           
            {/* Room Code */}
            <div className="space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="e.g., ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Ask the host for the 6-character room code
              </p>
            </div>

            {/* User Info (Read-only) */}
            {user && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  Joining as: <span className="font-semibold">{user.username}</span>
                </p>
              </div>
            )}

            {/* Join Button */}
            <Button 
              onClick={handleJoinParty}
              className="w-full"
              size="lg"
              disabled={isLoading || !user}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                'Join Party'
              )}
            </Button>

            {!user && (
              <p className="text-sm text-center text-muted-foreground">
                Please log in to join a party
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Join;