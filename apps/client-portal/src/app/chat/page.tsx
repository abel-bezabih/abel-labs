'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasBrief, setHasBrief] = useState(false);
  const [briefId, setBriefId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for brief generation periodically
  useEffect(() => {
    if (!sessionId) return;

    const checkForBrief = async () => {
      try {
        const response = await axios.get(`${API_URL}/conversations/${sessionId}`);
        if (response.data.projectBrief) {
          setHasBrief(true);
          setBriefId(response.data.projectBrief.id);
        }
      } catch (error) {
        // Ignore errors, brief might not be ready yet
      }
    };

    // Check immediately and then every 5 seconds
    checkForBrief();
    const interval = setInterval(checkForBrief, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      const response = await axios.post(`${API_URL}/conversations`);
      setSessionId(response.data.sessionId);
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm Abel from Abel Labs. To get started, could you share your name, email, and phone number?\n\nI can then answer questions about our services and pricing.\n\nFor detailed quotes: 📞 (604) 977-6878 or ✉️ hello@abellabs.ca",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/conversations/${sessionId}/messages`, {
        content: input,
      });

      const conversation = response.data;
      const updatedMessages = conversation.messages as Message[];
      setMessages(updatedMessages);

      // Check if brief was generated
      if (conversation.projectBrief) {
        setHasBrief(true);
        setBriefId(conversation.projectBrief.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Abel</h1>
                <p className="text-sm text-gray-500">Your AI-powered creative consultant</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl h-[calc(100vh-12rem)] flex flex-col border border-gray-200 overflow-hidden"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </motion.div>
                  {message.role === 'user' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Brief Generated Banner */}
          {hasBrief && briefId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Project Brief Generated!</p>
                  <p className="text-sm text-gray-600">View your brief status and next steps</p>
                </div>
              </div>
              <Link
                href={`/brief-status?briefId=${briefId}`}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
              >
                View Status
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-white/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-3"
            >
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
