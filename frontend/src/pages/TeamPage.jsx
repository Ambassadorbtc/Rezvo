import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Camera,
  Mail,
  Phone,
  X,
  Check,
  Eye,
  EyeOff,
  Palette,
  Briefcase,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import api, { formatPrice } from '../lib/api';

const COLORS = [
  '#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const TeamPage = () => {
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    color: '#00BFA5',
    avatar_url: '',
    service_ids: [],
    show_on_booking_page: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, servicesRes] = await Promise.all([
        api.get('/team-members'),
        api.get('/services')
      ]);
      setMembers(membersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      color: COLORS[members.length % COLORS.length],
      avatar_url: '',
      service_ids: [],
      show_on_booking_page: true
    });
    setEditingMember(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (member) => {
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'staff',
      color: member.color || '#00BFA5',
      avatar_url: member.avatar_url || '',
      service_ids: member.service_ids || [],
      show_on_booking_page: member.show_on_booking_page !== false
    });
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await api.post('/upload/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar_url: response.data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        await api.patch(`/team-members/${editingMember.id}`, formData);
      } else {
        await api.post('/team-members', formData);
      }
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member');
    }
  };

  const handleDelete = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await api.delete(`/team-members/${memberId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Team</h1>
          <p className="text-navy-500 mt-1">Manage your team members and their permissions</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-teal-500 hover:bg-teal-600"
          data-testid="add-team-member-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="team-search-input"
          />
        </div>
      </div>

      {/* Team Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No team members yet</h3>
          <p className="text-navy-500 mb-6">Add your first team member to get started</p>
          <Button onClick={handleOpenAdd} className="bg-teal-500 hover:bg-teal-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              data-testid={`team-member-card-${member.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold overflow-hidden"
                    style={{ backgroundColor: member.color || '#00BFA5' }}
                  >
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase() || 'T'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{member.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(member)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-navy-500 mb-4">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {member.service_ids?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {member.service_ids.slice(0, 3).map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <span key={serviceId} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                        {service.name}
                      </span>
                    ) : null;
                  })}
                  {member.service_ids.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{member.service_ids.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-navy-500">
                  {member.show_on_booking_page !== false ? (
                    <>
                      <Eye className="w-4 h-4 text-teal-500" />
                      <span>Visible on booking page</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-gray-400" />
                      <span>Hidden from booking page</span>
                    </>
                  )}
                </div>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: member.color }}
                  title="Calendar color"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="relative w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer group"
                style={{ backgroundColor: formData.color }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  formData.name?.charAt(0)?.toUpperCase() || '?'
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-sm text-navy-500">Click to upload photo</p>
            </div>

            {/* Name */}
            <div>
              <Label>Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
                data-testid="team-member-name-input"
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+44 7123 456789"
              />
            </div>

            {/* Role */}
            <div>
              <Label>Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Picker */}
            <div>
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Calendar Color
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-navy-900 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Assigned Services
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.service_ids.includes(service.id)
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service.name}</span>
                      {formData.service_ids.includes(service.id) && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs text-navy-500">{formatPrice(service.price_pence)}</span>
                  </button>
                ))}
              </div>
              {services.length === 0 && (
                <p className="text-sm text-navy-500 mt-2">No services available. Add services first.</p>
              )}
            </div>

            {/* Show on Booking Page Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <Label className="mb-1">Show on Booking Page</Label>
                <p className="text-sm text-navy-500">
                  Allow customers to select this team member when booking
                </p>
              </div>
              <Switch
                checked={formData.show_on_booking_page}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_booking_page: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-teal-500 hover:bg-teal-600"
                data-testid="save-team-member-btn"
              >
                {editingMember ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamPage;
