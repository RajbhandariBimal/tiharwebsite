export type ArtifactId = 'diyo' | 'sukunda' | 'lantern' | 'thali';

export type LightingMood = 'dusk' | 'midnight';

export interface YamapanchakDay {
  dayNumber: number;
  id: string;
  nepaliName: string;
  nepalBhasaName: string;
  title: string;
  lunarDate: string;
  honoree: string;
  offering: string;
  summary: string;
  traditions: string[];
  blessingPhrase: string;
  imageSrc: string;
  imageAlt: string;
  accentHex: string;
}

export const YAMAPANCHAK_DAYS: YamapanchakDay[] = [
  {
    dayNumber: 1,
    id: 'kaag-tihar',
    nepaliName: 'काग तिहार',
    nepalBhasaName: 'Kwaha Puja',
    title: 'Kaag Tihar',
    lunarDate: 'Kartik Krishna Trayodashi',
    honoree: 'Crows · Messengers of Yama',
    offering: 'Leaf-plate feast at dawn',
    summary:
      'At daybreak, families place portions of rice, sweets, and freshly cooked dishes on woven tapari leaf plates across rooftops and courtyard ledges to honor crows—revered as swift messengers carrying news between worlds.',
    traditions: [
      'Offer rice, sel roti, and sweets on green sal-leaf tapari before eating',
      'Sweep courtyards with red clay and fresh cow-dung paste to prepare for Laxmi',
      'String early garlands of bright orange sayapatri marigolds along doorways',
    ],
    blessingPhrase: 'May every message arriving at your threshold bring peace.',
    imageSrc: '/src/assets/images/tihar_kaag_dawn_offering_1794925935918.jpg',
    imageAlt: 'Glossy Himalayan crow perched beside a green sal-leaf tapari platter with rice, sel roti, and a lit clay diyo on a sunlit Kathmandu brick terrace',
    accentHex: '#E89B1E',
  },
  {
    dayNumber: 2,
    id: 'kukur-tihar',
    nepaliName: 'कुकुर तिहार',
    nepalBhasaName: 'Khicha Puja',
    title: 'Kukur Tihar',
    lunarDate: 'Kartik Krishna Chaturdashi',
    honoree: 'Dogs · Guardians of Dharma',
    offering: 'Sayapatri mala & vermilion tika',
    summary:
      'Every dog—beloved companion and neighborhood street guardian alike—is honored with a fragrant garland of marigold blossoms, a bright red abir tika on the forehead, and a generous meal of meat, milk, and rice.',
    traditions: [
      'Drape hand-strung sayapatri marigold garlands around every dog',
      'Apply vermilion and curd-rice tika as a mark of gratitude and protection',
      'Serve warm festive treats celebrating loyalty and companionship',
    ],
    blessingPhrase: 'Loyalty and gentle guardianship walk beside every home.',
    imageSrc: '/src/assets/images/tihar_kukur_marigold_1794923813232.jpg',
    imageAlt: 'Himalayan dog adorned with a marigold garland and red forehead tika in a sunlit Nepali courtyard',
    accentHex: '#D95338',
  },
  {
    dayNumber: 3,
    id: 'laxmi-puja',
    nepaliName: 'गाई तिहार र लक्ष्मी पूजा',
    nepalBhasaName: 'Sa Puja & Laxmi Puja',
    title: 'Gai Tihar & Laxmi Puja',
    lunarDate: 'Kartik Amavasya',
    honoree: 'Sacred Cow & Goddess Laxmi',
    offering: 'Rows of clay diyas & rangoli trails',
    summary:
      'On the darkest new-moon night of autumn, doorways bloom with rice-flour mandalas and glowing clay diyas. Tiny painted footprints lead from the threshold to the altar as girls sing Bhailo from courtyard to courtyard.',
    traditions: [
      'Morning worship of cows with yellow turmeric garlands and sacred yellow threads',
      'Draw intricate mandap and lotus rangolis at thresholds with colored rice flour',
      'Light rows of mustard-oil clay diyas along windows, stairs, and rooftops',
    ],
    blessingPhrase: 'Where warm light gathers at dusk, abundance enters freely.',
    imageSrc: '/src/assets/images/tihar_laxmi_puja_courtyard_1794923812709.jpg',
    imageAlt: 'Kathmandu brick courtyard glowing with clay diyo lamps, marigolds, and a colorful rangoli mandala at dusk',
    accentHex: '#F5A623',
  },
  {
    dayNumber: 4,
    id: 'mha-puja',
    nepaliName: 'गोवर्धन पूजा र म्हः पूजा',
    nepalBhasaName: 'Mha Puja · Nepal Sambat New Year',
    title: 'Govardhan & Mha Puja',
    lunarDate: 'Kartik Shukla Pratipada',
    honoree: 'Self-Soul & Nepal Sambat New Year',
    offering: 'Individual floor mandalas & sukunda',
    summary:
      'In Newar households, Mha Puja celebrates the divinity within oneself at the dawn of Nepal Sambat. Each family member sits before a geometric rice-flour mandala lit by a brass sukunda lamp while receiving auspicious sagun.',
    traditions: [
      'Craft personal sand-and-rice mandalas for every member of the household',
      'Offer fruits, roasted grains, yoghurt, and a lit cotton wick for longevity',
      'Welcome Nepal Sambat New Year with Deusi songs echoing down brick alleys',
    ],
    blessingPhrase: 'Honor the quiet light within your own spirit this new year.',
    imageSrc: '/src/assets/images/tihar_mha_puja_mandala_1794925937318.jpg',
    imageAlt: 'Traditional Newari Mha Puja floor mandala painted in white rice flour and vermilion beside a lit brass sukunda lamp and sagun platter',
    accentHex: '#C93B2B',
  },
  {
    dayNumber: 5,
    id: 'bhai-tika',
    nepaliName: 'भाइटीका',
    nepalBhasaName: 'Kija Puja',
    title: 'Bhai Tika',
    lunarDate: 'Kartik Shukla Dwitiya',
    honoree: 'Brothers & Sisters · Eternal Bond',
    offering: 'Saptarangi tika & makhamali mala',
    summary:
      'Sisters trace a protective circle of mustard oil and water around their brothers, crack a walnut at the doorway to ward off misfortune, and place seven-colored Saptarangi Tika alongside evergreen purple makhamali garlands.',
    traditions: [
      'Walk three times around the brother pouring a continuous ring of sacred oil',
      'Apply vertical seven-band Saptarangi Tika of red, yellow, green, blue, violet, saffron, and white',
      'Exchange unfading purple makhamali garlands, dubo grass, and sweet platters',
    ],
    blessingPhrase: 'Like the makhamali blossom, may our bond never fade.',
    imageSrc: '/src/assets/images/tihar_bhai_tika_thali_1794923813850.jpg',
    imageAlt: 'Brass Bhai Tika platter with saptarangi seven-color tika, purple makhamali garland, walnuts, and sukunda lamp',
    accentHex: '#A63A79',
  },
];

