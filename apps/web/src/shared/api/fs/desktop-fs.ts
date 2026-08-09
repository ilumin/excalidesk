import type { RPCSchema } from "electrobun/view";

import type { DesktopApi, DesktopRequests } from "./types";

type DesktopRPC = { bun: RPCSchema<{ requests: DesktopRequests }>; webview: RPCSchema };

/**
 * The default is 10s, but `pickDirectory` is a modal the user drives — and it
 * blocks the bun loop, so every request behind it waits too.
 */
const MAX_REQUEST_TIME = 10 * 60 * 1000;

/**
 * The other half of the seam: every call forwards its argument tuple to the
 * matching request in the bun process.
 *
 * `electrobun/view` touches `window` at module scope, so it is imported
 * dynamically — that keeps `bun test` and the plain-browser build clear of it,
 * and leaves the code in its own chunk. Every method is already async, so
 * awaiting the module costs nothing.
 */
export function createDesktopApi(): DesktopApi {
  const ready = import("electrobun/view").then(({ Electroview }) => {
    const rpc = Electroview.defineRPC<DesktopRPC>({
      maxRequestTime: MAX_REQUEST_TIME,
      handlers: { requests: {} },
    });
    new Electroview({ rpc });
    const request = rpc.request as (method: PropertyKey, params: unknown[]) => Promise<unknown>;
    // Wrapped, not returned raw: `rpc.request` is a catch-all proxy, so resolving
    // a promise with it makes the runtime probe `.then` — and that becomes an RPC.
    return (method: PropertyKey, params: unknown[]) => request(method, params);
  });

  return new Proxy({} as DesktopApi, {
    get(_target, method) {
      // Never answer `then`: an awaited bridge would otherwise RPC into the void.
      if (typeof method !== "string" || method === "then") return undefined;
      return async (...args: unknown[]) => {
        // JSON has no `undefined`, so an omitted optional argument would arrive
        // as `null` and defeat the default parameter on the other side.
        while (args.length && args.at(-1) === undefined) args.pop();
        return (await ready)(method, args);
      };
    },
  });
}
