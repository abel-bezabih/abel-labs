'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const messageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm Abel from Abel Labs. I'm having trouble connecting right now.\n\nPlease contact us directly:\n📞 (604) 977-6878\n✉️ hello@abellabs.ca\n\nWe'll get back to you within 24 hours!",
          timestamp: new Date(),
        },
      ]);
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
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/conversations/${sessionId}/messages`, {
        content: messageToSend,
      });

      const conversation = response.data;
      const updatedMessages = conversation.messages as Message[];
      setMessages(updatedMessages);
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
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-blue-500/50 transition-all group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '600px',
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ maxHeight: isMinimized ? '60px' : 'min(600px, calc(100vh - 8rem))' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Abel</h3>
                  <p className="text-white/80 text-xs">We typically reply in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  <Minimize2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        variants={messageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-200">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                              animate={{
                                y: [0, -6, 0],
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

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={loading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      aria-label="Send message"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </motion.button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

