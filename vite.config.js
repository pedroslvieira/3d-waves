import glsl from "vite-plugin-glsl";

export default {
  base: "/3d-gerstner-waves/",
  build: {
    sourcemap: true,
  },
  plugins: [glsl()],
};