export interface MandalaMotifSpec {
  id: 'padma' | 'ashtamangala' | 'mhapuja' | 'swastik';
  name: string;
  originNote: string;
  petalCount: number;
  ringRadii: number[];
}

export const MANDALA_MOTIFS: MandalaMotifSpec[] = [
  {
    id: 'padma',
    name: 'Padma Lotus Mandap',
    originNote: 'Eight-petaled threshold lotus welcoming Laxmi',
    petalCount: 8,
    ringRadii: [34, 62, 92, 118],
  },
  {
    id: 'mhapuja',
    name: 'Mha Puja Newar Mandala',
    originNote: 'Concentric rice-flour cosmos for New Year purification',
    petalCount: 12,
    ringRadii: [28, 56, 86, 116],
  },
  {
    id: 'ashtamangala',
    name: 'Ashtamangala Star',
    originNote: 'Intersecting squares symbolizing harmony of eight directions',
    petalCount: 8,
    ringRadii: [32, 66, 98, 120],
  },
  {
    id: 'swastik',
    name: 'Surya Chakra Rangoli',
    originNote: 'Sixteen-ray autumn sun mandala in turmeric & abir',
    petalCount: 16,
    ringRadii: [30, 58, 90, 120],
  },
];

export interface MandalaPalette {
  id: 'marigold' | 'saptarangi' | 'newari';
  name: string;
  colors: string[];
}

