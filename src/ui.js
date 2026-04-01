import { Pane } from "tweakpane";
import * as THREE from "three";

export function setupUI({ waterResolution, water }) {
  const pane = new Pane();

  // Water parameters folder
  const waterFolder = pane.addFolder({ title: "Water" });

  const geometryFolder = waterFolder.addFolder({ title: "Geometry" });

  geometryFolder
    .addBinding(waterResolution, "size", {
      min: 2,
      max: 1024,
      step: 2,
      label: "Resolution",
    })
    .on("change", ({ value }) => {
      console.log(value);
      // Update geometry with new dimensions
      const newGeometry = new THREE.PlaneGeometry(
        2,
        2,
        waterResolution.size,
        waterResolution.size
      );
      water.geometry.dispose();
      water.geometry = newGeometry;
    });

  // Gerstner Waves
  const wavesFolder = waterFolder.addFolder({ title: "Waves" });
  wavesFolder.addBinding(water.material.uniforms.uWaveCount, "value", {
    min: 1,
    max: 8,
    step: 1,
    label: "Wave Count",
  });
  wavesFolder.addBinding(water.material.uniforms.uAmplitudeScale, "value", {
    min: 0,
    max: 3,
    label: "Amplitude",
  });
  wavesFolder.addBinding(water.material.uniforms.uSteepnessScale, "value", {
    min: 0,
    max: 2,
    label: "Steepness",
  });

  // Color
  const colorFolder = waterFolder.addFolder({ title: "Color" });

  colorFolder.addBinding(water.material.uniforms.uOpacity, "value", {
    min: 0,
    max: 1,
    step: 0.01,
    label: "Opacity",
  });

  colorFolder.addBinding(water.material.uniforms.uTroughColor, "value", {
    label: "Trough Color",
    view: "color",
    color: { type: "float" },
  });
  colorFolder.addBinding(water.material.uniforms.uSurfaceColor, "value", {
    label: "Surface Color",
    view: "color",
    color: { type: "float" },
  });
  colorFolder.addBinding(water.material.uniforms.uPeakColor, "value", {
    label: "Peak Color",
    view: "color",
    color: { type: "float" },
  });
  colorFolder.addBinding(water.material.uniforms.uPeakThreshold, "value", {
    min: 0,
    max: 0.5,
    label: "Peak Threshold",
  });
  colorFolder.addBinding(water.material.uniforms.uPeakTransition, "value", {
    min: 0,
    max: 0.5,
    label: "Peak Transition",
  });
  colorFolder.addBinding(water.material.uniforms.uTroughThreshold, "value", {
    min: -0.5,
    max: 0,
    label: "Trough Threshold",
  });
  colorFolder.addBinding(water.material.uniforms.uTroughTransition, "value", {
    min: 0,
    max: 0.5,
    label: "Trough Transition",
  });

  // Fresnel
  const fresnelFolder = waterFolder.addFolder({ title: "Fresnel" });
  fresnelFolder.addBinding(water.material.uniforms.uFresnelStrength, "value", {
    min: 0,
    max: 1,
    label: "Scale",
  });
  fresnelFolder.addBinding(water.material.uniforms.uFresnelPower, "value", {
    min: 0,
    max: 3,
    label: "Power",
  });


}
