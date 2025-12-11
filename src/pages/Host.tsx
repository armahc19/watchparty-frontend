import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Film, Music, Upload, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSearchParams } from "react-router-dom";

const Host = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxViewers, setMaxViewers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const activityType = searchParams.get('type') || 'movie';

  const handleCreateParty = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a party title",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to create a party",
          variant: "destructive",
        });
        return;
      }

      // Call your Go backend
      const response = await fetch('http://localhost:8081/api/party/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description, 
          max_viewers: maxViewers,
          activity_type: activityType, // Add this line
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create party');
      }

      const result = await response.json();

      toast({
        title: "Party Created!",
        description: `Room Code: ${result.party.room_code}`,
      });

      // Navigate to the new party room
      //navigate(`/party/${result.party.id}`);
      // Navigate to the correct room based on activity type
        if (activityType === 'free') {
          navigate(`/free/${result.party.id}`);
        } 
        else {
          //navigate(`/party/${result.party.id}`); // fallback
          alert("Error pages");
        }

    } catch (error: any) {
      console.error('Create party error:', error);
      toast({
        title: "Failed to Create Party",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            {/* Party Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Party Title *</Label>
              <Input
                id="title"
                placeholder="Movie Night, Chill Vibes, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Party Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What are we watching? (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Max Viewers */}
            <div className="space-y-2">
              <Label htmlFor="maxViewers">Maximum Viewers</Label>
              <select
                id="maxViewers"
                value={maxViewers}
                onChange={(e) => setMaxViewers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={3}>3 viewers</option>
                
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Film className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-400">Live Streaming Setup</h4>
                  <p className="text-sm text-blue-300 mt-1">
                    After creating the party, you'll be able to start streaming your camera, 
                    screen, or video file to all participants in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Button 
              onClick={handleCreateParty}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Party...
                </>
              ) : (
                'Create Watch Party'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Host;