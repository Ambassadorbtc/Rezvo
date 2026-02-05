import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  ChevronLeft, 
  Plus,
  Smile,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  Copy,
  Trash2,
  Edit3,
  Reply,
  X,
  Mic,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const SupportPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    loadConversations();
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        subject: newChatSubject || 'Support Request',
        recipient_type: 'support'
      });
      
      setNewMessage('');
      setNewChatSubject('');
      setShowNewChat(false);
      await loadConversations();
      
      const newConv = { id: res.data.conversation_id, subject: newChatSubject || 'Support Request' };
      setSelectedConversation(newConv);
      await loadMessages(res.data.conversation_id);
      
      toast.success('Message sent!');
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
        content: newMessage,
        reply_to: replyingTo?.id || null
      });
      
      setNewMessage('');
      setReplyingTo(null);
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      await api.patch(`/messages/${messageId}`, { content: editText });
      setEditingMessage(null);
      setEditText('');
      await loadMessages(selectedConversation.id);
      toast.success('Message edited');
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      await loadMessages(selectedConversation.id);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
    setSelectedMessage(null);
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
    setSelectedMessage(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // For demo, we'll just send the image name as a message
      const imageMessage = `📷 [Image: ${file.name}]`;
      
      if (selectedConversation) {
        await api.post(`/conversations/${selectedConversation.id}/messages`, {
          content: imageMessage
        });
        await loadMessages(selectedConversation.id);
      }
      
      toast.success('Image sent!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedConversation) {
        handleSendMessage();
      } else if (showNewChat) {
        handleStartConversation();
      }
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    inputRef.current?.focus();
  };

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const filteredConversations = conversations.filter(c =>
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messageGroups = groupMessagesByDate(messages);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex bg-gray-50" data-testid="support-page">
        {/* Sidebar */}
        <div className={`w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <Button
                onClick={() => setShowNewChat(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 w-10 p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 rounded-xl bg-gray-100 border-0 h-11"
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
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start a new conversation with support</p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${
                    selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{conv.subject || 'Support Chat'}</span>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.last_message || 'No messages yet'}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation && !showNewChat ? 'hidden md:flex' : 'flex'}`}>
          {!selectedConversation && !showNewChat ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/10">
                  <MessageCircle className="w-12 h-12 text-teal-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Support</h2>
                <p className="text-gray-500 max-w-sm mb-6">
                  Have a question? Start a conversation and our team will help you out.
                </p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-6 py-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : showNewChat && !selectedConversation ? (
            // New Chat Form
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-4">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-lg mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      placeholder="What can we help you with?"
                      value={newChatSubject}
                      onChange={(e) => setNewChatSubject(e.target.value)}
                      className="rounded-xl bg-gray-50 border-gray-200 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      placeholder="Describe your issue or question..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full h-40 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <Button
                    onClick={handleStartConversation}
                    disabled={sending || !newMessage.trim()}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Chat Thread
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation?.subject || 'Support Chat'}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-xs text-gray-500">Rezvo Support • Usually replies within 24h</p>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-xl">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                        <span className="text-xs font-medium text-gray-500">{formatDateHeader(msgs[0].created_at)}</span>
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-4">
                      {msgs.map((msg) => {
                        const isOwn = msg.sender_id !== 'support';
                        const isEditing = editingMessage?.id === msg.id;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                          >
                            {/* Avatar for support messages */}
                            {!isOwn && (
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            
                            <div className={`relative max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                              {/* Reply preview */}
                              {msg.reply_to && (
                                <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs ${
                                  isOwn ? 'bg-teal-600/50 text-white/80' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  <Reply className="w-3 h-3 inline mr-1" />
                                  Replying to previous message
                                </div>
                              )}
                              
                              {/* Message bubble */}
                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isOwn
                                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20'
                                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                                }`}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setSelectedMessage(msg);
                                }}
                              >
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleEditMessage(msg.id)}
                                        className="bg-white/20 hover:bg-white/30 text-white text-xs"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setEditingMessage(null); setEditText(''); }}
                                        className="text-white/70 hover:text-white text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    {msg.edited && (
                                      <span className={`text-xs ${isOwn ? 'text-white/50' : 'text-gray-400'}`}> (edited)</span>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              {/* Time & Status */}
                              <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">{formatMessageTime(msg.created_at)}</span>
                                {isOwn && (
                                  <CheckCheck className={`w-4 h-4 ${msg.read ? 'text-teal-500' : 'text-gray-300'}`} />
                                )}
                              </div>
                              
                              {/* Message Actions (on hover) */}
                              <div className={`absolute top-0 ${isOwn ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                <button
                                  onClick={() => setReplyingTo(msg)}
                                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                                >
                                  <Reply className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                {isOwn && (
                                  <button
                                    onClick={() => { setEditingMessage(msg); setEditText(msg.content); }}
                                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-teal-500" />
                    <span className="text-sm text-gray-600">
                      Replying to: <span className="font-medium">{replyingTo.content.substring(0, 50)}...</span>
                    </span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-3">
                  {/* Attachment Button */}
                  <div className="flex gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-12 rounded-2xl bg-gray-100 border-0 h-12 text-base"
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-14 right-0 z-50">
                        <Picker 
                          data={data} 
                          onEmojiSelect={addEmoji}
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="none"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl h-12 w-12 p-0 shadow-lg shadow-teal-500/30"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Context Menu for Message */}
        {selectedMessage && (
          <div 
            className="fixed inset-0 z-50" 
            onClick={() => setSelectedMessage(null)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-2 min-w-[200px]">
              <button
                onClick={() => handleCopyMessage(selectedMessage.content)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Copy className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Copy</span>
              </button>
              <button
                onClick={() => { setReplyingTo(selectedMessage); setSelectedMessage(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Reply className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Reply</span>
              </button>
              {selectedMessage.sender_id !== 'support' && (
                <>
                  <button
                    onClick={() => { setEditingMessage(selectedMessage); setEditText(selectedMessage.content); setSelectedMessage(null); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SupportPage;
