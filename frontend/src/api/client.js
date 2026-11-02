// In development Vite proxies /api to the backend. For a deployed frontend, set VITE_API_URL to the backend's URL.
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function send(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Please check that it's running and try again.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    // A dead session anywhere except the login/signup calls themselves sends the user back to the start.
    if (res.status === 401 && !path.startsWith("/auth/")) onUnauthorized();
    throw new ApiError(res.status, data?.error ?? "Something went wrong", data?.details);
  }
  return res;
}

const json = async (method, path, body) => (await send(method, path, body)).json();

export const api = {
  get: (path) => json("GET", path),
  post: (path, body = {}) => json("POST", path, body),
  put: (path, body) => json("PUT", path, body),
  patch: (path, body) => json("PATCH", path, body),
  del: (path) => json("DELETE", path),
  blob: async (path) => (await send("GET", path)).blob(),
};

// First field-level message if the server sent any, otherwise the general one.
export function errorMessage(err) {
  return err?.details?.[0]?.message ?? err?.message ?? "Something went wrong";
}
