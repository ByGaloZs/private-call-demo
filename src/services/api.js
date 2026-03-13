const BASE_HEADERS = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      ...BASE_HEADERS,
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export const api = {
  login: ({ username, password }) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request("/api/logout", {
      method: "POST",
    }),

  me: () => request("/api/me"),

  getDemoConfig: () => request("/api/demo-config"),

  callDemo: (payload) =>
    request("/api/call-demo", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
