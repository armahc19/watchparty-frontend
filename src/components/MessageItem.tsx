import { Message } from "@/lib/mockStore";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="group">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-sm text-primary">
          {message.username}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <p className="text-sm mt-1 break-words">{message.text}</p>
    </div>
  );
};

export default MessageItem;