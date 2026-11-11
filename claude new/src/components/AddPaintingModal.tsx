import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Download,
  Trash2,
  HardDrive,
  RefreshCw,
  Copy,
  Save,
} from 'lucide-react';
import { Painting, PaintingCategory } from '../types';
import { compressImage } from '../utils/artStorage';
import { hasColorFamilyFeature, COLOR_FAMILY_OPTIONS } from '../utils/colorFamily';

export const AddPaintingModal: React.FC = () => {
  const {
    isAddPaintingOpen,
    setIsAddPaintingOpen,
    addPainting,
    deletePainting,
    paintings,
    formatPrice,
    exportAllPaintings,
    copyArtDataToClipboard,
    syncPaintingsToServer,
    importPaintingsFile,
  } = useShop();

  const [modalMode, setModalMode] = useState<'upload' | 'manage'>('upload');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<PaintingCategory>('cars');
  const [basePrice, setBasePrice] = useState<number>(800);
  const [tag, setTag] = useState('New Original');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('Hand-Painted Acrylic & Texture on Stretched Canvas');
  const [enableColorFamily, setEnableColorFamily] = useState(false);

  // Image source: file upload or url
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'url'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddPaintingOpen) {
        setIsAddPaintingOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddPaintingOpen, setIsAddPaintingOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isAddPaintingOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddPaintingOpen]);

  if (!isAddPaintingOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setImageFileName(file.name);
    setIsCompressing(true);

    try {
      // Compress and resize image to prevent browser storage quota errors
      const compressed = await compressImage(file, 1200, 0.82);
      setImagePreview(compressed);
    } catch (err) {
      console.warn('Fallback to direct file read:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUrlApply = () => {
    setError(null);
    if (!imageUrlInput.trim()) {
      setError('Please enter a valid image URL');
      return;
    }
    setImagePreview(imageUrlInput.trim());
    setImageFileName('Web Image');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importPaintingsFile(file);
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a painting title.');
      return;
    }

    if (!imagePreview) {
      setError('Please upload an image or provide an image URL for your painting.');
      return;
    }

    const price = Number(basePrice) || 800;
    const smallPriceDelta = -100;
    const framePriceDelta = 300;

    const newPainting: Painting = {
      id: `custom-art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      subtitle: subtitle.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Canvas Art`,
      category,
      medium: medium.trim() || 'Hand-Painted Mixed Media on Canvas',
      year: new Date().getFullYear(),
      basePrice: price,
      currency: 'PKR',
      image: imagePreview,
      tag: tag.trim() || 'Original Artwork',
      description:
        description.trim() ||
        `Authentic hand-painted ${category} artwork on heavyweight stretched canvas. Individually crafted with rich pigments and texture.`,
      dimensions: '12 × 12 in (30 × 30 cm)',
      surface: 'Heavyweight Stretched Canvas',
      inStockCount: 3,
      leadTime: 'Delivered across GIKI within 2–3 days',
      rating: 5.0,
      reviewCount: 0,
      variants: [
        {
          id: `v-lrg-${Date.now()}`,
          name: '12 × 12 in Canvas (Large)',
          size: '12 × 12 in',
          frame: 'Deep Stretched Canvas',
          priceDelta: 0,
          inStock: true,
        },
        {
          id: `v-sml-${Date.now()}`,
          name: '6 × 6 in Canvas (Small)',
          size: '6 × 6 in',
          frame: 'Compact Gallery Wrap',
          priceDelta: smallPriceDelta,
          inStock: true,
        },
        {
          id: `v-frm-${Date.now()}`,
          name: 'Photo Frame Edition (9.5 × 13.5 in)',
          size: '9.5 × 13.5 in',
          frame: 'Black Glass Framed Canvas',
          priceDelta: framePriceDelta,
          inStock: true,
        },
      ],
      reviews: [],
      colorFamily:
        hasColorFamilyFeature({ name: name.trim() }) || enableColorFamily
          ? ['Red', 'Yellow', 'Orange', 'Blue', 'White', 'Navy Blue', 'Green']
          : undefined,
    };

    addPainting(newPainting);
    setIsAddPaintingOpen(false);

    // Reset form
    setName('');
    setSubtitle('');
    setImagePreview('');
    setImageFileName('');
    setImageUrlInput('');
    setDescription('');
    setEnableColorFamily(false);

    // Scroll to collection
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsAddPaintingOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FBFBFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl text-stone-900 font-normal">
                Studio Super Power: Artworks & Storage
              </h3>
              <p className="text-[11px] text-stone-500">
                Permanent IndexedDB database storage · Unlimited artworks
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddPaintingOpen(false)}
            className="p-1.5 text-stone-500 hover:text-black rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs: Upload vs Manage & Backups */}
        <div className="flex items-center px-6 pt-3 border-b border-stone-200 gap-6 bg-[#F8F7F4] text-xs">
          <button
            type="button"
            onClick={() => setModalMode('upload')}
            className={`pb-2.5 font-medium border-b-2 transition-all cursor-pointer ${
              modalMode === 'upload'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            + Upload New Painting
          </button>
          <button
            type="button"
            onClick={() => setModalMode('manage')}
            className={`pb-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              modalMode === 'manage'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Manage Artworks ({paintings.length}) & Backup</span>
          </button>
        </div>

        {modalMode === 'manage' ? (
          /* Manage & Backup Screen */
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
            {/* Storage Info Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">
                  Unlimited IndexedDB Storage Active
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  The previous 5MB browser quota issue has been solved! All your artworks are now stored in browser IndexedDB with automatic high-fidelity image compression. You can upload dozens or hundreds of paintings safely.
                </p>
              </div>
            </div>

            {/* Backup & Restore controls */}
            <div className="p-4 bg-[#F9F8F5] border border-stone-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  Artworks Saved & Backup Controls
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                  Auto-Saved & Synced
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Your published paintings are automatically saved into your browser storage and synced. You can also download a JSON backup file or copy the art data to paste directly into chat with the assistant to permanently lock it into the codebase.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncPaintingsToServer();
                    setIsSyncing(false);
                  }}
                  disabled={paintings.length === 0 || isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 text-white rounded-md text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSyncing ? 'Saving...' : 'Save Permanently to Server'}</span>
                </button>

                <button
                  type="button"
                  onClick={exportAllPaintings}
                  disabled={paintings.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white rounded-md text-xs font-medium hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyArtDataToClipboard();
                    if (ok) {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }
                  }}
                  disabled={paintings.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-md text-xs font-medium hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Art Data!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-700" />
                      <span>Copy Art Data for Chat</span>
                    </>
                  )}
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 text-stone-800 rounded-md text-xs font-medium hover:bg-stone-50 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                  <span>Restore from Backup</span>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Current Artworks List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  Stored Artworks ({paintings.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setModalMode('upload')}
                  className="text-[11px] text-stone-700 underline font-medium hover:text-black"
                >
                  + Add more paintings
                </button>
              </div>

              {paintings.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-300 text-stone-500">
                  <p>No artworks found in storage yet.</p>
                  <button
                    type="button"
                    onClick={() => setModalMode('upload')}
                    className="mt-3 px-3 py-1.5 bg-stone-900 text-white rounded text-xs font-medium"
                  >
                    Upload Your First Artwork
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                  {paintings.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-white hover:bg-stone-50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate text-xs">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                            <span className="capitalize">{p.category}</span>
                            <span>·</span>
                            <span>{formatPrice(p.basePrice)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deletePainting(p.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title={`Delete ${p.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload Form Body */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Image Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider">
                  Painting Artwork Image <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Auto-compressed & unlimited storage
                </span>
              </div>

              {/* Tab switch: File upload vs Image URL */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveImageTab('upload')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeImageTab === 'upload'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-black'
                  }`}
                >
                  Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageTab('url')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeImageTab === 'url'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-black'
                  }`}
                >
                  Direct Image URL
                </button>
              </div>

              {activeImageTab === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-lg p-5 text-center transition-colors bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCompressing ? (
                      <div className="flex items-center gap-2 text-stone-600">
                        <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                        <span className="font-medium">Optimizing & preparing artwork...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">
                            Click to select painting photo from device
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            PNG, JPG, WEBP — automatically optimized for fast gallery display
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/painting.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleUrlApply}
                    className="px-4 py-2 bg-stone-800 text-white font-medium rounded-lg text-xs hover:bg-stone-900 cursor-pointer"
                  >
                    Load Image
                  </button>
                </div>
              )}

              {/* Preview image */}
              {imagePreview && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50 p-2 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      {imageFileName || 'Selected Artwork'}
                    </p>
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ready to save permanently</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFileName('');
                      setImageUrlInput('');
                    }}
                    className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Painting Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMW M4 Track Edition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Caption / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern Acrylic on Canvas or your custom caption"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Category & Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Category Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PaintingCategory)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900 bg-white cursor-pointer"
                >
                  <option value="cars">Cars</option>
                  <option value="bikes">Bikes</option>
                  <option value="cityscapes">Cityscapes</option>
                  <option value="spacescapes">Spacescapes</option>
                  <option value="quotes">Quotes</option>
                  <option value="abstract">Abstract</option>
                  <option value="landscapes">Seascapes & Nature</option>
                  <option value="botanicals">Botanicals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  Tag / Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Studio Original, New Arrival"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Pricing & Dimensions summary */}
            <div className="p-3.5 bg-[#F9F8F5] border border-stone-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Base Price (PKR)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Standard 12 × 12 in Canvas price
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-700">Rs.</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-24 px-2.5 py-1.5 border border-stone-300 rounded text-xs font-semibold text-stone-900 bg-white text-right focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600 space-y-1">
                <p className="font-medium text-stone-800">Automatic Size Tiers Generated:</p>
                <ul className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <li className="bg-white p-1.5 rounded border border-stone-200">
                    <span className="block font-bold text-stone-800">Small (6 × 6 in)</span>
                    <span className="text-stone-600 font-medium">
                      {formatPrice(Math.max(100, basePrice - 100))}
                    </span>
                  </li>
                  <li className="bg-white p-1.5 rounded border border-stone-200">
                    <span className="block font-bold text-stone-800">Large (12 × 12 in)</span>
                    <span className="text-stone-600 font-medium">{formatPrice(basePrice)}</span>
                  </li>
                  <li className="bg-white p-1.5 rounded border border-stone-200">
                    <span className="block font-bold text-stone-800">Photo Frame (9.5 × 13.5 in)</span>
                    <span className="text-stone-600 font-medium">{formatPrice(basePrice + 300)}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Color Family Feature Option */}
            {(() => {
              const isAutoEligible = hasColorFamilyFeature({ name: name.trim() });
              const isChecked = isAutoEligible || enableColorFamily;
              return (
                <div
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isChecked
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-[#F9F8F5] border-stone-200'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAutoEligible}
                      onChange={(e) => setEnableColorFamily(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-stone-900">
                          Color Family Feature
                        </span>
                        {isAutoEligible ? (
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                            Auto-enabled for {name.trim()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-medium">
                            (Red, Yellow, Orange, Blue, White, Navy Blue, Green)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        Enables collectors to choose their preferred color palette without changing the artwork's original photo.
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {COLOR_FAMILY_OPTIONS.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            className={`w-3.5 h-3.5 rounded-full ${c.badgeBg} ${c.border || ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })()}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                Artwork Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe the painting technique, subject, and color palette..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setModalMode('manage')}
                className="text-stone-500 hover:text-black underline text-xs cursor-pointer"
              >
                Manage existing ({paintings.length})
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPaintingOpen(false)}
                  className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#191918] hover:bg-stone-800 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Publish Artwork Permanently</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
