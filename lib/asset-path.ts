const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withAssetBasePath(path?: string) {
  if (!path || path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (configuredBasePath && normalizedPath.startsWith(`${configuredBasePath}/`)) {
    return normalizedPath;
  }

  return `${configuredBasePath}${normalizedPath}`;
}

export function absoluteAssetUrl(path?: string) {
  const resolvedPath = withAssetBasePath(path);
  if (!resolvedPath || resolvedPath.startsWith("http")) {
    return resolvedPath ?? "";
  }

  if (typeof window === "undefined") {
    return resolvedPath;
  }

  return `${window.location.origin}${resolvedPath}`;
}
