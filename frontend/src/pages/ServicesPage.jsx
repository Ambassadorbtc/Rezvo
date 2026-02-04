import { useState, useEffect } from 'react';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Plus, Scissors, Pencil, Trash2, Loader2, Clock, PoundSterling } from 'lucide-react';
import { toast } from 'sonner';

const ServicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
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
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await api.delete(`/services/${serviceId}`);
      toast.success('Service deleted');
      loadServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6" data-testid="services-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-white/50 mt-1">{services.length} services</p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-gradient-blaze hover:opacity-90 text-white rounded-full btn-press"
            data-testid="add-service-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card className="bg-obsidian-paper border-white/5">
            <CardContent className="py-12 text-center">
              <Scissors className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 mb-4">No services yet</p>
              <Button onClick={() => openDialog()} className="bg-blaze hover:bg-blaze-hover text-white" data-testid="empty-add-service-btn">
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-obsidian-paper border-white/5 card-hover group"
                data-testid={`service-card-${service.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blaze/10 flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-blaze" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(service)}
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                        data-testid={`edit-service-${service.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                        data-testid={`delete-service-${service.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  
                  {service.description && (
                    <p className="text-sm text-white/50 mb-4 line-clamp-2">{service.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{service.duration_min} min</span>
                    </div>
                    <div className="text-xl font-bold text-accent-teal tabular-nums">
                      {formatPrice(service.price_pence)}
                    </div>
                  </div>

                  {service.deposit_required && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-warning/10 text-warning text-sm">
                      Deposit: {formatPrice(service.deposit_amount_pence)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-obsidian-paper border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Haircut & Beard Trim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-obsidian border-white/10"
                  data-testid="service-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="service-price-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-obsidian border-white/10" data-testid="service-duration-select">
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
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-obsidian border-white/10 resize-none"
                  rows={3}
                  data-testid="service-description-input"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian border border-white/5">
                <div>
                  <Label className="text-base">Require Deposit?</Label>
                  <p className="text-sm text-white/50">Reduces no-shows</p>
                </div>
                <Switch
                  checked={depositRequired}
                  onCheckedChange={setDepositRequired}
                  data-testid="service-deposit-toggle"
                />
              </div>

              {depositRequired && (
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount (£)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="service-deposit-amount-input"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blaze hover:bg-blaze-hover text-white"
                data-testid="save-service-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingService ? 'Update' : 'Add Service'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ServicesPage;
