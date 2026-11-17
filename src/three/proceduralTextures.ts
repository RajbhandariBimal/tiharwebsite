import * as THREE from 'three';

export interface ProceduralTextureSet {
  mandalaColorMap: THREE.CanvasTexture;
  brassBumpMap: THREE.CanvasTexture;
  clayBumpMap: THREE.CanvasTexture;
  loktaPaperMap: THREE.CanvasTexture;
  courtyardBrickMap: THREE.CanvasTexture;
  courtyardFloorMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createTiharTextures(maxAnisotropy: number): ProceduralTextureSet {
  const safeAnisotropy = Math.max(1, Math.min(8, maxAnisotropy));

  // 1. Vibrant Nepali Ashtamangala & Lotus Rangoli Mandala CanvasTexture (SRGBColorSpace)
  const mandalaCanvas = document.createElement('canvas');
  mandalaCanvas.width = 512;
  mandalaCanvas.height = 512;
  const mCtx = mandalaCanvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  // Deep terracotta-stone base
  const bgGrad = mCtx.createRadialGradient(cx, cy, 20, cx, cy, 256);
  bgGrad.addColorStop(0, '#3D1518');
  bgGrad.addColorStop(0.65, '#25101A');
  bgGrad.addColorStop(1, '#160E18');
  mCtx.fillStyle = bgGrad;
  mCtx.fillRect(0, 0, 512, 512);

  // Outer rice-flour dot border (16-fold)
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    mCtx.fillStyle = i % 2 === 0 ? '#F7EFE2' : '#F5A623';
    mCtx.beginPath();
    mCtx.arc(cx + Math.cos(a) * 232, cy + Math.sin(a) * 232, i % 2 === 0 ? 6 : 4, 0, Math.PI * 2);
    mCtx.fill();
  }

  // Concentric painted rice-flour rings
  const rings = [
    { r: 214, color: '#E89B1E', width: 5 },
    { r: 196, color: '#C93B2B', width: 8 },
    { r: 162, color: '#F7EFE2', width: 3 },
    { r: 122, color: '#2E9E6B', width: 6 },
    { r: 84, color: '#F5A623', width: 5 },
  ];
  rings.forEach(({ r, color, width }) => {
    mCtx.strokeStyle = color;
    mCtx.lineWidth = width;
    mCtx.beginPath();
    mCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mCtx.stroke();
  });