export const MANDALA_PALETTES: MandalaPalette[] = [
  {
    id: 'marigold',
    name: 'Sayapatri & Sindoor',
    colors: ['#F5A623', '#D95338', '#F2C94C', '#F7EFE2'],
  },
  {
    id: 'saptarangi',
    name: 'Saptarangi Seven-Hue',
    colors: ['#D93B2B', '#F5A623', '#2E9E6B', '#A63A79'],
  },
  {
    id: 'newari',
    name: 'Patan Terracotta & Gold',
    colors: ['#C93B2B', '#E3B23C', '#EDE2D0', '#7D2922'],
  },
];

export interface MandalaGeometryPoint {
  cx: number;
  cy: number;
  angleDeg: number;
}

export function computeMandalaPetalPoints(
  center: number,
  radius: number,
  petalCount: number,
): MandalaGeometryPoint[] {
  const safeCount = Math.max(4, Math.min(32, Math.floor(petalCount)));
  const points: MandalaGeometryPoint[] = [];
  for (let i = 0; i < safeCount; i++) {
    const angleDeg = (360 / safeCount) * i;
    const rad = (angleDeg * Math.PI) / 180;
    points.push({
      cx: Number((center + Math.cos(rad) * radius).toFixed(2)),
      cy: Number((center + Math.sin(rad) * radius).toFixed(2)),
      angleDeg: Number(angleDeg.toFixed(2)),
    });
  }
  return points;
}

