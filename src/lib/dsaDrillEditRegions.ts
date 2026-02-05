export type EditRegion = { start: number; end: number };

export const parseEditRegions = (code: string, markers: { start: string; end: string }[]) => {
  const regions: EditRegion[] = [];
  let searchIndex = 0;
  markers.forEach((marker) => {
    const startIdx = code.indexOf(marker.start, searchIndex);
    if (startIdx === -1) return;
    const endIdx = code.indexOf(marker.end, startIdx + marker.start.length);
    if (endIdx === -1) return;
    const regionStart = startIdx + marker.start.length;
    regions.push({ start: regionStart, end: endIdx });
    searchIndex = endIdx + marker.end.length;
  });
  return regions;
};

export const isEditAllowed = (prev: string, next: string, regions: EditRegion[]) => {
  if (prev === next) return true;
  const diffIndex = getFirstDiffIndex(prev, next);
  if (diffIndex === -1) return true;
  return regions.some((region) => diffIndex >= region.start && diffIndex <= region.end);
};

const getFirstDiffIndex = (a: string, b: string) => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : len;
};
