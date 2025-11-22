import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipForward, Volume2, Maximize } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl: string;
  isHost: boolean;
  isPlaying: boolean;
  currentTime: number;
  onPlaybackChange: (isPlaying: boolean, currentTime: number) => void;
}

const VideoPlayer = ({ videoUrl, isHost, isPlaying, currentTime, onPlaybackChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localTime, setLocalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  // Sync playback state with party
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(console.error);
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }

    // Sync time if difference is more than 1 second
    if (Math.abs(video.currentTime - currentTime) > 1) {
      video.currentTime = currentTime;
    }
  }, [isPlaying, currentTime]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video || !isHost) return;

    const newIsPlaying = video.paused;
    onPlaybackChange(newIsPlaying, video.currentTime);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !isHost) return;

    const newTime = value[0];
    video.currentTime = newTime;
    onPlaybackChange(isPlaying, newTime);
  };

  const handleSkip = () => {
    const video = videoRef.current;
    if (!video || !isHost) return;

    const newTime = Math.min(video.currentTime + 10, duration);
    video.currentTime = newTime;
    onPlaybackChange(isPlaying, newTime);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setLocalTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = value[0];
      video.volume = newVolume / 100;
      setVolume(newVolume);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      video.requestFullscreen().catch(console.error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if URL is a YouTube link
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : new URLSearchParams(url.split('?')[1]).get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <Card className="overflow-hidden border-border">
      <div className="relative bg-cinema-darker aspect-video">
        {isYouTube ? (
          <div className="w-full h-full">
            <iframe
              src={getYouTubeEmbedUrl(videoUrl) || ''}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {!isHost && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-sm">Playback controlled by host</p>
              </div>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 bg-card">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[localTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!isHost || isYouTube}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(localTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayPause}
              disabled={!isHost || isYouTube}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSkip}
              disabled={!isHost || isYouTube}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-20"
                disabled={isYouTube}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFullscreen}
              disabled={isYouTube}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {!isHost && (
          <p className="text-xs text-muted-foreground text-center">
            Playback is controlled by the host
          </p>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;