export function buildLotusPetalPath(
  center: number,
  innerR: number,
  outerR: number,
  halfSpreadRad: number,
  angleRad: number,
): string {
  const tipX = center + Math.cos(angleRad) * outerR;
  const tipY = center + Math.sin(angleRad) * outerR;
  const baseX = center + Math.cos(angleRad) * innerR;
  const baseY = center + Math.sin(angleRad) * innerR;
  const midR = (innerR + outerR) * 0.56;
  const leftX = center + Math.cos(angleRad - halfSpreadRad) * midR;
  const leftY = center + Math.sin(angleRad - halfSpreadRad) * midR;
  const rightX = center + Math.cos(angleRad + halfSpreadRad) * midR;
  const rightY = center + Math.sin(angleRad + halfSpreadRad) * midR;

  return `M ${baseX.toFixed(2)} ${baseY.toFixed(2)} Q ${leftX.toFixed(2)} ${leftY.toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)} Q ${rightX.toFixed(2)} ${rightY.toFixed(2)} ${baseX.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

export interface DeusiVerse {
  id: string;
  tradition: 'Deusi' | 'Bhailo';
  lead: string;
  chorus: string;
  englishMeaning: string;
}

export const DEUSI_VERSES: DeusiVerse[] = [
  {
    id: 'bhailo-1',
    tradition: 'Bhailo',
    lead: 'Bhailini aayin aagana, badari koodari rakhana...',
    chorus: 'Hey Bhailo!',
    englishMeaning:
      'The Bhailo singers have arrived in your courtyard—sweep the threshold clean and welcome the festive evening.',
  },
  {
    id: 'deusi-1',
    tradition: 'Deusi',
    lead: 'A hai — Ratimati chhano, sunchandi ko daano...',
    chorus: 'Deusi Re!',
    englishMeaning:
      'Beneath your warm tiled eaves, may golden grain and quiet prosperity fill every room of this household.',
  },
  {
    id: 'deusi-2',
    tradition: 'Deusi',
    lead: 'A hai — Hami ta aayau, Bali Raja le pathayeko...',
    chorus: 'Deusi Re!',
    englishMeaning:
      'We have come in the ancient tradition sent by King Bali, singing blessings in rhythm to the Madal drum.',
  },
  {
    id: 'bhailo-2',
    tradition: 'Bhailo',
    lead: 'Jhilimili jhilimili batti balera, Laxmi ko aagaman...',
    chorus: 'Hey Bhailo!',
    englishMeaning:
      'With rows of flickering lamps glowing like stars, we invite grace and joyful warmth into your home.',
  },
];

export interface CourtyardWish {
  id: string;
  sender: string;
  city: string;
  message: string;
  dayTag: string;
  createdAt: string;
}

export const INITIAL_COURTYARD_WISHES: CourtyardWish[] = [
  {
    id: 'seed-1',
    sender: 'Aarav Shrestha',
    city: 'Patan, Lalitpur',
    message: 'Shubha Dipawali & Bhintuna! May every brick courtyard glow warmly tonight.',
    dayTag: 'Mha Puja',
    createdAt: '2026-11-16T18:10:00Z',
  },
  {
    id: 'seed-2',
    sender: 'Srijana Gurung',
    city: 'Pokhara',
    message: 'Wishing my brothers health, laughter, and endless sel roti on Bhai Tika.',
    dayTag: 'Bhai Tika',
    createdAt: '2026-11-16T19:25:00Z',
  },
  {
    id: 'seed-3',
    sender: 'Prakash Adhikari',
    city: 'Bhaktapur',
    message: 'Lighting a clay diyo for our neighborhood street dogs this Kukur Tihar.',
    dayTag: 'Kukur Tihar',
    createdAt: '2026-11-16T20:05:00Z',
  },
];

export interface WishValidationResult {
  valid: boolean;
  errors: {
    sender?: string;
    city?: string;
    message?: string;
  };
}

export function validateCourtyardWishInput(input: {
  sender: string;
  city: string;
  message: string;
}): WishValidationResult {
  const errors: WishValidationResult['errors'] = {};
  const trimmedSender = input.sender.trim();
  const trimmedCity = input.city.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedSender.length < 2) {
    errors.sender = 'Please enter your name (at least 2 characters).';
  } else if (trimmedSender.length > 48) {
    errors.sender = 'Name must be 48 characters or fewer.';
  }

  if (trimmedCity.length < 2) {
    errors.city = 'Please enter a city or neighborhood.';
  } else if (trimmedCity.length > 48) {
    errors.city = 'City must be 48 characters or fewer.';
  }

  if (trimmedMessage.length < 6) {
    errors.message = 'Please write a Tihar blessing (at least 6 characters).';
  } else if (trimmedMessage.length > 180) {
    errors.message = 'Blessing must be 180 characters or fewer.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createCourtyardWish(
  input: { sender: string; city: string; message: string; dayTag: string },
  nowIso: string = new Date().toISOString(),
): CourtyardWish {
  return {
    id: `diyo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: input.sender.trim(),
    city: input.city.trim(),
    message: input.message.trim(),
    dayTag: input.dayTag,
    createdAt: nowIso,
  };
}

export const ARTIFACT_META: Record<
  ArtifactId,
  {
    label: string;
    nepaliLabel: string;
    subtitle: string;
    partsCount: number;
    craftNote: string;
  }
