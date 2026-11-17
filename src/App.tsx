import { useEffect, useState } from 'react';
import { ArrowDown, Flame } from 'lucide-react';
import Header from './components/Header';
import { FestiveGarlandStrip, MarigoldShowerOverlay } from './components/TiharFestiveDecor';
import Tihar3DCanvas from './components/Tihar3DCanvas';
import YamapanchakSection from './components/YamapanchakSection';
import TiharGallerySection from './components/TiharGallerySection';
import MandalaDeusiSection from './components/MandalaDeusiSection';
import CourtyardWallSection from './components/CourtyardWallSection';
import {
  INITIAL_COURTYARD_WISHES,
  type ArtifactId,
  type CourtyardWish,
  type LightingMood,
} from './utils/tiharLogic';
import { playGhantaChime } from './utils/tiharAudio';

const WISHES_STORAGE_KEY = 'swanti_tihar_wishes_v1';
const LIT_DAYS_STORAGE_KEY = 'swanti_tihar_lit_days_v1';

export default function App() {
  const [activeArtifact, setActiveArtifact] = useState<ArtifactId>('diyo');
  const [isLit, setIsLit] = useState(true);
  const [lightingMood, setLightingMood] = useState<LightingMood>('dusk');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [burstNonce, setBurstNonce] = useState(0);

  const [wishes, setWishes] = useState<CourtyardWish[]>(() => {
    try {
      const saved = window.localStorage.getItem(WISHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CourtyardWish[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to seed data
    }
    return INITIAL_COURTYARD_WISHES;
  });

  const [litDays, setLitDays] = useState<Record<number, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem(LIT_DAYS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<number, boolean>;
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // Fallback
    }
    return { 3: true };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // Non-blocking
    }
  }, [wishes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIT_DAYS_STORAGE_KEY, JSON.stringify(litDays));
    } catch {
      // Non-blocking
    }
  }, [litDays]);

  const litDayCount = Object.values(litDays).filter(Boolean).length;
  const totalLitLamps = 108 + wishes.length + litDayCount + (isLit ? 1 : 0);

  const triggerCelebration = () => {
    setBurstNonce((n) => n + 1);
  };

  const handleLightDayOffering = (dayNumber: number) => {
    const turningOn = !litDays[dayNumber];
    setLitDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
    if (turningOn) triggerCelebration();
  };

  const handleAddWish = (wish: CourtyardWish) => {
    setWishes((prev) => [wish, ...prev]);
    triggerCelebration();
  };

  const handleJumpToLightDiyo = () => {
    setIsLit(true);
    triggerCelebration();
    if (soundEnabled) playGhantaChime();
    const el = document.getElementById('courtyard-wall');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="top"
      data-mood={lightingMood}
      className={`min-h-screen text-[#F5EDE2] flex flex-col transition-colors duration-300 ${
        lightingMood === 'midnight' ? 'bg-[#06040A] midnight-ambient' : 'bg-[#0F0B14] courtyard-ambient'
      }`}
    >
      <Header onJumpToLightDiyo={handleJumpToLightDiyo} />
      <FestiveGarlandStrip isMidnight={lightingMood === 'midnight'} />
      <MarigoldShowerOverlay burstNonce={burstNonce} />

      <main className="flex-1">
        {/* Hero & Interactive 3D Courtyard */}
        <section
          id="courtyard-3d"
          aria-labelledby="hero-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-end mb-5">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-[#E89B1E] tracking-wide">
                Nepal&apos;s Festival of Lights · Shubha Dipawali &amp; Nepal Sambat
              </p>
              <h1
                id="hero-heading"
                className="font-display text-3xl sm:text-5xl font-semibold text-[#F7EFE4] mt-1.5 leading-[1.06] text-balance"
              >
                Five Sacred Nights of Clay Diyas, Marigolds &amp; Sacred Sound
              </h1>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-end gap-3.5">
              <p className="text-sm text-[#C7B9AA] leading-relaxed lg:text-right max-w-md">
                Orbit handcrafted 3D Nepali brass and terracotta artifacts, click any lamp to kindle
                its flame, or inspect its craft layers below.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLit(true);
                    triggerCelebration();
                    if (soundEnabled) playGhantaChime();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E89B1E] text-[#120D18] text-sm font-semibold hover:bg-[#f2aa36] transition-colors whitespace-nowrap shrink-0 min-h-[42px] cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Kindle Lamp</span>
                </button>
                <a
                  href="#yamapanchak"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1424] border border-[#E89B1E]/25 text-[#EFE6DA] text-sm font-medium hover:bg-[#241B32] transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
                >
                  <span>Explore 5 Days</span>
                  <ArrowDown className="w-4 h-4 text-[#E89B1E]" />
                </a>
              </div>
            </div>
          </div>

          {/* 3D Interactive Courtyard Viewport */}
          <Tihar3DCanvas
            activeArtifact={activeArtifact}
            onSelectArtifact={setActiveArtifact}
            isLit={isLit}
            onToggleLit={() => setIsLit((v) => !v)}
            lightingMood={lightingMood}
            onToggleMood={() => setLightingMood((m) => (m === 'dusk' ? 'midnight' : 'dusk'))}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            onIgniteBurst={triggerCelebration}
          />

          {/* Compact 4-Column Cultural Motif Strip directly below 3D Stage */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-4">
              <span className="font-mono tabular-nums text-xs text-[#E89B1E]">01 · Sayapatri</span>
              <p className="text-sm font-semibold text-[#F7EFE4] mt-1">Marigold Garlands</p>
              <p className="text-xs text-[#B5A799] mt-1">
                Strung across carved windows &amp; doorways
              </p>
            </div>
            <div className="bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-4">
              <span className="font-mono tabular-nums text-xs text-[#E89B1E]">02 · Makhamali</span>
              <p className="text-sm font-semibold text-[#F7EFE4] mt-1">Unfading Amaranth</p>
              <p className="text-xs text-[#B5A799] mt-1">
                Woven into eternal Bhai Tika necklaces
              </p>
            </div>
            <div className="bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-4">
              <span className="font-mono tabular-nums text-xs text-[#E89B1E]">03 · Sel Roti</span>
              <p className="text-sm font-semibold text-[#F7EFE4] mt-1">Crisp Rice Rings</p>
              <p className="text-xs text-[#B5A799] mt-1">
                Cardamom-scented circles shared with neighbors
              </p>
            </div>
            <div className="bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-4">
              <span className="font-mono tabular-nums text-xs text-[#E89B1E]">04 · Deusi Re</span>
              <p className="text-sm font-semibold text-[#F7EFE4] mt-1">Evening Folk Chorus</p>
              <p className="text-xs text-[#B5A799] mt-1">
                Madal rhythms &amp; courtyard blessings after dusk
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Five Days of Yamapanchak */}
        <YamapanchakSection
          litDays={litDays}
          onLightDayOffering={handleLightDayOffering}
          soundEnabled={soundEnabled}
        />

        {/* Section 2: Tihar Visual Monograph Bento Gallery */}
        <TiharGallerySection />

        {/* Section 3: Interactive Rangoli Mandala & Deusi-Bhailo Cadence */}
        <MandalaDeusiSection />

        {/* Section 3: Community Courtyard Diyo Wall */}
        <CourtyardWallSection
          wishes={wishes}
          onAddWish={handleAddWish}
          totalLitLamps={totalLitLamps}
          soundEnabled={soundEnabled}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E89B1E]/15 bg-[#0C0910]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-[#F7EFE4]">Swanti &amp; Tihar</p>
            <p className="text-xs text-[#9E9083] mt-1">
              Celebrating Kaag, Kukur, Gai &amp; Laxmi Puja, Mha Puja, and Bhai Tika.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#BEB0A2]">
            <a href="#courtyard-3d" className="hover:text-[#E89B1E] transition-colors">
              3D Artifacts
            </a>
            <a href="#yamapanchak" className="hover:text-[#E89B1E] transition-colors">
              Yamapanchak
            </a>
            <a href="#festival-gallery" className="hover:text-[#E89B1E] transition-colors">
              Gallery
            </a>
            <a href="#mandala-deusi" className="hover:text-[#E89B1E] transition-colors">
              Mandala Studio
            </a>
            <a href="#courtyard-wall" className="hover:text-[#E89B1E] transition-colors">
              Courtyard Wall
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
