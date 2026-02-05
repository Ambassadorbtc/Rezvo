import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageCircle, Send, Search, User, Clock, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

const SupportPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(res.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleStartConversation = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/conversations', {
        content: newMessage,
        recipient_type: 'support'
      });
      
      setNewMessage('');
      await loadConversations();
      
      // Select the new conversation
      const newConv = { id: res.data.conversation_id };
      setSelectedConversation(newConv);
      await loadMessages(res.data.conversation_id);
      
      toast.success('Message sent to support!');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
      
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedConversation) {
        handleSendMessage();
      } else {
        handleStartConversation();
      }
    }
  };

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d');
  };

  const filteredConversations = conversations.filter(c =>
    c.participant_names?.['support']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex bg-cream-50" data-testid="support-page">
        {/* Sidebar - Conversations List */}
        <div className={`w-full md:w-96 bg-white border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-navy-900 mb-4">Support</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-navy-900 font-semibold mb-1">No conversations yet</h3>
                <p className="text-sm text-navy-500 mb-4">Start a conversation with our support team</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-navy-900 text-sm">Rezvo Support</span>
                        {conv.last_message_at && (
                          <span className="text-xs text-navy-400">
                            {formatMessageTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-navy-500 truncate">{conv.last_message || 'No messages'}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* New Conversation */}
          {!selectedConversation && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message to start..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-xl"
                />
                <Button
                  onClick={handleStartConversation}
                  disabled={sending || !newMessage.trim()}
                  className="bg-teal-500 hover:bg-teal-600 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-navy-900 mb-2">Welcome to Support</h2>
                <p className="text-navy-500 max-w-sm">
                  Have a question or need help? Start a conversation and our team will respond shortly.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-navy-900">Rezvo Support</h2>
                  <p className="text-xs text-navy-400">Typically replies within 24 hours</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id !== 'support';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isOwn
                            ? 'bg-teal-500 text-white rounded-br-md'
                            : 'bg-white text-navy-900 rounded-bl-md shadow-sm border border-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-teal-100' : 'text-navy-400'}`}>
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-xl bg-gray-50 border-gray-200"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-teal-500 hover:bg-teal-600 rounded-xl px-5"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SupportPage;
