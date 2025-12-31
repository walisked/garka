// Vitest setup shim to avoid missing SSR helper references injected by Vite transforms
// Some transformed modules expect __vite_ssr_exportName__ to be defined in the environment.
// Provide a no-op that returns the export name for compatibility.

globalThis.__vite_ssr_exportName__ = (target, name) => name;
