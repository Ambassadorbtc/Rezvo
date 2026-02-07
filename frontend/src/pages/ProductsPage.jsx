import { useState, useEffect } from 'react';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Search,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_pence: '',
    sku: '',
    stock_quantity: '',
    image_url: '',
    category: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price_pence: parseInt(formData.price_pence) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0
    };

    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, productData);
        toast.success('Product updated!');
      } else {
        await api.post('/products', productData);
        toast.success('Product created!');
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price_pence: product.price_pence?.toString() || '',
      sku: product.sku || '',
      stock_quantity: product.stock_quantity?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_pence: '',
      sku: '',
      stock_quantity: '',
      image_url: '',
      category: ''
    });
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-5 md:p-8 max-w-6xl mx-auto" data-testid="products-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 anim-fade-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-navy-900">Products</h1>
            <p className="text-navy-400 mt-1">Manage your products for sale</p>
          </div>
          <Button
            onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 anim-fade-up anim-d1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 rounded-xl bg-white border-gray-200"
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Add products to sell to your customers</p>
              <Button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="bg-white text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white hover:bg-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Stock Badge */}
                  {product.stock_quantity !== undefined && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                      product.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' :
                      product.stock_quantity > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <CardContent className="p-4">
                  {product.category && (
                    <span className="text-xs text-teal-600 font-medium">{product.category}</span>
                  )}
                  <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-teal-600">{formatPrice(product.price_pence)}</span>
                    {product.sku && (
                      <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setEditingProduct(null); }}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <Label className="text-gray-700">Product Name *</Label>
                  <Input
                    placeholder="e.g., Hair Serum"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-700">Description</Label>
                  <textarea
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">Price (pence) *</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="1500"
                        value={formData.price_pence}
                        onChange={(e) => setFormData({ ...formData, price_pence: e.target.value })}
                        className="pl-9 rounded-xl"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      = {formatPrice(parseInt(formData.price_pence) || 0)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-700">Stock Quantity</Label>
                    <div className="relative mt-1">
                      <Archive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="100"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className="pl-9 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">SKU</Label>
                    <div className="relative mt-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="PROD-001"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700">Category</Label>
                    <Input
                      placeholder="Hair Care"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Image URL</Label>
                  <div className="relative mt-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); setEditingProduct(null); }}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
