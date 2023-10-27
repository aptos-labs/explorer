// vite.config.ts
import { defineConfig } from "file:///Users/jillxu/Documents/GitHub/explorer/node_modules/.pnpm/vite@4.3.9_@types+node@18.15.5/node_modules/vite/dist/node/index.js";
import react from "file:///Users/jillxu/Documents/GitHub/explorer/node_modules/.pnpm/@vitejs+plugin-react@4.0.0_vite@4.3.9/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgr from "file:///Users/jillxu/Documents/GitHub/explorer/node_modules/.pnpm/vite-plugin-svgr@3.2.0_vite@4.3.9/node_modules/vite-plugin-svgr/dist/index.js";
var vite_config_default = defineConfig(() => {
  return {
    build: {
      outDir: "build",
      sourcemap: true
    },
    // in addition to the default VITE_ prefix, also support REACT_APP_ prefixed environment variables for compatibility reasons with legacy create-react-app.
    envPrefix: ["VITE_", "REACT_APP_"],
    plugins: [react(), svgr()]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamlsbHh1L0RvY3VtZW50cy9HaXRIdWIvZXhwbG9yZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qaWxseHUvRG9jdW1lbnRzL0dpdEh1Yi9leHBsb3Jlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamlsbHh1L0RvY3VtZW50cy9HaXRIdWIvZXhwbG9yZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJidWlsZFwiLFxuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gaW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHQgVklURV8gcHJlZml4LCBhbHNvIHN1cHBvcnQgUkVBQ1RfQVBQXyBwcmVmaXhlZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucyB3aXRoIGxlZ2FjeSBjcmVhdGUtcmVhY3QtYXBwLlxuICAgIGVudlByZWZpeDogW1wiVklURV9cIiwgXCJSRUFDVF9BUFBfXCJdLFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCBzdmdyKCldLFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLFNBQVEsb0JBQW1CO0FBQ2xVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFFakIsSUFBTyxzQkFBUSxhQUFhLE1BQU07QUFDaEMsU0FBTztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLElBQ2I7QUFBQTtBQUFBLElBRUEsV0FBVyxDQUFDLFNBQVMsWUFBWTtBQUFBLElBQ2pDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQUEsRUFDM0I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
