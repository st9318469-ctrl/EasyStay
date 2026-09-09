const LOCAL_API_URL = "http://localhost:5000";

// Keep one source of truth for local and deployed builds. Vite injects the
// configured URL at build time; localhost is only the development fallback.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || LOCAL_API_URL).replace(/\/+$/, "");
