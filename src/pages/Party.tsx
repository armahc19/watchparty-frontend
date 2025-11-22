import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { mockStore, WatchParty } from "@/lib/mockStore";
import VideoPlayer from "@/components/VideoPlayer";
import ChatBox from "@/components/ChatBox";
import ViewerCount from "@/components/ViewerCount";
import RoomShareModal from "@/components/RoomShareModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Party = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get("username") || "Guest";
  const isHost = searchParams.get("host") === "true";

  const [party, setParty] = useState<WatchParty | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const currentParty = mockStore.getParty(roomId);
    
    if (!currentParty) {
      toast({
        title: "Party Not Found",
        description: "This watch party doesn't exist",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setParty(currentParty);

    // Subscribe to party updates
    const unsubscribe = mockStore.subscribe(roomId, (updatedParty) => {
      setParty(updatedParty);
    });

    // Join party if not host
    if (!isHost) {
      mockStore.joinParty(roomId, username);
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      mockStore.leaveParty(roomId, username);
    };
  }, [roomId, username, isHost, navigate]);

  const handlePlaybackChange = (isPlaying: boolean, currentTime: number) => {
    if (isHost && roomId) {
      mockStore.updatePlaybackState(roomId, isPlaying, currentTime);
    }
  };

  const handleSendMessage = (text: string) => {
    if (roomId) {
      mockStore.sendMessage(roomId, username, text);
    }
  };

  const handleLeave = () => {
    if (roomId) {
      mockStore.leaveParty(roomId, username);
    }
    navigate("/");
  };

  if (!party) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-cinema-dark flex items-center justify-center">
        <p className="text-muted-foreground">Loading party...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-cinema-dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Leave
              </Button>
              <div>
                <h1 className="text-xl font-bold">{party.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Room: {party.id} {isHost && "• You're the host"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ViewerCount count={party.participants.length} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              videoUrl={party.videoUrl}
              isHost={isHost}
              isPlaying={party.isPlaying}
              currentTime={party.currentTime}
              onPlaybackChange={handlePlaybackChange}
            />
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <ChatBox
              messages={party.messages}
              participants={party.participants}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <RoomShareModal
          roomId={party.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default Party;