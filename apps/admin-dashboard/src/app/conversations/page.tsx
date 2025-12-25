'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, User, Calendar, ExternalLink, Bot } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Conversation {
  id: string;
  sessionId: string;
  status: string;
  intent: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  projectBrief: {
    id: string;
    projectType: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`${API_URL}/conversations/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'ABANDONED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFirstUserMessage = (messages: any[]) => {
    const userMsg = messages.find((m) => m.role === 'user');
    return userMsg?.content || 'No message';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Client Conversations</h1>
            <p className="text-gray-600">View all AI bot conversations with potential clients</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="w-5 h-5" />
            <span>{conversations.length} total conversations</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 space-y-4">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedConversation?.id === conv.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {conv.user || conv.contactName ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                          {(conv.user?.name || conv.contactName || 'A').charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {conv.user?.name || conv.contactName || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.user?.email || conv.contactEmail || 'No email'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        conv.status
                      )}`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {getFirstUserMessage(conv.messages)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(conv.createdAt)}</span>
                    </div>
                    {conv.intent && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {conv.intent}
                      </span>
                    )}
                  </div>
                  {conv.projectBrief && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <a
                        href={`/briefs/${conv.projectBrief.id}`}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Brief
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Conversation Details</h2>
                    <p className="text-sm text-gray-600">Session: {selectedConversation.sessionId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedConversation.status
                      )}`}
                    >
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>

                {(selectedConversation.user || selectedConversation.contactName || selectedConversation.contactEmail || selectedConversation.contactPhone) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2">Client Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(selectedConversation.user?.name || selectedConversation.contactName) && (
                        <div>
                          <span className="text-gray-600">Name:</span>{' '}
                          <span className="font-medium">
                            {selectedConversation.user?.name || selectedConversation.contactName}
                          </span>
                        </div>
                      )}
                      {(selectedConversation.user?.email || selectedConversation.contactEmail) && (
                        <div>
                          <span className="text-gray-600">Email:</span>{' '}
                          <a
                            href={`mailto:${selectedConversation.user?.email || selectedConversation.contactEmail}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {selectedConversation.user?.email || selectedConversation.contactEmail}
                          </a>
                        </div>
                      )}
                      {selectedConversation.contactPhone && (
                        <div>
                          <span className="text-gray-600">Phone:</span>{' '}
                          <a
                            href={`tel:${selectedConversation.contactPhone}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {selectedConversation.contactPhone}
                          </a>
                        </div>
                      )}
                      {selectedConversation.user && (
                        <div>
                          <span className="text-gray-600">Status:</span>{' '}
                          <span className="font-medium text-green-600">Registered User</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Messages</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {selectedConversation.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDate(msg.timestamp)}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Started:</span>{' '}
                      <span className="font-medium">{formatDate(selectedConversation.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>{' '}
                      <span className="font-medium">
                        {formatDate(selectedConversation.updatedAt)}
                      </span>
                    </div>
                    {selectedConversation.intent && (
                      <div>
                        <span className="text-gray-600">Project Type:</span>{' '}
                        <span className="font-medium">{selectedConversation.intent}</span>
                      </div>
                    )}
                    {selectedConversation.projectBrief && (
                      <div>
                        <span className="text-gray-600">Brief Status:</span>{' '}
                        <a
                          href={`/briefs/${selectedConversation.projectBrief.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {selectedConversation.projectBrief.status}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

