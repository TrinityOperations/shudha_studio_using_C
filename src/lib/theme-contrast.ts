export type ContrastPair = { foreground: string; background: string };

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) throw new Error("Expected a six-digit hex color.");
  return (
    0.2126 * channel(parseInt(value.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(value.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(value.slice(4, 6), 16))
  );
}

export function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesNormalTextContrast(pair: ContrastPair) {
  return contrastRatio(pair.foreground, pair.background) >= 4.5;
}

export function readablePrimaryColor(primary: string, hover: string) {
  if (passesNormalTextContrast({ foreground: "#ffffff", background: primary })) {
    return primary;
  }
  if (passesNormalTextContrast({ foreground: "#ffffff", background: hover })) {
    return hover;
  }
  return "#0f172a";
}
