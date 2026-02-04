import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import api, { formatPrice } from '../lib/api';
import { toast } from 'sonner';

const COLORS = ['#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const getRoleBadge = (role) => {
  if (role === 'admin') return 'bg-purple-100 text-purple-700';
  if (role === 'manager') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
};

const TeamPage = () => {
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [m, s] = await Promise.all([api.get('/team-members'), api.get('/services')]);
      setMembers(m.data);
      setServices(s.data);
    } catch (e) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async () => {
    try {
      const res = await api.post('/team-members', {
        name: 'New Team Member', email: '', phone: '', role: 'staff',
        color: COLORS[members.length % COLORS.length], avatar_url: '',
        service_ids: [], show_on_booking_page: true
      });
      await fetchData();
      setExpandedId(res.data.id);
      setEditingId(res.data.id);
      toast.success('Team member added');
    } catch (e) {
      toast.error('Failed to add team member');
    }
  };

  const handleStartEdit = (member) => {
    setEditForm({
      name: member.name || '', email: member.email || '', phone: member.phone || '',
      role: member.role || 'staff', color: member.color || '#00BFA5',
      avatar_url: member.avatar_url || '', service_ids: member.service_ids || [],
      show_on_booking_page: member.show_on_booking_page !== false
    });
    setEditingId(member.id);
    setExpandedId(member.id);
  };

  const handleSaveEdit = async (memberId) => {
    setSaving(true);
    try {
      await api.patch('/team-members/' + memberId, editForm);
      await fetchData();
      setEditingId(null);
      setEditForm({});
      toast.success('Team member updated');
    } catch (e) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditForm(prev => ({ ...prev, avatar_url: res.data.url }));
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await api.delete('/team-members/' + id);
      await fetchData();
      toast.success('Team member removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const handleToggleVisibility = async (member) => {
    try {
      await api.patch('/team-members/' + member.id, { show_on_booking_page: !member.show_on_booking_page });
      await fetchData();
    } catch (e) {}
  };

  const filtered = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Team Members</h1>
            <p className="text-navy-500 mt-1">Manage your team and their booking permissions</p>
          </div>
          <Button onClick={handleAddNew} className="bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/25" data-testid="add-team-member-btn">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Team Member
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50 border-0" data-testid="team-search-input" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">{members.length === 0 ? 'No team members yet' : 'No results found'}</h3>
              <p className="text-navy-500 mb-6">{members.length === 0 ? 'Add your first team member' : 'Try adjusting your search'}</p>
              {members.length === 0 && <Button onClick={handleAddNew} className="bg-teal-500 hover:bg-teal-600">Add Team Member</Button>}
            </div>
          ) : (
            <div>
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-navy-500">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.map((member) => (
                  <MemberRow 
                    key={member.id} 
                    member={member} 
                    services={services}
                    expanded={expandedId === member.id}
                    editing={editingId === member.id}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    saving={saving}
                    uploading={uploading}
                    fileInputRef={fileInputRef}
                    onExpand={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    onEdit={() => handleStartEdit(member)}
                    onSave={() => handleSaveEdit(member.id)}
                    onCancel={() => { setEditingId(null); setEditForm({}); }}
                    onDelete={() => handleDelete(member.id)}
                    onToggleVisibility={() => handleToggleVisibility(member)}
                    onUpload={handleImageUpload}
                  />
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-navy-500">Showing {filtered.length} of {members.length} team members</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const MemberRow = ({ member, services, expanded, editing, editForm, setEditForm, saving, uploading, fileInputRef, onExpand, onEdit, onSave, onCancel, onDelete, onToggleVisibility, onUpload }) => {
  const toggleService = (sid) => {
    setEditForm(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(sid) ? prev.service_ids.filter(id => id !== sid) : [...prev.service_ids, sid]
    }));
  };

  return (
    <div data-testid={'team-member-row-' + member.id}>
      <div className={'grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ' + (expanded ? 'bg-gray-50' : '')}>
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold overflow-hidden flex-shrink-0 shadow-md" style={{ backgroundColor: member.color || '#00BFA5' }}>
            {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" /> : (member.name?.charAt(0)?.toUpperCase() || 'T')}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-navy-900 truncate">{member.name}</h3>
            {member.phone && <p className="text-sm text-navy-400">{member.phone}</p>}
          </div>
        </div>
        <div className="md:col-span-3 text-navy-600 truncate">{member.email || '—'}</div>
        <div className="md:col-span-2">
          <span className={'inline-flex px-3 py-1 rounded-full text-xs font-medium ' + getRoleBadge(member.role)}>{member.role}</span>
        </div>
        <div className="md:col-span-2">
          <button onClick={onToggleVisibility} className={'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (member.show_on_booking_page !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')} data-testid={'toggle-visibility-' + member.id}>
            <span className={'w-2 h-2 rounded-full ' + (member.show_on_booking_page !== false ? 'bg-green-500' : 'bg-gray-400')}></span>
            {member.show_on_booking_page !== false ? 'Visible' : 'Hidden'}
          </button>
        </div>
        <div className="md:col-span-1 flex items-center justify-end gap-2">
          <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" data-testid={'edit-member-' + member.id}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" data-testid={'delete-member-' + member.id}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button onClick={onExpand} className="p-2 text-navy-400 hover:bg-gray-100 rounded-lg">
            <svg className={'w-4 h-4 transition-transform ' + (expanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
          {editing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer group shadow-lg" style={{ backgroundColor: editForm.color }} onClick={() => fileInputRef.current?.click()}>
                    {editForm.avatar_url ? <img src={editForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : (editForm.name?.charAt(0)?.toUpperCase() || '?')}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
                  <p className="text-sm text-navy-500 mt-2">Click to change photo</p>
                </div>
                <div>
                  <Label className="mb-2 block">Calendar Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setEditForm(prev => ({ ...prev, color: c }))} className={'w-8 h-8 rounded-full transition-all ' + (editForm.color === c ? 'ring-2 ring-offset-2 ring-navy-900 scale-110' : 'hover:scale-105')} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div><Label>Full Name *</Label><Input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="mt-1" data-testid="edit-name-input" /></div>
                <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="mt-1" /></div>
                <div><Label>Phone</Label><Input type="tel" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} className="mt-1" /></div>
                <div>
                  <Label>Role</Label>
                  <select value={editForm.role} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 bg-white">
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Assigned Services</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {services.length === 0 ? <p className="text-sm text-navy-500">No services available</p> : services.map((s) => (
                      <button key={s.id} onClick={() => toggleService(s.id)} className={'w-full p-3 rounded-lg border text-left transition-all ' + (editForm.service_ids.includes(s.id) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300 bg-white')}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{s.name}</span>
                          {editForm.service_ids.includes(s.id) && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs text-navy-500">{formatPrice(s.price_pence)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div><Label className="mb-1">Show on Booking Page</Label><p className="text-xs text-navy-500">Customers can select this person</p></div>
                  <Switch checked={editForm.show_on_booking_page} onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, show_on_booking_page: checked }))} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                  <Button onClick={onSave} disabled={saving} className="flex-1 bg-teal-500 hover:bg-teal-600" data-testid="save-member-btn">
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-navy-500 mb-3">Assigned Services</h4>
                {member.service_ids?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.service_ids.map(sid => {
                      const s = services.find(x => x.id === sid);
                      return s ? <span key={sid} className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full">{s.name}</span> : null;
                    })}
                  </div>
                ) : <p className="text-sm text-navy-400">No services assigned</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-navy-500 mb-3">Working Hours</h4>
                <p className="text-sm text-navy-600">Mon - Fri: 9:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-navy-500 mb-3">Performance</h4>
                <div className="flex gap-6">
                  <div><p className="text-2xl font-bold text-navy-900">{member.bookings_completed || 0}</p><p className="text-xs text-navy-500">Bookings</p></div>
                  <div><p className="text-2xl font-bold text-navy-900">{formatPrice(member.revenue_pence || 0)}</p><p className="text-xs text-navy-500">Revenue</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
