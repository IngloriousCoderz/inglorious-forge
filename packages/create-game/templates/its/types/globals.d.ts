declare module "@inglorious/engine/*"
declare module "@inglorious/renderer-2d/*"
declare module "@/*"
declare module "*.its"

declare function v<Coordinates extends number[]>(
  ...coords: Coordinates
): import("@inglorious/utils/vector.js").Vector<Coordinates>
