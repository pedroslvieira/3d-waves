import glsl from "vite-plugin-glsl";

export default {
  base: "/realistic-water/",
  build: {
    sourcemap: true,
  },
  plugins: [glsl()],
};
