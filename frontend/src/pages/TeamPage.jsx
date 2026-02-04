import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Camera,
  Mail,
  Phone,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Palette,
  Briefcase,
  Eye,
  EyeOff,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import api, { formatPrice } from '../lib/api';
import { toast } from 'sonner';

const COLORS = [
  '#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const ROLE_BADGES = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
  manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Manager' },
  staff: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Staff' }
};

const TeamPage = () => {
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({});

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
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async () => {
    try {
      const newMember = {
        name: 'New Team Member',
        email: '',
        phone: '',
        role: 'staff',
        color: COLORS[members.length % COLORS.length],
        avatar_url: '',
        service_ids: [],
        show_on_booking_page: true
      };
      const res = await api.post('/team-members', newMember);
      await fetchData();
      setExpandedId(res.data.id);
      setEditingId(res.data.id);
      toast.success('Team member added. Edit their details below.');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    }
  };

  const handleStartEdit = (member) => {
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'staff',
      color: member.color || '#00BFA5',
      avatar_url: member.avatar_url || '',
      service_ids: member.service_ids || [],
      show_on_booking_page: member.show_on_booking_page !== false
    });
    setEditingId(member.id);
    setExpandedId(member.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (memberId) => {
    setSaving(true);
    try {
      await api.patch(`/team-members/${memberId}`, editForm);
      await fetchData();
      setEditingId(null);
      setEditForm({});
      toast.success('Team member updated');
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, memberId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await api.post('/upload/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditForm(prev => ({ ...prev, avatar_url: response.data.url }));
      toast.success('Photo uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await api.delete(`/team-members/${memberId}`);
      await fetchData();
      toast.success('Team member removed');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleToggleVisibility = async (member) => {
    try {
      await api.patch(`/team-members/${member.id}`, {
        show_on_booking_page: !member.show_on_booking_page
      });
      await fetchData();
      toast.success(member.show_on_booking_page ? 'Hidden from booking page' : 'Now visible on booking page');
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleService = (serviceId) => {
    setEditForm(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Team Members</h1>
            <p className="text-navy-500 mt-1">Manage your team and their booking permissions</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/25"
            data-testid="add-team-member-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-0"
                data-testid="team-search-input"
              />
            </div>
            
            {/* Role Filter */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-0">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Team Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                {members.length === 0 ? 'No team members yet' : 'No results found'}
              </h3>
              <p className="text-navy-500 mb-6">
                {members.length === 0 ? 'Add your first team member to get started' : 'Try adjusting your search or filters'}
              </p>
              {members.length === 0 && (
                <Button onClick={handleAddNew} className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-navy-500">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <div key={member.id} data-testid={`team-member-row-${member.id}`}>
                    {/* Main Row */}
                    <div 
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                        expandedId === member.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <div className="md:col-span-4 flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold overflow-hidden flex-shrink-0 shadow-md"
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
                        <div className="min-w-0">
                          <h3 className="font-semibold text-navy-900 truncate">{member.name}</h3>
                          {member.phone && (
                            <p className="text-sm text-navy-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="md:col-span-3 flex items-center gap-2 text-navy-600">
                        <Mail className="w-4 h-4 text-navy-400 flex-shrink-0 hidden md:block" />
                        <span className="truncate">{member.email || '—'}</span>
                      </div>

                      {/* Role */}
                      <div className="md:col-span-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          ROLE_BADGES[member.role]?.bg || 'bg-gray-100'
                        } ${ROLE_BADGES[member.role]?.text || 'text-gray-700'}`}>
                          {ROLE_BADGES[member.role]?.label || member.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <button
                          onClick={() => handleToggleVisibility(member)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            member.show_on_booking_page !== false
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          data-testid={`toggle-visibility-${member.id}`}
                        >
                          {member.show_on_booking_page !== false ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Visible
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Hidden
                            </>
                          )}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                          data-testid={`edit-member-${member.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          data-testid={`delete-member-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                          className="p-2 text-navy-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title={expandedId === member.id ? 'Collapse' : 'Expand'}
                        >
                          {expandedId === member.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Edit Row */}
                    {expandedId === member.id && (
                      <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
                        {editingId === member.id ? (
                          /* Edit Mode */
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Avatar & Basic Info */}
                            <div className="space-y-6">
                              <div className="flex flex-col items-center">
                                <div 
                                  className="relative w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer group shadow-lg"
                                  style={{ backgroundColor: editForm.color }}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  {editForm.avatar_url ? (
                                    <img 
                                      src={editForm.avatar_url} 
                                      alt="Avatar" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    editForm.name?.charAt(0)?.toUpperCase() || '?'
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
                                  onChange={(e) => handleImageUpload(e, member.id)}
                                  className="hidden"
                                />
                                <p className="text-sm text-navy-500 mt-2">Click to change photo</p>
                              </div>

                              {/* Color Picker */}
                              <div>
                                <Label className="flex items-center gap-2 mb-2">
                                  <Palette className="w-4 h-4" />
                                  Calendar Color
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setEditForm(prev => ({ ...prev, color }))}
                                      className={`w-8 h-8 rounded-full transition-all ${
                                        editForm.color === color ? 'ring-2 ring-offset-2 ring-navy-900 scale-110' : 'hover:scale-105'
                                      }`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Middle Column - Contact Info */}
                            <div className="space-y-4">
                              <div>
                                <Label>Full Name *</Label>
                                <Input
                                  required
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Enter name"
                                  className="mt-1"
                                  data-testid="edit-name-input"
                                />
                              </div>
                              <div>
                                <Label>Email Address</Label>
                                <Input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="email@example.com"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Phone Number</Label>
                                <Input
                                  type="tel"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="+44 7123 456789"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Select 
                                  value={editForm.role} 
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Right Column - Services & Toggle */}
                            <div className="space-y-6">
                              <div>
                                <Label className="flex items-center gap-2 mb-3">
                                  <Briefcase className="w-4 h-4" />
                                  Assigned Services
                                </Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {services.length === 0 ? (
                                    <p className="text-sm text-navy-500">No services available</p>
                                  ) : (
                                    services.map((service) => (
                                      <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => toggleService(service.id)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                                          editForm.service_ids.includes(service.id)
                                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">{service.name}</span>
                                          {editForm.service_ids.includes(service.id) && (
                                            <Check className="w-4 h-4" />
                                          )}
                                        </div>
                                        <span className="text-xs text-navy-500">{formatPrice(service.price_pence)}</span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Visibility Toggle */}
                              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                <div>
                                  <Label className="mb-1">Show on Booking Page</Label>
                                  <p className="text-xs text-navy-500">
                                    Customers can select this person
                                  </p>
                                </div>
                                <Switch
                                  checked={editForm.show_on_booking_page}
                                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, show_on_booking_page: checked }))}
                                />
                              </div>

                              {/* Save/Cancel Buttons */}
                              <div className="flex gap-3 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => handleSaveEdit(member.id)}
                                  disabled={saving}
                                  className="flex-1 bg-teal-500 hover:bg-teal-600"
                                  data-testid="save-member-btn"
                                >
                                  {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                  )}
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Services */}
                            <div>
                              <h4 className="text-sm font-medium text-navy-500 mb-3">Assigned Services</h4>
                              {member.service_ids?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {member.service_ids.map(serviceId => {
                                    const service = services.find(s => s.id === serviceId);
                                    return service ? (
                                      <span key={serviceId} className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                                        {service.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-navy-400">No services assigned</p>
                              )}
                            </div>

                            {/* Working Hours */}
                            <div>
                              <h4 className="text-sm font-medium text-navy-500 mb-3">Working Hours</h4>
                              <p className="text-sm text-navy-600">Mon - Fri: 9:00 AM - 5:00 PM</p>
                            </div>

                            {/* Stats */}
                            <div>
                              <h4 className="text-sm font-medium text-navy-500 mb-3">Performance</h4>
                              <div className="flex gap-6">
                                <div>
                                  <p className="text-2xl font-bold text-navy-900">{member.bookings_completed || 0}</p>
                                  <p className="text-xs text-navy-500">Bookings</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-navy-900">{formatPrice(member.revenue_pence || 0)}</p>
                                  <p className="text-xs text-navy-500">Revenue</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-navy-500">
                  Showing {filteredMembers.length} of {members.length} team members
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TeamPage;
