import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  isHost: boolean;
}

interface ChatBoxProps {
  partyId: string;
  currentUser: any;
}

const ChatBox: React.FC<ChatBoxProps> = ({ partyId, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial messages - replace with real WebSocket messages
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: '1',
        username: 'MovieMaster',
        message: 'Welcome to the watch party! 🎬',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isHost: true,
      },
      {
        id: '2',
        userId: '2',
        username: 'FilmFanatic',
        message: 'Thanks for hosting! Ready to watch!',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        isHost: false,
      },
      {
        id: '3',
        userId: '3',
        username: 'CinemaLover',
        message: 'This is my first watch party, excited! 🍿',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        isHost: false,
      },
    ];
    setMessages(mockMessages);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;

    setIsLoading(true);

    try {
      // Create new message
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        message: newMessage,
        timestamp: new Date().toISOString(),
        isHost: false, // This would come from backend
      };

      // TODO: Send via WebSocket to Go backend
      console.log('Sending message:', message);

      // Add to local state (temporary)
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // TODO: Replace with real WebSocket send
      // websocket.send(JSON.stringify({
      //   type: 'chat',
      //   partyId,
      //   message: newMessage
      // }));

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>💬</span>
          Live Chat
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              message.userId === currentUser?.id
                ? 'bg-indigo-500/20 border border-indigo-500/30 ml-auto'
                : message.isHost
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-gray-700/50 border border-gray-600/30'
            }`}
          >
            {/* Message Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold text-sm ${
                    message.isHost
                      ? 'text-yellow-400'
                      : message.userId === currentUser?.id
                      ? 'text-indigo-300'
                      : 'text-gray-300'
                  }`}
                >
                  {message.username}
                  {message.isHost && ' 👑'}
                  {message.userId === currentUser?.id && ' (You)'}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {formatTime(message.timestamp)}
              </span>
            </div>

            {/* Message Content */}
            <p className="text-sm text-white break-words">
              {message.message}
            </p>
          </div>
        ))}
        
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;