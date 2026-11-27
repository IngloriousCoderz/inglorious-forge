declare module "@/*"
declare module "*.its"

declare function v<Coordinates extends number[]>(
  ...coords: Coordinates
): import("@inglorious/utils/vector.js").Vector<Coordinates>
