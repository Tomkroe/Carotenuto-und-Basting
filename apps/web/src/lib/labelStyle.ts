import type { CSSProperties } from "react";

export function labelStyle(farbe: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, ${farbe} 18%, white)`,
    color: `color-mix(in srgb, ${farbe} 65%, black)`,
  };
}
