export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-PawaVet-Request": "1" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response
    .json()
    .catch(() => ({ error: "The service returned an invalid response." }));
  if (!response.ok) {
    if (response.status === 401 && path !== "/api/auth/login")
      window.dispatchEvent(new Event("pawavet-session-expired"));
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }
  return payload as T;
}
