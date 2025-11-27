import { createRequestHandler, RouterContextProvider } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    // Use Object.assign to preserve existing context access pattern
    Object.assign(context, {
      cloudflare: { env, ctx },
    });
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
