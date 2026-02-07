import { useState, useEffect } from 'react';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Plus, Scissors, Pencil, Trash2, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ServicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDuration('60');
    setDescription('');
    setDepositRequired(false);
    setDepositAmount('');
    setEditingService(null);
  };

  const openDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setPrice((service.price_pence / 100).toString());
      setDuration(service.duration_min.toString());
      setDescription(service.description || '');
      setDepositRequired(service.deposit_required);
      setDepositAmount(service.deposit_amount_pence ? (service.deposit_amount_pence / 100).toString() : '');
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !price) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        price_pence: Math.round(parseFloat(price) * 100),
        duration_min: parseInt(duration),
        description,
        deposit_required: depositRequired,
        deposit_amount_pence: depositRequired ? Math.round(parseFloat(depositAmount) * 100) : 0,
      };

      if (editingService) {
        await api.patch(`/services/${editingService.id}`, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service added');
      }

      setDialogOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    setDeleteConfirm(serviceId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await api.delete(`/services/${deleteConfirm}`);
      toast.success('Service deleted');
      loadServices();
    } catch (error) {
      toast.error('Failed to delete service');
    } finally {
      setDeleteConfirm(null);
    }
  };

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
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="services-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 anim-fade-up">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Services</h1>
            <p className="text-navy-400 mt-1">{services.length} services</p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-button btn-press"
            data-testid="add-service-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center anim-fade-up anim-d1">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-navy-500 mb-4">No services yet</p>
            <Button onClick={() => openDialog()} className="bg-teal-500 hover:bg-teal-600 text-white rounded-full" data-testid="empty-add-service-btn">
              Add Your First Service
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border border-gray-100 group hover:shadow-lg transition-all hover:scale-[1.01] anim-fade-up anim-d${Math.min(i + 1, 8)}`}
                data-testid={`service-card-${service.id}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(service)} className="h-8 w-8 text-navy-400 hover:text-navy-700 hover:bg-gray-100" data-testid={`edit-service-${service.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-8 w-8 text-navy-400 hover:text-red-600 hover:bg-red-50" data-testid={`delete-service-${service.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-lg text-navy-900 mb-2">{service.name}</h3>
                  
                  {service.description && (
                    <p className="text-sm text-navy-500 mb-4 line-clamp-2">{service.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-navy-500">
                      <div className="w-7 h-7 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm">{service.duration_min} min</span>
                    </div>
                    <div className="text-xl font-bold text-teal-600 tabular-nums">
                      {formatPrice(service.price_pence)}
                    </div>
                  </div>

                  {service.deposit_required && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm">
                      Deposit: {formatPrice(service.deposit_amount_pence)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white border-0 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-navy-900">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-navy-700 font-medium">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Haircut & Beard Trim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-cream border-gray-200 rounded-xl"
                  data-testid="service-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-navy-700 font-medium">Price (£) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl"
                    data-testid="service-price-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy-700 font-medium">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-cream border-gray-200 rounded-xl" data-testid="service-duration-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-navy-700 font-medium">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-cream border-gray-200 rounded-xl resize-none"
                  rows={3}
                  data-testid="service-description-input"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                <div>
                  <Label className="text-navy-700 font-medium">Require Deposit?</Label>
                  <p className="text-sm text-navy-500">Reduces no-shows</p>
                </div>
                <Switch
                  checked={depositRequired}
                  onCheckedChange={setDepositRequired}
                  data-testid="service-deposit-toggle"
                />
              </div>

              {depositRequired && (
                <div className="space-y-2">
                  <Label htmlFor="depositAmount" className="text-navy-700 font-medium">Deposit Amount (£)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl"
                    data-testid="service-deposit-amount-input"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-200 rounded-full">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                data-testid="save-service-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingService ? 'Update' : 'Add Service'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Delete Service</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 py-4">Are you sure you want to delete this service? This action cannot be undone.</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ServicesPage;
