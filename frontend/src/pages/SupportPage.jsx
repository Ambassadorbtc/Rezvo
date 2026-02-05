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
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isYesterday } from 'date-fns';
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
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
      toast.success('Please enter a message', { className: 'bg-teal-500 text-white' });
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
      
      toast.success('Message sent!', { className: 'bg-teal-500 text-white' });
    } catch (error) {
      toast.error('Failed to send message', { className: 'bg-red-500 text-white' });
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
      toast.error('Failed to send message', { className: 'bg-red-500 text-white' });
    } finally {
      setSending(false);
    }
  };

  const handleSaveEdit = async (messageId) => {
    if (!editText.trim()) return;
    
    try {
      await api.patch(`/messages/${messageId}`, { content: editText });
      setEditingMessageId(null);
      setEditText('');
      await loadMessages(selectedConversation.id);
      toast.success('Message updated', { className: 'bg-teal-500 text-white' });
    } catch (error) {
      toast.error('Failed to update message', { className: 'bg-red-500 text-white' });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      await loadMessages(selectedConversation.id);
      toast.success('Message deleted', { className: 'bg-teal-500 text-white' });
    } catch (error) {
      toast.error('Failed to delete message', { className: 'bg-red-500 text-white' });
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!', { className: 'bg-teal-500 text-white' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)', { className: 'bg-red-500 text-white' });
      return;
    }

    setUploadingFile(true);
    try {
      // Convert file to base64 for sending
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        const fileMessage = file.type.startsWith('image/') 
          ? `📷 Image: ${file.name}\n[Image attached - ${(file.size / 1024).toFixed(1)}KB]`
          : `📎 File: ${file.name}\n[File attached - ${(file.size / 1024).toFixed(1)}KB]`;
        
        if (selectedConversation) {
          await api.post(`/conversations/${selectedConversation.id}/messages`, {
            content: fileMessage,
            attachment: {
              name: file.name,
              type: file.type,
              size: file.size
            }
          });
          await loadMessages(selectedConversation.id);
          toast.success('File sent!', { className: 'bg-teal-500 text-white' });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload file', { className: 'bg-red-500 text-white' });
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
        <div className={`w-full md:w-[340px] bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <Button
                onClick={() => setShowNewChat(true)}
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-lg bg-gray-100 border-0 h-9 text-sm"
              />
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
                <h3 className="font-semibold text-gray-900 mb-1">No messages</h3>
                <p className="text-sm text-gray-500 mb-3">Start a conversation</p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 border-b border-gray-50 hover:bg-gray-50 transition-all text-left ${
                    selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-3 border-l-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-gray-900 truncate">{conv.subject || 'Support'}</span>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                            {formatMessageTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.last_message || 'No messages'}</p>
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
                <h2 className="text-xl font-bold text-gray-900 mb-1">Support Chat</h2>
                <p className="text-sm text-gray-500 mb-4">We typically reply within 24 hours</p>
                <Button
                  onClick={() => setShowNewChat(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            </div>
          ) : showNewChat && !selectedConversation ? (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
                <button onClick={() => setShowNewChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-gray-900">New Message</h2>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={newChatSubject}
                      onChange={(e) => setNewChatSubject(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      placeholder="Describe your issue..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full h-32 px-3 py-2 rounded-lg bg-white border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleStartConversation}
                    disabled={sending || !newMessage.trim()}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">{selectedConversation?.subject || 'Support'}</h2>
                    <p className="text-xs text-gray-500">Usually replies within 24h</p>
                  </div>
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
                        const isOwn = msg.sender_id !== 'support';
                        const isEditing = editingMessageId === msg.id;
                        
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                            {!isOwn && (
                              <div className="w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            
                            <div className="relative max-w-[75%]">
                              {replyingTo?.id === msg.id && (
                                <div className="mb-1 px-2 py-1 rounded-lg text-[10px] bg-gray-200 text-gray-600">
                                  <Reply className="w-3 h-3 inline mr-1" />
                                  Replying...
                                </div>
                              )}
                              
                              <div className={`rounded-2xl px-3 py-2 ${
                                isOwn
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                              }`}>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-sm text-white placeholder:text-white/50 resize-none"
                                      autoFocus
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveEdit(msg.id)}
                                        className="bg-white/20 hover:bg-white/30 text-white text-xs h-6 px-2"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setEditingMessageId(null); setEditText(''); }}
                                        className="text-white/70 hover:text-white text-xs h-6 px-2"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    {msg.edited && (
                                      <span className={`text-[10px] ${isOwn ? 'text-white/50' : 'text-gray-400'}`}> (edited)</span>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-gray-400">{formatMessageTime(msg.created_at)}</span>
                                {isOwn && <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? 'text-teal-500' : 'text-gray-300'}`} />}
                              </div>
                              
                              {/* Hover Actions */}
                              {!isEditing && (
                                <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-md p-1`}>
                                  <button
                                    onClick={() => handleCopyMessage(msg.content)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Copy"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => setReplyingTo(msg)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Reply"
                                  >
                                    <Reply className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  {isOwn && (
                                    <>
                                      <button
                                        onClick={() => { setEditingMessageId(msg.id); setEditText(msg.content); }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Edit"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="p-1 hover:bg-red-50 rounded"
                                        title="Delete"
                                      >
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
                    <span className="text-gray-600 truncate max-w-[200px]">
                      {replyingTo.content.substring(0, 40)}...
                    </span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Input Area */}
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
                    title="Attach file"
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
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SupportPage;