  // Outer 16 lotus petals (Sayapatri orange & crimson)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    mCtx.save();
    mCtx.translate(cx, cy);
    mCtx.rotate(a);
    mCtx.fillStyle = i % 2 === 0 ? '#E89B1E' : '#C93B2B';
    mCtx.beginPath();
    mCtx.moveTo(126, 0);
    mCtx.quadraticCurveTo(160, -24, 190, 0);
    mCtx.quadraticCurveTo(160, 24, 126, 0);
    mCtx.fill();
    mCtx.strokeStyle = '#F7EFE2';
    mCtx.lineWidth = 2;
    mCtx.stroke();
    mCtx.restore();
  }

  // Intersecting sacred squares (Bhupura / Mandap)
  for (let s = 0; s < 2; s++) {
    mCtx.save();
    mCtx.translate(cx, cy);
    mCtx.rotate((s * Math.PI) / 4);
    mCtx.strokeStyle = s === 0 ? '#F5A623' : '#F7EFE2';
    mCtx.lineWidth = 4;
    mCtx.strokeRect(-72, -72, 144, 144);
    mCtx.restore();
  }

  // Inner 8 lotus petals (Makhamali magenta & gold)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    mCtx.save();
    mCtx.translate(cx, cy);
    mCtx.rotate(a);
    mCtx.fillStyle = i % 2 === 0 ? '#A63A79' : '#F5A623';
    mCtx.beginPath();
    mCtx.moveTo(22, 0);
    mCtx.quadraticCurveTo(48, -16, 74, 0);
    mCtx.quadraticCurveTo(48, 16, 22, 0);
    mCtx.fill();
    mCtx.restore();
  }

  // Central bindu
  mCtx.fillStyle = '#F7EFE2';
  mCtx.beginPath();
  mCtx.arc(cx, cy, 16, 0, Math.PI * 2);
  mCtx.fill();
  mCtx.fillStyle = '#C93B2B';
  mCtx.beginPath();
  mCtx.arc(cx, cy, 9, 0, Math.PI * 2);
  mCtx.fill();

  const mandalaColorMap = new THREE.CanvasTexture(mandalaCanvas);
  mandalaColorMap.colorSpace = THREE.SRGBColorSpace;
  mandalaColorMap.anisotropy = safeAnisotropy;

  // 2. Hammered Brass Bump/Roughness Map (Linear / NoColorSpace)
  const brassCanvas = document.createElement('canvas');
  brassCanvas.width = 256;
  brassCanvas.height = 256;
  const bCtx = brassCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  // Deterministic pseudo-random hammered dimples
  for (let i = 0; i < 420; i++) {
    const x = ((i * 73) % 256);
    const y = ((i * 137) % 256);
    const r = 4 + (i % 7);
    const g = bCtx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(215, 215, 215, 0.45)');
    g.addColorStop(1, 'rgba(90, 90, 90, 0)');
    bCtx.fillStyle = g;
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }
  const brassBumpMap = new THREE.CanvasTexture(brassCanvas);
  brassBumpMap.wrapS = THREE.RepeatWrapping;
  brassBumpMap.wrapT = THREE.RepeatWrapping;
  brassBumpMap.repeat.set(3, 3);
  brassBumpMap.anisotropy = safeAnisotropy;

  // 3. Hand-thrown Terracotta Clay Micro-Relief Map (Linear / NoColorSpace)
  const clayCanvas = document.createElement('canvas');
  clayCanvas.width = 256;
  clayCanvas.height = 256;
  const cCtx = clayCanvas.getContext('2d')!;
  cCtx.fillStyle = '#888888';
  cCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    const shade = 115 + Math.floor(Math.sin(y * 0.45) * 28);
    cCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
    cCtx.fillRect(0, y, 256, 2);
  }
  for (let i = 0; i < 600; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    cCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(40,40,40,0.16)';
    cCtx.fillRect(x, y, 2, 2);
  }
  const clayBumpMap = new THREE.CanvasTexture(clayCanvas);
  clayBumpMap.wrapS = THREE.RepeatWrapping;
  clayBumpMap.wrapT = THREE.RepeatWrapping;
  clayBumpMap.repeat.set(2, 2);
  clayBumpMap.anisotropy = safeAnisotropy;

  // 4. Warm Handmade Nepali Lokta Paper + Mandala Motif Texture (SRGBColorSpace)
  const loktaCanvas = document.createElement('canvas');
  loktaCanvas.width = 256;
  loktaCanvas.height = 256;
  const lCtx = loktaCanvas.getContext('2d')!;
  const lGrad = lCtx.createLinearGradient(0, 0, 0, 256);
  lGrad.addColorStop(0, '#FFD479');
  lGrad.addColorStop(0.5, '#FFB140');
  lGrad.addColorStop(1, '#E87A24');
  lCtx.fillStyle = lGrad;
  lCtx.fillRect(0, 0, 256, 256);

  // Subtle fibrous paper flecks
  for (let i = 0; i < 320; i++) {
    const x = (i * 67) % 256;
    const y = (i * 113) % 256;
    lCtx.strokeStyle = 'rgba(130, 58, 12, 0.22)';
    lCtx.lineWidth = 1;
    lCtx.beginPath();
    lCtx.moveTo(x, y);
    lCtx.lineTo(x + ((i % 9) - 4), y + ((i % 7) - 3));
    lCtx.stroke();
  }
  // Centered Lotus emblem silhouette on paper panels
  lCtx.strokeStyle = 'rgba(135, 36, 16, 0.55)';
  lCtx.lineWidth = 3;
  lCtx.beginPath();
  lCtx.arc(128, 128, 52, 0, Math.PI * 2);
  lCtx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    lCtx.beginPath();
    lCtx.arc(128 + Math.cos(a) * 32, 128 + Math.sin(a) * 32, 16, 0, Math.PI * 2);
    lCtx.stroke();
  }
  const loktaPaperMap = new THREE.CanvasTexture(loktaCanvas);
  loktaPaperMap.colorSpace = THREE.SRGBColorSpace;
  loktaPaperMap.anisotropy = safeAnisotropy;

  // 5. Traditional Newari Terracotta Dachi Appa Brick Texture (SRGBColorSpace)
  const brickCanvas = document.createElement('canvas');
  brickCanvas.width = 256;
  brickCanvas.height = 256;
  const brCtx = brickCanvas.getContext('2d')!;
  brCtx.fillStyle = '#2B1514';
  brCtx.fillRect(0, 0, 256, 256);

  const brickRows = 8;
  const brickCols = 4;
  const bh = 256 / brickRows;
  const bw = 256 / brickCols;
  const brickTones = ['#7C2D23', '#6E261E', '#8A3427', '#5E211B'];

  for (let row = 0; row < brickRows; row++) {
    const offset = row % 2 === 0 ? 0 : bw * 0.5;
    for (let col = -1; col <= brickCols; col++) {
      const tone = brickTones[(row * 5 + col + 4) % brickTones.length];
      brCtx.fillStyle = tone;
      brCtx.fillRect(col * bw + offset + 2, row * bh + 2, bw - 4, bh - 4);
      // Subtle top highlight on glazed Newari brick edge
      brCtx.fillStyle = 'rgba(255, 196, 130, 0.08)';
      brCtx.fillRect(col * bw + offset + 2, row * bh + 2, bw - 4, 3);
    }
  }
  const courtyardBrickMap = new THREE.CanvasTexture(brickCanvas);
  courtyardBrickMap.colorSpace = THREE.SRGBColorSpace;
  courtyardBrickMap.wrapS = THREE.RepeatWrapping;
  courtyardBrickMap.wrapT = THREE.RepeatWrapping;
  courtyardBrickMap.repeat.set(3, 2);
  courtyardBrickMap.anisotropy = safeAnisotropy;

  // 6. Kathmandu Stone Courtyard Floor with Painted Rice-Flour Border & Laxmi Paila (SRGBColorSpace)
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  const fcx = 256;
  const fcy = 256;

  const floorGrad = fCtx.createRadialGradient(fcx, fcy, 40, fcx, fcy, 256);
  floorGrad.addColorStop(0, '#241621');
  floorGrad.addColorStop(0.55, '#1B121F');
  floorGrad.addColorStop(1, '#120D1A');
  fCtx.fillStyle = floorGrad;
  fCtx.fillRect(0, 0, 512, 512);

  // Radial paving stone rings
  fCtx.strokeStyle = 'rgba(232, 155, 30, 0.16)';
  fCtx.lineWidth = 2;
  for (const r of [118, 156, 198, 236]) {
    fCtx.beginPath();
    fCtx.arc(fcx, fcy, r, 0, Math.PI * 2);
    fCtx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    fCtx.beginPath();
    fCtx.moveTo(fcx + Math.cos(a) * 118, fcy + Math.sin(a) * 118);
    fCtx.lineTo(fcx + Math.cos(a) * 236, fcy + Math.sin(a) * 236);
    fCtx.stroke();
  }

  // Painted rice-flour & Sindoor Laxmi Paila (sacred footprint trail approaching central altar)
  for (let step = 0; step < 5; step++) {
    const yPos = 455 - step * 36;
    const xOff = step % 2 === 0 ? -11 : 11;
    fCtx.save();
    fCtx.translate(fcx + xOff, yPos);
    fCtx.fillStyle = 'rgba(247, 239, 226, 0.68)';
    fCtx.beginPath();
    fCtx.ellipse(0, 0, 5.5, 9, 0, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.fillStyle = 'rgba(232, 155, 30, 0.78)';
    for (let t = -2; t <= 2; t++) {
      fCtx.beginPath();
      fCtx.arc(t * 2.2, -10.5, 1.4, 0, Math.PI * 2);
      fCtx.fill();
    }
    fCtx.restore();
  }

  const courtyardFloorMap = new THREE.CanvasTexture(floorCanvas);
  courtyardFloorMap.colorSpace = THREE.SRGBColorSpace;
  courtyardFloorMap.anisotropy = safeAnisotropy;

  return {
    mandalaColorMap,
    brassBumpMap,
    clayBumpMap,
    loktaPaperMap,
    courtyardBrickMap,
    courtyardFloorMap,
    dispose: () => {
      mandalaColorMap.dispose();
      brassBumpMap.dispose();
      clayBumpMap.dispose();
      loktaPaperMap.dispose();
      courtyardBrickMap.dispose();
      courtyardFloorMap.dispose();
    },
  };
}
