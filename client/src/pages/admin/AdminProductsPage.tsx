import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { tradeService } from '../../services/trade.service';
import { Product } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Package, PlusCircle, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
    category: 'Toys & Gifts',
    status: 'ACTIVE',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchProducts = async () => {
    try {
      const res = await tradeService.getProducts();
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: 0,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
      category: 'Toys & Gifts',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price || 0,
      stock: prod.stock || 100,
      image: prod.image,
      category: prod.category || 'Toys & Gifts',
      status: prod.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, form);
        setMessage(`Product "${form.name}" updated successfully!`);
      } else {
        await adminService.createProduct(form);
        setMessage(`Product "${form.name}" created successfully!`);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Catalog Product',
      message: `Are you sure you want to delete "${name}" from the product trading catalog?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.deleteProduct(id);
          setMessage(`Product "${name}" deleted.`);
          fetchProducts();
        } catch (err: any) {
          setError('Failed to delete product.');
        }
      },
    });
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" /> Marketplace Product Catalog
          </h1>
          <p className="text-xs text-slate-400">Configure lifestyle products available for user trading.</p>
        </div>

        <Button variant="gold" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add New Product
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading product catalog...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No products created yet.</p>
        ) : (
          <Table headers={['Product Image & Name', 'Category', 'Quantity (Stock)', 'Status', 'Actions']}>
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-brand-border bg-black/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-300 font-medium">{p.category}</td>
                <td className="px-5 py-3 font-bold text-amber-400 text-xs">
                  {p.stock || 100} units
                </td>
                <td className="px-5 py-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-brand-card border border-brand-border text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        confirmText="Delete Product"
      />

      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title={editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Textarea
              label="Product Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <Input
              label="Quantity (Stock)"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              required
            />

            <ImageUploadPicker
              label="Product Image (Upload or Paste URL)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />

            <Select
              label="Category"
              options={[
                { label: 'Toys & Gifts', value: 'Toys & Gifts' },
                { label: 'Personal Wellness', value: 'Personal Wellness' },
                { label: 'Lifestyle & Home', value: 'Lifestyle & Home' },
                { label: 'Personal Care', value: 'Personal Care' },
                { label: 'Luxury Accessories', value: 'Luxury Accessories' },
              ]}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={actionLoading}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