> = {
  diyo: {
    label: 'Clay Diyo & Mandap',
    nepaliLabel: 'माटोको दियो',
    subtitle: 'Hand-thrown terracotta oil lamp over an Ashtamangala floor mandala',
    partsCount: 8,
    craftNote: 'Mustard oil reservoir, twisted cotton batti, and marigold ring',
  },
  sukunda: {
    label: 'Brass Sukunda',
    nepaliLabel: 'सुकुन्दा',
    subtitle: 'Ceremonial Newari brass oil lamp with arched peacock torana crest',
    partsCount: 9,
    craftNote: 'Lost-wax cast brass base, Ganesha emblem, and curved handle',
  },
  lantern: {
    label: 'Aakash Deep Lantern',
    nepaliLabel: 'आकाश दीप',
    subtitle: 'Carved wooden pagoda sky lantern with glowing Lokta handmade paper',
    partsCount: 10,
    craftNote: 'Six-sided Aankhijhyal lattice, tiered eaves, and hanging brass bells',
  },
  thali: {
    label: 'Bhai Tika Thali',
    nepaliLabel: 'भाइटीका थाली',
    subtitle: 'Hammered brass ceremonial platter with Saptarangi Tika & Kalash',
    partsCount: 11,
    craftNote: 'Seven pigment katoris, makhamali garland, walnuts, and sel roti',
  },
};

export type GalleryCategory = 'all' | 'rituals' | 'celebration' | 'architecture';

export interface TiharGalleryItem {
  id: string;
  title: string;
  nepaliTitle: string;
  category: Exclude<GalleryCategory, 'all'>;
  location: string;
  dayReference: string;
  caption: string;
  layoutSpan: 'featured' | 'wide' | 'tall' | 'standard';
  imageSrc: string;
  imageAlt: string;
}

