import { useState } from 'react';
import { Flame, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { YAMAPANCHAK_DAYS } from '../utils/tiharLogic';
import { playGhantaChime } from '../utils/tiharAudio';

interface YamapanchakSectionProps {
  litDays: Record<number, boolean>;
  onLightDayOffering: (dayNumber: number) => void;
  soundEnabled: boolean;
}

export default function YamapanchakSection({
  litDays,
  onLightDayOffering,
  soundEnabled,
}: YamapanchakSectionProps) {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(3); // Default to Laxmi Puja
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const activeDay =
    YAMAPANCHAK_DAYS.find((d) => d.dayNumber === selectedDayNum) ?? YAMAPANCHAK_DAYS[2];
  const isDayLit = Boolean(litDays[activeDay.dayNumber]);

  return (
    <section
      id="yamapanchak"
      aria-labelledby="yamapanchak-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E89B1E]/15">
        <div>
          <p className="text-xs font-medium text-[#E89B1E] tracking-wide">
            Yamapanchak · Five Sacred Days of Tihar
          </p>
          <h2
            id="yamapanchak-heading"
            className="font-display text-3xl sm:text-5xl font-semibold text-[#F7EFE4] mt-2 leading-tight text-balance"
          >
            From the Messenger Crow to the Unfading Makhamali
          </h2>
        </div>

        <p className="text-sm sm:text-base text-[#BEB0A2] max-w-md leading-relaxed">
          Select each lunar day of Kartik to explore its Nepali rituals, animal reverence, and
          evening offerings.
        </p>
      </div>

      {/* Interactive 5-Day Segmented Selector */}
      <div
        role="tablist"
        aria-label="Five days of Yamapanchak"
        className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#16111E] p-1.5 rounded-xl border border-[#E89B1E]/15"
      >
        {YAMAPANCHAK_DAYS.map((day) => {
          const isActive = day.dayNumber === selectedDayNum;
          const dayAlreadyLit = Boolean(litDays[day.dayNumber]);
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedDayNum(day.dayNumber)}
              className={`px-3 py-3 rounded-lg text-left transition-colors min-h-[44px] cursor-pointer flex flex-col justify-center ${
                isActive
                  ? 'bg-[#E89B1E] text-[#120D18]'
                  : 'text-[#D6C9BA] hover:bg-[#221A2E] hover:text-white'
              }`}
            >
              <span
                className={`font-mono tabular-nums text-[11px] font-medium ${
                  isActive ? 'text-[#2B1B05]' : 'text-[#E89B1E]'
                }`}
              >
                0{day.dayNumber} {dayAlreadyLit ? '· Lit' : ''}
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate mt-0.5">{day.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Day Showcase (Balanced 2-Column Split with items-stretch) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left Image Frame */}
          <div className="lg:col-span-6 rounded-xl overflow-hidden border border-[#E89B1E]/20 bg-[#171220] min-h-[300px] sm:min-h-[380px] relative">
            {!imgErrors[activeDay.id] ? (
              <img
                src={activeDay.imageSrc}
                alt={activeDay.imageAlt}
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgErrors((prev) => ({
                    ...prev,
                    [activeDay.id]: true,
                  }))
                }
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#2B1722] to-[#130D1B]">
                <Flame className="w-10 h-10 text-[#E89B1E] mb-3" />
                <p className="font-display text-2xl text-[#F7EFE4]">{activeDay.title}</p>
                <p className="text-xs text-[#BEB0A2] mt-1">{activeDay.nepaliName}</p>
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0F0B14]/90 via-[#0F0B14]/40 to-transparent"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-xs text-[#EDE3D6]">
              <span>{activeDay.nepaliName}</span>
              <span className="text-[#E89B1E] font-medium">{activeDay.nepalBhasaName}</span>
            </div>
          </div>

          {/* Right Cultural Narrative */}
          <div className="lg:col-span-6 bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Unboxed Clean Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#C7B9AA]">
                <span className="font-mono tabular-nums text-[#E89B1E]">
                  Day 0{activeDay.dayNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeDay.lunarDate}</span>
                <span aria-hidden="true">·</span>
                <span>{activeDay.honoree}</span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl font-semibold text-[#F7EFE4] mt-3 leading-tight">
                {activeDay.title}
              </h3>

              <p className="text-sm sm:text-base text-[#D3C6B8] mt-4 leading-relaxed">
                {activeDay.summary}
              </p>

              <div className="mt-6 pt-6 border-t border-[#E89B1E]/12">
                <h4 className="text-xs font-semibold text-[#E89B1E] tracking-wide">
                  Traditional Observances
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {activeDay.traditions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-[#E5D7C6]">
                      <span className="font-mono tabular-nums text-xs text-[#E89B1E] mt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E89B1E]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#B5A799] block">Key Offering</span>
                <span className="text-sm font-medium text-[#F7EFE4]">{activeDay.offering}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playGhantaChime();
                  onLightDayOffering(activeDay.dayNumber);
                }}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer ${
                  isDayLit
                    ? 'bg-[#261E33] text-[#F5A623] border border-[#E89B1E]/40'
                    : 'bg-[#E89B1E] text-[#120D18] hover:bg-[#f2aa36]'
                }`}
              >
                {isDayLit ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Offering Lamp Lit</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Light Day&apos;s Offering</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
