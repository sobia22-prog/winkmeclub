import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { tradeService } from '../../services/trade.service';
import { Product } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Package, PlusCircle, Trash2, Edit } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 1000,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80',
    category: 'Lifestyle & Home',
    status: 'ACTIVE',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await tradeService.getProducts();
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditProduct(null);
    setForm({
      name: '',
      description: '',
      price: 1000,
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80',
      category: 'Lifestyle & Home',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditProduct(prod);
    setForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      image: prod.image,
      category: prod.category,
      status: prod.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editProduct) {
        await adminService.updateProduct(editProduct._id, form);
      } else {
        await adminService.createProduct(form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await adminService.deleteProduct(id);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" /> Marketplace Product Catalog
          </h1>
          <p className="text-xs text-slate-400">Configure lifestyle products available for user trading.</p>
        </div>

        <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenCreate}>
          Create New Product
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading catalog...</Card>
      ) : (
        <Table headers={['Product Image', 'Name', 'Category', 'Price', 'Status', 'Actions']}>
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3">
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
              </td>
              <td className="px-5 py-3 font-bold text-slate-100">{p.name}</td>
              <td className="px-5 py-3 text-slate-400">{p.category}</td>
              <td className="px-5 py-3 font-bold text-amber-400">
                ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3">
                {p.status === 'ACTIVE' ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="neutral">INACTIVE</Badge>}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 bg-brand-surface border border-brand-border rounded-lg text-slate-300 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title={editProduct ? 'Edit Product' : 'Create Marketplace Product'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (₹)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
              />
              <Input
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <ImageUploadPicker
              label="Product Image Upload"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              helperText="Upload photo for product catalog item"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={actionLoading}>
                Save Product
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
