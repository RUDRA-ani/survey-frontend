
const ACCESS_TOKEN_KEY = "token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setTokens(data: {
  accessToken: string;
}): void {
  setAccessToken(data.accessToken);
}

export function isTokenExpired(): boolean {
  const token = getAccessToken();

  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
