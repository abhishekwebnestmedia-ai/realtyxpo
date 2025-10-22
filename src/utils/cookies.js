// Simple cookie helpers. Note: HttpOnly cookies must be set by the server (Set-Cookie).
export function setCookie(name, value, { days = 7, path = '/', secure = true, sameSite = 'Lax' } = {}) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Expires=${expires}; Path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += '; Secure';
  // Not setting HttpOnly here because client-side JS cannot set HttpOnly cookies.
  document.cookie = cookie;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + encodeURIComponent(name) + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function deleteCookie(name, { path = '/' } = {}) {
  document.cookie = `${encodeURIComponent(name)}=; Expires=${new Date(0).toUTCString()}; Path=${path};`;
}
