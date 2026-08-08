import { RouterProvider, createHashHistory, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

// The packaged shell loads `views://mainview/index.html`, so path routing 404s.
// Hash history is scheme-agnostic; http(s) keeps clean URLs.
const packaged = !location.protocol.startsWith("http");

const router = createRouter({
  routeTree,
  history: packaged ? createHashHistory() : undefined,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <Loader />,
  context: {},
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
