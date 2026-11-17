import * as THREE from 'three';
import type { ProceduralTextureSet } from './proceduralTextures';
import type { ArtifactId } from '../utils/tiharLogic';

export interface BuiltArtifact {
  id: ArtifactId;
  group: THREE.Group;
  flames: THREE.Group[];
  flameLights: THREE.PointLight[];
  swayParts: THREE.Object3D[];
  explodableParts: Array<{ mesh: THREE.Object3D; basePos: THREE.Vector3; offset: THREE.Vector3 }>;
  clickTargets: THREE.Object3D[];
}

function registerExplodable(
  list: BuiltArtifact['explodableParts'],
  mesh: THREE.Object3D,
  offset: THREE.Vector3,
): void {
  list.push({
    mesh,
    basePos: mesh.position.clone(),
    offset,
  });
}

function createFlameGroup(scale = 1): { group: THREE.Group; light: THREE.PointLight } {
  const group = new THREE.Group();

  // Organic teardrop LatheGeometry profile for outer sheath
  const outerPts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16; // 0 = base, 1 = tip
    const r = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.45) * 0.145 * scale;
    const y = t * 0.44 * scale;
    outerPts.push(new THREE.Vector2(Math.max(0.0005, r), y));
  }
  const outerGeo = new THREE.LatheGeometry(outerPts, 24);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xff7b1c,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);

  // Inner bright incandescent teardrop core
  const innerPts: THREE.Vector2[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const r = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.5) * 0.08 * scale;
    const y = t * 0.28 * scale + 0.02 * scale;
    innerPts.push(new THREE.Vector2(Math.max(0.0005, r), y));
  }
  const innerGeo = new THREE.LatheGeometry(innerPts, 20);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xfff6c7,
    transparent: true,
    opacity: 0.96,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);

  // Warm soft glow aura
  const haloGeo = new THREE.SphereGeometry(0.18 * scale, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.y = 0.16 * scale;

  const light = new THREE.PointLight(0xff9b2f, 3.6, 10, 1.7);
  light.position.set(0, 0.3 * scale, 0);

  group.add(outerMesh, innerMesh, haloMesh, light);
  return { group, light };
}

function createMarigoldRing(
  radius: number,
  count: number,
  petalScale = 1,
): THREE.InstancedMesh {
  // Multi-tiered ruffled marigold (Sayapatri) Lathe profile instead of smooth pebbles
  const flowerPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.11 * petalScale, 0.015 * petalScale),
    new THREE.Vector2(0.155 * petalScale, 0.05 * petalScale),
    new THREE.Vector2(0.125 * petalScale, 0.085 * petalScale),
    new THREE.Vector2(0.145 * petalScale, 0.115 * petalScale),
    new THREE.Vector2(0.095 * petalScale, 0.15 * petalScale),
    new THREE.Vector2(0.045 * petalScale, 0.165 * petalScale),
    new THREE.Vector2(0.0, 0.155 * petalScale),
  ];
  const blossomGeo = new THREE.LatheGeometry(flowerPts, 10);
  // Modulate radial vertices slightly for ruffled petal crown
  const posAttr = blossomGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const ang = Math.atan2(z, x);
    const ruffle = 1 + Math.sin(ang * 5) * 0.16;
    posAttr.setXYZ(i, x * ruffle, y, z * ruffle);
  }
  blossomGeo.computeVertexNormals();

  const blossomMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.03,
  });

  const instanced = new THREE.InstancedMesh(blossomGeo, blossomMat, count);
  const dummy = new THREE.Object3D();
  const palette = [new THREE.Color('#F59E0B'), new THREE.Color('#EA580C'), new THREE.Color('#FBBF24')];

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const jitterR = radius + (i % 2 === 0 ? 0.03 : -0.02);
    dummy.position.set(Math.cos(a) * jitterR, 0.01 * petalScale, Math.sin(a) * jitterR);
    dummy.rotation.set((i % 3) * 0.14 - 0.1, a + i * 0.5, (i % 2) * 0.12 - 0.06);
    const s = 0.88 + ((i * 17) % 24) / 100;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
    instanced.setColorAt(i, palette[i % palette.length]);
  }
  instanced.instanceMatrix.needsUpdate = true;
  if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  instanced.computeBoundingSphere();
  instanced.castShadow = true;
  instanced.receiveShadow = true;
  return instanced;
}

