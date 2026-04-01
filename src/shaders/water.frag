precision highp float;

uniform samplerCube uEnvironmentTexture;

uniform vec3 uTroughColor;
uniform vec3 uSurfaceColor;
uniform vec3 uPeakColor;

uniform float uTroughThreshold;
uniform float uTroughTransition;
uniform float uPeakThreshold;
uniform float uPeakTransition;

uniform float uOpacity;

uniform float uFresnelStrength;
uniform float uFresnelPower;

varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 reflected = reflect(viewDirection, vNormal);

    vec3 reflectionColor = textureCube(uEnvironmentTexture, reflected).rgb;

    // fresnel power controls how fast it goes from no reflection to full reflection
    // fresnel strength controls how strong the fresnel is
    float fresnel = uFresnelStrength * pow(1.0 - clamp(dot(viewDirection, normalize(vNormal)), 0.0, 1.0), uFresnelPower);

    // calculate how much of each color we need to use to each pixel
    float trough2Surface = smoothstep(uTroughThreshold - uTroughTransition, uTroughThreshold + uTroughTransition, vWorldPosition.y);
    float surface2Peak = smoothstep(uPeakThreshold - uPeakTransition, uPeakThreshold + uPeakTransition, vWorldPosition.y);

    vec3 mixedColor1 = mix(uTroughColor, uSurfaceColor, trough2Surface);
    vec3 mixedColor2 = mix(mixedColor1, uPeakColor, surface2Peak);
    vec3 waterColor = mix(mixedColor2, reflectionColor, fresnel);

    vec3 finalColor = waterColor;

    gl_FragColor = vec4(finalColor, uOpacity);
}