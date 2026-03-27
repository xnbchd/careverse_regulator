import { createFileRoute, redirect } from "@tanstack/react-router"

// Redirect old /inspection route to new /inspections route
export const Route = createFileRoute("/inspection")({
  beforeLoad: async ({ search }) => {
    throw redirect({
      to: "/inspections",
      search: search || { activeTab: "scheduled" },
    })
  },
})
