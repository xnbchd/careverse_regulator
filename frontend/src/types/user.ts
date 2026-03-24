export type UserRole = 'Administrator' | 'Inspector' | 'Reviewer' | 'Analyst' | 'Viewer'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  department?: string
  phone?: string
  lastLogin?: string
  createdAt: string
  permissions: string[]
}

export interface Role {
  id: string
  name: UserRole
  description: string
  permissions: string[]
  userCount: number
}

export interface Permission {
  id: string
  name: string
  description: string
  category: 'inspections' | 'licenses' | 'affiliations' | 'users' | 'settings' | 'reports'
}

export interface UserFilters {
  search?: string
  role?: UserRole | 'all'
  status?: UserStatus | 'all'
}

export interface CreateUserPayload {
  email: string
  fullName: string
  role: UserRole
  department?: string
  phone?: string
  permissions: string[]
}

export interface UpdateUserPayload {
  fullName?: string
  role?: UserRole
  status?: UserStatus
  department?: string
  phone?: string
  permissions?: string[]
}
