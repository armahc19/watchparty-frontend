import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RoomShareModalProps {
  roomId: string;
  onClose: () => void;
}

const RoomShareModal = ({ roomId, onClose }: RoomShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/join?room=${roomId}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Watch Party</DialogTitle>
          <DialogDescription>
            Share this room ID or link with your friends to invite them
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Room ID */}
          <div className="space-y-2">
            <Label>Room ID</Label>
            <div className="flex gap-2">
              <Input
                value={roomId}
                readOnly
                className="text-center text-2xl tracking-widest font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy(roomId)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy(shareUrl)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomShareModal;