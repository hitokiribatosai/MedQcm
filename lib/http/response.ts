export const privateHeaders = { "Cache-Control": "private, no-store" };
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: privateHeaders });
}
export async function readJson(
  request: Request,
  maximum = 40000,
): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty request");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
// Only deliberate SQL validation messages (P0001) are safe to show; never expose SQL internals.
export function databaseMessage(error: { code?: string; message?: string }) {
  return error.code === "P0001"
    ? error.message || "Request rejected"
    : "Service unavailable. Please retry or contact support.";
}
