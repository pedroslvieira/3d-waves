import * as THREE from "three";
import vertexShader from "../shaders/water.vert?raw";
import fragmentShader from "../shaders/water.frag?raw";

// Build wave parameters from physical properties.
// frequency = 2π / wavelength  (wave number k)
// phase     = sqrt(g * k)      (angular frequency ω via linear dispersion)
const G = 9.8;
function makeWave(angleDeg, wavelength, amplitude, steepness) {
  const angle = (angleDeg * Math.PI) / 180;
  const frequency = (2 * Math.PI) / wavelength;
  const phase = Math.sqrt(G * frequency);
  return {
    direction: new THREE.Vector2(Math.cos(angle), Math.sin(angle)),
    amplitude,
    steepness,
    frequency,
    phase,
  };
}

// Six waves: varied directions (degrees), wavelengths, amplitudes and steepness.
// Steepness values are chosen so Σ(Q·k·A) ≪ 1 — no self-intersection.
const WAVES = [
  makeWave(  0,  1.5, 0.025, 0.50),
  makeWave( 15,  1.0, 0.015, 0.40),
  makeWave( 30,  1.2, 0.020, 0.45),
  makeWave(-20,  0.7, 0.010, 0.30),
  makeWave( 45,  0.5, 0.008, 0.25),
  makeWave(-40,  0.8, 0.012, 0.35),
];

const MAX_WAVES = 8; // must match #define MAX_WAVES in the vertex shader

export default class Water extends THREE.Mesh {
  constructor(options) {
    super();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0.0 },
        // name matches the uniform in water.frag
        uEnvironmentTexture: { value: options.environmentMap },
        uOpacity:       { value: 0.9 },

        // Color
        uTroughColor:     { value: new THREE.Color(0.01, 0.13, 0.28) },
        uSurfaceColor:    { value: new THREE.Color(0.33, 0.69, 0.53) },
        uPeakColor:       { value: new THREE.Color(0.50, 0.69, 0.75) },
        uTroughThreshold: { value: -0.02 },
        uTroughTransition:{ value: 0.15  },
        uPeakThreshold:   { value: 0.015 },
        uPeakTransition:  { value: 0.010 },

        // Fresnel
        uFresnelStrength: { value: 0.5 },
        uFresnelPower:    { value: 1.0 },



        // Gerstner wave arrays (structure-of-arrays for GLSL compatibility)
        uWaveCount:       { value: WAVES.length },
        uWaveDirections:  { value: padArray(WAVES.map(w => w.direction),  MAX_WAVES, new THREE.Vector2()) },
        uWaveAmplitudes:  { value: padArray(WAVES.map(w => w.amplitude),  MAX_WAVES, 0) },
        uWaveSteepnesses: { value: padArray(WAVES.map(w => w.steepness),  MAX_WAVES, 0) },
        uWaveFrequencies: { value: padArray(WAVES.map(w => w.frequency),  MAX_WAVES, 0) },
        uWavePhases:      { value: padArray(WAVES.map(w => w.phase),      MAX_WAVES, 0) },

        // Global multipliers exposed to the UI
        uAmplitudeScale:  { value: 1.0 },
        uSteepnessScale:  { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    this.geometry = new THREE.PlaneGeometry(
      2,
      2,
      options.resolution,
      options.resolution
    );
    this.rotation.x = -Math.PI / 2;
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
  }
}

// Pad an array to a fixed length so Three.js uploads the full uniform array.
function padArray(arr, length, fill) {
  const out = arr.slice();
  while (out.length < length) out.push(fill);
  return out;
}