export function buildClayDiyoArtifact(textures: ProceduralTextureSet): BuiltArtifact {
  const group = new THREE.Group();
  const flames: THREE.Group[] = [];
  const flameLights: THREE.PointLight[] = [];
  const explodableParts: BuiltArtifact['explodableParts'] = [];
  const clickTargets: THREE.Object3D[] = [];

  const clayMat = new THREE.MeshStandardMaterial({
    color: 0xb4532a,
    roughness: 0.84,
    metalness: 0.05,
    bumpMap: textures.clayBumpMap,
    bumpScale: 0.025,
  });
  const darkClayRimMat = new THREE.MeshStandardMaterial({
    color: 0x7c2d12,
    roughness: 0.68,
    metalness: 0.08,
    bumpMap: textures.clayBumpMap,
    bumpScale: 0.015,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe2a93b,
    metalness: 0.9,
    roughness: 0.24,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.015,
  });
  const oilMat = new THREE.MeshPhysicalMaterial({
    color: 0x92400e,
    roughness: 0.08,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });

  // 1. Mandap Mandala Floor Plinth (grounded at y = 0)
  const plinthGeo = new THREE.CylinderGeometry(2.35, 2.48, 0.12, 48);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x2a1b24,
    roughness: 0.78,
    metalness: 0.1,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.06;
  plinth.receiveShadow = true;
  group.add(plinth);
  registerExplodable(explodableParts, plinth, new THREE.Vector3(0, -0.35, 0));

  // 2. Painted Rice-Flour Mandala Disc (+0.02 above plinth to avoid Z-fighting)
  const mandalaGeo = new THREE.CircleGeometry(2.2, 48);
  mandalaGeo.rotateX(-Math.PI / 2);
  const mandalaMat = new THREE.MeshStandardMaterial({
    map: textures.mandalaColorMap,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const mandalaDisc = new THREE.Mesh(mandalaGeo, mandalaMat);
  mandalaDisc.position.y = 0.14;
  mandalaDisc.receiveShadow = true;
  group.add(mandalaDisc);
  registerExplodable(explodableParts, mandalaDisc, new THREE.Vector3(0, -0.1, 0));

  // 3. Hammered Brass Pedestal Stand
  const pedestalPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.85, 0),
    new THREE.Vector2(0.82, 0.09),
    new THREE.Vector2(0.45, 0.18),
    new THREE.Vector2(0.35, 0.28),
    new THREE.Vector2(0.68, 0.36),
    new THREE.Vector2(0.0, 0.36),
  ];
  const pedestalGeo = new THREE.LatheGeometry(pedestalPts, 36);
  const pedestal = new THREE.Mesh(pedestalGeo, brassMat);
  pedestal.position.y = 0.15;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);
  registerExplodable(explodableParts, pedestal, new THREE.Vector3(0, 0.2, 0));

  // 4. Hand-thrown Fluted Clay Diyo Bowl (LatheGeometry)
  const bowlPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.55, 0.02),
    new THREE.Vector2(0.88, 0.22),
    new THREE.Vector2(1.06, 0.56),
    new THREE.Vector2(1.12, 0.64),
    new THREE.Vector2(1.0, 0.66),
    new THREE.Vector2(0.86, 0.52),
    new THREE.Vector2(0.52, 0.24),
    new THREE.Vector2(0.0, 0.18),
  ];
  const bowlGeo = new THREE.LatheGeometry(bowlPts, 40);
  const bowl = new THREE.Mesh(bowlGeo, clayMat);
  bowl.position.y = 0.51;
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  group.add(bowl);
  clickTargets.push(bowl);
  registerExplodable(explodableParts, bowl, new THREE.Vector3(0, 0.65, 0));

  // 5. Pinched Spout Lip (Beveled ExtrudeGeometry)
  const spoutShape = new THREE.Shape();
  spoutShape.moveTo(-0.22, 0);
  spoutShape.quadraticCurveTo(0, 0.68, 0.22, 0);
  spoutShape.lineTo(0.12, -0.08);
  spoutShape.lineTo(-0.12, -0.08);
  spoutShape.closePath();
  const spoutGeo = new THREE.ExtrudeGeometry(spoutShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 3,
  });
  spoutGeo.rotateX(Math.PI / 2 - 0.18);
  const spout = new THREE.Mesh(spoutGeo, darkClayRimMat);
  spout.position.set(0, 1.13, 0.92);
  spout.castShadow = true;
  group.add(spout);
  clickTargets.push(spout);
  registerExplodable(explodableParts, spout, new THREE.Vector3(0, 0.85, 0.45));

  // 6. Glossy Mustard Oil Pool
  const oilGeo = new THREE.CircleGeometry(0.88, 36);
  oilGeo.rotateX(-Math.PI / 2);
  const oilPool = new THREE.Mesh(oilGeo, oilMat);
  oilPool.position.y = 0.98;
  group.add(oilPool);
  registerExplodable(explodableParts, oilPool, new THREE.Vector3(0, 1.05, 0));

  // 7. Twisted Cotton Batti Wick (TubeGeometry)
  const wickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.88, 0.18),
    new THREE.Vector3(0, 0.99, 0.68),
    new THREE.Vector3(0, 1.12, 1.15),
    new THREE.Vector3(0, 1.27, 1.33),
  ]);
  const wickGeo = new THREE.TubeGeometry(wickCurve, 24, 0.042, 10, false);
  const wickMat = new THREE.MeshStandardMaterial({
    color: 0xf4ead7,
    roughness: 0.95,
    metalness: 0,
  });
  const wick = new THREE.Mesh(wickGeo, wickMat);
  wick.castShadow = true;
  group.add(wick);
  clickTargets.push(wick);
  registerExplodable(explodableParts, wick, new THREE.Vector3(0, 1.35, 0.25));

  // 8. Animated Flame + Sayapatri Marigold Garland Ring
  const { group: flameGroup, light: flameLight } = createFlameGroup(1.25);
  flameGroup.position.set(0, 1.24, 1.33);
  group.add(flameGroup);
  flames.push(flameGroup);
  flameLights.push(flameLight);
  registerExplodable(explodableParts, flameGroup, new THREE.Vector3(0, 1.7, 0.25));

  const marigoldRing = createMarigoldRing(1.56, 24, 1.05);
  marigoldRing.position.y = 0.16;
  group.add(marigoldRing);
  registerExplodable(explodableParts, marigoldRing, new THREE.Vector3(0, -0.04, 0));

  return {
    id: 'diyo',
    group,
    flames,
    flameLights,
    swayParts: [],
    explodableParts,
    clickTargets,
  };
}

