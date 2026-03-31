import { createRouter, createBrowserHistory } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { RouteError } from "@/components/errors/RouteError"
import { NotFoundPage } from "@/components/errors/NotFoundPage"

// Router basepath should always be /compliance-360/ for both dev and production
// (Vite's base is different - it's for asset loading, not routing)
const basepath = "/compliance-360"

export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  basepath,
  defaultPreload: "intent",
  // Default error boundary shown when any route loader or component throws
  defaultErrorComponent: ({ error, reset }) => RouteError({ error: error as Error, reset }),
  // Shown when no route matches the current URL
  defaultNotFoundComponent: () => NotFoundPage(),
})

// Type augmentation for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
