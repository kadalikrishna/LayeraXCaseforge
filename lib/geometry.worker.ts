import { buildGeometry } from "./geometry-engine";
import type { GeometryRequest } from "./geometry-protocol";
self.onmessage = async (event: MessageEvent<GeometryRequest>) => {
  const result = await buildGeometry(event.data);
  const transfer: Transferable[] = [];
  if (result.positions) transfer.push(result.positions.buffer as ArrayBuffer);
  if (result.phone) transfer.push(result.phone.buffer as ArrayBuffer);
  self.postMessage(result, { transfer });
};
