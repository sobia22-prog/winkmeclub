import React, { useState, useEffect } from 'react';
import { girlProfileService, GirlProfileData } from '../../services/girlProfile.service';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import {
  Heart,
  Plus,
  Trash2,
  Edit,
  Star,
  Sparkles,
  Tag,
  MapPin,
  CheckCircle2,
  PlusCircle,
  X,
} from 'lucide-react';

export const AdminGirlProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5.0);
  const [height, setHeight] = useState("5'6\"");
  const [weight, setWeight] = useState('52 kg');
  const [chestCircumference, setChestCircumference] = useState('34B');
  const [initialLikes, setInitialLikes] = useState<number>(500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('Mumbai');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState('VIP, Featured');
  const [verificationLabel, setVerificationLabel] = useState('ID Verified');
  const [details, setDetails] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // New Category Inline Form State
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfilesAndCategories = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        girlProfileService.getAdminProfiles(),
        girlProfileService.getCategories(),
      ]);

      if (pRes.data.success) setProfiles(pRes.data.profiles);
      if (cRes.data.success) setCategories(cRes.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilesAndCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setRating(5.0);
    setHeight("5'6\"");
    setWeight('52 kg');
    setChestCircumference('34B');
    setInitialLikes(500);
    setSelectedCategories(['Sexy', 'Hot']);
    setLocation('Mumbai');
    setBio('');
    setTags('VIP, Featured');
    setVerificationLabel('ID Verified');
    setDetails('');
    setProfileImage('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingId(p._id);
    setName(p.name);
    setRating(p.rating ?? 5.0);
    setHeight(p.height || "5'6\"");
    setWeight(p.weight || '52 kg');
    setChestCircumference(p.chestCircumference || '34B');
    setInitialLikes(p.initialLikes ?? 500);
    setSelectedCategories(p.categories || []);
    setLocation(p.location || 'Mumbai');
    setBio(p.bio || '');
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '');
    setVerificationLabel(p.verificationLabel || 'ID Verified');
    setDetails(p.details || '');
    setProfileImage(p.profileImage || '');
    setError('');
    setIsModalOpen(true);
  };

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await girlProfileService.createCategory(newCategoryName.trim());
      if (res.data.success) {
        const catObj = res.data.category;
        setCategories((prev) => [...prev, catObj]);
        if (!selectedCategories.includes(catObj.name)) {
          setSelectedCategories((prev) => [...prev, catObj.name]);
        }
        setNewCategoryName('');
        setShowAddCategoryInput(false);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !profileImage) {
      setError('Name and Profile Image are required.');
      return;
    }
    setSubmitting(true);
    setError('');

    const payload: GirlProfileData = {
      name,
      rating,
      height,
      weight,
      chestCircumference,
      initialLikes,
      categories: selectedCategories,
      location,
      bio,
      tags,
      verificationLabel,
      details,
      profileImage,
    };

    try {
      if (editingId) {
        const res = await girlProfileService.updateProfile(editingId, payload);
        if (res.data.success) {
          setMessage(`Profile "${name}" updated successfully!`);
          setIsModalOpen(false);
          fetchProfilesAndCategories();
        }
      } else {
        const res = await girlProfileService.createProfile(payload);
        if (res.data.success) {
          setMessage(`Girl profile "${name}" created successfully!`);
          setIsModalOpen(false);
          fetchProfilesAndCategories();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string, girlName: string) => {
    if (!window.confirm(`Are you sure you want to delete profile "${girlName}"?`)) return;
    try {
      const res = await girlProfileService.deleteProfile(id);
      if (res.data.success) {
        setMessage(`Profile "${girlName}" deleted.`);
        fetchProfilesAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Girls Profile Management
          </h1>
          <p className="text-xs text-slate-400">
            CRUD curated girl profiles shown to members on the Home feed and Match discovery cards.
          </p>
        </div>

        <Button
          variant="gold"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Add New Girl Profile
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Profiles Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading girls profiles catalog...</Card>
      ) : profiles.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500 space-y-3">
          <p>No curated girl profiles added yet.</p>
          <Button variant="gold" size="sm" onClick={handleOpenCreate}>
            Create First Profile
          </Button>
        </Card>
      ) : (
        <Table headers={['Girl Profile', 'Location', 'Metrics (H/W/C)', 'Categories', 'Rating & Likes', 'Verification', 'Actions']}>
          {profiles.map((p) => (
            <tr key={p._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={p.profileImage}
                    alt={p.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-amber-500/40 shadow-md shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.bio || 'No bio'}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> {p.location || 'Mumbai'}
                </span>
              </td>
              <td className="px-5 py-3 text-[11px] text-slate-300 font-mono">
                {p.height || "5'6\""} • {p.weight || '52kg'} • {p.chestCircumference || '34B'}
              </td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1">
                  {(p.categories || []).map((cat: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg">
                      {cat}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-3 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating || 5.0}
                  <span className="text-[10px] text-rose-400 flex items-center gap-0.5 ml-1 font-semibold">
                    <Heart className="w-3 h-3 fill-rose-400" /> {p.initialLikes || 500}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3">
                <Badge variant="verified" size="sm">{p.verificationLabel || 'ID Verified'}</Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(p._id, p.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* CREATE / EDIT GIRL PROFILE MODAL (Exact Matching Fields from Prompt & Screenshots) */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? `Edit Girl Profile — ${name}` : 'Add New Girl Profile'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-semibold">
                {error}
              </div>
            )}

            {/* Name & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                placeholder="5.0"
                value={rating.toString()}
                onChange={(e) => setRating(Number(e.target.value))}
                required
              />
            </div>

            {/* Height, Weight, Chest Circumference, Initial Likes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Height"
                placeholder="e.g. 5'6&quot;"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Input
                label="Weight"
                placeholder="e.g. 52 kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Input
                label="Chest Circumference"
                placeholder="e.g. 34B"
                value={chestCircumference}
                onChange={(e) => setChestCircumference(e.target.value)}
              />
              <Input
                label="Initial Likes"
                type="number"
                placeholder="500"
                value={initialLikes.toString()}
                onChange={(e) => setInitialLikes(Number(e.target.value))}
              />
            </div>

            {/* Categories (Select Multiple & Add New Category) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Categories (Select Multiple)
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat._id || cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}

                {!showAddCategoryInput ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryInput(true)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> + Add new category
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-brand-surface border border-amber-500/40 rounded-xl p-1">
                    <input
                      type="text"
                      placeholder="New category..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-transparent px-2.5 py-1 text-xs text-slate-100 focus:outline-none w-32 font-medium"
                    />
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleCreateNewCategory}
                      isLoading={addingCategory}
                      className="py-1 px-2.5"
                    >
                      Add
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(false)}
                      className="p-1 text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                placeholder="Delhi / Mumbai / Kolkata"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label="Tags (comma separated)"
                placeholder="VIP, Featured, Hot"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Verification Label & Short Bio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Verification label"
                placeholder="ID verified"
                value={verificationLabel}
                onChange={(e) => setVerificationLabel(e.target.value)}
              />
              <Textarea
                label="Short bio"
                placeholder="Short bio sentence..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
              />
            </div>

            {/* Details */}
            <Textarea
              label="Details"
              placeholder="Write something about her..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />

            {/* Profile Image Upload Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Profile Image</label>
              <ImageUploadPicker
                value={profileImage}
                onChange={(url) => setProfileImage(url)}
                label=""
                helperText="Click to upload profile image"
                aspectRatio="square"
              />
            </div>

            {/* Footer Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                type="submit"
                isLoading={submitting}
              >
                {editingId ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
