import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
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
  MoreVertical,
  Check,
  CheckCheck,
  Copy,
  Trash2,
  Edit3,
  Reply,
  X,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const SupportPage = () => {
  const { user } = useAuth();
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // Poll conversations every 5 seconds for real-time feel
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Poll messages every 3 seconds when conversation is open
      const messageInterval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(messageInterval);
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

  // Silently refresh conversations without affecting loading state
  const refreshConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
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
      
      // Select the newly created conversation
      const newConv = { 
        id: res.data.conversation_id, 
        subject: newChatSubject || 'Support Request',
        status: 'open',
        created_at: new Date().toISOString()
      };
      setSelectedConversation(newConv);
      await loadMessages(res.data.conversation_id);
      
      toast.success('Support ticket created!');
    } catch (error) {
      toast.error('Failed to create support ticket');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage;
    setSending(true);
    setNewMessage('');
    setReplyingTo(null);
    
    // Optimistically add message to UI immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || user?.sub,
      sender_name: user?.email || 'User',
      content: messageContent,
      is_admin: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: messageContent,
        reply_to: replyingTo?.id || null
      });
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id 
          ? { ...optimisticMessage, id: response.data.id, created_at: response.data.created_at }
          : m
      ));
      
      // Silently update conversation list (no loading state change)
      refreshConversations();
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedConversation) return;
    
    try {
      await api.patch(`/conversations/${selectedConversation.id}`, { status });
      setSelectedConversation({ ...selectedConversation, status });
      refreshConversations();
      toast.success(`Ticket ${status === 'open' ? 'reopened' : status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      await api.patch(`/messages/${messageId}`, { content: editText });
      setEditingMessageId(null);
      setEditText('');
      await loadMessages(selectedConversation.id);
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
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
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    setUploadingFile(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post('/support/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = uploadRes.data.url;
      const fileMessage = file.type.startsWith('image/') 
        ? `📷 Image: ${file.name}\n${fileUrl}`
        : `📎 File: ${file.name}\n${fileUrl}`;
      
      if (selectedConversation) {
        await api.post(`/conversations/${selectedConversation.id}/messages`, {
          content: fileMessage
        });
        await loadMessages(selectedConversation.id);
        toast.success('File uploaded!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (editingMessageId) {
      setEditText(prev => prev + emoji.native);
    } else {
      setNewMessage(prev => prev + emoji.native);
      inputRef.current?.focus();
    }
  };

  const formatMessageTime = (dateStr) => {
    return format(new Date(dateStr), 'HH:mm');
  };

  const formatConversationDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'd MMM');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const messageGroups = groupMessagesByDate(messages);

  const statusCounts = {
    all: conversations.length,
    open: conversations.filter(c => c.status === 'open' || !c.status).length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    closed: conversations.filter(c => c.status === 'closed').length
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex bg-gray-50" data-testid="support-page">
        {/* Sidebar */}
        <div className={`w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">Support</h1>
              <Button
                onClick={() => { setShowNewChat(true); setSelectedConversation(null); }}
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Issue
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-gray-100 border-0 h-9 text-sm"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {['all', 'open', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all capitalize ${
                    statusFilter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-7 h-7 text-teal-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">No tickets</h3>
                <p className="text-sm text-gray-500 mb-3">Create a new support ticket</p>
                <Button
                  onClick={() => { setShowNewChat(true); setSelectedConversation(null); }}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Issue
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConversation(conv); setShowNewChat(false); }}
                  className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${
                    selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-3 border-l-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">{conv.subject || 'Support Request'}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(conv.status)}`}>
                          {getStatusIcon(conv.status)}
                          {conv.status || 'open'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{conv.last_message || 'No messages'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          {conv.created_at ? formatConversationDate(conv.created_at) : '-'}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-gray-400">
                            Last: {formatConversationDate(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-white font-bold">{conv.unread_count}</span>
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
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Support Center</h2>
                <p className="text-sm text-gray-500 mb-4">We typically reply within 24 hours</p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Support Ticket
                </Button>
              </div>
            </div>
          ) : showNewChat ? (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
                <button onClick={() => setShowNewChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-gray-900">New Support Ticket</h2>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <Input
                        placeholder="Brief description of your issue"
                        value={newChatSubject}
                        onChange={(e) => setNewChatSubject(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea
                        placeholder="Describe your issue in detail..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full h-40 px-4 py-3 rounded-xl bg-white border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleStartConversation}
                      disabled={sending || !newMessage.trim()}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">{selectedConversation?.subject || 'Support'}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(selectedConversation?.status)}`}>
                        {getStatusIcon(selectedConversation?.status)}
                        {selectedConversation?.status || 'open'}
                      </span>
                      {selectedConversation?.created_at && (
                        <span className="text-[10px] text-gray-400">
                          Created {formatDistanceToNow(new Date(selectedConversation.created_at))} ago
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Status Actions */}
                <div className="flex items-center gap-2">
                  {/* Refresh Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadMessages(selectedConversation?.id)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Refresh messages"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  {/* Status Dropdown */}
                  <select
                    value={selectedConversation?.status || 'open'}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer bg-teal-500 text-white focus:ring-2 focus:ring-teal-300"
                  >
                    <option value="open" className="bg-white text-gray-800">Open</option>
                    <option value="resolved" className="bg-white text-gray-800">Resolved</option>
                    <option value="closed" className="bg-white text-gray-800">Closed</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                        <span className="text-[10px] font-medium text-gray-500">{formatDateHeader(msgs[0].created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {msgs.map((msg) => {
                        // Owner's view: Own messages on RIGHT (teal), Admin/Founder messages on LEFT (blue)
                        // If is_admin is true, it's from founder - show on LEFT
                        // If sender_id matches current user AND is_admin is false/undefined - show on RIGHT
                        const isFromAdmin = msg.is_admin === true;
                        const isOwn = !isFromAdmin && (msg.sender_id === user?.sub || msg.sender_id === user?.id);
                        const isEditing = editingMessageId === msg.id;
                        
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                            {!isOwn && (
                              <div className="w-7 h-7 bg-[#3B82F6] rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            
                            <div className="relative max-w-[75%]">
                              <div className={`rounded-2xl px-3 py-2 ${
                                isOwn
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-[#3B82F6] text-white'
                              }`}>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-sm resize-none"
                                      autoFocus
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleSaveEdit(msg.id)} className="bg-white/20 hover:bg-white/30 text-xs h-6 px-2">
                                        Save
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => { setEditingMessageId(null); setEditText(''); }} className="text-xs h-6 px-2">
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    {msg.edited && <span className="text-[10px] opacity-50"> (edited)</span>}
                                  </>
                                )}
                              </div>
                              
                              <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-gray-400">{formatMessageTime(msg.created_at)}</span>
                                {isOwn && <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? 'text-teal-500' : 'text-gray-300'}`} />}
                              </div>
                              
                              {!isEditing && (
                                <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-md p-1`}>
                                  <button onClick={() => handleCopyMessage(msg.content)} className="p-1 hover:bg-gray-100 rounded" title="Copy">
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  <button onClick={() => setReplyingTo(msg)} className="p-1 hover:bg-gray-100 rounded" title="Reply">
                                    <Reply className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  {isOwn && (
                                    <>
                                      <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.content); }} className="p-1 hover:bg-gray-100 rounded" title="Edit">
                                        <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                      </button>
                                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 hover:bg-red-50 rounded" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
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
                <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Reply className="w-4 h-4 text-teal-500" />
                    <span className="text-gray-600 truncate max-w-[200px]">{replyingTo.content.substring(0, 40)}...</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Input Area - Only show if not closed */}
              {selectedConversation?.status !== 'closed' && (
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? (
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Paperclip className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="pr-10 rounded-xl bg-gray-100 border-0 h-10"
                      />
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Smile className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-50">
                          <Picker data={data} onEmojiSelect={addEmoji} theme="light" previewPosition="none" skinTonePosition="none" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 w-10 p-0 flex-shrink-0"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Closed Ticket Notice */}
              {selectedConversation?.status === 'closed' && (
                <div className="p-4 bg-gray-100 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-2">This ticket is closed.</p>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('open')}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reopen Ticket
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SupportPage;
