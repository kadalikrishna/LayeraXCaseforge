declare module "@jscad/stl-deserializer" {
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";
  export function deserialize(options: { filename?: string; output: "geometry" }, input: string | ArrayBuffer): Geom3[];
}
