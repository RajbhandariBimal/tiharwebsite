import { useState, type FormEvent } from 'react';
import { Flame, Send } from 'lucide-react';
import {
  createCourtyardWish,
  validateCourtyardWishInput,
  type CourtyardWish,
} from '../utils/tiharLogic';
import { playGhantaChime } from '../utils/tiharAudio';

interface CourtyardWallSectionProps {
  wishes: CourtyardWish[];
  onAddWish: (wish: CourtyardWish) => void;
  totalLitLamps: number;
  soundEnabled: boolean;
}

const DAY_TAG_OPTIONS = [
  'Laxmi Puja',
  'Bhai Tika',
  'Mha Puja',
  'Kukur Tihar',
  'Kaag Tihar',
];

export default function CourtyardWallSection({
  wishes,
  onAddWish,
  totalLitLamps,
  soundEnabled,
}: CourtyardWallSectionProps) {
  const [sender, setSender] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [dayTag, setDayTag] = useState('Laxmi Puja');
  const [errors, setErrors] = useState<{ sender?: string; city?: string; message?: string }>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateCourtyardWishInput({ sender, city, message });
    if (!validation.valid) {
      setErrors(validation.errors);
      setJustSubmitted(false);
      return;
    }

    const newWish = createCourtyardWish({ sender, city, message, dayTag });
    onAddWish(newWish);
    if (soundEnabled) playGhantaChime();
    setSender('');
    setCity('');
    setMessage('');
    setErrors({});
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 3500);
  };

  return (
    <section
      id="courtyard-wall"
      aria-labelledby="courtyard-wall-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="dhaka-hairline rounded-full mb-12 opacity-80" aria-hidden="true" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E89B1E]/15">
        <div>
          <p className="text-xs font-medium text-[#E89B1E] tracking-wide">
            Community Courtyard · Shared Diyo Wall
          </p>
          <h2
            id="courtyard-wall-heading"
            className="font-display text-3xl sm:text-5xl font-semibold text-[#F7EFE4] mt-2 leading-tight text-balance"
          >
            Light a Clay Diyo &amp; Leave a Tihar Wish
          </h2>
        </div>

        <div className="bg-[#16111E] border border-[#E89B1E]/20 rounded-xl px-5 py-3 flex items-center gap-4 shrink-0">
          <Flame className="w-5 h-5 text-[#E89B1E]" />
          <div>
            <span className="text-xs text-[#B5A799] block">Courtyard Diyas Lit</span>
            <span
              data-testid="total-lit-lamps"
              className="font-mono tabular-nums text-xl font-semibold text-[#F7EFE4]"
            >
              {totalLitLamps}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Light a Diyo Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-5 bg-[#16111E] border border-[#E89B1E]/20 rounded-xl p-6 sm:p-8 space-y-4"
        >
          <h3 className="font-display text-2xl font-semibold text-[#F7EFE4]">
            Add Your Lamp to the Courtyard
          </h3>

          <div>
            <label htmlFor="wish-sender" className="block text-xs font-medium text-[#D6C9BA] mb-1.5">
              Your Name
            </label>
            <input
              id="wish-sender"
              name="sender"
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. Anisha Shakya"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F0B14] border border-[#E89B1E]/25 text-sm text-[#F7EFE4] placeholder-[#7B6E63] focus:outline-none focus:border-[#E89B1E]"
            />
            {errors.sender && (
              <p role="alert" className="text-xs text-[#F87171] mt-1">
                {errors.sender}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wish-city" className="block text-xs font-medium text-[#D6C9BA] mb-1.5">
                City or Tole
              </label>
              <input
                id="wish-city"
                name="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Patan, Nepal"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F0B14] border border-[#E89B1E]/25 text-sm text-[#F7EFE4] placeholder-[#7B6E63] focus:outline-none focus:border-[#E89B1E]"
              />
              {errors.city && (
                <p role="alert" className="text-xs text-[#F87171] mt-1">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="wish-day" className="block text-xs font-medium text-[#D6C9BA] mb-1.5">
                Tihar Day
              </label>
              <select
                id="wish-day"
                name="dayTag"
                value={dayTag}
                onChange={(e) => setDayTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F0B14] border border-[#E89B1E]/25 text-sm text-[#F7EFE4] focus:outline-none focus:border-[#E89B1E]"
              >
                {DAY_TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="wish-message" className="block text-xs font-medium text-[#D6C9BA] mb-1.5">
              Festival Blessing
            </label>
            <textarea
              id="wish-message"
              name="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a warm Tihar wish for family and neighbors..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F0B14] border border-[#E89B1E]/25 text-sm text-[#F7EFE4] placeholder-[#7B6E63] focus:outline-none focus:border-[#E89B1E] resize-none"
            />
            {errors.message && (
              <p role="alert" className="text-xs text-[#F87171] mt-1">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#E89B1E] text-[#120D18] text-sm font-semibold hover:bg-[#f2aa36] transition-colors min-h-[44px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Light Diyo &amp; Post Wish</span>
          </button>

          {justSubmitted && (
            <p role="status" className="text-xs font-medium text-[#F5A623]">
              Your clay diyo is now lit in the courtyard wall.
            </p>
          )}
        </form>

        {/* Right: Lit Diyo Wishes List + Editorial Courtyard Frame */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-xl overflow-hidden border border-[#E89B1E]/20 relative h-52 sm:h-60 bg-[#171220]">
            <img
              src="/src/assets/images/tihar_laxmi_puja_courtyard_1794923812709.jpg"
              alt="Kathmandu brick courtyard glowing with clay diyas at Laxmi Puja"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0F0B14]/85 via-[#0F0B14]/30 to-transparent"
            />
            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2">
              <p className="font-display text-xl sm:text-2xl text-[#F7EFE4]">
                &ldquo;Jhilimili jhilimili batti balera...&rdquo;
              </p>
              <span className="text-xs text-[#E89B1E]">Kathmandu Valley Courtyard</span>
            </div>
          </div>

          <ul aria-label="Courtyard Tihar wishes" className="space-y-3">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="bg-[#16111E] border border-[#E89B1E]/15 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-[#251A2A] flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-4 h-4 text-[#E89B1E]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#B5A799]">
                    <span className="font-semibold text-[#F7EFE4] text-sm">{wish.sender}</span>
                    <span aria-hidden="true">·</span>
                    <span>{wish.city}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#E89B1E]">{wish.dayTag}</span>
                  </div>
                  <p className="text-sm text-[#DED2C5] mt-1.5 leading-relaxed">{wish.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
