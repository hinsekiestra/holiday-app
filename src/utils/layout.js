export function getLayout(width, height) {
  const isLandscape = width > height;
  const isTabletLike = Math.min(width, height) >= 700;
  return { isLandscape, isTabletLike };
}
