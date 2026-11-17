import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Flame, X } from 'lucide-react';
import {
  TIHAR_GALLERY_ITEMS,
  filterGalleryItems,
  type GalleryCategory,
  type TiharGalleryItem,
} from '../utils/tiharLogic';

const GALLERY_FILTERS: Array<{ id: GalleryCategory; label: string }> = [
  { id: 'all', label: 'All Moments' },
  { id: 'rituals', label: 'Rituals & Lamps' },
  { id: 'celebration', label: 'Feast & Music' },
  { id: 'architecture', label: 'Courtyard Nights' },
];

export default function TiharGallerySection() {
  const [category, setCategory] = useState<GalleryCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(
    () => filterGalleryItems(TIHAR_GALLERY_ITEMS, category),
    [category],
  );

  const selectedIndex = selectedId
    ? filteredItems.findIndex((item) => item.id === selectedId)
    : -1;
  const activeItem: TiharGalleryItem | null =
    selectedIndex >= 0 ? filteredItems[selectedIndex] : null;

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (selectedIndex + 1) % filteredItems.length;
        setSelectedId(filteredItems[nextIdx].id);
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
        setSelectedId(filteredItems[prevIdx].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeItem, selectedIndex, filteredItems]);

  const getBentoSpanClass = (item: TiharGalleryItem, idx: number) => {
    if (category !== 'all') {
      return idx === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : 'col-span-1';
    }
    switch (item.layoutSpan) {
      case 'featured':
        return 'sm:col-span-2 lg:col-span-2 lg:row-span-2';
      case 'tall':
        return 'lg:row-span-2';
      case 'wide':
        return 'sm:col-span-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <section
      id="festival-gallery"
      aria-labelledby="festival-gallery-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="dhaka-hairline rounded-full mb-12 opacity-80" aria-hidden="true" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E89B1E]/15">
        <div>
          <p className="text-xs font-medium text-[#E89B1E] tracking-wide">
            Visual Monograph · Kathmandu · Patan · Bhaktapur
          </p>
          <h2
            id="festival-gallery-heading"
            className="font-display text-3xl sm:text-5xl font-semibold text-[#F7EFE4] mt-2 leading-tight text-balance"
          >
            Lanterns, Brick Lanes &amp; Golden Thresholds
          </h2>
        </div>

        {/* Clean Interactive Segmented Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter Tihar gallery moments"
          className="flex overflow-x-auto sm:inline-flex items-center gap-1.5 bg-[#16111E] p-1.5 rounded-xl border border-[#E89B1E]/15 shrink-0"
        >
          {GALLERY_FILTERS.map((tab) => {
            const active = tab.id === category;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                  active
                    ? 'bg-[#E89B1E] text-[#120D18] font-semibold'
                    : 'text-[#CEC1B3] hover:text-white hover:bg-[#221A2E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media-First Bento Visual Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[230px] sm:auto-rows-[250px] gap-4">
        {filteredItems.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            aria-label={`Inspect photograph: ${item.title}`}
            className={`group relative rounded-2xl overflow-hidden border border-[#E89B1E]/20 bg-[#16111E] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E89B1E] ${getBentoSpanClass(
              item,
              idx,
            )}`}
          >
            {!imgErrors[item.id] ? (
              <img
                src={item.imageSrc}
                alt={item.imageAlt}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() =>
                  setImgErrors((prev) => ({
                    ...prev,
                    [item.id]: true,
                  }))
                }
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#2B1722] to-[#120D1A]">
                <Flame className="w-8 h-8 text-[#E89B1E] mb-2" />
                <p className="font-display text-xl text-[#F7EFE4]">{item.title}</p>
                <p className="text-xs text-[#BEB0A2] mt-1">{item.nepaliTitle}</p>
              </div>
            )}

            {/* Measured Gradient Scrim for 4.5:1 Text Legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0B0810]/92 via-[#0B0810]/30 to-transparent"
            />

            {/* Top-Right Subtle Expand Affordance */}
            <span
              aria-hidden="true"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-[#0F0B14]/75 border border-[#E89B1E]/25 flex items-center justify-center text-[#F5EDE2] opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <Expand className="w-3.5 h-3.5 text-[#E89B1E]" />
            </span>

            {/* Unboxed Bottom Metadata & Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#E89B1E] font-medium">
                <span>{item.nepaliTitle}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#D8CBBF]">{item.location}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#F7EFE4] mt-0.5 leading-tight">
                {item.title}
              </h3>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 z-50 bg-[#08050C]/92 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#140F1B] border border-[#E89B1E]/30 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[52vh] sm:h-[64vh] bg-[#0B0810]">
              {!imgErrors[activeItem.id] ? (
                <img
                  src={activeItem.imageSrc}
                  alt={activeItem.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <Flame className="w-10 h-10 text-[#E89B1E] mb-3" />
                  <p className="font-display text-2xl text-[#F7EFE4]">{activeItem.title}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close photograph viewer"
                className="absolute top-3 right-3 w-11 h-11 rounded-lg bg-[#0F0B14]/85 border border-[#E89B1E]/30 text-[#F7EFE4] hover:text-[#E89B1E] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const prevIdx =
                        (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                      setSelectedId(filteredItems[prevIdx].id);
                    }}
                    aria-label="Previous photograph"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#0F0B14]/80 border border-[#E89B1E]/25 text-[#F7EFE4] hover:text-[#E89B1E] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (selectedIndex + 1) % filteredItems.length;
                      setSelectedId(filteredItems[nextIdx].id);
                    }}
                    aria-label="Next photograph"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg bg-[#0F0B14]/80 border border-[#E89B1E]/25 text-[#F7EFE4] hover:text-[#E89B1E] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E89B1E]/15">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#C7B9AA]">
                  <span className="text-[#E89B1E] font-medium">{activeItem.nepaliTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeItem.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeItem.dayReference}</span>
                </div>
                <h3
                  id="lightbox-title"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#F7EFE4] mt-1"
                >
                  {activeItem.title}
                </h3>
                <p className="text-sm text-[#CEC1B3] mt-1.5 max-w-2xl leading-relaxed">
                  {activeItem.caption}
                </p>
              </div>

              <span className="font-mono tabular-nums text-xs text-[#A89A8D] shrink-0">
                0{selectedIndex + 1} / 0{filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
