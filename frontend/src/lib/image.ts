const FALLBACK_IMAGE = "/image_289eb4.jpg";

export function getProductImageUrl(
  imagePath?: string | null
): string {
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }

  if (
    imagePath.startsWith("https://") ||
    imagePath.startsWith("http://")
  ) {
    return imagePath;
  }

  const normalizedPath = imagePath
    .replace(/^\/+/, "")
    .replace(/^storage\//, "");

  return `/storage/${normalizedPath}`;
}