export function buildSukundaArtifact(textures: ProceduralTextureSet): BuiltArtifact {
  const group = new THREE.Group();
  const flames: THREE.Group[] = [];
  const flameLights: THREE.PointLight[] = [];
  const explodableParts: BuiltArtifact['explodableParts'] = [];
  const clickTargets: THREE.Object3D[] = [];

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xdfa63b,
    metalness: 0.92,
    roughness: 0.22,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.018,
  });
  const antiqueBronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8f5d1e,
    metalness: 0.85,
    roughness: 0.48,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.02,
  });
  const sindoorAccentMat = new THREE.MeshStandardMaterial({
    color: 0xc93b2b,
    roughness: 0.65,
    metalness: 0.05,
  });

  // 1. Stepped Temple Base (LatheGeometry)
  const basePts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1.12, 0),
    new THREE.Vector2(1.1, 0.1),
    new THREE.Vector2(0.88, 0.16),
    new THREE.Vector2(0.76, 0.26),
    new THREE.Vector2(0.42, 0.34),
    new THREE.Vector2(0.28, 0.72),
    new THREE.Vector2(0.42, 0.85),
    new THREE.Vector2(0.24, 1.02),
    new THREE.Vector2(0, 1.02),
  ];
  const baseMesh = new THREE.Mesh(new THREE.LatheGeometry(basePts, 40), brassMat);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);
  clickTargets.push(baseMesh);
  registerExplodable(explodableParts, baseMesh, new THREE.Vector3(0, -0.35, 0));

  // 2. Sculpted Oil Reservoir Bowl
  const cupPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.54, 0.04),
    new THREE.Vector2(0.78, 0.24),
    new THREE.Vector2(0.84, 0.44),
    new THREE.Vector2(0.74, 0.46),
    new THREE.Vector2(0.56, 0.2),
    new THREE.Vector2(0, 0.14),
  ];
  const cupMesh = new THREE.Mesh(new THREE.LatheGeometry(cupPts, 36), brassMat);
  cupMesh.position.y = 1.02;
  cupMesh.castShadow = true;
  group.add(cupMesh);
  clickTargets.push(cupMesh);
  registerExplodable(explodableParts, cupMesh, new THREE.Vector3(0, 0.35, 0));

  // 3. Elongated Pouring Spout for the Batti
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.32, 0.56),
    new THREE.Vector3(0, 1.4, 0.95),
    new THREE.Vector3(0, 1.48, 1.24),
  ]);
  const spoutMesh = new THREE.Mesh(
    new THREE.TubeGeometry(spoutCurve, 18, 0.11, 12, false),
    antiqueBronzeMat,
  );
  spoutMesh.castShadow = true;
  group.add(spoutMesh);
  registerExplodable(explodableParts, spoutMesh, new THREE.Vector3(0, 0.5, 0.45));

  // 4. Serpentine Curved Handle on Back
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.52, -0.3),
    new THREE.Vector3(0, 0.72, -1.05),
    new THREE.Vector3(0, 1.38, -1.16),
    new THREE.Vector3(0, 1.45, -0.68),
  ]);
  const handleMesh = new THREE.Mesh(
    new THREE.TubeGeometry(handleCurve, 28, 0.075, 12, false),
    antiqueBronzeMat,
  );
  handleMesh.castShadow = true;
  group.add(handleMesh);
  registerExplodable(explodableParts, handleMesh, new THREE.Vector3(0, 0.15, -0.55));

  // 5. Ornate Arched Peacock Torana Crest Behind Cup (Solid sculpted ExtrudeGeometry)
  const toranaShape = new THREE.Shape();
  toranaShape.moveTo(-0.56, 0);
  toranaShape.quadraticCurveTo(-0.62, 0.9, 0, 1.32);
  toranaShape.quadraticCurveTo(0.62, 0.9, 0.56, 0);
  toranaShape.closePath();
  const toranaGeo = new THREE.ExtrudeGeometry(toranaShape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  const torana = new THREE.Mesh(toranaGeo, brassMat);
  torana.position.set(0, 1.4, -0.55);
  torana.castShadow = true;
  group.add(torana);
  clickTargets.push(torana);
  registerExplodable(explodableParts, torana, new THREE.Vector3(0, 0.95, -0.25));

  // 6. Central Ganesha / Kalash Relief Medallion + Sindoor Dot anchored flush to Torana
  const medallion = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 20), antiqueBronzeMat);
  medallion.scale.set(1, 1.2, 0.45);
  medallion.position.set(0, 1.92, -0.42);
  medallion.castShadow = true;
  group.add(medallion);
  registerExplodable(explodableParts, medallion, new THREE.Vector3(0, 1.15, 0.15));

  const tikaDot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), sindoorAccentMat);
  tikaDot.position.set(0, 2.06, -0.31);
  group.add(tikaDot);
  registerExplodable(explodableParts, tikaDot, new THREE.Vector3(0, 1.15, 0.35));

  // 7. Brass Kalash Finial on Top of Torana
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 16), brassMat);
  finial.position.set(0, 2.86, -0.51);
  group.add(finial);
  registerExplodable(explodableParts, finial, new THREE.Vector3(0, 1.4, -0.25));

  // 8. Cotton Wick & Flame at Spout
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.25, 10),
    new THREE.MeshStandardMaterial({ color: 0xf4ead7, roughness: 0.95 }),
  );
  wick.rotation.x = 0.45;
  wick.position.set(0, 1.54, 1.24);
  group.add(wick);
  registerExplodable(explodableParts, wick, new THREE.Vector3(0, 0.75, 0.5));

  const { group: flameGroup, light } = createFlameGroup(1.1);
  flameGroup.position.set(0, 1.63, 1.29);
  group.add(flameGroup);
  flames.push(flameGroup);
  flameLights.push(light);
  registerExplodable(explodableParts, flameGroup, new THREE.Vector3(0, 1.1, 0.5));

  // 9. Base Marigold Petals Ring
  const marigoldRing = createMarigoldRing(1.32, 20, 0.85);
  marigoldRing.position.y = 0.02;
  group.add(marigoldRing);
  registerExplodable(explodableParts, marigoldRing, new THREE.Vector3(0, -0.45, 0));

  return {
    id: 'sukunda',
    group,
    flames,
    flameLights,
    swayParts: [],
    explodableParts,
    clickTargets,
  };
}

