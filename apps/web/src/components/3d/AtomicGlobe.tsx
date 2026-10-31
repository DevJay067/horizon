// @ts-nocheck
/**
 * AtomicGlobe.tsx — Standalone React port of the MeridianGlobe / AtomicGlobe
 * Reversed colors: Pure #0A0A0A black stippled dots on transparent / off-white #FAFAF9
 * Centered on East Asia (China, Korea, Japan) rising from the bottom of the hero
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

const GRID_COLS=448;const GRID_ROWS=224;const COAST_RUNS=["LR3iWfC1291A1W622w12~1Sa7Q14t221J1w23g89M6b1k6X1B123329O29z6326Y2cC1Z19c29c2W57234k4z2E1751~27~8444G1x289137","3i3X4a528522232dax2H11U17D1hw49utscx3Z1e65566452724X45g32fsL1$26x1vw1853Y3uy15~2I1H29G4ca345254239qI1Z24tF11","655g5Y23eY16134g5Z2E1x1b5224123412131319D472d1446125ipE1$24h4311x2ddC11pH317d5s7V1E1kp35216i43A19n2mof212bl6","54rgE1R1dJ172H3d2bb2S32555w1lR1x1jd5664245h3l4vk2fw284e73688kvS1rj15218352C82u335w1W1rdb3257291347225~1eaeC3","614bdpX1y1422v2G81y121253qy12onafb31~2227b2a3E38d33cijbw1e3d6~a3f3dvamfhf561y383h1bU25413b314hdq2y1e3y63B63e","Z1bh225pX2B1X2b131231263k9Y1f4N52fcc242F56fX18s8kV2A1h141y2kat4Y1g4E5513ar87B55hZ11o16alZ1641e31D1a21eV1kc33","S2f7Y43474I14mN497j2D2ikP1p4T1313oP1jjC24f125721L4m8G19mO46433d4C2jeU1u3M13y1U1clA24d2248M4n8K18oL4a222c4A2n","6Y1C12P2Y13sX1534ax522j6N15gI56624W1s4X132R315V14tV13473K5f3T12f22H528w2s3W1y4S222~171J522W222J581~12352G212","A412C24254y212L522X213P5Z186F212F412E277Z1P531Y215H32g1N1~12cG2I4G21121F2E1333d6G3F3G36j3D1G2K2I4C223J2h3i52","3c6G362V257G34adh343bL214B2G4z2I2g31553efa4D377V2112cw369736c36316gH2A2G4w2M2de53c384a7Z2d2~23e82Q24s1121141","561acN2~1H4$1M2ca272345s5P22223g3$23f39M26s4441kcN2Z1J4X1P2ak1643s6M294d3x33b45R24t528321158aP2W1M4W1P21254d","d16S35495y3a448F311sg42S2V1O4U1T2lr22F38268F3412dG3vmU2P1W4L1U2puH3a311S32bH3g28uU2K1Z4I1V2w14a324I3b1C4~32y","1V2E122$423t4213V2E22W2N4U23g121R1U22915m21z512jh2T2G24T2P4R25g3V1Q23ih23y542gi3P2X13g631L2R4K2117h3Y1O22jf3","1E523ek1N2$13i513H2R413~1d42j2~1J21pcM514bC3w24pcZ132O425W1cq3x2M24ia42P59h134I2z23pcr1rF522k5meo3z2G23a2c9x","21U11~1b75b4E2z23nii7i32I533g9gjm4y2z2423c57b$11Y3c36g125x2y25kkecf32~42ifddlj3A2A2162ciz6gW2A24hmbfgg3M43fd","13fbqc4C2V2dI623623Q2C24cr8i12ee2O41efl8ta2E2O2cX6aP2F227w17lfe121H4221ea22m7B121G2P26B75P2H2D17m248e141D414","1f842m7t29F2z24d4F73a9y2F246u6m256g311E411141f371n4w1N2W111g94I782jX1M2w1321l262n2B45s2m221x1M2V1o15P713oV1K","2B13l2r123A4481i3m2D1H2W1ow8p21T1f4T1w23g292L45e442X1S17bS1uw8vT11g22M1Y1424d6W45c414Z1L1H2x1$7z1H2K1~1413a8","K41b98215y2J1F2A1X7B1F2I1A258c7122w4232223b66C2G1G2B1U7E1D2G1D257a31z44a2113975F2F1B2H1S7J1A2D1G266833e234x3","81332843766I2B1$1P1T7S1Z1A1K24a253d11dJ228cg211h4L2z1Z1S1S7V1X1x1N23h121ib4111D222c41x12Q2x1X1V1T7U1Y1x1O242","2x1c91C2ctaQ2x1X1U1W7T1Y1x1V25313241f733$11f2r241A3x1Z1R1Z7Q1Z1y1z3141t3P21$3z1Z1Q1~7N1~1z1O31b1X2277M3z1~1N","1w8M1w2z192A3863V247822~229A1~1L1z8K1~1A184Z2d75q1X156fY267z1~1J1E8G1w2y167Y2i45r1d2G172lX268w1w2E1L8D1w2v96","X2uD11I1vW26auw2D1M8D1x2rc6T2A1L2E1R25bsz2B1M8B1z2sa6Q2G1j1y12kI1O269sB2A1M8z1C2ra6O2J1F2K1P25aqG2w1M8uI2pc4","O2M1B2M1Q23doK2sL8tK2nA3O1y2N1B3mL2tK8tL2lC3N1y2N1C3kN2sK8sO2iE3M1y2M1F3hQ2qK8qR2gF3M1z2q5fI3dU2oK8nV2cJ3cbn","B2lebK3aV2nK8mW24R35j21hI11rgp3Q613iH8kQ7et1d2tdR7kF8kS7cv275y1312W7jF8dD9473C9fE8eE91c3t5B8bE8dA83t4g3t2B8b","11E8az94k6x9cC8ay95o5z9aB8bAjbB8aZd1G5aA88Ij8A88a4Zi8D88Cj8K8411W$4131A9111zb1S72Z84L47C11g575k7w3w13n114121","26x1dI44U83G4j34hO2M2U2bz191W34P8317z33eM16G3M1L36C227P2813G8818~1132332Q24X3oY33A3Z1738q7w6131d1p9X1B7pD7T1","g52125c47s1K47fO1V1z7z1B7U1C3Q2A3P1H7E1N7X1V2y2F3Q1R7A1Y7a6A1z343H137~2z189V7I1J7hab1jV2C253A3478abS7K1~737f","Q3w2Q35O8x1NcG14oNcaOcsU13TO2"].join("");const RUN_ALPHABET="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$~";let runDigits=null;const digitOf=ch=>{if(!runDigits){runDigits={};for(let i=0;i<RUN_ALPHABET.length;i++)runDigits[RUN_ALPHABET[i]]=i;}return runDigits[ch]??0;};/** Expand COAST_RUNS back into a row-major occupancy grid. */const inflateCoastGrid=()=>{const cells=new Uint8Array(GRID_COLS*GRID_ROWS);const serpentine=new Uint8Array(GRID_COLS*GRID_ROWS);let cursor=0;let write=0;let value=0;while(cursor<COAST_RUNS.length&&write<serpentine.length){let run=0;let shift=0;let digit=0;do{digit=digitOf(COAST_RUNS[cursor++]);run|=(digit&31)<<shift;shift+=5;}while(digit&32&&cursor<COAST_RUNS.length)const stop=Math.min(write+run,serpentine.length);if(value)serpentine.fill(1,write,stop);write=stop;value^=1;}// Odd rows were walked right-to-left when the runs were built.
let read=0;for(let row=0;row<GRID_ROWS;row++){const base=row*GRID_COLS;if(row&1){for(let col=GRID_COLS-1;col>=0;col--)cells[base+col]=serpentine[read++];}else{for(let col=0;col<GRID_COLS;col++)cells[base+col]=serpentine[read++];}}return cells;};/**
 * Chamfer distance transform over the grid, wrapping at the antimeridian.
 * Returns, for every cell, the approximate distance in cells to the nearest
 * cell whose occupancy differs — signed positive on land.
 */const buildProximityField=cells=>{const W=GRID_COLS;const H=GRID_ROWS;const FAR=1e6;const ORTHO=1;const DIAG=1.41421356;const sweep=target=>{const d=new Float32Array(W*H);for(let i=0;i<d.length;i++)d[i]=cells[i]===target?0:FAR;const wrapCol=c=>c<0?c+W:c>=W?c-W:c;const relax=(i,j,cost)=>{const v=d[j]+cost;if(v<d[i])d[i]=v;};for(let y=0;y<H;y++){for(let x=0;x<W;x++){const i=y*W+x;const l=y*W+wrapCol(x-1);relax(i,l,ORTHO);if(y>0){const up=(y-1)*W;relax(i,up+x,ORTHO);relax(i,up+wrapCol(x-1),DIAG);relax(i,up+wrapCol(x+1),DIAG);}}}for(let y=H-1;y>=0;y--){for(let x=W-1;x>=0;x--){const i=y*W+x;const r=y*W+wrapCol(x+1);relax(i,r,ORTHO);if(y<H-1){const dn=(y+1)*W;relax(i,dn+x,ORTHO);relax(i,dn+wrapCol(x-1),DIAG);relax(i,dn+wrapCol(x+1),DIAG);}}}return d;};// Land cells measure their distance to water and vice versa. Offsetting by
// half a cell puts the zero crossing on the shared cell boundary, so a
// bilinear read of this field describes the coastline continuously.
const toWater=sweep(0);const toLand=sweep(1);const field=new Float32Array(W*H);for(let i=0;i<field.length;i++)field[i]=cells[i]?toWater[i]-.5:.5-toLand[i];return field;};let cachedField=null;const proximityField=()=>{if(!cachedField){try{cachedField=buildProximityField(inflateCoastGrid());}catch(err){cachedField=new Float32Array(GRID_COLS*GRID_ROWS);}}return cachedField;};/**
 * Bilinear read of the proximity field. `u` runs west to east, `v` north to
 * south, both 0..1. Positive results are inland, in grid cells.
 */const inlandDepth=(u,v)=>{const field=proximityField();const fx=u*GRID_COLS-.5;const fy=v*GRID_ROWS-.5;const x0=Math.floor(fx);const y0=Math.floor(fy);const tx=fx-x0;const ty=fy-y0;const col=c=>(c%GRID_COLS+GRID_COLS)%GRID_COLS;const row=r=>r<0?0:r>=GRID_ROWS?GRID_ROWS-1:r;const xa=col(x0);const xb=col(x0+1);const ya=row(y0)*GRID_COLS;const yb=row(y0+1)*GRID_COLS;const top=field[ya+xa]*(1-tx)+field[ya+xb]*tx;const bottom=field[yb+xa]*(1-tx)+field[yb+xb]*tx;return top*(1-ty)+bottom*ty;};/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */const DEG=Math.PI/180;const TAU=Math.PI*2;const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;/**
 * Framer hands colors over as hex, rgb()/hsl() or a `var(--token, fallback)`
 * wrapper around one of those. three.js chokes on the wrapper and quietly
 * stays white, so unwrap it first and pull the alpha out by hand.
 */const readTint=input=>{const tint={rgb:new THREE.Color(16777215),alpha:1};if(typeof input!=="string"||!input.length)return tint;let text=input.trim();if(text.slice(0,4).toLowerCase()==="var("){const split=text.indexOf(",");const tail=text.lastIndexOf(")");if(split>-1&&tail>split)text=text.slice(split+1,tail).trim();}const hex=/^#([0-9a-f]{3,8})$/i.exec(text);if(hex){const body=hex[1];if(body.length===4||body.length===8){const step=body.length/4;const slice=body.slice(3*step);const raw=step===1?slice+slice:slice;tint.alpha=parseInt(raw,16)/255;}const rgbPart=body.slice(0,body.length>=6?6:3);try{tint.rgb.set("#"+rgbPart);}catch(err){/* leave white */}return tint;}const fn=/^(rgba?|hsla?)\(([^)]*)\)$/i.exec(text);if(fn){const parts=fn[2].split(/[,/\s]+/).filter(Boolean);if(parts.length>=4){const last=parts[3];const n=parseFloat(last);if(!Number.isNaN(n))tint.alpha=clamp(last.endsWith("%")?n/100:n,0,1);}}try{tint.rgb.set(text);}catch(err){const embedded=/#[0-9a-f]{6}/i.exec(text);if(embedded){try{tint.rgb.set(embedded[0]);}catch(err2){/* leave white */}}}return tint;};/** Unit vector for a latitude/longitude pair, +Y north, +Z at 0 degrees. */const unitFromGeo=(latDeg,lngDeg,out)=>{const lat=latDeg*DEG;const lng=lngDeg*DEG;const band=Math.cos(lat);const v=out||new THREE.Vector3;return v.set(Math.sin(lng)*band,Math.sin(lat),Math.cos(lng)*band);};/** Deterministic stream so a given density always produces the same field. */const makeRandom=seed=>{let state=seed>>>0||1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;state>>>=0;return state/4294967296;};};/**
 * Lay dots over the land using rings of constant colatitude. Ring spacing and
 * the number of dots per ring both track the target spacing, so cells stay
 * close to square and the field reads as even scatter rather than a pattern.
 * Each dot is jittered inside its own cell and kept only if the bilinear
 * coastline field says it landed ashore.
 */const scatterLandDots=targetDots=>{// Fraction of the sphere's *area* that is land. The grid's cell count
// says 0.336, but equirectangular cells over-weight the poles; by area
// it is ~0.292, which is what makes the requested dot count come out.
const landShare=.292;const sphereDots=Math.max(64,Math.round(targetDots/landShare));const spacing=Math.sqrt(4*Math.PI/sphereDots);const rings=Math.max(3,Math.round(Math.PI/spacing));const random=makeRandom(2654435769^sphereDots);const coords=[];const seeds=[];const coastal=[];const COAST_CELLS=6;for(let ring=0;ring<rings;ring++){const theta=Math.PI*(ring+.5)/rings;const band=Math.sin(theta);const perRing=Math.max(1,Math.round(TAU*band/spacing));const phase=random()*TAU;const dTheta=Math.PI/rings;const dPhi=TAU/perRing;for(let step=0;step<perRing;step++){const t=theta+(random()-.5)*dTheta*.85;const p=phase+(step+(random()-.5)*.85)*dPhi;const sinT=Math.sin(t);const x=sinT*Math.sin(p);const y=Math.cos(t);const z=sinT*Math.cos(p);const u=.5+Math.atan2(x,z)/TAU;const v=clamp(.5-Math.asin(clamp(y,-1,1))/Math.PI,0,1);const depth=inlandDepth(u-Math.floor(u),v);if(depth<=0)continue;coords.push(x,y,z);seeds.push(random()*512);coastal.push(clamp(depth/COAST_CELLS,0,1));}}return{position:new Float32Array(coords),seed:new Float32Array(seeds),coast:new Float32Array(coastal),count:seeds.length};};

const FIELD_VERTEX=`
attribute float aSeed;
attribute float aCoast;

uniform float uTime;
uniform float uProgress;
uniform float uFormation;
uniform vec3  uSweepAxis;

uniform float uDotSize;
uniform float uSizeJitter;
uniform float uCoastLift;
uniform float uBackFade;

uniform float uCursorMode;
uniform vec3  uCursor;
uniform float uCursorGain;
uniform float uReach;
uniform float uWaveLength;
uniform float uWaveSpeed;
uniform float uCrest;
uniform float uSwell;
uniform float uGlow;
uniform vec3  uDrift;

varying float vHeat;
varying float vFade;
varying float vGrain;
varying float vPx;

float noise1(float s) {
    return fract(sin(s * 78.233 + 12.9898) * 43758.5453);
}

void main() {
    vec3 nrm = normalize(position);
    float rA = noise1(aSeed);
    float rB = noise1(aSeed + 4.77);
    float rC = noise1(aSeed + 9.13);

    // ---- entrance -------------------------------------------------
    // Every mode resolves to a radius, a lateral spread that closes as the
    // dot settles, and a birth fade, so they share one composition step.
    float radius = 1.0;
    float spread = 0.0;
    float born = 1.0;

    if (uFormation < 0.5) {
        // Sweep: a terminator crosses the sphere and the surface rises
        // behind it with a small overshoot.
        float key = 0.5 - 0.5 * dot(nrm, uSweepAxis);
        float t = clamp((uProgress - key * 0.72) / 0.28, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - t, 3.0);
        radius = mix(0.82, 1.0, e) + sin(e * 3.14159) * 0.045;
        born = smoothstep(0.0, 0.35, t);
    } else if (uFormation < 1.5) {
        // Bloom: the shell grows out of the core.
        float t = clamp((uProgress - rA * 0.32) / 0.68, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - t, 4.0);
        radius = e;
        born = smoothstep(0.0, 0.22, t);
    } else if (uFormation < 2.5) {
        // Fall: dots converge from a loose cloud outside the sphere.
        float t = clamp((uProgress - rA * 0.4) / 0.6, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - t, 3.0);
        radius = mix(2.05, 1.0, e);
        spread = 0.85 * (1.0 - e);
        born = smoothstep(0.0, 0.2, t);
    } else if (uFormation < 3.5) {
        // Drift: the same arrival, restaged forever on a per-dot cycle.
        float cyc = fract(uTime * 0.055 + rA * 13.0);
        float arrive = 0.22;
        if (cyc < arrive) {
            float t = cyc / arrive;
            float e = 1.0 - pow(1.0 - t, 3.0);
            radius = mix(1.85, 1.0, e);
            spread = 0.75 * (1.0 - e);
            born = smoothstep(0.0, 0.3, t);
        } else {
            born = 1.0 - smoothstep(0.90, 1.0, cyc);
        }
        born *= smoothstep(0.0, 0.18, uProgress);
    } else {
        born = uProgress;
    }

    vec3 wander = normalize(vec3(rA, rB, rC) - 0.5);
    vec3 pos = normalize(nrm + wander * spread) * radius;

    // ---- cursor ---------------------------------------------------
    float heat = 0.0;
    float swell = 1.0;

    if (uCursorMode < 2.5 && uCursorGain > 0.002) {
        float ang = acos(clamp(dot(nrm, uCursor), -1.0, 1.0));
        float env = 1.0 - smoothstep(0.0, uReach, ang);
        env *= env;
        float amp = env * uCursorGain;

        if (uCursorMode < 0.5) {
            // Sonar: wavefronts leave the contact point and run outward
            // along the surface, lifting the shell as each crest passes.
            float wave = sin(
                ang / max(uWaveLength, 0.02) * 6.2831853
                - uTime * uWaveSpeed * 6.2831853
            );
            pos += nrm * wave * amp * uCrest;
            heat = max(0.0, wave) * amp;
            swell = 1.0 + max(0.0, wave) * amp * uSwell;
        } else if (uCursorMode < 1.5) {
            // Halo: light only, no displacement.
            float breathe = 0.78 + 0.22 * sin(uTime * 1.7);
            heat = amp * breathe;
            swell = 1.0 + heat * uSwell * 0.6;
        } else {
            // Wake: the surface is combed along the pointer's travel.
            vec3 tangent = uDrift - dot(uDrift, nrm) * nrm;
            pos += tangent * amp * uCrest * 8.0;
            heat = amp * clamp(length(uDrift) * 24.0, 0.0, 1.0);
            swell = 1.0 + heat * uSwell * 0.5;
        }
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // View-space normal for soft directional lighting
    vec3 worldNormal = normalize(normalMatrix * nrm);
    vec3 viewLightDir = normalize(vec3(-0.35, 0.65, 0.65));
    float lit = clamp(dot(worldNormal, viewLightDir), 0.0, 1.0);
    float litScale = 0.72 + 0.38 * lit;

    // Coastal dots read slightly bolder, deep interior balanced
    float shore = mix(1.0 + uCoastLift * 0.75, 1.0 - uCoastLift * 0.25, aCoast);
    float jitter = 1.0 + (rB - 0.5) * 1.5 * uSizeJitter;
    float breath = 0.92 + 0.08 * sin(uTime * 1.8 + rA * 21.0);

    // Keep dots clearly visible across the entire visible hemisphere including the top side.
    // Attenuate safely by distance while strictly clamping to prevent near-plane runaway point sizes.
    float distAtten = clamp(2.5 / max(1.2, -mv.z), 0.7, 1.35);
    gl_PointSize = clamp(
        uDotSize * jitter * shore * min(swell, 1.25) * breath * litScale * distAtten,
        0.8,
        uDotSize * 1.45
    );
    vPx = gl_PointSize;

    // Smooth limb fade without cutting off the top side
    float facing = worldNormal.z;
    vFade = mix(uBackFade, 1.0, smoothstep(-0.25, 0.15, facing)) * born;
    vHeat = clamp(heat * uGlow, 0.0, 1.0);
    vGrain = 0.65 + 0.35 * rC;
}
`;const FIELD_FRAGMENT=`
uniform vec3  uInk;
uniform float uInkAlpha;
uniform vec3  uTint;

varying float vHeat;
varying float vFade;
varying float vGrain;
varying float vPx;

void main() {
    // Round dot with a one-pixel edge regardless of how large it is on screen.
    float r = length(gl_PointCoord - vec2(0.5));
    float edge = 1.2 / max(vPx, 1.0);
    float disc = 1.0 - smoothstep(0.5 - edge, 0.5, r);
    if (disc <= 0.0) discard;

    vec3 rgb = mix(uInk, uTint, vHeat);
    float a = disc * uInkAlpha * vGrain * vFade * (1.0 + vHeat * 0.85);
    gl_FragColor = vec4(rgb, clamp(a, 0.0, 1.0));
}
`;

const CAMERA_FOV = 32;
const CAMERA_Z = 3.5;
const SWEEP_AXIS = new THREE.Vector3(-0.78, 0.46, 0.42).normalize();
const CURSOR_MODE_INDEX: Record<string, number> = { sonar: 0, halo: 1, wake: 2, off: 3 };
const FORMATION_INDEX: Record<string, number> = { sweep: 0, bloom: 1, fall: 2, drift: 3, instant: 4 };

interface GlobeConfig {
  ink: string;
  tint: string;
  backFade: number;
  dotSize: number;
  sizeJitter: number;
  coastLift: number;
  dotTarget: number;
  spin: number;
  tilt: number;
  startLng: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  allowTiltDrag: boolean;
  tiltRange: number;
  formation: 'sweep' | 'bloom' | 'fall' | 'drift' | 'instant';
  entranceSeconds: number;
  replayOnScroll: boolean;
  cursorMode: 'sonar' | 'halo' | 'wake' | 'off';
  reach: number;
  waveLength: number;
  waveSpeed: number;
  crest: number;
  swell: number;
  glow: number;
  cursorDelay: number;
  quality: 'auto' | 'high' | 'low';
  isMini?: boolean;
  onBackdropPress?: () => void;
}

const resolveTier = (quality: string) => {
  if (quality === 'high') return 2;
  if (quality === 'low') return 0;
  if (typeof navigator === 'undefined') return 2;
  const nav = navigator;
  const cores = nav.hardwareConcurrency || 8;
  const memory = (nav as any).deviceMemory || 8;
  const handheld = /Mobi|Android|iPhone|iPad|iPod/i.test(nav.userAgent || '');
  return handheld || cores <= 4 || memory <= 4 ? 0 : 2;
};

class GlobeRuntime {
  host: HTMLElement;
  cfg: GlobeConfig;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  pivot: THREE.Group;
  field: THREE.Points | null = null;
  fieldMaterial: THREE.ShaderMaterial;
  fieldUniforms: any;
  tier: number = 2;
  width: number = 1;
  height: number = 1;
  progress: number = 0;
  elapsed: number = 0;
  spinAngle: number = 0;
  tiltAngle: number = 0;
  scale: number = 1;
  flingX: number = 0;
  dragging: boolean = false;
  dragFrom = { x: 0, y: 0 };
  pointerInside: boolean = false;
  pointerUV = { x: -1, y: -1 };
  hoverSince: number = 0;
  cursorGain: number = 0;
  contactLocal = new THREE.Vector3(0, 0, 1);
  lastWorldHit: THREE.Vector3 | null = null;
  drift = new THREE.Vector3();
  visible: boolean = true;
  raf: number | null = null;
  last: number | null = null;
  ray = new THREE.Raycaster();
  ndc = new THREE.Vector2();
  localRay = new THREE.Ray();
  unitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
  inverse = new THREE.Matrix4();
  hit = new THREE.Vector3();
  scratchA = new THREE.Vector3();
  scratchB = new THREE.Vector3();
  scratchQ = new THREE.Quaternion();
  resizeWatcher: ResizeObserver | null = null;
  viewWatcher: IntersectionObserver | null = null;

  constructor(host: HTMLElement, cfg: GlobeConfig) {
    this.host = host;
    this.cfg = cfg;
    this.tier = resolveTier(cfg.quality);
    this.measure();

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: this.tier > 0,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier > 0 ? 2 : 1.5));
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    host.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, this.width / this.height, 0.1, 80);
    this.camera.position.z = CAMERA_Z;

    this.pivot = new THREE.Group();
    this.pivot.rotation.order = 'XYZ';
    this.scene.add(this.pivot);

    this.fieldUniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uFormation: { value: 0 },
      uSweepAxis: { value: SWEEP_AXIS.clone() },
      uDotSize: { value: 5.5 },
      uSizeJitter: { value: 0.6 },
      uCoastLift: { value: 0.4 },
      uBackFade: { value: 0.12 },
      uCursorMode: { value: 0 },
      uCursor: { value: new THREE.Vector3(0, 0, 1) },
      uCursorGain: { value: 0 },
      uReach: { value: 0.5 },
      uWaveLength: { value: 0.22 },
      uWaveSpeed: { value: 0.55 },
      uCrest: { value: 0.035 },
      uSwell: { value: 1.2 },
      uGlow: { value: 1 },
      uDrift: { value: new THREE.Vector3() },
      uInk: { value: new THREE.Color('#0A0A0A') },
      uInkAlpha: { value: 1.0 },
      uTint: { value: new THREE.Color('#2DD4BF') },
    };

    this.fieldMaterial = new THREE.ShaderMaterial({
      uniforms: this.fieldUniforms,
      vertexShader: FIELD_VERTEX,
      fragmentShader: FIELD_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.spinAngle = -(cfg.startLng || 115) * DEG;
    this.tiltAngle = (cfg.tilt || 18) * DEG;
    this.pivot.rotation.set(this.tiltAngle, this.spinAngle, 0);

    this.bindPointer();

    this.resizeWatcher = new ResizeObserver(() => this.resize());
    this.resizeWatcher.observe(host);

    this.viewWatcher = new IntersectionObserver((entries) => {
      const seen = entries[0]?.isIntersecting ?? false;
      if (this.cfg.replayOnScroll && seen !== this.visible) {
        this.progress = 0;
        this.elapsed = 0;
      }
      this.visible = seen;
    });
    this.viewWatcher.observe(host);

    this.apply(cfg);
    this.buildField();
    this.raf = requestAnimationFrame(this.tick);
  }

  apply(cfg: GlobeConfig) {
    const prev = this.cfg;
    this.cfg = cfg;
    const u = this.fieldUniforms;
    const ink = readTint(cfg.ink);
    u.uInk.value.copy(ink.rgb);
    u.uInkAlpha.value = ink.alpha;
    u.uTint.value.copy(readTint(cfg.tint).rgb);
    u.uBackFade.value = clamp(cfg.backFade, 0, 1);
    u.uDotSize.value = cfg.dotSize;
    u.uSizeJitter.value = clamp(cfg.sizeJitter, 0, 1);
    u.uCoastLift.value = clamp(cfg.coastLift, 0, 1);
    u.uFormation.value = FORMATION_INDEX[cfg.formation] ?? 0;
    u.uCursorMode.value = CURSOR_MODE_INDEX[cfg.cursorMode] ?? 3;
    u.uReach.value = Math.max(0.05, cfg.reach);
    u.uWaveLength.value = Math.max(0.02, cfg.waveLength);
    u.uWaveSpeed.value = cfg.waveSpeed;
    u.uCrest.value = cfg.crest;
    u.uSwell.value = cfg.swell;
    u.uGlow.value = cfg.glow;

    if (prev && prev.startLng !== cfg.startLng) {
      this.spinAngle = -(cfg.startLng || 0) * DEG;
    }
  }

  replayEntrance() {
    this.progress = 0;
    this.elapsed = 0;
  }

  buildField() {
    this.disposeField();
    const budget = this.cfg.quality === 'low' ? 0.6 : 1.0;
    const data = scatterLandDots(Math.max(600, Math.round(this.cfg.dotTarget * budget)));
    if (!data.count) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.position, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 1));
    geo.setAttribute('aCoast', new THREE.BufferAttribute(data.coast, 1));
    geo.setDrawRange(0, data.count);

    this.field = new THREE.Points(geo, this.fieldMaterial);
    this.field.frustumCulled = false;
    this.field.renderOrder = 1;
    this.pivot.add(this.field);
  }

  measure() {
    this.width = Math.max(300, this.host.clientWidth || 300);
    this.height = Math.max(300, this.host.clientHeight || 300);
  }

  fitScale() {
    const viewH = 2 * Math.tan((CAMERA_FOV * DEG) / 2) * CAMERA_Z;
    const viewW = viewH * (this.width / this.height);
    if (this.cfg.isMini) {
      // Mini mode: fit entire globe sphere cleanly within container
      return (Math.min(viewH, viewW) / 2.25) * (this.cfg.zoom ?? 1);
    }
    // Hero mode: sphere should be clearly globe-shaped (visible curvature),
    // with the top crest rising up to just touch the CTA buttons.
    // Use ~45% of viewport height as the sphere diameter so it reads as a globe
    // rather than a flat wall of dots.
    const targetRadius = (viewH * 0.48) * (this.cfg.zoom ?? 1);
    return targetRadius;
  }

  resize() {
    this.measure();
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    if (!this.visible) this.renderOnce();
  }

  renderOnce() {
    this.renderer.render(this.scene, this.camera);
  }

  trackCursor(dt: number) {
    const cfg = this.cfg;
    const live = cfg.cursorMode !== 'off' && this.pointerInside && performance.now() - this.hoverSince >= (cfg.cursorDelay || 0) * 1e3;
    let want = 0;

    if (live) {
      this.ndc.set(this.pointerUV.x * 2 - 1, -(this.pointerUV.y * 2) + 1);
      this.ray.setFromCamera(this.ndc, this.camera);
      this.inverse.copy(this.pivot.matrixWorld).invert();
      this.localRay.copy(this.ray.ray).applyMatrix4(this.inverse);

      if (this.localRay.intersectSphere(this.unitSphere, this.hit)) {
        want = 1;
        this.contactLocal.copy(this.hit).normalize();

        this.scratchA.copy(this.contactLocal).applyMatrix4(this.pivot.matrixWorld);
        if (this.lastWorldHit) {
          this.scratchB.copy(this.scratchA).sub(this.lastWorldHit);
          this.pivot.getWorldQuaternion(this.scratchQ).invert();
          this.scratchB.applyQuaternion(this.scratchQ).divideScalar(Math.max(0.001, this.scale));
        } else {
          this.scratchB.set(0, 0, 0);
          this.lastWorldHit = new THREE.Vector3();
        }
        this.lastWorldHit.copy(this.scratchA);
        this.drift.lerp(this.scratchB, 0.3);
      } else {
        this.lastWorldHit = null;
      }
    } else {
      this.lastWorldHit = null;
      this.drift.multiplyScalar(Math.pow(0.001, dt));
    }

    this.cursorGain += (want - this.cursorGain) * (1 - Math.pow(0.02, dt));
    this.fieldUniforms.uCursorGain.value = this.cursorGain;
    if (this.cursorGain > 0.004) {
      this.fieldUniforms.uCursor.value.copy(this.contactLocal);
    }
    this.fieldUniforms.uDrift.value.copy(this.drift);
  }

  bindPointer() {
    this.host.addEventListener('pointerdown', this.onDown);
    this.host.addEventListener('pointerleave', this.onLeave);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
  }

  onDown = (event: PointerEvent) => {
    this.dragging = true;
    this.flingX = 0;
    this.dragFrom.x = event.clientX;
    this.dragFrom.y = event.clientY;
    this.cfg.onBackdropPress?.();
  };

  onMove = (event: PointerEvent) => {
    const box = this.host.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return;
    this.pointerUV.x = (event.clientX - box.left) / box.width;
    this.pointerUV.y = (event.clientY - box.top) / box.height;
    const within = this.pointerUV.x >= 0 && this.pointerUV.x <= 1 && this.pointerUV.y >= 0 && this.pointerUV.y <= 1;
    if (within && !this.pointerInside) this.hoverSince = performance.now();
    this.pointerInside = within;

    if (!this.dragging) return;
    const zoomed = box.width / this.width || 1;
    const dx = (event.clientX - this.dragFrom.x) / zoomed;
    const dy = (event.clientY - this.dragFrom.y) / zoomed;
    this.dragFrom.x = event.clientX;
    this.dragFrom.y = event.clientY;

    const GAIN = 0.0075;
    this.flingX = dx * GAIN;
    this.spinAngle += this.flingX;

    if (this.cfg.allowTiltDrag) {
      const limit = (this.cfg.tiltRange ?? 70) * DEG;
      this.tiltAngle = clamp(this.tiltAngle + dy * GAIN, -limit, limit);
    }
  };

  onUp = () => {
    this.dragging = false;
  };

  onLeave = () => {
    if (this.dragging) return;
    this.pointerInside = false;
    this.lastWorldHit = null;
  };

  tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.visible) return;

    const now = performance.now();
    const dt = this.last === null ? 1 / 60 : Math.min(0.1, (now - this.last) / 1e3);
    this.last = now;

    const frames = dt * 60;
    const ease = (k: number) => 1 - Math.pow(1 - k, frames);
    const clock = now / 1e3;
    const cfg = this.cfg;

    if (this.progress < 1) {
      this.elapsed += dt;
      this.progress = clamp(this.elapsed / Math.max(0.016, cfg.entranceSeconds || 0.016), 0, 1);
    }

    this.fieldUniforms.uTime.value = clock;
    this.fieldUniforms.uProgress.value = this.progress;

    if (!this.dragging) {
      this.spinAngle += (cfg.spin * 0.016 + (1 - this.progress) * 0.014) * frames;
      this.spinAngle += this.flingX * frames;
      this.flingX *= Math.pow(0.94, frames);
      this.tiltAngle += (cfg.tilt * DEG - this.tiltAngle) * ease(0.055);
    }

    const wanted = this.fitScale() * (0.88 + 0.12 * this.progress);
    this.scale += (wanted - this.scale) * ease(0.08);

    const viewH = 2 * Math.tan((CAMERA_FOV * DEG) / 2) * CAMERA_Z;
    let yPos = 0;
    const xPos = this.cfg.offsetX || 0;

    if (this.cfg.isMini) {
      yPos = this.cfg.offsetY || 0;
    } else {
      // Position the globe so its top crest rises up to just touch the CTA area.
      // Place the sphere center below the viewport center so the top arc is visible
      // curving gracefully beneath the text.
      const crestY = -(viewH * 0.08) + (this.cfg.offsetY || 0);
      yPos = crestY;
    }

    this.pivot.scale.setScalar(this.scale);
    this.pivot.position.set(xPos, yPos, 0);
    this.pivot.rotation.y += (this.spinAngle - this.pivot.rotation.y) * ease(0.1);
    this.pivot.rotation.x += (this.tiltAngle - this.pivot.rotation.x) * ease(0.1);

    this.trackCursor(dt);
    this.renderer.render(this.scene, this.camera);
  };

  disposeField() {
    if (!this.field) return;
    this.pivot.remove(this.field);
    this.field.geometry.dispose();
    this.field = null;
  }

  dispose() {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.resizeWatcher?.disconnect();
    this.viewWatcher?.disconnect();
    this.host.removeEventListener('pointerdown', this.onDown);
    this.host.removeEventListener('pointerleave', this.onLeave);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.disposeField();
    this.fieldMaterial.dispose();
    this.scene.clear();
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    const canvas = this.renderer.domElement;
    if (canvas.parentNode === this.host) {
      this.host.removeChild(canvas);
    }
  }
}

