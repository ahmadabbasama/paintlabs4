import React, { useState, useMemo } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { TopNav } from './components/TopNav';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CustomPortraitSection } from './components/CustomPortraitSection';
import { ContactSection } from './components/ContactSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SizeChartModal } from './components/SizeChartModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AddPaintingModal } from './components/AddPaintingModal';
import { MediaModal } from './components/MediaModal';
import { NotInGikiModal } from './components/NotInGikiModal';
import { useModalBackButton } from './hooks/useModalBackButton';
import { ArrowUpDown, Heart, Palette, Sparkles } from 'lucide-react';

const StorefrontContent: React.FC = () => {
  const { paintings, wishlist, setIsAddPaintingOpen } = useShop();

  // Phone back button closes the open overlay instead of leaving the site.
  useModalBackButton();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filtered & Sorted paintings
  const displayPaintings = useMemo(() => {
    let list = [...paintings];

    if (selectedCategory === 'wishlist') {
      list = list.filter((p) => wishlist.includes(p.id));
    } else if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStockCount > 0);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [paintings, selectedCategory, inStockOnly, sortBy, wishlist]);

  const categories = [
    { id: 'all', label: 'For you' },
    { id: 'bikes', label: 'Bikes' },
    { id: 'cars', label: 'Cars' },
    { id: 'cityscapes', label: 'Cityscapes' },
    { id: 'spacescapes', label: 'Spacescapes' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'landscapes', label: 'Seascapes & Nature' },
    { id: 'botanicals', label: 'Botanicals' },
    ...(wishlist.length > 0 ? [{ id: 'wishlist', label: `Saved Art (${wishlist.length})` }] : []),
  ];

  const handleExplore = () => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] selection:bg-[#E8E4DA] selection:text-black">
      {/* 1. Header with Top Bar Contract */}
      <TopNav
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* 2. Hero Section */}
      <Hero onExplore={handleExplore} />

      {/* 3. Original Paintings & Ready Designs Collection */}
      <main id="collection" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#EAE8E3]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-semibold">
              <span>Studio Collection</span>
              <span aria-hidden="true">·</span>
              <span>Original Art Gallery</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#191918] font-normal mt-1">
              Original Paintings & Ready Works
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            Authentic paintings delivering across GIKI. Explore our ready designs or commission a custom portrait tailored to your story.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-[#EAE8E3]/60">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-lg">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-[#191918] shadow-xs'
                      : 'text-stone-600 hover:text-black'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Super Power, Sort By & In-Stock */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            

            <label className="flex items-center gap-2 cursor-pointer text-stone-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-black rounded border-stone-300 focus:ring-0 cursor-pointer accent-[#191918]"
              />
              <span>Originals in Studio</span>
            </label>

            <div className="flex items-center gap-1.5 bg-[#F4F1EA] px-3 py-1.5 rounded-lg border border-[#E7E3D8]">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
                aria-label="Sort paintings"
              >
                <option value="featured">Featured Sequence</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Collector Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Desktop Product Grid */}
        {displayPaintings.length === 0 ? (
          paintings.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#F8F6F0] rounded-xl border border-[#ECE8DE] max-w-md mx-auto my-6 p-6">
              <div className="w-12 h-12 rounded-full bg-[#EFECE5] flex items-center justify-center text-stone-600 mx-auto">
                <Palette className="w-6 h-6 stroke-1" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-xl text-stone-900 font-normal">
                  Studio Collection Updating
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Original artworks are being curated in our studio. You can commission an exclusive custom portrait or inquire directly with our CEO.
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('custom-portrait');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
              >
                <span>Commission Custom Art</span>
              </button>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-[#F8F6F0] rounded-lg border border-[#ECE8DE]">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-editorial text-xl text-stone-800 font-normal">
                No matching paintings found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {selectedCategory === 'wishlist'
                  ? "You haven't saved any paintings to your wishlist yet. Click the heart icon on any painting to save it."
                  : 'Try adjusting your filter options or exploring all studio categories.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setInStockOnly(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#191918] rounded hover:bg-stone-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {displayPaintings.map((painting) => (
              <ProductCard key={painting.id} product={painting} />
            ))}
          </div>
        )}
      </main>

      {/* 4. Custom Portrait Studio: "Describe Your Own Idea" */}
      <CustomPortraitSection />

      {/* 5. Contact Us Section */}
      <ContactSection />

      {/* 7. Footer */}
      <Footer />

      {/* Floating Modals & Drawers */}
      <ProductDetailModal />
      <AddPaintingModal />
      <CartDrawer />
      <CheckoutModal />
      <SizeChartModal />
      <MediaModal />
      <NotInGikiModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <StorefrontContent />
    </ShopProvider>
  );
}
