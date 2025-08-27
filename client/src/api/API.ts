const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:5001/api");

export default API_BASE;
