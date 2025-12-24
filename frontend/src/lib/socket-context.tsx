'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Socket event types
export interface SocketMessage {
  message: {
    _id: string;
    conversation: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    receiver: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    content: string;
    messageType: 'text' | 'file' | 'image' | 'system';
    attachments?: Array<{
      url: string;
      publicId?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    }>;
    isRead: boolean;
    readAt?: string;
    isEdited: boolean;
    editedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  conversationId: string;
}

export interface TypingEvent {
  userId: string;
  userName: string;
  conversationId: string;
}

export interface OnlineStatusEvent {
  userId: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: string[];

  // Connection methods
  connect: () => void;
  disconnect: () => void;

  // Conversation methods
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;

  // Message methods
  sendMessage: (data: {
    conversationId?: string;
    receiverId?: string;
    content: string;
    messageType?: 'text' | 'file' | 'image';
    attachments?: Array<{
      url: string;
      publicId?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    }>;
  }) => void;
  markMessagesAsRead: (conversationId: string) => void;

  // Typing methods
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;

  // Online status
  checkUsersOnline: (userIds: string[]) => void;

  // Event listeners
  onNewMessage: (callback: (data: SocketMessage) => void) => () => void;
  onMessageNotification: (callback: (data: {
    conversationId: string;
    message: {
      content: string;
      sender?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
      };
    };
  }) => void) => () => void;
  onTypingStarted: (callback: (data: TypingEvent) => void) => () => void;
  onTypingStopped: (callback: (data: TypingEvent) => void) => () => void;
  onUserOnline: (callback: (data: OnlineStatusEvent) => void) => () => void;
  onUserOffline: (callback: (data: OnlineStatusEvent) => void) => () => void;
  onMessagesRead: (callback: (data: { conversationId: string; readBy: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const socketRef = useRef<Socket | null>(null);

  // Connect to Socket.io server
  const connect = useCallback(() => {
    if (!token || !user || socketRef.current) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
      'http://localhost:5000';

    console.info('Connecting to Socket.io server:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.info('Socket.io connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.info('Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setIsConnected(false);
    });

    // Listen for online users list
    newSocket.on('users:online', (data: { userIds: string[] }) => {
      setActiveUsers(data.userIds);
    });

    // Listen for user online/offline events
    newSocket.on('user:online', (data: OnlineStatusEvent) => {
      setActiveUsers(prev => [...new Set([...prev, data.userId])]);
    });

    newSocket.on('user:offline', (data: OnlineStatusEvent) => {
      setActiveUsers(prev => prev.filter(id => id !== data.userId));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [token, user]);

  // Disconnect from Socket.io server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.info('Disconnecting from Socket.io server');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setActiveUsers([]);
    }
  }, []);

  // Auto-connect when user logs in
  useEffect(() => {
    if (token && user && !socketRef.current) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  // Join a conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:join', { conversationId });
    }
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:leave', { conversationId });
    }
  }, []);

  // Send a message
  const sendMessage = useCallback((data: {
    conversationId?: string;
    receiverId?: string;
    content: string;
    messageType?: 'text' | 'file' | 'image';
    attachments?: Array<{
      url: string;
      publicId?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    }>;
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', data);
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('messages:markAsRead', { conversationId });
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { conversationId });
    }
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { conversationId });
    }
  }, []);

  // Check online status of users
  const checkUsersOnline = useCallback((userIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('users:checkOnline', { userIds });
    }
  }, []);

  // Event listener helpers (returns cleanup function)
  const onNewMessage = useCallback((callback: (data: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message:new', callback);
      return () => {
        socketRef.current?.off('message:new', callback);
      };
    }
    return () => { };
  }, []);

  const onMessageNotification = useCallback((callback: (data: {
    conversationId: string;
    message: {
      content: string;
      sender?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
      };
    };
  }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message:notification', callback);
      return () => {
        socketRef.current?.off('message:notification', callback);
      };
    }
    return () => { };
  }, []);

  const onTypingStarted = useCallback((callback: (data: TypingEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('typing:started', callback);
      return () => {
        socketRef.current?.off('typing:started', callback);
      };
    }
    return () => { };
  }, []);

  const onTypingStopped = useCallback((callback: (data: TypingEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('typing:stopped', callback);
      return () => {
        socketRef.current?.off('typing:stopped', callback);
      };
    }
    return () => { };
  }, []);

  const onUserOnline = useCallback((callback: (data: OnlineStatusEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user:online', callback);
      return () => {
        socketRef.current?.off('user:online', callback);
      };
    }
    return () => { };
  }, []);

  const onUserOffline = useCallback((callback: (data: OnlineStatusEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user:offline', callback);
      return () => {
        socketRef.current?.off('user:offline', callback);
      };
    }
    return () => { };
  }, []);

  const onMessagesRead = useCallback((callback: (data: { conversationId: string; readBy: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('messages:read', callback);
      return () => {
        socketRef.current?.off('messages:read', callback);
      };
    }
    return () => { };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    activeUsers,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    checkUsersOnline,
    onNewMessage,
    onMessageNotification,
    onTypingStarted,
    onTypingStopped,
    onUserOnline,
    onUserOffline,
    onMessagesRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the Socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
