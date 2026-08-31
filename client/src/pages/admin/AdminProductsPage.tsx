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
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Package, PlusCircle, Edit, Trash2, CheckCircle2, AlertCircle, Eye, ArrowRightLeft, EyeOff, LayoutGrid } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOBBY' | 'HIDDEN'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    sectionType: 'LOBBY' | 'HIDDEN';
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: '',
    description: '',
    price: 0,
    image: '/images/products/doll.jpg',
    category: 'Toys & Gifts',
    sectionType: 'LOBBY',
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

  const handleOpenAdd = (defaultSection: 'LOBBY' | 'HIDDEN' = 'LOBBY') => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: 0,
      image: '/images/products/doll.jpg',
      category: 'Toys & Gifts',
      sectionType: defaultSection,
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
      image: prod.image,
      category: prod.category || 'Toys & Gifts',
      sectionType: (prod.sectionType || (prod.isMainPage ? 'LOBBY' : 'HIDDEN')) as 'LOBBY' | 'HIDDEN',
      status: prod.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleToggleSection = async (product: Product) => {
    setError('');
    const currentSec = product.sectionType || (product.isMainPage ? 'LOBBY' : 'HIDDEN');
    const targetSec = currentSec === 'LOBBY' ? 'HIDDEN' : 'LOBBY';

    try {
      await adminService.updateProduct(product._id, {
        sectionType: targetSec,
        isMainPage: targetSec === 'LOBBY',
      });
      setMessage(`Product "${product.name}" moved to ${targetSec === 'LOBBY' ? 'Main Lobby' : 'Hidden Products Catalog'}.`);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to switch product section.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    const payload = {
      ...form,
      isMainPage: form.sectionType === 'LOBBY',
    };

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload);
        setMessage(`Product "${form.name}" updated successfully!`);
      } else {
        await adminService.createProduct(payload);
        setMessage(`Product "${form.name}" created successfully in ${form.sectionType === 'LOBBY' ? 'Main Lobby' : 'Hidden Products Catalog'}!`);
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
      message: `Are you sure you want to delete "${name}" from the trading catalog?`,
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

  const lobbyProducts = products.filter((p) => (p.sectionType ? p.sectionType === 'LOBBY' : p.isMainPage !== false));
  const hiddenProducts = products.filter((p) => (p.sectionType ? p.sectionType === 'HIDDEN' : p.isMainPage === false));

  const filteredProducts = products.filter((p) => {
    const sec = p.sectionType || (p.isMainPage !== false ? 'LOBBY' : 'HIDDEN');
    if (activeTab === 'LOBBY') return sec === 'LOBBY';
    if (activeTab === 'HIDDEN') return sec === 'HIDDEN';
    return true; // ALL
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-600" /> Marketplace Product Catalog
          </h1>
          <p className="text-xs text-slate-500">Partition products into Main Lobby (max 4 on trade page) and Hidden Products separately.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => handleOpenAdd('LOBBY')}>
            + Add Lobby Product
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<EyeOff className="w-4 h-4" />} onClick={() => handleOpenAdd('HIDDEN')}>
            + Add Hidden Product
          </Button>
        </div>
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

      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> All Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('LOBBY')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'LOBBY'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Main Lobby Products</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{lobbyProducts.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('HIDDEN')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'HIDDEN'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Hidden Products</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{hiddenProducts.length}</span>
        </button>
      </div>

      <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading product catalog...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No products found in this section.</p>
        ) : (
          <Table headers={['Product Image & Name', 'Category', 'Display Section', 'Status', 'Actions']}>
            {filteredProducts.map((p) => {
              const sec = p.sectionType || (p.isMainPage !== false ? 'LOBBY' : 'HIDDEN');
              const isLobby = sec === 'LOBBY';

              return (
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
                    <div className="flex items-center gap-2">
                      {isLobby ? (
                        <Badge variant="vip">MAIN LOBBY 🌟</Badge>
                      ) : (
                        <Badge variant="neutral">HIDDEN CATALOG 🙈</Badge>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleSection(p)}
                        className="px-2 py-1 bg-slate-100 hover:bg-pink-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-pink-600 rounded-lg transition-colors flex items-center gap-1"
                        title={isLobby ? 'Move to Hidden Products' : 'Move to Main Lobby'}
                      >
                        <ArrowRightLeft className="w-3 h-3 text-pink-600" />
                        {isLobby ? 'To Hidden' : 'To Lobby'}
                      </button>
                    </div>
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
              );
            })}
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
              <h3 className="text-lg font-black text-slate-900">{viewingProduct.name}</h3>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Category: <strong className="text-slate-800">{viewingProduct.category}</strong></span>
                <span>•</span>
                <span>Section: <strong className="text-pink-600">{viewingProduct.sectionType || (viewingProduct.isMainPage !== false ? 'LOBBY' : 'HIDDEN')}</strong></span>
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
          title={editingProduct ? 'Edit Catalog Product' : `Add New ${form.sectionType === 'LOBBY' ? 'Main Lobby' : 'Hidden'} Product`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Select
              label="Display Section / Partition"
              options={[
                { label: 'Main Lobby (Displayed on Trade Page — Max 4 Cards)', value: 'LOBBY' },
                { label: 'Hidden Products Catalog (Drawer / Hidden Catalog)', value: 'HIDDEN' },
              ]}
              value={form.sectionType}
              onChange={(e) => setForm({ ...form, sectionType: e.target.value as any })}
            />

            <Textarea
              label="Product Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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

