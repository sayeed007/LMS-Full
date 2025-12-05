'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSocket } from '@/lib/socket-context';
import {
  useGetConversationsQuery,
  useLazySearchUsersQuery,
  useGetUnreadCountQuery,
  type Conversation,
  type UserSearchResult
} from '@/store/api/messageApi';
import ChatInterface from '@/components/messaging/ChatInterface';
import { Search, MessageSquare, Users, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { isConnected } = useSocket();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useGetConversationsQuery({
    limit: 50,
    page: 1
  });

  // Fetch unread count
  const { data: unreadData } = useGetUnreadCountQuery();

  // Search users
  const [searchUsers, { data: searchResults, isLoading: searchLoading }] = useLazySearchUsersQuery();

  // Handle user search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers({ q: searchQuery, limit: 10 });
    }
  }, [searchQuery, searchUsers]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedUserId(null);
    setShowUserSearch(false);
  };

  // Handle starting a new conversation with a user
  const handleStartConversation = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedConversationId(null);
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const conversations = conversationsData?.data || [];
  const totalUnread = unreadData?.data?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary-600" />
                Messages
              </h1>
              <p className="text-gray-600 mt-1">
                Chat with instructors and students
                {totalUnread > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                    {totalUnread} unread
                  </span>
                )}
              </p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-240px)]">
              {/* Search and New Message */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="w-full mb-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  New Message
                </button>

                {showUserSearch && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                        {searchLoading ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                          </div>
                        ) : searchResults?.data && searchResults.data.length > 0 ? (
                          searchResults.data.map((user: UserSearchResult) => (
                            <button
                              key={user._id}
                              onClick={() => handleStartConversation(user._id)}
                              className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                            >
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {user.role}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Conversations */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
                {conversationsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start a new message to begin chatting</p>
                  </div>
                ) : (
                  conversations.map((conversation: Conversation) => {
                    const isSelected = conversation._id === selectedConversationId;
                    const lastMessage = conversation.lastMessage;
                    const unreadCount = conversation.unreadCount || 0;

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => handleSelectConversation(conversation._id)}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {conversation.otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                {conversation.otherParticipant?.name || 'Unknown User'}
                              </p>
                              {lastMessage && (
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>

                            {lastMessage && (
                              <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                {lastMessage.sender._id === user?._id ? 'You: ' : ''}
                                {lastMessage.content}
                              </p>
                            )}

                            {unreadCount > 0 && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                                  {unreadCount} new
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversationId || selectedUserId ? (
              <ChatInterface
                conversationId={selectedConversationId || undefined}
                userId={selectedUserId || undefined}
                onConversationCreated={(convId) => {
                  setSelectedConversationId(convId);
                  setSelectedUserId(null);
                  refetchConversations();
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-240px)] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
