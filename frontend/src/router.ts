import { createRouter, createBrowserHistory } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

// Router basepath should always be /compliance-360/ for both dev and production
// (Vite's base is different - it's for asset loading, not routing)
const basepath = "/compliance-360"

export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  basepath,
  defaultPreload: "intent",
})

// Type augmentation for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
