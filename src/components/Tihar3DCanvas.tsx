import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Flame, Layers, Moon, RotateCcw, Sun, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { createTiharTextures } from '../three/proceduralTextures';
import {
  buildAakashDeepLantern,
  buildBhaiTikaThaliArtifact,
  buildClayDiyoArtifact,
  buildSukundaArtifact,
  type BuiltArtifact,
} from '../three/tiharModels';
import { buildNewariCourtyardBackdrop } from '../three/courtyardStage';
import { ARTIFACT_META, type ArtifactId, type LightingMood } from '../utils/tiharLogic';
import { playGhantaChime } from '../utils/tiharAudio';

// Pre-allocated scratch math helpers outside the render loop (zero GC)
const _scratchVec = new THREE.Vector3();
const _scratchTarget = new THREE.Vector3();
const _scratchCamPos = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _duskKeyColor = new THREE.Color(0xffcf88);
const _midnightKeyColor = new THREE.Color(0x7d9eff);
const _duskRimColor = new THREE.Color(0x9a70f0);
const _midnightRimColor = new THREE.Color(0x6b98ff);
const _duskHemiSky = new THREE.Color(0x6d5891);
const _midnightHemiSky = new THREE.Color(0x16214a);

interface Tihar3DCanvasProps {
  activeArtifact: ArtifactId;
  onSelectArtifact: (id: ArtifactId) => void;
  isLit: boolean;
  onToggleLit: () => void;
  lightingMood: LightingMood;
  onToggleMood: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onIgniteBurst?: () => void;
}

const CAMERA_PRESETS: Record<ArtifactId, { pos: [number, number, number]; target: [number, number, number] }> = {
  diyo: { pos: [3.4, 2.35, 4.35], target: [0, 0.52, 0.15] },
  sukunda: { pos: [4.4, 2.65, 5.7], target: [0, 1.18, 0.0] },
  lantern: { pos: [3.9, 2.25, 4.85], target: [0, 1.2, 0] },
  thali: { pos: [0.45, 3.65, 4.35], target: [0, 0.12, 0] },
};

function createRadialShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function Tihar3DCanvas({
  activeArtifact,
  onSelectArtifact,
  isLit,
  onToggleLit,
  lightingMood,
  onToggleMood,
  soundEnabled,
  onToggleSound,
  onIgniteBurst,
}: Tihar3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  // Store mutable React state in refs so WebGLRenderer mounts once and never tears down
  const stateRef = useRef({
    activeArtifact,
    isLit,
    lightingMood,
    explodeAmount,
    soundEnabled,
    burstIntensity: 0,
    cameraPresetPending: true,
  });

  const callbacksRef = useRef({ onToggleLit, onIgniteBurst });
  callbacksRef.current = { onToggleLit, onIgniteBurst };

  useEffect(() => {
    const prev = stateRef.current.activeArtifact;
    stateRef.current.activeArtifact = activeArtifact;
    if (prev !== activeArtifact) {
      stateRef.current.cameraPresetPending = true;
    }
  }, [activeArtifact]);

  useEffect(() => {
    const wasLit = stateRef.current.isLit;
    stateRef.current.isLit = isLit;
    if (!wasLit && isLit) {
      stateRef.current.burstIntensity = 1.0;
    }
  }, [isLit]);

  useEffect(() => {
    const prevMood = stateRef.current.lightingMood;
    stateRef.current.lightingMood = lightingMood;
    if (prevMood !== lightingMood && lightingMood === 'midnight') {
      stateRef.current.burstIntensity = 0.9;
    }
  }, [lightingMood]);

  useEffect(() => {
    stateRef.current.explodeAmount = explodeAmount;
  }, [explodeAmount]);

  useEffect(() => {
    stateRef.current.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL probe
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    const onContextRestored = () => {
      setWebglFallback(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    const duskBg = new THREE.Color('#1D142D');
    const midnightBg = new THREE.Color('#030208');
    scene.background = duskBg.clone();
    scene.fog = new THREE.FogExp2('#1D142D', 0.045);

    // Studio PBR reflections on every device (RoomEnvironment) — modulated in Midnight Puja for chiaroscuro
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 1.1;
    pmremGenerator.dispose();

    const isNarrow = width < 600;
    const camera = new THREE.PerspectiveCamera(isNarrow ? 48 : 42, width / height, 0.1, 80);
    const initialPreset = CAMERA_PRESETS[stateRef.current.activeArtifact];
    const distMult = isNarrow ? 1.28 : 1.0;
    camera.position.set(
      initialPreset.pos[0] * distMult,
      initialPreset.pos[1] * distMult,
      initialPreset.pos[2] * distMult,
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: null,
      RIGHT: null,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    // Allow native vertical page scrolling on touchscreens while keeping horizontal drag & pinch
    renderer.domElement.style.touchAction = 'pan-y';
    controls.minDistance = 2.6;
    controls.maxDistance = 10.5;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 0.55;
    controls.addEventListener('start', () => {
      stateRef.current.cameraPresetPending = false;
    });
    controls.addEventListener('change', () => {
      renderer.domElement.dataset.cameraDistance = controls.getDistance().toFixed(2);
      renderer.domElement.dataset.azimuth = controls.getAzimuthalAngle().toFixed(2);
    });

    // Warm / Cool Lighting Rig (<= 1 shadow caster)
    const hemiLight = new THREE.HemisphereLight(0x52456e, 0x1a110d, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffcb80, 1.5);
    keyLight.position.set(4.5, 6.8, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4.2;
    keyLight.shadow.camera.right = 4.2;
    keyLight.shadow.camera.top = 4.2;
    keyLight.shadow.camera.bottom = -4.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8e63eb, 0.55);
    rimLight.position.set(-4.5, 3.8, -4.5);
    scene.add(rimLight);

    // Grounded Kathmandu Stone Courtyard Stage (extended + fog-blended so no horizon seam)
    const courtyardGeo = new THREE.CircleGeometry(48, 64);
    courtyardGeo.rotateX(-Math.PI / 2);
    const courtyardMat = new THREE.MeshStandardMaterial({
      color: 0x110c17,
      roughness: 0.96,
      metalness: 0.02,
    });
    const courtyardFloor = new THREE.Mesh(courtyardGeo, courtyardMat);
    courtyardFloor.position.y = -0.02;
    courtyardFloor.receiveShadow = true;
    scene.add(courtyardFloor);

    // Subtle brass inlay ring around artifact plinth
    const ringGeo = new THREE.RingGeometry(2.65, 2.74, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd99b26,
      roughness: 0.35,
      metalness: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const courtyardRing = new THREE.Mesh(ringGeo, ringMat);
    courtyardRing.position.y = 0.0;
    scene.add(courtyardRing);

    const shadowTex = createRadialShadowTexture();
    const contactShadowGeo = new THREE.CircleGeometry(2.65, 32);
    contactShadowGeo.rotateX(-Math.PI / 2);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.position.y = -0.004;
    scene.add(contactShadow);

    // Procedural Textures + Newari Courtyard Backdrop + All 4 Composite 3D Tihar Artifacts
    const textures = createTiharTextures(renderer.capabilities.getMaxAnisotropy());
    const courtyardBackdrop = buildNewariCourtyardBackdrop(textures);
    scene.add(courtyardBackdrop.group);

    const artifacts: Record<ArtifactId, BuiltArtifact> = {
      diyo: buildClayDiyoArtifact(textures),
      sukunda: buildSukundaArtifact(textures),
      lantern: buildAakashDeepLantern(textures),
      thali: buildBhaiTikaThaliArtifact(textures),
    };

    (Object.keys(artifacts) as ArtifactId[]).forEach((id) => {
      const art = artifacts[id];
      art.group.visible = id === stateRef.current.activeArtifact;
      scene.add(art.group);
    });

    // Floating Diyo Embers & Radial Golden Spark Burst (InstancedMesh)
    const emberCount = 72;
    const emberGeo = new THREE.OctahedronGeometry(0.038, 0);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffc04d,
      transparent: true,
      opacity: 0.88,
    });
    const embers = new THREE.InstancedMesh(emberGeo, emberMat, emberCount);
    embers.frustumCulled = false;
    scene.add(embers);

    const emberState = Array.from({ length: emberCount }, (_, i) => {
      const angle = (i / emberCount) * Math.PI * 2;
      const rad = 0.45 + ((i * 29) % 36) / 10;
      return {
        angle,
        rad,
        y: ((i * 19) % 38) / 10,
        speed: 0.25 + ((i * 13) % 24) / 40,
        phase: i * 0.7,
      };
    });

    // Raycaster for interactive 3D clicking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return; // Dragged camera, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const currentArt = artifacts[stateRef.current.activeArtifact];
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(currentArt.clickTargets, true);
      if (hits.length > 0) {
        stateRef.current.burstIntensity = 1.0;
        if (stateRef.current.soundEnabled) {
          playGhantaChime();
        }
        callbacksRef.current.onToggleLit();
        callbacksRef.current.onIgniteBurst?.();
      }
    };

    const onWheelCapture = (e: WheelEvent) => {
      // Prevent OrbitControls from zooming on mouse-wheel/trackpad scroll while keeping passive page scroll
      e.stopImmediatePropagation();
    };

    renderer.domElement.addEventListener('wheel', onWheelCapture, {
      capture: true,
      passive: true,
    });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Resize observer for crisp responsive framing
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation state & software-WebGL afterDraw pacing
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;
    let currentExplode = 0;
    let currentFlameScale = stateRef.current.isLit ? 1 : 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      const {
        activeArtifact: activeId,
        isLit: lit,
        lightingMood: mood,
        explodeAmount: targetExplode,
        burstIntensity,
        cameraPresetPending,
      } = stateRef.current;

      // Switch visible artifact
      (Object.keys(artifacts) as ArtifactId[]).forEach((id) => {
        artifacts[id].group.visible = id === activeId;
      });
      const currentArt = artifacts[activeId];

      // Smooth damped camera preset transitions (preserve radial arc so camera never clips through artifact)
      if (cameraPresetPending) {
        const preset = CAMERA_PRESETS[activeId];
        const narrowMult = container.clientWidth < 600 ? 1.24 : 1.0;
        _scratchCamPos.set(
          preset.pos[0] * narrowMult,
          preset.pos[1] * narrowMult,
          preset.pos[2] * narrowMult,
        );
        _scratchTarget.set(...preset.target);
        if (isSoftwareGl) {
          camera.position.copy(_scratchCamPos);
          controls.target.copy(_scratchTarget);
          stateRef.current.cameraPresetPending = false;
        } else {
          const prevDist = camera.position.distanceTo(controls.target);
          const targetDist = _scratchCamPos.distanceTo(_scratchTarget);
          camera.position.lerp(_scratchCamPos, 1 - Math.exp(-5.5 * dt));
          controls.target.lerp(_scratchTarget, 1 - Math.exp(-6.5 * dt));
          const minArcDist = Math.min(prevDist, targetDist);
          _scratchVec.copy(camera.position).sub(controls.target);
          const curDist = _scratchVec.length();
          if (curDist > 0.001 && curDist < minArcDist) {
            _scratchVec.setLength(minArcDist);
            camera.position.copy(controls.target).add(_scratchVec);
          }
          if (
            camera.position.distanceTo(_scratchCamPos) < 0.03 &&
            controls.target.distanceTo(_scratchTarget) < 0.02
          ) {
            stateRef.current.cameraPresetPending = false;
          }
        }
      }
      controls.update();

      // Smoothly damp lighting mood (Warm Dusk Twilight vs Dramatic Midnight Puja chiaroscuro)
      const isMidnight = mood === 'midnight';
      const targetBg = isMidnight ? midnightBg : duskBg;
      const moodLerp = isSoftwareGl ? 1 : 1 - Math.exp(-5 * dt);
      (scene.background as THREE.Color).lerp(targetBg, moodLerp);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
        scene.fog.density = isSoftwareGl
          ? isMidnight
            ? 0.066
            : 0.045
          : THREE.MathUtils.damp(scene.fog.density, isMidnight ? 0.066 : 0.045, 5, dt);
      }

      scene.environmentIntensity = isSoftwareGl
        ? isMidnight
          ? 0.24
          : 1.1
        : THREE.MathUtils.damp(scene.environmentIntensity, isMidnight ? 0.24 : 1.1, 5, dt);

      keyLight.intensity = isSoftwareGl
        ? isMidnight
          ? 0.26
          : 2.05
        : THREE.MathUtils.damp(keyLight.intensity, isMidnight ? 0.26 : 2.05, 5, dt);
      keyLight.color.lerp(isMidnight ? _midnightKeyColor : _duskKeyColor, moodLerp);

      hemiLight.intensity = isSoftwareGl
        ? isMidnight
          ? 0.24
          : 0.92
        : THREE.MathUtils.damp(hemiLight.intensity, isMidnight ? 0.24 : 0.92, 5, dt);
      hemiLight.color.lerp(isMidnight ? _midnightHemiSky : _duskHemiSky, moodLerp);

      rimLight.intensity = isSoftwareGl
        ? isMidnight
          ? 1.15
          : 0.55
        : THREE.MathUtils.damp(rimLight.intensity, isMidnight ? 1.15 : 0.55, 5, dt);
      rimLight.color.lerp(isMidnight ? _midnightRimColor : _duskRimColor, moodLerp);

      // Smoothly damp Exploded-Craft separation
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 7, dt);
      for (const part of currentArt.explodableParts) {
        _scratchVec.copy(part.basePos).addScaledVector(part.offset, currentExplode);
        part.mesh.position.copy(_scratchVec);
      }

      // Flame flicker & burst animation (extra golden warmth during Midnight Puja)
      currentFlameScale = THREE.MathUtils.damp(currentFlameScale, lit ? 1 : 0, 8, dt);
      stateRef.current.burstIntensity = Math.max(0, burstIntensity - dt * 1.4);

      const flicker =
        0.92 +
        Math.sin(elapsed * 11.3) * 0.06 +
        Math.cos(elapsed * 17.7) * 0.04 +
        stateRef.current.burstIntensity * 0.45;

      for (const flame of currentArt.flames) {
        const s = Math.max(0.0001, currentFlameScale * (isMidnight ? 1.14 : 1));
        flame.visible = currentFlameScale > 0.01;
        flame.scale.set(s * (0.94 + Math.sin(elapsed * 13) * 0.06), s * flicker, s);
        flame.rotation.z = Math.sin(elapsed * 7.2) * 0.07;
      }

      const flameBoost = isMidnight ? 5.9 : 3.4;
      for (const light of currentArt.flameLights) {
        light.intensity = currentFlameScale * (flameBoost + stateRef.current.burstIntensity * 2.8) * flicker;
      }

      // Gentle sway on hanging lantern tassels
      currentArt.swayParts.forEach((part, idx) => {
        part.rotation.z = Math.sin(elapsed * 2.1 + idx) * 0.08;
        part.rotation.x = Math.cos(elapsed * 1.7 + idx) * 0.05;
      });

      // Update Newari Courtyard Backdrop Lights, Stars, Moon, Sky Lanterns & Floor Halo
      courtyardBackdrop.updateBackdrop(
        lit,
        mood,
        elapsed,
        stateRef.current.burstIntensity,
        dt,
        isSoftwareGl,
      );

      // Update floating golden embers & radial burst sparks (InstancedMesh)
      const emberVisibility = Math.max(isMidnight ? 0.34 : 0.16, currentFlameScale);
      const emberMoodScale = isMidnight ? 1.52 : 1.0;
      const burstExpand = 1 + stateRef.current.burstIntensity * 0.48;
      for (let i = 0; i < emberCount; i++) {
        const e = emberState[i];
        const yPos = ((e.y + elapsed * e.speed * (lit ? 1.1 : 0.25)) % 3.8) + 0.15;
        const swirl = e.angle + elapsed * 0.35 + Math.sin(elapsed + e.phase) * 0.16;
        const r = e.rad * burstExpand * (1 + Math.sin(yPos * 0.8) * 0.12);
        _dummy.position.set(Math.cos(swirl) * r, yPos, Math.sin(swirl) * r);
        const pulseScale =
          (0.62 + Math.sin(elapsed * 3.5 + e.phase) * 0.35) *
          emberVisibility *
          emberMoodScale *
          (1 + stateRef.current.burstIntensity * 0.85);
        _dummy.scale.setScalar(Math.max(0.01, pulseScale));
        _dummy.rotation.set(elapsed + e.phase, elapsed * 0.7, 0);
        _dummy.updateMatrix();
        embers.setMatrixAt(i, _dummy.matrix);
      }
      embers.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      renderer.domElement.dataset.cameraDistance = controls.getDistance().toFixed(2);
      renderer.domElement.dataset.azimuth = controls.getAzimuthalAngle().toFixed(2);
      renderer.domElement.dataset.mood = mood;

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('wheel', onWheelCapture, { capture: true });
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      courtyardBackdrop.dispose();
      textures.dispose();
      shadowTex.dispose();
      envRT.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const artifactMeta = ARTIFACT_META[activeArtifact];

  return (
    <div
      data-testid="tihar-3d-canvas"
      data-artifact={activeArtifact}
      data-lit={String(isLit)}
      data-mood={lightingMood}
      data-exploded={explodeAmount > 0.1 ? 'true' : 'false'}
      className={`relative w-full h-[490px] sm:h-[540px] lg:h-[580px] rounded-xl overflow-hidden border transition-colors duration-300 ${
        lightingMood === 'midnight'
          ? 'border-[#E89B1E]/50 bg-[#030208] shadow-[0_0_50px_rgba(232,155,30,0.12)]'
          : 'border-[#E89B1E]/25 bg-[#1D142D]'
      }`}
    >
      {/* WebGL isolated mount container */}
      {!webglFallback ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label={`Interactive 3D view of ${artifactMeta.label}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#181220]">
          <img
            src="/src/assets/images/tihar_laxmi_puja_courtyard_1794923812709.jpg"
            alt="Tihar Laxmi Puja Courtyard"
            referrerPolicy="no-referrer"
            className="w-full max-w-md h-52 object-cover rounded-lg mb-5 border border-[#E89B1E]/30"
          />
          <h3 className="font-display text-2xl font-semibold text-[#F5EDE2]">
            {artifactMeta.label}
          </h3>
          <p className="text-sm text-[#B8AB9E] mt-2 max-w-md">{artifactMeta.subtitle}</p>
        </div>
      )}

      {/* Top-Left Artifact Readout (Static, zero-pill, compact on mobile) */}
      <div className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 max-w-[calc(100%-24px)] sm:max-w-md bg-[#140F1B]/92 border border-[#E89B1E]/20 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-[#E89B1E] font-medium">
          <span>{artifactMeta.nepaliLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{artifactMeta.partsCount} crafted parts</span>
          <span aria-hidden="true">·</span>
          <span>{isLit ? 'Flame Lit' : 'Unlit'}</span>
          <span aria-hidden="true">·</span>
          <span>{lightingMood === 'midnight' ? 'Midnight Puja' : 'Dusk Twilight'}</span>
        </div>
        <h2 className="font-display text-lg sm:text-2xl font-semibold text-[#F7EFE4] mt-0.5 leading-tight">
          {artifactMeta.label}
        </h2>
        <p className="hidden sm:block text-xs text-[#C2B5A8] mt-1 leading-relaxed">
          {artifactMeta.subtitle}
        </p>
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-20px)] max-w-[900px] z-10 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          aria-expanded={!dockCollapsed}
          className="mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-md bg-[#16111E]/95 border border-b-0 border-[#E89B1E]/25 text-xs font-medium text-[#E5D7C6] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#E89B1E]" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#E89B1E]" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#16111E]/95 border border-[#E89B1E]/25 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2.5">
            {/* Row 1: 4 Artifact Switcher Tabs (single-line scrollable on mobile, 4-col grid on sm+) */}
            <div
              role="tablist"
              aria-label="3D Tihar Artifacts"
              className="flex overflow-x-auto sm:grid sm:grid-cols-4 gap-1.5 bg-[#0E0A14] p-1 rounded-lg"
            >
              {(Object.keys(ARTIFACT_META) as ArtifactId[]).map((id) => {
                const active = id === activeArtifact;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onSelectArtifact(id)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 sm:shrink sm:truncate cursor-pointer min-h-[40px] ${
                      active
                        ? 'bg-[#E89B1E] text-[#120D18] font-semibold'
                        : 'text-[#CFC2B4] hover:text-white hover:bg-[#231B2E]'
                    }`}
                  >
                    {ARTIFACT_META[id].label}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Craft Actions + Explode Slider */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (soundEnabled) playGhantaChime();
                    onToggleLit();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                    isLit
                      ? 'bg-[#C93B2B] text-white hover:bg-[#b23223]'
                      : 'bg-[#E89B1E] text-[#120D18] hover:bg-[#f2aa36]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isLit ? 'Extinguish Flame' : 'Light Flame'}</span>
                </button>

                <button
                  type="button"
                  aria-pressed={lightingMood === 'midnight'}
                  onClick={() => {
                    const enteringMidnight = lightingMood === 'dusk';
                    if (enteringMidnight) {
                      if (soundEnabled) playGhantaChime();
                      onIgniteBurst?.();
                    }
                    onToggleMood();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                    lightingMood === 'midnight'
                      ? 'bg-[#251A3B] border border-[#E89B1E]/65 text-[#FFE29A] hover:bg-[#2F214A]'
                      : 'bg-[#231B2E] border border-transparent text-[#EDE3D6] hover:bg-[#2F243D]'
                  }`}
                >
                  {lightingMood === 'dusk' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#E89B1E]" />
                      <span>Midnight Puja</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#FFE29A]" />
                      <span>Dusk Twilight</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label={soundEnabled ? 'Mute chime sound' : 'Enable chime sound'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#231B2E] text-[#EDE3D6] hover:bg-[#2F243D] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#E89B1E]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#9C8E82]" />
                  )}
                  <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Chime Off'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-[300px]">
                <Layers className="w-3.5 h-3.5 text-[#E89B1E] shrink-0" />
                <label
                  htmlFor="explode-craft-slider"
                  className="text-xs font-medium text-[#D8CBBF] whitespace-nowrap shrink-0"
                >
                  Explode Craft
                </label>
                <input
                  id="explode-craft-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explodeAmount}
                  onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
                  className="w-full accent-[#E89B1E] cursor-pointer"
                />
                {explodeAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setExplodeAmount(0)}
                    aria-label="Reset exploded view"
                    className="p-1.5 rounded-md text-[#C2B5A8] hover:text-white hover:bg-[#231B2E] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