export interface AtomicGlobeProps {
  className?: string;
  scrollProgress?: number;
  style?: React.CSSProperties;
  isMini?: boolean;
  dotSize?: number;
  dotTarget?: number;
  coastLift?: number;
  sizeJitter?: number;
  zoom?: number;
  spin?: number;
  tilt?: number;
  startLng?: number;
  offsetX?: number;
  offsetY?: number;
  interactive?: boolean;
}

export const AtomicGlobe: React.FC<AtomicGlobeProps> = ({
  className,
  scrollProgress = 0,
  style,
  isMini = false,
  dotSize,
  dotTarget,
  coastLift = 0.32,
  sizeJitter = 0.22,
  zoom = 1.0,
  spin = 0.045,
  tilt,
  startLng = 52,
  offsetX = 0,
  offsetY,
  interactive = true,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<GlobeRuntime | null>(null);

  const effectiveDotSize = dotSize ?? (isMini ? 3.0 : 5.2);
  const effectiveDotTarget = dotTarget ?? (isMini ? 24000 : 240000);
  const effectiveTilt = tilt ?? (isMini ? 20 : 32);
  const effectiveOffsetY = offsetY ?? 0;

  const prevDotTargetRef = useRef(effectiveDotTarget);

  const [prefersCalm, setPrefersCalm] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersCalm(query.matches);
    sync();
    query.addEventListener?.('change', sync);
    return () => query.removeEventListener?.('change', sync);
  }, []);

  const config = useMemo<GlobeConfig>(() => ({
    ink: '#0A0A0A',
    tint: '#0A0A0A',
    backFade: isMini ? 0.08 : 0.04,
    dotSize: effectiveDotSize,
    sizeJitter,
    coastLift,
    dotTarget: effectiveDotTarget,
    spin: prefersCalm ? 0 : spin,
    tilt: effectiveTilt,
    startLng,
    zoom,
    offsetX,
    offsetY: effectiveOffsetY,
    allowTiltDrag: interactive && !isMini,
    tiltRange: 70,
    formation: prefersCalm || isMini ? 'instant' : 'sweep',
    entranceSeconds: prefersCalm || isMini ? 0.3 : 2.2,
    replayOnScroll: !prefersCalm && !isMini,
    cursorMode: prefersCalm || isMini ? 'off' : 'sonar',
    reach: 0.52,
    waveLength: 0.22,
    waveSpeed: prefersCalm ? 0 : 0.55,
    crest: 0.035,
    swell: 0.25,
    glow: 1,
    cursorDelay: 0,
    quality: isMini ? 'low' : 'high',
    isMini,
  }), [
    effectiveDotSize,
    effectiveDotTarget,
    coastLift,
    sizeJitter,
    zoom,
    spin,
    effectiveTilt,
    startLng,
    offsetX,
    effectiveOffsetY,
    prefersCalm,
    isMini,
    interactive,
  ]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let runtime: GlobeRuntime | null = null;
    try {
      runtime = new GlobeRuntime(host, config);
    } catch (err) {
      return;
    }
    runtimeRef.current = runtime;

    return () => {
      runtimeRef.current = null;
      runtime?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!runtimeRef.current) return;
    runtimeRef.current.apply(config);
    if (prevDotTargetRef.current !== config.dotTarget) {
      prevDotTargetRef.current = config.dotTarget;
      runtimeRef.current.buildField();
    }
  }, [config]);

  // Fade out slightly when scrolled down
  const opacity = Math.max(0, 1 - scrollProgress * 1.5);

  return (
    <div
      className={cn('relative w-full h-full select-none overflow-hidden', className)}
      style={{
        opacity,
        transition: 'opacity 0.2s ease-out',
        ...style,
      }}
    >
      <div
        ref={hostRef}
        className="absolute inset-0 z-10 touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