export function buildAakashDeepLantern(textures: ProceduralTextureSet): BuiltArtifact {
  const group = new THREE.Group();
  const flames: THREE.Group[] = [];
  const flameLights: THREE.PointLight[] = [];
  const swayParts: THREE.Object3D[] = [];
  const explodableParts: BuiltArtifact['explodableParts'] = [];
  const clickTargets: THREE.Object3D[] = [];

  const carvedTeakMat = new THREE.MeshStandardMaterial({
    color: 0x3f2316,
    roughness: 0.72,
    metalness: 0.08,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6ac3c,
    metalness: 0.9,
    roughness: 0.24,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.015,
  });
  const loktaPaperMat = new THREE.MeshStandardMaterial({
    map: textures.loktaPaperMap,
    color: 0xffffff,
    emissive: 0xff8c24,
    emissiveMap: textures.loktaPaperMap,
    emissiveIntensity: 1.05,
    roughness: 0.9,
    metalness: 0,
  });

  // 1. Grounded Hexagonal Plinth Base (y = 0)
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.16, 6), carvedTeakMat);
  standBase.position.y = 0.08;
  standBase.receiveShadow = true;
  group.add(standBase);
  registerExplodable(explodableParts, standBase, new THREE.Vector3(0, -0.4, 0));

  // 2. Lower Lotus Pedestal & Brass Collar
  const lotusCup = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.56, 0.34, 6), carvedTeakMat);
  lotusCup.position.y = 0.48;
  lotusCup.castShadow = true;
  group.add(lotusCup);
  registerExplodable(explodableParts, lotusCup, new THREE.Vector3(0, -0.15, 0));

  // 3. Glowing Handmade Lokta Paper Core
  const corePaper = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 1.38, 6), loktaPaperMat);
  corePaper.position.y = 1.34;
  group.add(corePaper);
  clickTargets.push(corePaper);
  registerExplodable(explodableParts, corePaper, new THREE.Vector3(0, 0.2, 0));

  // 4. Six Carved Teak Corner Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.5, 8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const pillar = new THREE.Mesh(pillarGeo, carvedTeakMat);
    pillar.position.set(Math.cos(a) * 0.84, 1.34, Math.sin(a) * 0.84);
    pillar.castShadow = true;
    group.add(pillar);
    registerExplodable(
      explodableParts,
      pillar,
      new THREE.Vector3(Math.cos(a) * 0.55, 0.2, Math.sin(a) * 0.55),
    );
  }

  // 5. Lower & Upper Pagoda Roof Eaves
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.36, 0.42, 6), carvedTeakMat);
  lowerRoof.position.y = 2.22;
  lowerRoof.castShadow = true;
  group.add(lowerRoof);
  clickTargets.push(lowerRoof);
  registerExplodable(explodableParts, lowerRoof, new THREE.Vector3(0, 0.72, 0));

  const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.46, 6), carvedTeakMat);
  upperRoof.position.y = 2.6;
  upperRoof.castShadow = true;
  group.add(upperRoof);
  registerExplodable(explodableParts, upperRoof, new THREE.Vector3(0, 1.05, 0));

  // 6. Brass Gajur Finial & Suspension Ring
  const gajurPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.24, 0),
    new THREE.Vector2(0.18, 0.14),
    new THREE.Vector2(0.22, 0.26),
    new THREE.Vector2(0.08, 0.42),
    new THREE.Vector2(0, 0.55),
  ];
  const gajur = new THREE.Mesh(new THREE.LatheGeometry(gajurPts, 24), brassMat);
  gajur.position.y = 2.8;
  group.add(gajur);
  registerExplodable(explodableParts, gajur, new THREE.Vector3(0, 1.45, 0));

  // 7. Six Swaying Brass Bells & Marigold Tassels at Roof Corners
  const bellGeo = new THREE.ConeGeometry(0.08, 0.16, 12);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tasselPivot = new THREE.Group();
    tasselPivot.position.set(Math.cos(a) * 1.18, 2.02, Math.sin(a) * 1.18);

    const bell = new THREE.Mesh(bellGeo, brassMat);
    bell.position.y = -0.18;
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6),
      brassMat,
    );
    cord.position.y = -0.08;
    tasselPivot.add(cord, bell);
    group.add(tasselPivot);
    swayParts.push(tasselPivot);
    registerExplodable(
      explodableParts,
      tasselPivot,
      new THREE.Vector3(Math.cos(a) * 0.4, 0.55, Math.sin(a) * 0.4),
    );
  }

  // 8. Interior Light & Flame Silhouette
  const { group: flameGroup, light } = createFlameGroup(1.1);
  flameGroup.position.set(0, 1.15, 0);
  group.add(flameGroup);
  flames.push(flameGroup);
  flameLights.push(light);
  registerExplodable(explodableParts, flameGroup, new THREE.Vector3(0, 0.2, 0));

  return {
    id: 'lantern',
    group,
    flames,
    flameLights,
    swayParts,
    explodableParts,
    clickTargets,
  };
}

