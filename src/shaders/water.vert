precision highp float;

#define MAX_WAVES 8

uniform float uTime;
uniform int   uWaveCount;

// Structure of arrays — one entry per wave
uniform vec2  uWaveDirections[MAX_WAVES];
uniform float uWaveAmplitudes[MAX_WAVES];
uniform float uWaveSteepnesses[MAX_WAVES];
uniform float uWaveFrequencies[MAX_WAVES];  // k  = 2π / wavelength
uniform float uWavePhases[MAX_WAVES];       // ω  = sqrt(g * k)

// Global multipliers (controllable from UI)
uniform float uAmplitudeScale;
uniform float uSteepnessScale;

varying vec3 vNormal;
varying vec3 vWorldPosition;

// XYZ displacement for one Gerstner wave evaluated at world-space position p.
// Reference: Water.shader → Gerstner() in the Unity repo.
vec3 gerstnerDisplacement(int i, vec3 p) {
    vec2  d = uWaveDirections[i];
    float A = uWaveAmplitudes[i]  * uAmplitudeScale;
    float Q = uWaveSteepnesses[i] * uSteepnessScale;
    float k = uWaveFrequencies[i];
    float w = uWavePhases[i];

    float proj = dot(p.xz, d) * k + uTime * w;
    float c = cos(proj);
    float s = sin(proj);

    return vec3(
        Q * A * d.x * c,   // lateral X
        A * s,             // vertical Y
        Q * A * d.y * c    // lateral Z
    );
}

// Analytical normal contribution for one wave (avoids finite-difference cost).
// Reference: Water.shader → GerstnerNormal() in the Unity repo.
vec3 gerstnerNormal(int i, vec3 p) {
    vec2  d  = uWaveDirections[i];
    float A  = uWaveAmplitudes[i]  * uAmplitudeScale;
    float Q  = uWaveSteepnesses[i] * uSteepnessScale;
    float k  = uWaveFrequencies[i];
    float w  = uWavePhases[i];
    float ka = k * A;

    float proj = dot(p.xz, d) * k + uTime * w;
    float c = cos(proj);
    float s = sin(proj);

    return vec3(
        d.x * ka * c,
        Q   * ka * s,
        d.y * ka * c
    );
}

void main() {
    // Start in world space so wave coords align with the visible plane extent.
    vec4 worldPos = modelMatrix * vec4(position, 1.0);

    vec3 displacement = vec3(0.0);
    vec3 normalSum    = vec3(0.0);

    for (int i = 0; i < MAX_WAVES; i++) {
        if (i >= uWaveCount) break;
        // Both functions use the original (un-displaced) world position,
        // matching the reference implementation.
        displacement += gerstnerDisplacement(i, worldPos.xyz);
        normalSum    += gerstnerNormal(i,       worldPos.xyz);
    }

    worldPos.xyz += displacement;

    // Assemble world-space normal from accumulated perturbation.
    // When normalSum == 0 the result is (0,1,0) — perfectly flat.
    vNormal = normalize(vec3(-normalSum.x, 1.0 - normalSum.y, -normalSum.z));

    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
