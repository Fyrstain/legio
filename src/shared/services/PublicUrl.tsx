const absoluteUrlPattern = /^[a-z][a-z\d+\-.]*:\/\//i;

function ensureLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export const getPublicPath = (): string => {
  const publicUrl = process.env.PUBLIC_URL?.trim();

  if (!publicUrl || publicUrl === ".") {
    return "";
  }

  return publicUrl.endsWith("/")
    ? publicUrl.slice(0, -1)
    : publicUrl;
};

export const toPublicUrl = (path = ""): string => {
  if (absoluteUrlPattern.test(path)) {
    return path;
  }

  const publicPath = getPublicPath();

  if (!path) {
    return publicPath || "/";
  }

  const normalizedPath = ensureLeadingSlash(path);

  return `${publicPath}${normalizedPath}`;
};

export const toAbsolutePublicUrl = (path = ""): string => {
  if (absoluteUrlPattern.test(path)) {
    return path;
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost";

  return new URL(toPublicUrl(path), origin).toString();
};

export const getCurrentPublicUrl = (): string => {
  if (typeof window === "undefined") {
    return toAbsolutePublicUrl("/");
  }

  const currentUrl = new URL(window.location.href);
  const publicPath = getPublicPath();

  if (
    publicPath &&
    currentUrl.pathname !== publicPath &&
    !currentUrl.pathname.startsWith(`${publicPath}/`)
  ) {
    currentUrl.pathname = `${publicPath}${ensureLeadingSlash(
      currentUrl.pathname,
    )}`;
  }

  return currentUrl.toString();
};

export const toAppPathname = (path: string): string => {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost";

  let pathname: string;

  try {
    pathname = new URL(path, origin).pathname;
  } catch {
    pathname = ensureLeadingSlash(path);
  }

  const publicPath = getPublicPath();

  if (
    publicPath &&
    (pathname === publicPath || pathname.startsWith(`${publicPath}/`))
  ) {
    const appPath = pathname.slice(publicPath.length);

    return appPath || "/";
  }

  return ensureLeadingSlash(pathname);
};