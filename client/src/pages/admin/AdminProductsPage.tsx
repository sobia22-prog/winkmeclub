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
import { Package, PlusCircle, Edit, Trash2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    image: '/images/products/doll.jpg',
    category: 'Toys & Gifts',
    status: 'ACTIVE',
    isMainPage: false,
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
      image: '/images/products/doll.jpg',
      category: 'Toys & Gifts',
      status: 'ACTIVE',
      isMainPage: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price || 0,
      image: prod.image,
      category: prod.category || 'Toys & Gifts',
      status: prod.status || 'ACTIVE',
      isMainPage: Boolean(prod.isMainPage),
    });
    setShowModal(true);
  };

  const handleToggleMainPage = async (product: Product) => {
    setError('');
    const newStatus = !product.isMainPage;
    try {
      await adminService.updateProduct(product._id, { isMainPage: newStatus });
      setMessage(`"${product.name}" moved to ${newStatus ? 'Main Trades Page' : 'Additional Catalog Drawer'}.`);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product display location.');
    }
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
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-600" /> Marketplace Product Catalog
          </h1>
          <p className="text-xs text-slate-500">Configure lifestyle products shown on the Main Trades Page vs Additional Catalog Drawer.</p>
        </div>

        <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add New Product
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading product catalog...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No products created yet.</p>
        ) : (
          <Table headers={['Product Image & Name', 'Category', 'Frontend Location', 'Status', 'Actions']}>
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-700 font-medium">{p.category}</td>
                <td className="px-5 py-3">
                  {p.isMainPage ? (
                    <button
                      onClick={() => handleToggleMainPage(p)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-all cursor-pointer shadow-sm"
                      title="Click to move to Additional Catalog Drawer"
                    >
                      ★ MAIN TRADES PAGE
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleMainPage(p)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 transition-all cursor-pointer"
                      title="Click to feature on Main Trades Page"
                    >
                      📁 CATALOG DRAWER
                    </button>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProduct(p)}
                      className="p-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 hover:bg-pink-100 transition-colors"
                      title="View Product Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-pink-300 transition-colors shadow-sm"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5 text-pink-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
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

      {/* View Product Details Modal */}
      {viewingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setViewingProduct(null)}
          title="Product Details"
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={viewingProduct.image}
                alt={viewingProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">{viewingProduct.name}</h3>
                {viewingProduct.isMainPage ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-50 text-pink-700 border border-pink-200">
                    ★ MAIN TRADES PAGE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    📁 CATALOG DRAWER
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Category: <strong className="text-slate-800">{viewingProduct.category}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-600">{viewingProduct.status}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Description</span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {viewingProduct.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

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

            <Select
              label="Frontend Display Location"
              options={[
                { label: '★ Show on Main Trades Page (Featured 4 Grid)', value: 'MAIN' },
                { label: '📁 Show in Additional Catalog Drawer (Hidden List)', value: 'CATALOG' },
              ]}
              value={form.isMainPage ? 'MAIN' : 'CATALOG'}
              onChange={(e) => setForm({ ...form, isMainPage: e.target.value === 'MAIN' })}
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
              <Button variant="primary" type="submit" isLoading={actionLoading}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