export const TIHAR_GALLERY_ITEMS: TiharGalleryItem[] = [
  {
    id: 'kathmandu-rooftops',
    title: 'Jhilimili Kathmandu Skyline',
    nepaliTitle: 'झिलिमिली काठमाडौं',
    category: 'architecture',
    location: 'Patan & Kathmandu Valley',
    dayReference: 'Laxmi Puja Dusk',
    caption:
      'Tiered Newari pagoda roofs and carved brick terraces trace the valley skyline in warm mustard-oil diyas and golden fairy lights.',
    layoutSpan: 'featured',
    imageSrc: '/src/assets/images/tihar_kathmandu_rooftop_lights_1794925937935.jpg',
    imageAlt: 'Twilight panorama of Kathmandu Valley pagoda roofs glowing with rows of clay diyas and golden fairy lights',
  },
  {
    id: 'aakash-deep-lantern',
    title: 'Aakash Deep Under the Eaves',
    nepaliTitle: 'आकाश दीप',
    category: 'architecture',
    location: 'Bhaktapur',
    dayReference: 'Kartik Evening',
    caption:
      'Carved dark teakwood and fibrous Lokta paper glow at blue hour beside strung orange sayapatri garlands and brass temple bells.',
    layoutSpan: 'tall',
    imageSrc: '/src/assets/images/tihar_aakash_deep_night_1794925937447.jpg',
    imageAlt: 'Hexagonal carved wooden and glowing handmade Lokta paper Aakash Deep lantern hanging beside marigolds at blue hour',
  },
  {
    id: 'kukur-garland',
    title: 'Kukur Tihar Companion',
    nepaliTitle: 'कुकुर तिहार',
    category: 'rituals',
    location: 'Lalitpur Courtyard',
    dayReference: 'Day 02 · Khicha Puja',
    caption:
      'A Himalayan guardian honored with a lush wreath of freshly strung marigolds and bright vermilion abir tika.',
    layoutSpan: 'standard',
    imageSrc: '/src/assets/images/tihar_kukur_marigold_1794923813232.jpg',
    imageAlt: 'Himalayan dog wearing a sayapatri marigold garland and red forehead tika in a sunlit courtyard',
  },
  {
    id: 'sel-roti-feast',
    title: 'Golden Sel Roti & Mithai',
    nepaliTitle: 'सेल रोटी र मिठाई',
    category: 'celebration',
    location: 'Pokhara Kitchen',
    dayReference: 'Tihar Feast',
    caption:
      'Crisp fermented rice-batter rings fried in ghee until amber, shared across neighbors alongside spiced tea and brass platters.',
    layoutSpan: 'standard',
    imageSrc: '/src/assets/images/tihar_sel_roti_feast_1794923813569.jpg',
    imageAlt: 'Golden fried sel roti stacked on a brass platter beside marigolds and glowing clay diyas',
  },
  {
    id: 'deusi-bhailo-alley',
    title: 'Deusi-Bhailo Alley Chorus',
    nepaliTitle: 'देउसी भैलो',
    category: 'celebration',
    location: 'Patan Brick Lane',
    dayReference: 'Dusk Procession',
    caption:
      'Neighborhood carolers carry a slung madal drum and oil lanterns beneath arches of strung marigolds and glowing bulbs.',
    layoutSpan: 'wide',
    imageSrc: '/src/assets/images/tihar_deusi_bhailo_alley_1794925937156.jpg',
    imageAlt: 'Nepali youths walking through a marigold-draped Patan brick alley with a madal drum and glowing lanterns at dusk',
  },
  {
    id: 'mha-puja-floor',
    title: 'Mha Puja Rice-Flour Cosmos',
    nepaliTitle: 'म्हः पूजा मण्डप',
    category: 'rituals',
    location: 'Kirtipur',
    dayReference: 'Day 04 · Nepal Sambat',
    caption:
      'Hand-drawn geometric mandalas paired with brass sukunda lamps, walnuts, and auspicious sagun trays on dark timber floorboards.',
    layoutSpan: 'standard',
    imageSrc: '/src/assets/images/tihar_mha_puja_mandala_1794925937318.jpg',
    imageAlt: 'Intricate rice-flour and vermilion Mha Puja mandala on dark wood beside a lit brass sukunda lamp',
  },
  {
    id: 'bhai-tika-saptarangi',
    title: 'Saptarangi Tika & Makhamali',
    nepaliTitle: 'भाइटीका थाली',
    category: 'rituals',
    location: 'Kathmandu',
    dayReference: 'Day 05 · Kija Puja',
    caption:
      'Seven vertical pigments, evergreen purple makhamali blooms, dubo grass, and unbroken walnuts prepared for sibling blessings.',
    layoutSpan: 'standard',
    imageSrc: '/src/assets/images/tihar_bhai_tika_thali_1794923813850.jpg',
    imageAlt: 'Brass Bhai Tika platter holding seven-color tika powders, purple makhamali garland, and walnuts',
  },
  {
    id: 'kaag-tapari-dawn',
    title: 'Kaag Tihar Dawn Tapari',
    nepaliTitle: 'काग तिहार',
    category: 'rituals',
    location: 'Pashupati Ridge',
    dayReference: 'Day 01 · Kwaha Puja',
    caption:
      'Morning light across red-brick parapets where crows gather beside woven sal-leaf platters holding rice, sel roti, and a clay lamp.',
    layoutSpan: 'wide',
    imageSrc: '/src/assets/images/tihar_kaag_dawn_offering_1794925935918.jpg',
    imageAlt: 'Black crow beside a woven green leaf tapari filled with rice, sweets, and a lit clay diyo on a Kathmandu brick ledge',
  },
  {
    id: 'laxmi-courtyard-rangoli',
    title: 'Laxmi Puja Threshold Lamps',
    nepaliTitle: 'लक्ष्मी पूजा आँगन',
    category: 'architecture',
    location: 'Basantapur',
    dayReference: 'Day 03 · Kartik Amavasya',
    caption:
      'Earthen diyas flickering around vibrant lotus rangolis on weathered stone steps inviting prosperity through every carved doorway.',
    layoutSpan: 'wide',
    imageSrc: '/src/assets/images/tihar_laxmi_puja_courtyard_1794923812709.jpg',
    imageAlt: 'Brick courtyard glowing with clay diyo lamps, marigold petals, and a colorful floor rangoli at dusk',
  },
];

export function filterGalleryItems(
  items: TiharGalleryItem[],
  category: GalleryCategory,
): TiharGalleryItem[] {
  if (category === 'all') return items;
  return items.filter((item) => item.category === category);
}
