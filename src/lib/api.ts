export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-PawaVet-Request": "1" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      503,
      "The clinic service is unavailable. Please try again.",
    );
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      path !== "/auth/unlock"
    )
      window.dispatchEvent(new Event("pawavet:session-expired"));
    if (response.status === 423)
      window.dispatchEvent(new Event("pawavet:session-locked"));
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String(data.error)
        : "Request failed.";
    throw new ApiError(response.status, message);
  }
  return data as T;
}
