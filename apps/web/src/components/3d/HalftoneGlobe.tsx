import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// GLSL Shaders: Pure #0A0A0A halftone points with directional lighting
// ─────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  attribute float aLand;
  attribute float aCoast;
  attribute float aOceanSpeck;

  varying float vAlpha;
  varying float vFacing;

  uniform float uDpr;
  uniform float uPointScale;

  void main() {
    // Normal is unit position on sphere
    vec3 N = normalize(position);

    // Camera view-space normal
    vec3 worldNormal = normalize(normalMatrix * N);

    // Directional light from upper-left and front in view space
    vec3 viewLightDir = normalize(vec3(-0.45, 0.65, 0.65));
    float lit = clamp(dot(worldNormal, viewLightDir), 0.0, 1.0);

    // Fresnel limb / facing term toward camera
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDir = normalize(-mvPos.xyz);
    float facing = clamp(dot(worldNormal, viewDir), 0.0, 1.0);
    float facingPow = pow(facing, 1.4);

    // ────── Point Size Formula ──────
    // size = base * ( land * (0.45 + 0.9*lit) + coast * 0.9 ) * facing^1.4
    float size = 0.0;
    if (aLand > 0.5) {
      size = uPointScale * (aLand * (0.45 + 0.9 * lit) + aCoast * 1.1) * facingPow;
    } else if (aOceanSpeck > 0.5) {
      // 1.5% sparse texture specks
      size = uPointScale * 0.16 * facingPow;
    }

    // ────── Alpha Formula ──────
    // alpha = 0.08 + 0.92*lit^1.2, multiplied by edge fade
    float alpha = (0.12 + 0.88 * pow(lit, 1.2)) * smoothstep(0.01, 0.15, facing);
    if (aOceanSpeck > 0.5) {
      alpha = (0.06 + 0.14 * lit) * smoothstep(0.01, 0.15, facing);
    }

    vAlpha = alpha;
    vFacing = facing;

    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = size * uDpr;

    // Discard tiny/invisible points behind or on limb
    if (size < 0.1 || facing <= 0.005) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      vAlpha = 0.0;
    }
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vFacing;

  void main() {
    vec2 cxy = gl_PointCoord - vec2(0.5);
    float dist = length(cxy);

    // Crisp circular dots with 1px smoothstep AA
    if (dist > 0.5) discard;
    float aa = 1.0 - smoothstep(0.42, 0.5, dist);

    // Pure #0A0A0A black ink dots
    gl_FragColor = vec4(0.039, 0.039, 0.039, vAlpha * aa);
  }
`;

// Stray dust dots drifting outside the sphere limb (~600 points)
const dustVertexShader = /* glsl */ `
  attribute float aSize;
  varying float vDustAlpha;
  uniform float uTime;
  uniform float uDpr;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.15 + position.y * 6.0) * 0.0035;
    pos.y += cos(uTime * 0.11 + position.x * 5.0) * 0.0025;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * uDpr;
    vDustAlpha = 0.20;
  }
`;

const dustFragmentShader = /* glsl */ `
  varying float vDustAlpha;
  void main() {
    vec2 cxy = gl_PointCoord - vec2(0.5);
    if (length(cxy) > 0.5) discard;
    float aa = 1.0 - smoothstep(0.38, 0.5, length(cxy));
    gl_FragColor = vec4(0.039, 0.039, 0.039, vDustAlpha * aa);
  }