export function buildBhaiTikaThaliArtifact(textures: ProceduralTextureSet): BuiltArtifact {
  const group = new THREE.Group();
  const flames: THREE.Group[] = [];
  const flameLights: THREE.PointLight[] = [];
  const explodableParts: BuiltArtifact['explodableParts'] = [];
  const clickTargets: THREE.Object3D[] = [];

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6b144,
    metalness: 0.92,
    roughness: 0.22,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.016,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xc96b3b,
    metalness: 0.88,
    roughness: 0.28,
    bumpMap: textures.brassBumpMap,
    bumpScale: 0.014,
  });

  // 1. Hammered Brass Thali Platter (LatheGeometry, grounded at y = 0)
  const thaliPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1.75, 0),
    new THREE.Vector2(2.05, 0.14),
    new THREE.Vector2(2.14, 0.26),
    new THREE.Vector2(2.04, 0.29),
    new THREE.Vector2(1.72, 0.08),
    new THREE.Vector2(0, 0.07),
  ];
  const thali = new THREE.Mesh(new THREE.LatheGeometry(thaliPts, 52), brassMat);
  thali.receiveShadow = true;
  thali.castShadow = true;
  group.add(thali);
  clickTargets.push(thali);
  registerExplodable(explodableParts, thali, new THREE.Vector3(0, -0.3, 0));

  // 2. Decorative Mandap Inlay inside Thali (+0.02 offset)
  const inlayGeo = new THREE.CircleGeometry(1.62, 48);
  inlayGeo.rotateX(-Math.PI / 2);
  const inlay = new THREE.Mesh(
    inlayGeo,
    new THREE.MeshStandardMaterial({
      map: textures.mandalaColorMap,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  inlay.position.y = 0.095;
  inlay.receiveShadow = true;
  group.add(inlay);
  registerExplodable(explodableParts, inlay, new THREE.Vector3(0, -0.1, 0));

  // 3. Central Copper/Brass Kalash Pot (LatheGeometry)
  const kalashPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.28, 0),
    new THREE.Vector2(0.46, 0.25),
    new THREE.Vector2(0.48, 0.48),
    new THREE.Vector2(0.22, 0.72),
    new THREE.Vector2(0.32, 0.88),
    new THREE.Vector2(0.28, 0.9),
    new THREE.Vector2(0.18, 0.7),
    new THREE.Vector2(0, 0.65),
  ];
  const kalash = new THREE.Mesh(new THREE.LatheGeometry(kalashPts, 32), copperMat);
  kalash.position.set(0, 0.11, -0.15);
  kalash.castShadow = true;
  group.add(kalash);
  clickTargets.push(kalash);
  registerExplodable(explodableParts, kalash, new THREE.Vector3(0, 0.75, -0.15));

  // 4. Mango Leaves Crown on Kalash
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.14, 0.22, 0, 0.48);
  leafShape.quadraticCurveTo(-0.14, 0.22, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.015,
    bevelEnabled: false,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.65,
    metalness: 0.05,
  });
  const leavesGroup = new THREE.Group();
  leavesGroup.position.set(0, 0.92, -0.15);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const a = (i / 5) * Math.PI * 2;
    leaf.rotation.y = a;
    leaf.rotation.x = 0.55;
    leavesGroup.add(leaf);
  }
  group.add(leavesGroup);
  registerExplodable(explodableParts, leavesGroup, new THREE.Vector3(0, 1.25, -0.15));

  // 5. Seven Saptarangi Tika Katori Bowls in an Arc
  const saptarangiHex = [
    0xd93b2b, // Red
    0xf59e0b, // Saffron
    0xfacc15, // Yellow
    0x2e9e6b, // Green
    0x2563eb, // Blue
    0x9333ea, // Violet
    0xf7efe2, // White
  ];
  const katoriGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.14, 20);
  const powderGeo = new THREE.SphereGeometry(0.15, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);

  saptarangiHex.forEach((hex, idx) => {
    const angle = -Math.PI * 0.75 + (idx / 6) * Math.PI * 1.1;
    const rad = 1.18;
    const katoriGroup = new THREE.Group();
    katoriGroup.position.set(Math.cos(angle) * rad, 0.17, Math.sin(angle) * rad);

    const katori = new THREE.Mesh(katoriGeo, brassMat);
    katori.castShadow = true;
    const powder = new THREE.Mesh(
      powderGeo,
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.92, metalness: 0 }),
    );
    powder.position.y = 0.04;
    powder.scale.y = 0.45;
    katoriGroup.add(katori, powder);
    group.add(katoriGroup);
    registerExplodable(
      explodableParts,
      katoriGroup,
      new THREE.Vector3(Math.cos(angle) * 0.42, 0.45 + idx * 0.04, Math.sin(angle) * 0.42),
    );
  });

  // 6. Evergreen Purple Makhamali Garland Ring (InstancedMesh)
  const makhamaliGeo = new THREE.DodecahedronGeometry(0.11, 1);
  const makhamaliMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.04,
  });
  const makhamaliCount = 28;
  const makhamaliInst = new THREE.InstancedMesh(makhamaliGeo, makhamaliMat, makhamaliCount);
  const dummy = new THREE.Object3D();
  const c1 = new THREE.Color('#A63A79');
  const c2 = new THREE.Color('#7E225B');
  for (let i = 0; i < makhamaliCount; i++) {
    const a = (i / makhamaliCount) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.68, 0.18, Math.sin(a) * 1.68);
    dummy.rotation.set(i * 0.3, a, 0);
    dummy.scale.setScalar(0.85 + ((i * 7) % 20) / 100);
    dummy.updateMatrix();
    makhamaliInst.setMatrixAt(i, dummy.matrix);
    makhamaliInst.setColorAt(i, i % 2 === 0 ? c1 : c2);
  }
  makhamaliInst.instanceMatrix.needsUpdate = true;
  if (makhamaliInst.instanceColor) makhamaliInst.instanceColor.needsUpdate = true;
  makhamaliInst.computeBoundingSphere();
  group.add(makhamaliInst);
  registerExplodable(explodableParts, makhamaliInst, new THREE.Vector3(0, 0.2, 0));

  // 7. Golden Sel Roti Rings & Brass Diyo on Front Side
  const selRotiMat = new THREE.MeshStandardMaterial({
    color: 0xc87522,
    roughness: 0.74,
    metalness: 0.04,
    bumpMap: textures.clayBumpMap,
    bumpScale: 0.02,
  });
  for (let i = 0; i < 2; i++) {
    const selRoti = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 14, 28), selRotiMat);
    selRoti.rotation.x = Math.PI / 2;
    selRoti.position.set(-0.72 + i * 0.14, 0.17 + i * 0.12, 0.85);
    selRoti.castShadow = true;
    group.add(selRoti);
    registerExplodable(explodableParts, selRoti, new THREE.Vector3(-0.35, 0.55 + i * 0.18, 0.35));
  }

  // Small brass diyo on platter
  const miniDiyo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.16, 20), brassMat);
  miniDiyo.position.set(0.66, 0.18, 0.86);
  group.add(miniDiyo);
  clickTargets.push(miniDiyo);
  registerExplodable(explodableParts, miniDiyo, new THREE.Vector3(0.32, 0.45, 0.35));

  const { group: flameGroup, light } = createFlameGroup(0.9);
  flameGroup.position.set(0.66, 0.25, 0.92);
  group.add(flameGroup);
  flames.push(flameGroup);
  flameLights.push(light);
  registerExplodable(explodableParts, flameGroup, new THREE.Vector3(0.32, 0.72, 0.35));

  return {
    id: 'thali',
    group,
    flames,
    flameLights,
    swayParts: [],
    explodableParts,
    clickTargets,
  };
}
