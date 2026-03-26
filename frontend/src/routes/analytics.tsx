import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/analytics')({
  beforeLoad: () => {
    // Permanent redirect to dashboard
    throw redirect({ to: '/dashboard', replace: true })
  }
})
