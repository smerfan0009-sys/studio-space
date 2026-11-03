const OPTIMIZABLE_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "i.ibb.co",
]);

export function isOptimizableImageUrl(src?: string | null): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