`;

// ─────────────────────────────────────────────────────────────
// Land Mask & Coastline Generation (4096 x 2048 equirectangular)
// ─────────────────────────────────────────────────────────────
function pseudoRandom(seed: number): number {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function createHighResLandMask(width: number, height: number): { landData: Uint8Array; blurData: Uint8Array } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  function toMap(lonDeg: number, latDeg: number): [number, number] {
    return [((lonDeg + 180) / 360) * width, ((90 - latDeg) / 180) * height];
  }

  function drawPoly(coords: [number, number][]) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < coords.length; i++) {
      const [mx, my] = toMap(coords[i][0], coords[i][1]);
      i === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ── High-Detail Continental Polygons (Centered on East Asia, Eurasia, Americas, Africa) ──

  // Eurasia (China, Mongolia, Siberia, Russia)
  drawPoly([
    [100, 75], [120, 74], [140, 72], [160, 70], [178, 65], [170, 60],
    [160, 52], [148, 48], [140, 48], [135, 46], [131, 43], [128, 42],
    [124, 40], [121, 39], [118, 38], [120, 35], [122, 32], [121, 30],
    [120, 27], [117, 24], [114, 22], [110, 21], [108, 22], [106, 20],
    [104, 16], [100, 14], [97, 16], [95, 20], [90, 23], [85, 27],
    [80, 29], [75, 30], [70, 36], [62, 40], [55, 44], [48, 50],
    [42, 58], [38, 65], [45, 70], [60, 73], [80, 75],
  ]);

  // Japan — Hokkaido
  drawPoly([[139.5, 45.5], [141, 45.8], [145.5, 44], [145, 42.5], [143, 42], [141, 42.8], [140, 43.5]]);
  // Japan — Honshu (Tokyo, Osaka, Kyoto, Tohoku)
  drawPoly([
    [141.5, 41.5], [142, 40], [141.5, 38.5], [141, 37], [140.5, 36],
    [139.7, 35.5], [138, 35], [136.5, 34.8], [135, 34.5], [133.5, 34.2],
    [132, 34], [131, 33.8], [131, 34.5], [132.5, 35.5], [134, 36],
    [136, 36.8], [138, 37.5], [139.5, 38.5], [140, 39.5], [140.8, 41],
  ]);
  // Japan — Shikoku & Kyushu
  drawPoly([[132.5, 34], [134.5, 34.2], [134.5, 33.3], [133, 33.2]]);
  drawPoly([[129.5, 33.8], [131.5, 34], [132, 32.5], [131, 31], [130, 31.5]]);
  // Japan — Okinawa
  drawPoly([[127, 27], [128.5, 27.5], [128, 26], [126.5, 26.5]]);

  // Korean Peninsula (Seoul, Busan, Pyongyang)
  drawPoly([
    [124.5, 40], [126, 41], [128, 42], [130, 42.5], [130.5, 39],
    [129.5, 36], [129, 35], [127.5, 34.5], [126, 34.5], [126, 37], [125, 38.5],
  ]);

  // Taiwan
  drawPoly([[120, 25.5], [122, 25], [121.8, 22.5], [120.5, 22]]);

  // Philippines
  drawPoly([[120, 18.5], [122, 18], [122.5, 14.5], [120.5, 14]]);
  drawPoly([[124, 14], [126, 12], [125, 9], [123, 10.5]]);

  // Kamchatka & Kuril Arc
  drawPoly([[156, 51.5], [158.5, 53.5], [162, 58], [163, 61.5], [160, 59], [157, 55], [155, 52]]);

  // Southeast Asia (Vietnam, Laos, Thailand, Myanmar, Malaysia)
  drawPoly([
    [93, 28], [98, 26], [100, 20], [106, 17], [108, 16],
    [109, 12], [107, 9], [105, 8], [103, 6], [101, 3],
    [100, 6], [99, 10], [98, 14], [95, 18], [92, 22],
  ]);

  // Indonesia (Sumatra, Java, Borneo, Sulawesi)
  drawPoly([[95, 5], [98, 3], [105, -5], [106, -6], [104, -8], [97, -2], [95, 2]]);
  drawPoly([[109, 5], [115, 5], [118, 1], [117, -3], [114, -4], [110, 0]]);
  drawPoly([[105, -6], [114, -7], [114, -8.5], [106, -8]]);
  drawPoly([[119, -1], [122, 1], [125, -3], [121, -5], [119, -3]]);

  // South Asia / India & Sri Lanka
  drawPoly([
    [68, 24], [72, 28], [76, 30], [80, 30], [85, 28], [88, 26],
    [88, 22], [85, 18], [82, 14], [80, 10], [78, 8], [76, 10],
    [74, 15], [72, 18], [70, 20],
  ]);
  drawPoly([[79.5, 9], [81.5, 8.5], [82, 6.5], [80, 6]]);

  // Middle East & Arabia
  drawPoly([
    [35, 31], [40, 35], [45, 38], [50, 37], [55, 30], [58, 26],
    [56, 22], [52, 16], [48, 14], [44, 14], [42, 18], [38, 24], [36, 28],
  ]);

  // Europe & Mediterranean
  drawPoly([
    [-10, 36], [-5, 43], [0, 44], [5, 44], [8, 46], [12, 46],
    [16, 42], [20, 40], [24, 41], [28, 42], [30, 45], [35, 48],
    [40, 52], [45, 55], [50, 60], [55, 65], [50, 68], [40, 70],
    [30, 71], [20, 70], [15, 68], [10, 65], [5, 62], [2, 55],
    [0, 50], [-3, 48], [-5, 44],
  ]);
  drawPoly([[-9, 37], [-6, 37], [-2, 38], [0, 40], [-1, 43], [-5, 43], [-9, 42], [-10, 40]]);
  drawPoly([[8, 46], [12, 44], [16, 42], [16, 38], [12, 37], [10, 40], [8, 43]]);
  drawPoly([[5, 58], [10, 60], [15, 64], [20, 68], [28, 70], [25, 65], [18, 60], [12, 57], [8, 56]]);
  drawPoly([[-5, 50], [1, 52], [1, 56], [-2, 58], [-5, 58], [-6, 54]]);
  drawPoly([[-10, 51.5], [-6, 52], [-6, 55], [-10, 55]]);

  // Africa & Madagascar
  drawPoly([
    [-17, 15], [-15, 25], [-8, 32], [-5, 35], [0, 36], [10, 37],
    [12, 35], [25, 32], [33, 30], [42, 28], [50, 12], [48, 5],
    [42, -2], [40, -8], [35, -18], [30, -26], [28, -33],
    [22, -34], [18, -28], [15, -20], [12, -10], [10, -2],
    [8, 5], [4, 8], [0, 6], [-5, 5], [-10, 8], [-15, 10],
  ]);
  drawPoly([[43, -12], [50, -15], [49, -22], [46, -25], [44, -22], [43, -16]]);

  // North America
  drawPoly([
    [-170, 64], [-165, 68], [-155, 72], [-140, 72], [-120, 72],
    [-100, 75], [-90, 75], [-80, 72], [-65, 65], [-55, 52],
    [-60, 48], [-66, 45], [-70, 42], [-75, 38], [-80, 30],
    [-83, 25], [-90, 22], [-97, 18], [-105, 20], [-108, 25],
    [-112, 30], [-117, 33], [-120, 34], [-122, 38], [-124, 42],
    [-124, 48], [-128, 52], [-135, 56], [-145, 60], [-155, 60],
    [-165, 62],
  ]);
  drawPoly([[-55, 60], [-45, 60], [-20, 70], [-18, 76], [-22, 82], [-40, 83], [-55, 80], [-60, 75], [-55, 68]]);

  // South America
  drawPoly([
    [-80, 10], [-76, 12], [-70, 12], [-60, 10], [-52, 5],
    [-45, 0], [-35, -5], [-35, -10], [-37, -18], [-40, -22],
    [-48, -28], [-55, -35], [-60, -42], [-65, -52], [-68, -55],
    [-72, -52], [-75, -40], [-76, -28], [-78, -18], [-80, -5], [-80, 5],
  ]);

  // Australia & New Zealand
  drawPoly([
    [113, -22], [120, -16], [130, -12], [136, -12], [142, -11],
    [148, -15], [152, -22], [153, -28], [151, -34], [145, -38],
    [138, -37], [132, -35], [126, -32], [120, -30], [115, -26],
  ]);
  drawPoly([[174, -36], [178, -37], [177, -41], [174, -39]]);
  drawPoly([[167, -44], [172, -42], [174, -44], [170, -47]]);

  // Land pixel data
  const imgData = ctx.getImageData(0, 0, width, height).data;
  const landData = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    landData[i] = imgData[i * 4];
  }

  // Precompute blurred edge map for COAST value calculation using hardware-accelerated canvas filter
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = width;
  blurCanvas.height = height;
  const blurCtx = blurCanvas.getContext('2d');
  const blurData = new Uint8Array(width * height);
  if (blurCtx) {
    blurCtx.filter = 'blur(4px)';
    blurCtx.drawImage(canvas, 0, 0);
    const blurImg = blurCtx.getImageData(0, 0, width, height).data;
    for (let i = 0; i < width * height; i++) {
      blurData[i] = blurImg[i * 4];
    }
  }

  return { landData, blurData };
}

// Module-level geometry caching to guarantee 0ms overhead on reloads/re-renders
let cachedGlobeGeometry: THREE.BufferGeometry | null = null;
let cachedDustGeometry: THREE.BufferGeometry | null = null;

// ─────────────────────────────────────────────────────────────
// Fibonacci Sphere Distribution (280k points, golden angle)
// ─────────────────────────────────────────────────────────────
function generateFibonacciPoints(
  numPoints: number,
  mapW: number,
  mapH: number,
  landData: Uint8Array,
  blurData: Uint8Array
) {
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const positions = new Float32Array(numPoints * 3);
  const landAttr = new Float32Array(numPoints);
  const coastAttr = new Float32Array(numPoints);
  const oceanSpeckAttr = new Float32Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (2 * i) / (numPoints - 1);
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;

    // Organic tiny jitter
    const jitter = 0.002 + pseudoRandom(i * 7 + 3) * 0.003;
    const jAngle = pseudoRandom(i * 7 + 5) * Math.PI * 2;
    const jPhi = pseudoRandom(i * 7 + 7) * Math.PI * 2;

    // Standard spherical coordinates
    // lon = angle in horizontal plane, lat = asin(y)
    const lon = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const lat = Math.asin(y);

    const x = radiusAtY * Math.sin(lon) + Math.cos(jAngle) * jitter;
    const z = radiusAtY * Math.cos(lon) + Math.sin(jPhi) * jitter;
    const yJ = y + (pseudoRandom(i * 7 + 9) - 0.5) * jitter;

    // Normalize to exact unit sphere
    const len = Math.sqrt(x * x + yJ * yJ + z * z);
    const nx = x / len;
    const ny = yJ / len;
    const nz = z / len;

    positions[i * 3] = nx;
    positions[i * 3 + 1] = ny;
    positions[i * 3 + 2] = nz;

    // True Geographic Spherical Coordinates: lat [-90, 90], lon [-180, 180]
    const latDeg = (Math.asin(Math.max(-1, Math.min(1, ny))) * 180) / Math.PI;
    const lonDeg = (Math.atan2(nx, nz) * 180) / Math.PI;

    const mx = Math.floor(((lonDeg + 180) / 360) * (mapW - 1));
    const my = Math.floor(((90 - latDeg) / 180) * (mapH - 1));
    const idx = my * mapW + mx;

    const isLand = landData[idx] > 120;
    const blurVal = blurData[idx];

    // Coast: land point near boundary (low blurVal relative to interior)
    let coastVal = 0.0;
    if (isLand) {
      coastVal = Math.max(0, (230 - blurVal) / 230.0);
    }

    landAttr[i] = isLand ? 1.0 : 0.0;
    coastAttr[i] = coastVal;

    // 1.5% random sparse specks over ocean for tactile print texture
    if (!isLand) {
      oceanSpeckAttr[i] = pseudoRandom(i * 13 + 19) < 0.015 ? 1.0 : 0.0;
    }
  }

  return { positions, landAttr, coastAttr, oceanSpeckAttr };
}

function generateDustPoints(count: number): { positions: Float32Array; sizes: Float32Array } {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = 1.02 + pseudoRandom(i * 11 + 1) * 0.10;
    const phi = pseudoRandom(i * 11 + 3) * Math.PI * 2;
    const cosTheta = (pseudoRandom(i * 11 + 5) * 2 - 1) * 0.82;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

    positions[i * 3] = r * sinTheta * Math.cos(phi);
    positions[i * 3 + 1] = r * sinTheta * Math.sin(phi);
    positions[i * 3 + 2] = r * cosTheta;
    sizes[i] = 1.0 + pseudoRandom(i * 11 + 7) * 1.0;
  }

  return { positions, sizes };
}

// ─────────────────────────────────────────────────────────────
// Inner 3D Scene Component
// ─────────────────────────────────────────────────────────────
interface EarthMeshProps {
  isHovered: React.MutableRefObject<boolean>;
  scrollProgress: React.MutableRefObject<number>;
  mouseParallax: React.MutableRefObject<{ x: number; y: number }>;
}

const EarthMesh: React.FC<EarthMeshProps> = ({ isHovered, scrollProgress, mouseParallax }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport, size, gl } = useThree();

  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Generate optimized points on Fibonacci sphere with instant module-level caching
  const { globeGeometry, dustGeometry } = useMemo(() => {
    if (cachedGlobeGeometry && cachedDustGeometry) {
      return { globeGeometry: cachedGlobeGeometry, dustGeometry: cachedDustGeometry };
    }

    const MAP_W = 1440;
    const MAP_H = 720;
    const { landData, blurData } = createHighResLandMask(MAP_W, MAP_H);

    const NUM_POINTS = 95000;
    const { positions, landAttr, coastAttr, oceanSpeckAttr } = generateFibonacciPoints(
      NUM_POINTS,
      MAP_W,
      MAP_H,
      landData,
      blurData
    );

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aLand', new THREE.Float32BufferAttribute(landAttr, 1));
    geo.setAttribute('aCoast', new THREE.Float32BufferAttribute(coastAttr, 1));
    geo.setAttribute('aOceanSpeck', new THREE.Float32BufferAttribute(oceanSpeckAttr, 1));

    const dust = generateDustPoints(350);
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dust.positions, 3));
    dustGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(dust.sizes, 1));

    cachedGlobeGeometry = geo;
    cachedDustGeometry = dustGeo;

    return { globeGeometry: geo, dustGeometry: dustGeo };
  }, []);

  const globeUniforms = useMemo(
    () => ({
      uDpr: { value: Math.min(window.devicePixelRatio, 2) },
      uPointScale: { value: 5.2 },
    }),
    []
  );

  const dustUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  );

  // Initial orientation: Longitude ~135°E facing camera, tilt ~0.35 rad toward North
  const baseRotationY = useMemo(() => -2.43, []);
  const autoRotationY = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    dustUniforms.uTime.value = time;

    // Responsive dot sizing: bold, tactile halftone dots
    const pointScale = Math.max(4.2, Math.min(6.8, size.width / 220));
    globeUniforms.uPointScale.value = pointScale;

    // Auto-rotate: 0.00035 rad/frame, pause on hover, disabled on prefers-reduced-motion
    if (!isHovered.current && !prefersReducedMotion) {
      autoRotationY.current += 0.00035;
    }

    // Scroll-linked transforms:
    // Rotates slowly toward next region, scales 1 to 1.12
    const sp = scrollProgress.current;
    const scrollRotation = sp * 0.55;
    const scrollScale = 1 + sp * 0.12;

    // Subtle mouse parallax (max 2° = 0.035 rad)
    const mouseRotY = mouseParallax.current.x * 0.035;
    const mouseRotX = mouseParallax.current.y * 0.025;

    // ─────────────────────────────────────────────────────────
    // Precision Dome Placement:
    // Apex touches exactly near the top of the canvas (16px below top edge)
    // Radius = viewport.width * 0.68
    // ─────────────────────────────────────────────────────────
    const sphereRadius = Math.max(viewport.width * 0.68, viewport.height * 1.35);
    const pixelWorldUnit = viewport.height / Math.max(1, size.height);
    const topMarginWorld = 16 * pixelWorldUnit;
    const yApex = viewport.height / 2 - topMarginWorld;
    const yCenter = yApex - sphereRadius;

    groupRef.current.position.set(0, yCenter, 0);
    groupRef.current.scale.setScalar(sphereRadius * scrollScale);

    groupRef.current.rotation.y = baseRotationY + autoRotationY.current + scrollRotation + mouseRotY;
    groupRef.current.rotation.x = 0.35 + mouseRotX;
  });

  useEffect(() => {
    const dpr = Math.min(gl.getPixelRatio(), 2);
    globeUniforms.uDpr.value = dpr;
    dustUniforms.uDpr.value = dpr;
  }, [size, gl, globeUniforms, dustUniforms]);

  return (
    <group ref={groupRef}>
      {/* Halftone Earth Point Cloud (single draw call) */}
      <points geometry={globeGeometry}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={globeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Stray dust dots outside limb */}
      <points geometry={dustGeometry}>
        <shaderMaterial
          vertexShader={dustVertexShader}
          fragmentShader={dustFragmentShader}
          uniforms={dustUniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────
// Public Component: HalftoneGlobe
// ─────────────────────────────────────────────────────────────
export interface HalftoneGlobeProps {
  className?: string;
  scrollProgress?: number;
}

export const HalftoneGlobe: React.FC<HalftoneGlobeProps> = ({
  className = '',
  scrollProgress: scrollProgressProp = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const scrollRef = useRef(scrollProgressProp);
  scrollRef.current = scrollProgressProp;

  const mouseParallax = useRef({ x: 0, y: 0 });

  // Pause render loop when off-screen
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fade-in on load: opacity 0 to 1 over 1.2s with slight rise
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Mouse parallax tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseParallax.current = { x: nx, y: -ny };
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    mouseParallax.current = { x: 0, y: 0 };
  };

  // Fade out as hero leaves
  const fadeOpacity = Math.max(0, 1 - scrollRef.current * 1.35);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full select-none ${className}`}
      style={{
        opacity: loaded ? fadeOpacity : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(24px)',
        transition: loaded
          ? 'opacity 0.15s ease-out'
          : 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-label="Horizon Halftone Earth"
    >
      {/* 
        Edge fade:
        1. Radial mask image on the canvas wrapper
        2. Linear white/off-white gradient overlays at top, left 10%, right 10%
      */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(to bottom, rgba(250, 250, 249, 0.95) 0%, rgba(250, 250, 249, 0.4) 6%, transparent 14%),
            linear-gradient(to right, #FAFAF9 0%, transparent 10%),
            linear-gradient(to left, #FAFAF9 0%, transparent 10%)
          `,
        }}
      />

      {isVisible && (
        <div
          className="w-full h-full"
          style={{
            maskImage: 'radial-gradient(ellipse 110% 90% at 50% 55%, black 68%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(ellipse 110% 90% at 50% 55%, black 68%, transparent 98%)',
          }}
        >
          <Canvas
            dpr={[1, 2]}
            camera={{
              fov: 30,
              near: 0.1,
              far: 100,
              position: [0, 0, 4.0],
            }}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            style={{
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
            }}
            frameloop={isVisible ? 'always' : 'never'}
          >
            <EarthMesh
              isHovered={isHoveredRef}
              scrollProgress={scrollRef}
              mouseParallax={mouseParallax}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default HalftoneGlobe;
