import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Music, Pause, Play, Sparkles } from 'lucide-react';
import {
  DEUSI_VERSES,
  MANDALA_MOTIFS,
  MANDALA_PALETTES,
  buildLotusPetalPath,
  computeMandalaPetalPoints,
} from '../utils/tiharLogic';
import { playMadalBeat } from '../utils/tiharAudio';

export default function MandalaDeusiSection() {
  const [motifId, setMotifId] = useState<(typeof MANDALA_MOTIFS)[number]['id']>('padma');
  const [paletteId, setPaletteId] = useState<(typeof MANDALA_PALETTES)[number]['id']>('marigold');
  const [recipient, setRecipient] = useState('Didi & Bhai');
  const [copied, setCopied] = useState(false);

  const [activeVerseIdx, setActiveVerseIdx] = useState(0);
  const [rhythmPlaying, setRhythmPlaying] = useState(false);
  const [beatStep, setBeatStep] = useState(0);

  const motif = MANDALA_MOTIFS.find((m) => m.id === motifId) ?? MANDALA_MOTIFS[0];
  const palette = MANDALA_PALETTES.find((p) => p.id === paletteId) ?? MANDALA_PALETTES[0];
  const activeVerse = DEUSI_VERSES[activeVerseIdx];

  const outerPoints = useMemo(
    () => computeMandalaPetalPoints(150, motif.ringRadii[2], motif.petalCount),
    [motif],
  );
  const innerPoints = useMemo(
    () => computeMandalaPetalPoints(150, motif.ringRadii[1], Math.max(6, motif.petalCount / 2)),
    [motif],
  );

  // Madal 4-beat Deusi rhythm loop when user explicitly toggles Play
  useEffect(() => {
    if (!rhythmPlaying) return;
    const sequence: Array<'dhin' | 'ta' | 'dhin' | 'na'> = ['dhin', 'ta', 'dhin', 'na'];
    let step = 0;
    const interval = window.setInterval(() => {
      const beat = sequence[step % sequence.length];
      playMadalBeat(beat);
      setBeatStep(step % sequence.length);
      step += 1;
    }, 340);
    return () => window.clearInterval(interval);
  }, [rhythmPlaying]);

  const handleCopyBlessing = () => {
    const cleanName = recipient.trim() || 'Friends & Family';
    const text = `Shubha Tihar, ${cleanName}! May the warm light of ${motif.name} bring peace and prosperity to your courtyard.`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="mandala-deusi"
      aria-labelledby="mandala-deusi-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="dhaka-hairline rounded-full mb-12 opacity-80" aria-hidden="true" />

      <div className="max-w-2xl">
        <p className="text-xs font-medium text-[#E89B1E] tracking-wide">
          Living Craft · Rangoli Mandap &amp; Folk Cadence
        </p>
        <h2
          id="mandala-deusi-heading"
          className="font-display text-3xl sm:text-5xl font-semibold text-[#F7EFE4] mt-2 leading-tight text-balance"
        >
          Compose a Threshold Mandala &amp; Hear the Madal Rhythm
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Interactive Rangoli / Mandala Studio */}
        <div className="lg:col-span-7 bg-[#16111E] border border-[#E89B1E]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Live SVG Mandala */}
            <div className="md:col-span-6 flex items-center justify-center bg-[#100C17] rounded-xl p-4 border border-[#E89B1E]/15">
              <svg
                viewBox="0 0 300 300"
                className="w-full max-w-[260px] h-auto"
                role="img"
                aria-label={`${motif.name} mandala in ${palette.name} colors`}
              >
                <circle cx="150" cy="150" r="138" fill="#18101E" stroke={palette.colors[0]} strokeWidth="2" />
                {motif.ringRadii.map((r, idx) => (
                  <circle
                    key={r}
                    cx="150"
                    cy="150"
                    r={r}
                    fill="none"
                    stroke={palette.colors[idx % palette.colors.length]}
                    strokeWidth={idx === 2 ? 2.5 : 1.5}
                    strokeDasharray={idx === 3 ? '4 6' : undefined}
                    opacity="0.88"
                  />
                ))}

                {/* Outer lotus petals */}
                {outerPoints.map((pt, idx) => {
                  const rad = (pt.angleDeg * Math.PI) / 180;
                  const path = buildLotusPetalPath(
                    150,
                    motif.ringRadii[1] + 2,
                    motif.ringRadii[3] - 4,
                    Math.PI / (motif.petalCount * 1.15),
                    rad,
                  );
                  return (
                    <path
                      key={`outer-${idx}`}
                      d={path}
                      fill={palette.colors[idx % 2]}
                      fillOpacity="0.82"
                      stroke={palette.colors[3]}
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Ashtamangala rotated sacred squares */}
                {(motif.id === 'ashtamangala' || motif.id === 'mhapuja') && (
                  <>
                    <rect
                      x="92"
                      y="92"
                      width="116"
                      height="116"
                      fill="none"
                      stroke={palette.colors[2]}
                      strokeWidth="2"
                    />
                    <rect
                      x="92"
                      y="92"
                      width="116"
                      height="116"
                      fill="none"
                      stroke={palette.colors[3]}
                      strokeWidth="2"
                      transform="rotate(45 150 150)"
                    />
                  </>
                )}

                {/* Inner lotus petals */}
                {innerPoints.map((pt, idx) => {
                  const rad = (pt.angleDeg * Math.PI) / 180;
                  const path = buildLotusPetalPath(
                    150,
                    18,
                    motif.ringRadii[1] - 4,
                    Math.PI / (innerPoints.length * 1.1),
                    rad,
                  );
                  return (
                    <path
                      key={`inner-${idx}`}
                      d={path}
                      fill={palette.colors[(idx + 1) % palette.colors.length]}
                      fillOpacity="0.9"
                    />
                  );
                })}

                {/* Outer bindu dots */}
                {outerPoints.map((pt, idx) => (
                  <circle
                    key={`dot-${idx}`}
                    cx={150 + Math.cos((pt.angleDeg * Math.PI) / 180) * 126}
                    cy={150 + Math.sin((pt.angleDeg * Math.PI) / 180) * 126}
                    r="3.2"
                    fill={palette.colors[3]}
                  />
                ))}

                {/* Central Diyo Bindu */}
                <circle cx="150" cy="150" r="15" fill={palette.colors[0]} />
                <circle cx="150" cy="150" r="7" fill="#FFF4D2" />
              </svg>
            </div>

            {/* Mandala Controls */}
            <div className="md:col-span-6 flex flex-col gap-5">
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#F7EFE4]">
                  {motif.name}
                </h3>
                <p className="text-xs text-[#BEB0A2] mt-1">{motif.originNote}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#D6C9BA] mb-2">
                  Sacred Pattern
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {MANDALA_MOTIFS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMotifId(item.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors min-h-[40px] cursor-pointer truncate ${
                        item.id === motifId
                          ? 'bg-[#E89B1E] text-[#120D18] font-semibold'
                          : 'bg-[#221A2E] text-[#D8CBBF] hover:text-white'
                      }`}
                    >
                      {item.name.split(' ')[0]} {item.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#D6C9BA] mb-2">
                  Pigment Palette
                </span>
                <div className="flex flex-col gap-1.5">
                  {MANDALA_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaletteId(p.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] cursor-pointer ${
                        p.id === paletteId
                          ? 'bg-[#281F36] text-white border border-[#E89B1E]/50'
                          : 'bg-[#1D1628] text-[#BFB2A4] hover:text-white border border-transparent'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {p.colors.map((hex) => (
                          <span
                            key={hex}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Greeting Share Strip */}
          <div className="mt-6 pt-5 border-t border-[#E89B1E]/15 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="mandala-recipient"
                className="block text-xs font-medium text-[#D6C9BA] mb-1.5"
              >
                Dedicate This Mandala To
              </label>
              <input
                id="mandala-recipient"
                type="text"
                value={recipient}
                maxLength={40}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Name of friend or family"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F0B14] border border-[#E89B1E]/25 text-sm text-[#F7EFE4] placeholder-[#827569] focus:outline-none focus:border-[#E89B1E]"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyBlessing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E89B1E] text-[#120D18] text-xs font-semibold hover:bg-[#f2aa36] transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Blessing Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Tihar Greeting</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Deusi-Bhailo Songbook & Madal Beat Player */}
        <div className="lg:col-span-5 bg-[#16111E] border border-[#E89B1E]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[#E89B1E]">
                Deusi &amp; Bhailo Call-and-Response
              </span>
              <span className="font-mono tabular-nums text-xs text-[#A89A8D]">
                0{activeVerseIdx + 1} / 0{DEUSI_VERSES.length}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7EFE4] mt-2">
              {activeVerse.tradition} Courtyard Chorus
            </h3>

            <div className="mt-5 p-5 rounded-xl bg-[#100C17] border border-[#E89B1E]/15">
              <p className="font-display text-xl italic text-[#F7EFE4] leading-snug">
                &ldquo;{activeVerse.lead}&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold text-[#E89B1E]">
                Chorus: {activeVerse.chorus}
              </p>
              <p className="mt-3 text-xs sm:text-sm text-[#C4B7A9] leading-relaxed">
                {activeVerse.englishMeaning}
              </p>
            </div>

            {/* Verse Selector Buttons */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {DEUSI_VERSES.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVerseIdx(idx)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] cursor-pointer ${
                    idx === activeVerseIdx
                      ? 'bg-[#C93B2B] text-white font-semibold'
                      : 'bg-[#221A2E] text-[#CEC1B3] hover:text-white'
                  }`}
                >
                  {v.tradition} {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Synthesized Madal Rhythm Trigger */}
          <div className="mt-6 pt-5 border-t border-[#E89B1E]/15">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 text-xs text-[#D6C9BA]">
                <Music className="w-4 h-4 text-[#E89B1E]" />
                <span>Madal 4-Beat Folk Cadence</span>
              </div>

              <div className="flex items-center gap-1.5" aria-hidden="true">
                {['Dhin', 'Ta', 'Dhin', 'Na'].map((syllable, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      rhythmPlaying && beatStep === idx
                        ? 'bg-[#E89B1E] text-[#120D18] font-bold'
                        : 'bg-[#221A2E] text-[#9E9083]'
                    }`}
                  >
                    {syllable}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRhythmPlaying((v) => !v)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                  rhythmPlaying
                    ? 'bg-[#C93B2B] text-white hover:bg-[#b23223]'
                    : 'bg-[#241C30] text-[#F7EFE4] hover:bg-[#312642] border border-[#E89B1E]/30'
                }`}
              >
                {rhythmPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Madal Beat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#E89B1E]" />
                    <span>Play Madal Beat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => playMadalBeat('dhin')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#1E1729] text-[#E89B1E] hover:bg-[#2A2039] text-xs font-medium min-h-[44px] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tap Drum</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
