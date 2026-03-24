import { create } from 'zustand'
import type { User, Role, Permission, UserFilters, CreateUserPayload, UpdateUserPayload, UserRole, UserStatus } from '@/types/user'

// Mock permissions
const mockPermissions: Permission[] = [
  { id: 'insp:view', name: 'View Inspections', description: 'View inspection records', category: 'inspections' },
  { id: 'insp:create', name: 'Create Inspections', description: 'Schedule new inspections', category: 'inspections' },
  { id: 'insp:edit', name: 'Edit Inspections', description: 'Modify inspection records', category: 'inspections' },
  { id: 'insp:delete', name: 'Delete Inspections', description: 'Remove inspection records', category: 'inspections' },
  { id: 'lic:view', name: 'View Licenses', description: 'View license records', category: 'licenses' },
  { id: 'lic:approve', name: 'Approve Licenses', description: 'Approve license applications', category: 'licenses' },
  { id: 'lic:reject', name: 'Reject Licenses', description: 'Reject license applications', category: 'licenses' },
  { id: 'aff:view', name: 'View Affiliations', description: 'View professional affiliations', category: 'affiliations' },
  { id: 'aff:approve', name: 'Approve Affiliations', description: 'Approve affiliation requests', category: 'affiliations' },
  { id: 'users:view', name: 'View Users', description: 'View user accounts', category: 'users' },
  { id: 'users:create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
  { id: 'users:edit', name: 'Edit Users', description: 'Modify user accounts', category: 'users' },
  { id: 'settings:view', name: 'View Settings', description: 'View system settings', category: 'settings' },
  { id: 'settings:edit', name: 'Edit Settings', description: 'Modify system settings', category: 'settings' },
  { id: 'reports:view', name: 'View Reports', description: 'Access analytics and reports', category: 'reports' },
  { id: 'reports:export', name: 'Export Reports', description: 'Export report data', category: 'reports' },
]

// Mock roles
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: mockPermissions.map(p => p.id),
    userCount: 2,
  },
  {
    id: 'inspector',
    name: 'Inspector',
    description: 'Conduct inspections and manage findings',
    permissions: ['insp:view', 'insp:create', 'insp:edit', 'lic:view', 'aff:view', 'reports:view'],
    userCount: 8,
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Review and approve applications',
    permissions: ['insp:view', 'lic:view', 'lic:approve', 'lic:reject', 'aff:view', 'aff:approve', 'reports:view'],
    userCount: 5,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'View data and generate reports',
    permissions: ['insp:view', 'lic:view', 'aff:view', 'reports:view', 'reports:export'],
    userCount: 3,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to records',
    permissions: ['insp:view', 'lic:view', 'aff:view'],
    userCount: 4,
  },
]

// Mock users generator
const generateMockUsers = (): User[] => {
  const now = new Date()
  return [
    {
      id: '1',
      email: 'admin@regulator.gov',
      fullName: 'Sarah Johnson',
      role: 'Administrator',
      status: 'active',
      department: 'IT Administration',
      phone: '+254 700 123456',
      lastLogin: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: mockPermissions.map(p => p.id),
    },
    {
      id: '2',
      email: 'jdoe@regulator.gov',
      fullName: 'John Doe',
      role: 'Inspector',
      status: 'active',
      department: 'Field Operations',
      phone: '+254 700 234567',
      lastLogin: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['insp:view', 'insp:create', 'insp:edit', 'lic:view', 'aff:view', 'reports:view'],
    },
    {
      id: '3',
      email: 'msmith@regulator.gov',
      fullName: 'Mary Smith',
      role: 'Reviewer',
      status: 'active',
      department: 'Licensing Division',
      phone: '+254 700 345678',
      lastLogin: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['insp:view', 'lic:view', 'lic:approve', 'lic:reject', 'aff:view', 'aff:approve', 'reports:view'],
    },
    {
      id: '4',
      email: 'bwilson@regulator.gov',
      fullName: 'Bob Wilson',
      role: 'Analyst',
      status: 'active',
      department: 'Data Analytics',
      phone: '+254 700 456789',
      lastLogin: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['insp:view', 'lic:view', 'aff:view', 'reports:view', 'reports:export'],
    },
    {
      id: '5',
      email: 'lbrown@regulator.gov',
      fullName: 'Lisa Brown',
      role: 'Inspector',
      status: 'inactive',
      department: 'Field Operations',
      phone: '+254 700 567890',
      lastLogin: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['insp:view', 'insp:create', 'insp:edit', 'lic:view', 'aff:view', 'reports:view'],
    },
    {
      id: '6',
      email: 'tjones@regulator.gov',
      fullName: 'Tom Jones',
      role: 'Viewer',
      status: 'active',
      department: 'External Affairs',
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['insp:view', 'lic:view', 'aff:view'],
    },
  ]
}

interface UserState {
  users: User[]
  roles: Role[]
  permissions: Permission[]
  filters: UserFilters
  selectedUser: User | null
  isLoading: boolean

  // Actions
  initialize: () => void
  updateFilters: (filters: Partial<UserFilters>) => void
  clearFilters: () => void
  selectUser: (user: User | null) => void
  createUser: (payload: CreateUserPayload) => Promise<void>
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  roles: mockRoles,
  permissions: mockPermissions,
  filters: {
    role: 'all',
    status: 'all',
  },
  selectedUser: null,
  isLoading: false,

  initialize: () => {
    const users = generateMockUsers()
    set({ users, isLoading: false })
  },

  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        role: 'all',
        status: 'all',
      },
    })
  },

  selectUser: (user) => {
    set({ selectedUser: user })
  },

  createUser: async (payload) => {
    set({ isLoading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: `${Date.now()}`,
      ...payload,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      users: [...state.users, newUser],
      isLoading: false,
    }))
  },

  updateUser: async (id, payload) => {
    set({ isLoading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, ...payload } : u
      ),
      selectedUser: null,
      isLoading: false,
    }))
  },

  deleteUser: async (id) => {
    set({ isLoading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      isLoading: false,
    }))
  },
}))

// Selector for filtered users
export const getFilteredUsers = (state: UserState): User[] => {
  let filtered = state.users

  // Filter by search
  if (state.filters.search) {
    const search = state.filters.search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.department?.toLowerCase().includes(search)
    )
  }

  // Filter by role
  if (state.filters.role && state.filters.role !== 'all') {
    filtered = filtered.filter((u) => u.role === state.filters.role)
  }

  // Filter by status
  if (state.filters.status && state.filters.status !== 'all') {
    filtered = filtered.filter((u) => u.status === state.filters.status)
  }

  return filtered
}
