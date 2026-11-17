import * as THREE from 'three';
import type { ProceduralTextureSet } from './proceduralTextures';
import type { LightingMood } from '../utils/tiharLogic';

export interface CourtyardBackdrop {
  group: THREE.Group;
  updateBackdrop: (
    isLit: boolean,
    mood: LightingMood,
    elapsed: number,
    burst: number,
    dt: number,
    instantMood?: boolean,
  ) => void;
  dispose: () => void;
}

function createWarmFloorGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 198, 92, 0.95)');
  grad.addColorStop(0.45, 'rgba(255, 142, 42, 0.42)');
  grad.addColorStop(0.78, 'rgba(210, 78, 22, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildNewariCourtyardBackdrop(textures: ProceduralTextureSet): CourtyardBackdrop {
  const group = new THREE.Group();

  // 1. Patterned Stone Courtyard Floor Plaza with Laxmi Paila Trail (above base ground)
  const plazaGeo = new THREE.CircleGeometry(7.2, 64);
  plazaGeo.rotateX(-Math.PI / 2);
  const plazaMat = new THREE.MeshStandardMaterial({
    map: textures.courtyardFloorMap,
    roughness: 0.86,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.y = -0.012;
  plaza.receiveShadow = true;
  group.add(plaza);

  // Materials for Newari brick-and-timber architecture
  const brickMat = new THREE.MeshStandardMaterial({
    map: textures.courtyardBrickMap,
    roughness: 0.88,
    metalness: 0.04,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x331c12,
    roughness: 0.74,
    metalness: 0.08,
  });
  const stoneCapMat = new THREE.MeshStandardMaterial({
    color: 0x2c2530,
    roughness: 0.84,
    metalness: 0.06,
  });
  const brassAccentMat = new THREE.MeshStandardMaterial({
    color: 0xdca135,
    roughness: 0.28,
    metalness: 0.88,
  });
  const loktaGlowMat = new THREE.MeshStandardMaterial({
    map: textures.loktaPaperMap,
    emissive: new THREE.Color(0xff9429),
    emissiveMap: textures.loktaPaperMap,
    emissiveIntensity: 0.9,
    roughness: 0.88,
  });

  // 2. Curved Rear Newari Courtyard Perimeter (radius ~5.5m, spans back semicircle -125 deg to +125 deg)
  const bayCount = 5;
  const pillarCount = bayCount + 1;
  const radius = 5.55;
  const startAngle = -Math.PI * 0.68 - Math.PI / 2; // centered around -Z (behind hero artifact)
  const endAngle = Math.PI * 0.68 - Math.PI / 2;

  const pillarPositions: THREE.Vector3[] = [];
  for (let i = 0; i < pillarCount; i++) {
    const t = i / (pillarCount - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    pillarPositions.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  // Carved Newari Tham Pillar Lathe Profile (stepped stone plinth + turned wooden column + bracket capital)
  const pillarPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.28, 0),
    new THREE.Vector2(0.28, 0.16),
    new THREE.Vector2(0.21, 0.24),
    new THREE.Vector2(0.16, 0.36),
    new THREE.Vector2(0.145, 1.35),
    new THREE.Vector2(0.19, 1.48),
    new THREE.Vector2(0.14, 1.62),
    new THREE.Vector2(0.165, 2.55),
    new THREE.Vector2(0.26, 2.75),
    new THREE.Vector2(0.32, 2.95),
    new THREE.Vector2(0.0, 2.95),
  ];
  const pillarGeo = new THREE.LatheGeometry(pillarPts, 16);

  // Carved Torana arch segment shape for bays
  const archShape = new THREE.Shape();
  archShape.moveTo(-1.05, 0);
  archShape.lineTo(-1.05, 0.42);
  archShape.lineTo(1.05, 0.42);
  archShape.lineTo(1.05, 0);
  archShape.quadraticCurveTo(0, 0.34, -1.05, 0);
  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
  });
  archGeo.center();

  pillarPositions.forEach((pos) => {
    const pillar = new THREE.Mesh(pillarGeo, darkWoodMat);
    pillar.position.copy(pos);
    pillar.lookAt(0, 0, 0);
    pillar.receiveShadow = true;
    group.add(pillar);

    // Brick base plinth under each pillar
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.68), brickMat);
    plinth.position.set(pos.x, 0.21, pos.z);
    plinth.lookAt(0, 0.21, 0);
    plinth.receiveShadow = true;
    group.add(plinth);
  });

  // 3. Connecting Brick Dwarf Walls, Carved Timber Arches & Catenary Jhilimili Garlands
  const bayLedgeDiyas: Array<{ pos: THREE.Vector3 }> = [];
  const bulbPositions: THREE.Vector3[] = [];
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x1a141e, roughness: 0.9 });

  for (let b = 0; b < bayCount; b++) {
    const pA = pillarPositions[b];
    const pB = pillarPositions[b + 1];
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
    const spanLen = pA.distanceTo(pB);

    // Low terracotta brick courtyard wall between pillars
    const wall = new THREE.Mesh(new THREE.BoxGeometry(spanLen - 0.3, 0.72, 0.34), brickMat);
    wall.position.set(mid.x, 0.36, mid.z);
    wall.lookAt(0, 0.36, 0);
    wall.receiveShadow = true;
    group.add(wall);

    // Carved stone coping ledge atop brick wall
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(spanLen - 0.22, 0.09, 0.42), stoneCapMat);
    ledge.position.set(mid.x, 0.76, mid.z);
    ledge.lookAt(0, 0.76, 0);
    group.add(ledge);

    // 3 small clay diyas along each brick wall ledge
    for (let d = -1; d <= 1; d++) {
      const lerpT = 0.5 + d * 0.24;
      const diyaPos = new THREE.Vector3().lerpVectors(pA, pB, lerpT);
      diyaPos.y = 0.83;
      bayLedgeDiyas.push({ pos: diyaPos });
    }

    // Upper carved timber cornice beam & arched Torana lintel
    const beam = new THREE.Mesh(new THREE.BoxGeometry(spanLen + 0.14, 0.2, 0.28), darkWoodMat);
    beam.position.set(mid.x, 2.98, mid.z);
    beam.lookAt(0, 2.98, 0);
    group.add(beam);

    const arch = new THREE.Mesh(archGeo, darkWoodMat);
    arch.scale.set(spanLen / 2.2, 1, 1);
    arch.position.set(mid.x, 2.66, mid.z);
    arch.lookAt(0, 2.66, 0);
    group.add(arch);

    // Catenary string light cable & bulbs draped beneath each arch
    const curvePts: THREE.Vector3[] = [];
    const subSteps = 7;
    for (let s = 0; s <= subSteps; s++) {
      const st = s / subSteps;
      const pt = new THREE.Vector3().lerpVectors(pA, pB, st);
      const sag = Math.sin(st * Math.PI) * 0.42;
      pt.y = 2.68 - sag;
      curvePts.push(pt);
      if (s > 0 && s < subSteps) {
        bulbPositions.push(pt.clone().add(new THREE.Vector3(0, -0.05, 0)));
      }
    }
    const wireCurve = new THREE.CatmullRomCurve3(curvePts);
    const wireMesh = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 16, 0.015, 6, false), wireMat);
    group.add(wireMesh);
  }

  // 4. Instanced Marigold Pillar Garlands wrapping all 6 wooden columns
  const blossomPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.09, 0.02),
    new THREE.Vector2(0.115, 0.05),
    new THREE.Vector2(0.08, 0.09),
    new THREE.Vector2(0.0, 0.1),
  ];
  const blossomGeo = new THREE.LatheGeometry(blossomPts, 8);
  const blossomMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.04,
  });

  const wrapsPerPillar = 18;
  const totalPillarBlossoms = pillarCount * wrapsPerPillar;
  const pillarMarigolds = new THREE.InstancedMesh(blossomGeo, blossomMat, totalPillarBlossoms);
  const dummy = new THREE.Object3D();
  const marigoldPalette = [
    new THREE.Color('#F59E0B'),
    new THREE.Color('#EA580C'),
    new THREE.Color('#FBBF24'),
  ];

  let idx = 0;
  pillarPositions.forEach((pos, pIdx) => {
    for (let w = 0; w < wrapsPerPillar; w++) {
      const t = w / (wrapsPerPillar - 1);
      const y = 0.56 + t * 2.02;
      const spiralAngle = t * Math.PI * 5 + pIdx * 0.8;
      const colRadius = 0.215;
      dummy.position.set(
        pos.x + Math.cos(spiralAngle) * colRadius,
        y,
        pos.z + Math.sin(spiralAngle) * colRadius,
      );
      dummy.rotation.set(Math.PI / 2, spiralAngle, 0.2);
      dummy.scale.setScalar(0.88 + (w % 3) * 0.1);
      dummy.updateMatrix();
      pillarMarigolds.setMatrixAt(idx, dummy.matrix);
      pillarMarigolds.setColorAt(idx, marigoldPalette[(w + pIdx) % marigoldPalette.length]);
      idx += 1;
    }
  });
  pillarMarigolds.instanceMatrix.needsUpdate = true;
  if (pillarMarigolds.instanceColor) pillarMarigolds.instanceColor.needsUpdate = true;
  pillarMarigolds.computeBoundingSphere();
  group.add(pillarMarigolds);

  // 5. Instanced Glowing Multicolor Jhilimili Fairy-Light Bulbs
  const bulbGeo = new THREE.SphereGeometry(0.06, 10, 10);
  const bulbsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffb845),
    emissiveIntensity: 1.4,
    roughness: 0.25,
  });
  const bulbsInst = new THREE.InstancedMesh(bulbGeo, bulbsMat, bulbPositions.length);
  const bulbPalette = [
    new THREE.Color('#FFE599'),
    new THREE.Color('#FF9E2C'),
    new THREE.Color('#FF5A4E'),
    new THREE.Color('#FFD25A'),
  ];
  bulbPositions.forEach((pt, bIdx) => {
    dummy.position.copy(pt);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(bIdx % 2 === 0 ? 1.05 : 0.88);
    dummy.updateMatrix();
    bulbsInst.setMatrixAt(bIdx, dummy.matrix);
    bulbsInst.setColorAt(bIdx, bulbPalette[bIdx % bulbPalette.length]);
  });
  bulbsInst.instanceMatrix.needsUpdate = true;
  if (bulbsInst.instanceColor) bulbsInst.instanceColor.needsUpdate = true;
  bulbsInst.computeBoundingSphere();
  group.add(bulbsInst);

  // 6. Instanced Courtyard Brick-Ledge Diyas & Lit Flame Tips
  const ledgeBowlGeo = new THREE.CylinderGeometry(0.11, 0.06, 0.06, 12);
  const ledgeBowlMat = new THREE.MeshStandardMaterial({
    color: 0xa44b24,
    roughness: 0.82,
    metalness: 0.05,
  });
  const ledgeDiyasInst = new THREE.InstancedMesh(
    ledgeBowlGeo,
    ledgeBowlMat,
    bayLedgeDiyas.length,
  );
  const ledgeFlameGeo = new THREE.ConeGeometry(0.042, 0.125, 8);
  const ledgeFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffb848,
    transparent: true,
    opacity: 0.92,
  });
  const ledgeFlamesInst = new THREE.InstancedMesh(
    ledgeFlameGeo,
    ledgeFlameMat,
    bayLedgeDiyas.length,
  );

  bayLedgeDiyas.forEach((d, dIdx) => {
    dummy.position.copy(d.pos);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    ledgeDiyasInst.setMatrixAt(dIdx, dummy.matrix);

    dummy.position.set(d.pos.x, d.pos.y + 0.08, d.pos.z);
    dummy.updateMatrix();
    ledgeFlamesInst.setMatrixAt(dIdx, dummy.matrix);
  });
  ledgeDiyasInst.instanceMatrix.needsUpdate = true;
  ledgeFlamesInst.instanceMatrix.needsUpdate = true;
  ledgeDiyasInst.computeBoundingSphere();
  ledgeFlamesInst.computeBoundingSphere();
  group.add(ledgeDiyasInst, ledgeFlamesInst);

  // 7. Flanking Hanging Aakash Deep Corner Courtyard Lanterns (indices 1 & pillarCount-2)
  const swayLanterns: THREE.Group[] = [];
  const lanternIndices = [1, pillarCount - 2];
  lanternIndices.forEach((pIdx) => {
    const basePos = pillarPositions[pIdx];
    const dirToCenter = new THREE.Vector3(-basePos.x, 0, -basePos.z).normalize();
    const lanternPivot = new THREE.Group();
    lanternPivot.position.set(
      basePos.x + dirToCenter.x * 0.42,
      2.65,
      basePos.z + dirToCenter.z * 0.42,
    );

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 6), brassAccentMat);
    cord.position.y = -0.17;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.18, 6), darkWoodMat);
    cap.position.y = -0.38;
    const paperCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.44, 6),
      loktaGlowMat,
    );
    paperCore.position.y = -0.66;
    const baseRim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.1, 6), brassAccentMat);
    baseRim.position.y = -0.92;

    lanternPivot.add(cord, cap, paperCore, baseRim);
    group.add(lanternPivot);
    swayLanterns.push(lanternPivot);
  });

  // 8. Sanctum Floor Warm Soft Radial Glow (expands softly in Midnight Puja)
  const floorHaloTex = createWarmFloorGlowTexture();
  const floorHaloGeo = new THREE.CircleGeometry(3.2, 48);
  floorHaloGeo.rotateX(-Math.PI / 2);
  const floorHaloMat = new THREE.MeshBasicMaterial({
    map: floorHaloTex,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const floorHalo = new THREE.Mesh(floorHaloGeo, floorHaloMat);
  floorHalo.position.y = 0.004;
  group.add(floorHalo);

  // 9. Midnight Sky Canopy: Kartik Starfield (InstancedMesh) + Crescent Moon + Ascending Sky Lanterns
  const starCount = 140;
  const starGeo = new THREE.OctahedronGeometry(0.048, 0);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xfff3da,
    transparent: true,
    opacity: 0,
  });
  const starsInst = new THREE.InstancedMesh(starGeo, starMat, starCount);
  starsInst.frustumCulled = false;
  const starData = Array.from({ length: starCount }, (_, sIdx) => {
    const theta = -Math.PI * 0.98 + (((sIdx * 17) % 100) / 100) * Math.PI * 0.96;
    const dist = 9.5 + ((sIdx * 31) % 8);
    const y = 1.9 + ((sIdx * 23) % 52) / 10;
    return {
      x: Math.cos(theta) * dist,
      y,
      z: Math.sin(theta) * dist - 0.8,
      baseScale: 0.55 + ((sIdx * 13) % 10) * 0.1,
      phase: sIdx * 0.85,
    };
  });
  starData.forEach((s, sIdx) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(s.baseScale);
    dummy.updateMatrix();
    starsInst.setMatrixAt(sIdx, dummy.matrix);
  });
  starsInst.instanceMatrix.needsUpdate = true;
  starsInst.computeBoundingSphere();
  group.add(starsInst);

  // Crescent Moon silhouette framed clearly above the rear-left courtyard roofline
  const moonShape = new THREE.Shape();
  moonShape.absarc(0, 0, 0.58, -Math.PI * 0.44, Math.PI * 0.44, false);
  moonShape.absarc(0.22, 0.05, 0.46, Math.PI * 0.36, -Math.PI * 0.36, true);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xfff5da,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const moonMesh = new THREE.Mesh(new THREE.ShapeGeometry(moonShape, 24), moonMat);
  moonMesh.position.set(-4.6, 3.6, -7.8);
  moonMesh.lookAt(3.8, 2.2, 4.8);
  moonMesh.rotateZ(0.28);
  group.add(moonMesh);

  // 10. Distant Glowing Sky Lanterns ascending visibly above the courtyard eaves
  const skyLanternCount = 10;
  const skyLanternGeo = new THREE.CylinderGeometry(0.15, 0.1, 0.32, 6);
  const skyLanternMat = new THREE.MeshBasicMaterial({
    color: 0xffb246,
    transparent: true,
    opacity: 0,
  });
  const skyLanternsInst = new THREE.InstancedMesh(skyLanternGeo, skyLanternMat, skyLanternCount);
  skyLanternsInst.frustumCulled = false;
  const skyLanternData = Array.from({ length: skyLanternCount }, (_, lIdx) => {
    const theta = -Math.PI * 0.9 + (lIdx / (skyLanternCount - 1)) * Math.PI * 0.72;
    const radiusDist = 6.8 + (lIdx % 3) * 1.1;
    return {
      x: Math.cos(theta) * radiusDist,
      z: Math.sin(theta) * radiusDist,
      yOffset: (lIdx * 0.52) % 3.2,
      speed: 0.22 + (lIdx % 4) * 0.05,
      phase: lIdx * 1.1,
    };
  });
  group.add(skyLanternsInst);

  // Subtle ambient warm courtyard lantern fill light
  const courtyardWarmLight = new THREE.PointLight(0xff9d3b, 1.4, 15, 1.5);
  courtyardWarmLight.position.set(0, 2.6, -3.6);
  group.add(courtyardWarmLight);

  let midnightBlend = 0;

  return {
    group,
    updateBackdrop(
      isLit: boolean,
      mood: LightingMood,
      elapsed: number,
      burst: number,
      dt: number,
      instantMood = false,
    ) {
      const targetMidnight = mood === 'midnight' ? 1 : 0;
      midnightBlend = instantMood
        ? targetMidnight
        : THREE.MathUtils.damp(midnightBlend, targetMidnight, 5.5, dt);
      const litFactor = isLit ? 1.0 : 0.22;
      const moodFactor = 0.92 + midnightBlend * 1.15;
      const shimmer = 0.88 + Math.sin(elapsed * (3.1 + midnightBlend * 2.2)) * 0.14 + burst * 0.75;

      bulbsMat.emissiveIntensity = (0.48 + litFactor * 1.15) * moodFactor * shimmer;
      loktaGlowMat.emissiveIntensity = (0.28 + litFactor * 0.92) * moodFactor * shimmer;
      ledgeFlamesInst.visible = isLit;
      ledgeFlameMat.opacity = isLit ? Math.min(1, 0.82 + Math.sin(elapsed * 9) * 0.16) : 0;
      courtyardWarmLight.intensity = (0.6 + litFactor * 1.2) * (1 + midnightBlend * 1.05) + burst * 1.4;

      // Sanctum floor warm soft glow
      floorHaloMat.opacity = isLit
        ? 0.16 + midnightBlend * 0.58 + burst * 0.25 + Math.sin(elapsed * 4.5) * 0.04
        : 0.03;

      // Sway hanging Aakash Deep lanterns under the arches
      swayLanterns.forEach((lantern, idx) => {
        lantern.rotation.z = Math.sin(elapsed * 1.4 + idx * 1.3) * (0.045 + midnightBlend * 0.02);
        lantern.rotation.x = Math.cos(elapsed * 1.1 + idx) * 0.03;
      });

      // Reveal twinkling Kartik stars, crescent moon, and rising sky lanterns in Midnight Puja
      const nightActive = midnightBlend > 0.02;
      starsInst.visible = nightActive;
      moonMesh.visible = nightActive;
      skyLanternsInst.visible = nightActive;

      if (nightActive) {
        starMat.opacity = Math.min(0.95, midnightBlend * 0.95);
        moonMat.opacity = Math.min(0.94, midnightBlend * 0.94);
        moonMesh.position.y = 3.25 + midnightBlend * 0.35;

        for (let i = 0; i < starCount; i++) {
          const s = starData[i];
          const twinkle = 0.6 + Math.sin(elapsed * 2.8 + s.phase) * 0.4;
          dummy.position.set(s.x, s.y, s.z);
          dummy.rotation.set(0, elapsed * 0.4, 0);
          dummy.scale.setScalar(s.baseScale * twinkle * midnightBlend);
          dummy.updateMatrix();
          starsInst.setMatrixAt(i, dummy.matrix);
        }
        starsInst.instanceMatrix.needsUpdate = true;

        skyLanternMat.opacity = Math.min(0.92, midnightBlend * 0.92);
        for (let i = 0; i < skyLanternCount; i++) {
          const l = skyLanternData[i];
          const yPos = 1.9 + ((l.yOffset + elapsed * l.speed) % 3.6);
          const swayX = Math.sin(elapsed * 0.7 + l.phase) * 0.2;
          const swayZ = Math.cos(elapsed * 0.6 + l.phase) * 0.16;
          const pulse = 0.85 + Math.sin(elapsed * 3.8 + l.phase) * 0.15;
          dummy.position.set(l.x + swayX, yPos, l.z + swayZ);
          dummy.rotation.set(Math.sin(elapsed + l.phase) * 0.06, elapsed * 0.2, 0);
          dummy.scale.setScalar(pulse * midnightBlend);
          dummy.updateMatrix();
          skyLanternsInst.setMatrixAt(i, dummy.matrix);
        }
        skyLanternsInst.instanceMatrix.needsUpdate = true;
      }
    },
    dispose() {
      floorHaloTex.dispose();
    },
  };
}
