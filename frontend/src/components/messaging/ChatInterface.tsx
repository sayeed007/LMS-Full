'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSocket } from '@/lib/socket-context';
import {
  useGetMessagesQuery,
  useGetOrCreateConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  type Message
} from '@/store/api/messageApi';
import { Send, Loader2, User, Circle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  conversationId?: string;
  userId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export default function ChatInterface({ conversationId, userId, onConversationCreated }: ChatInterfaceProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onTypingStarted,
    onTypingStopped,
    activeUsers
  } = useSocket();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create conversation if userId is provided
  const { data: conversationData } = useGetOrCreateConversationQuery(userId!, {
    skip: !userId || !!conversationId
  });

  // Determine active conversation ID
  const activeConversationId = conversationId || conversationData?.data?.conversation?._id;
  const otherParticipant = conversationData?.data?.conversation?.otherParticipant;

  // Fetch messages
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useGetMessagesQuery(
    {
      conversationId: activeConversationId!,
      limit: 50,
      page: 1
    },
    { skip: !activeConversationId }
  );

  // Mutations
  const [sendMessageREST] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  // Notify parent when conversation is created
  useEffect(() => {
    if (userId && activeConversationId && onConversationCreated) {
      onConversationCreated(activeConversationId);
    }
  }, [userId, activeConversationId, onConversationCreated]);

  // Initialize local messages from API
  useEffect(() => {
    if (messagesData?.data) {
      setLocalMessages(messagesData.data);
    }
  }, [messagesData]);

  // Join conversation room
  useEffect(() => {
    if (activeConversationId && isConnected) {
      joinConversation(activeConversationId);
      markAsRead(activeConversationId);

      return () => {
        leaveConversation(activeConversationId);
      };
    }
  }, [activeConversationId, isConnected, joinConversation, leaveConversation, markAsRead]);

  // Listen for new messages
  useEffect(() => {
    if (!activeConversationId) return;

    const cleanup = onNewMessage((data) => {
      if (data.conversationId === activeConversationId) {
        setLocalMessages(prev => [...prev, data.message]);
        scrollToBottom();

        // Mark as read if not from current user
        if (data.message.sender._id !== user?._id) {
          markAsRead(activeConversationId);
        }
      }
    });

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, onNewMessage, user, markAsRead]);

  // Listen for typing indicators
  useEffect(() => {
    if (!activeConversationId) return;

    const cleanupStart = onTypingStarted((data) => {
      if (data.conversationId === activeConversationId && data.userId !== user?._id) {
        setTypingUser(data.userName);
      }
    });

    const cleanupStop = onTypingStopped((data) => {
      if (data.conversationId === activeConversationId && data.userId !== user?._id) {
        setTypingUser(null);
      }
    });

    return () => {
      cleanupStart();
      cleanupStop();
    };
  }, [activeConversationId, onTypingStarted, onTypingStopped, user]);

  // Scroll to bottom on mount and new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!activeConversationId) return;

    // Send typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      startTyping(activeConversationId);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeConversationId);
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = messageInput.trim();
    if (!content) return;

    if (!activeConversationId && !userId) {
      toast.error('No conversation selected');
      return;
    }

    try {
      // Clear input immediately
      setMessageInput('');
      setIsTyping(false);
      if (activeConversationId) {
        stopTyping(activeConversationId);
      }

      // Send via WebSocket if connected
      if (isConnected && activeConversationId) {
        sendSocketMessage({
          conversationId: activeConversationId,
          receiverId: otherParticipant?._id || userId,
          content,
          messageType: 'text'
        });
      } else {
        // Fallback to REST API
        await sendMessageREST({
          conversationId: activeConversationId,
          receiverId: userId,
          content,
          messageType: 'text'
        }).unwrap();

        // Refetch messages
        refetchMessages();
      }
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message || 'Failed to send message'
        : 'Failed to send message';
      toast.error(errorMessage);
      setMessageInput(content); // Restore message on error
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  // Check if user is online
  const isUserOnline = otherParticipant && activeUsers.includes(otherParticipant._id);

  if (!activeConversationId && !userId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-240px)] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              {otherParticipant ? (
                <span className="text-white font-semibold text-lg">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            {isUserOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.name || 'Loading...'}
            </h3>
            <div className="flex items-center gap-1.5">
              {isUserOnline ? (
                <>
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Offline</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messagesLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : localMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          localMessages.map((message, index) => {
            const isOwn = message.sender._id === user?._id;
            const showTimestamp = index === 0 ||
              new Date(message.createdAt).getTime() - new Date(localMessages[index - 1].createdAt).getTime() > 5 * 60 * 1000;

            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {showTimestamp && (
                    <div className="text-xs text-gray-500 text-center mb-2">
                      {formatMessageTime(message.createdAt)}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${isOwn
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.isRead && isOwn && (
                    <div className="text-xs text-gray-400 mt-1">Read</div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={!isConnected && !activeConversationId}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || (!isConnected && !activeConversationId)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
