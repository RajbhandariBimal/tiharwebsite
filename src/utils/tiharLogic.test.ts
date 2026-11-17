import test from 'node:test';
import assert from 'node:assert/strict';
import {
  YAMAPANCHAK_DAYS,
  MANDALA_MOTIFS,
  ARTIFACT_META,
  TIHAR_GALLERY_ITEMS,
  filterGalleryItems,
  computeMandalaPetalPoints,
  buildLotusPetalPath,
  validateCourtyardWishInput,
  createCourtyardWish,
} from './tiharLogic';

test('Yamapanchak covers all 5 sequential days of Tihar with unique non-empty media', () => {
  assert.equal(YAMAPANCHAK_DAYS.length, 5);
  const seenImages = new Set<string>();
  YAMAPANCHAK_DAYS.forEach((day, idx) => {
    assert.equal(day.dayNumber, idx + 1);
    assert.ok(day.title.length > 0);
    assert.ok(day.imageSrc.startsWith('/src/assets/images/'));
    assert.equal(seenImages.has(day.imageSrc), false);
    seenImages.add(day.imageSrc);
    assert.equal(day.traditions.length, 3);
  });
});

test('Gallery catalog covers rituals, celebration, and architecture categories', () => {
  assert.ok(TIHAR_GALLERY_ITEMS.length >= 8);
  assert.equal(filterGalleryItems(TIHAR_GALLERY_ITEMS, 'all').length, TIHAR_GALLERY_ITEMS.length);
  const rituals = filterGalleryItems(TIHAR_GALLERY_ITEMS, 'rituals');
  const celebration = filterGalleryItems(TIHAR_GALLERY_ITEMS, 'celebration');
  const architecture = filterGalleryItems(TIHAR_GALLERY_ITEMS, 'architecture');
  assert.ok(rituals.length >= 2);
  assert.ok(celebration.length >= 2);
  assert.ok(architecture.length >= 2);
  assert.equal(rituals.every((item) => item.category === 'rituals'), true);
});

test('All 4 3D artifacts declare composite >= 3 parts metadata', () => {
  const keys = Object.keys(ARTIFACT_META) as Array<keyof typeof ARTIFACT_META>;
  assert.equal(keys.length, 4);
  for (const key of keys) {
    assert.ok(ARTIFACT_META[key].partsCount >= 3);
    assert.ok(ARTIFACT_META[key].label.length > 0);
  }
});

test('computeMandalaPetalPoints places equidistant points around center', () => {
  const points = computeMandalaPetalPoints(150, 100, 8);
  assert.equal(points.length, 8);
  // First point at 0 degrees -> (250, 150)
  assert.equal(points[0].cx, 250);
  assert.equal(points[0].cy, 150);
  // Opposite point at 180 degrees -> (50, 150)
  assert.equal(points[4].cx, 50);
  assert.equal(points[4].cy, 150);
});

test('buildLotusPetalPath produces valid closed SVG quadratic path', () => {
  const path = buildLotusPetalPath(150, 30, 90, 0.25, 0);
  assert.ok(path.startsWith('M '));
  assert.ok(path.includes(' Q '));
  assert.ok(path.endsWith(' Z'));
});

test('Mandala motifs define increasing concentric ring radii', () => {
  for (const motif of MANDALA_MOTIFS) {
    assert.equal(motif.ringRadii.length, 4);
    for (let i = 1; i < motif.ringRadii.length; i++) {
      assert.ok(motif.ringRadii[i] > motif.ringRadii[i - 1]);
    }
  }
});

test('validateCourtyardWishInput rejects empty and too-short inputs without silent fallbacks', () => {
  const emptyResult = validateCourtyardWishInput({
    sender: ' ',
    city: '',
    message: 'hi',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.sender);
  assert.ok(emptyResult.errors.city);
  assert.ok(emptyResult.errors.message);

  const validResult = validateCourtyardWishInput({
    sender: 'Kiran Maharjan',
    city: 'Kathmandu',
    message: 'May your home shine with clay diyas all week!',
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});

test('createCourtyardWish trims fields and assigns deterministic fields', () => {
  const wish = createCourtyardWish(
    {
      sender: '  Maya Tamang  ',
      city: '  Lalitpur ',
      message: '  Shubha Tihar to everyone!  ',
      dayTag: 'Laxmi Puja',
    },
    '2026-11-17T10:00:00Z',
  );
  assert.equal(wish.sender, 'Maya Tamang');
  assert.equal(wish.city, 'Lalitpur');
  assert.equal(wish.message, 'Shubha Tihar to everyone!');
  assert.equal(wish.dayTag, 'Laxmi Puja');
  assert.equal(wish.createdAt, '2026-11-17T10:00:00Z');
  assert.ok(wish.id.startsWith('diyo-'));
});
