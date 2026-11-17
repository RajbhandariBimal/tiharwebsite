import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onJumpToLightDiyo: () => void;
}

const NAV_LINKS = [
  { href: '#courtyard-3d', label: '3D Artifacts' },
  { href: '#yamapanchak', label: 'Five Days' },
  { href: '#festival-gallery', label: 'Gallery' },
  { href: '#mandala-deusi', label: 'Mandala & Deusi' },
  { href: '#courtyard-wall', label: 'Courtyard Wall' },
];

export default function Header({ onJumpToLightDiyo }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0F0B14]/95 border-b border-[#E89B1E]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-2xl font-bold tracking-tight text-[#F7EFE4] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E89B1E]"
        >
          Swanti &amp; Tihar
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#CEC1B3] hover:text-[#F5A623] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E89B1E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onJumpToLightDiyo}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#E89B1E] text-[#120D18] text-sm font-semibold hover:bg-[#f2aa36] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7EFE4]"
          >
            Light a Diyo
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#1A1424] text-[#F5EDE2] hover:bg-[#261D34] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E89B1E]/15 bg-[#130E1C] px-4 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#E5D7C6] hover:bg-[#21182E] hover:text-[#F5A623] transition-colors min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onJumpToLightDiyo();
            }}
            className="mt-1 w-full py-2.5 px-4 rounded-lg bg-[#E89B1E] text-[#120D18] text-sm font-semibold min-h-[44px] cursor-pointer"
          >
            Light a Diyo
          </button>
        </div>
      )}
    </header>
  );
}
