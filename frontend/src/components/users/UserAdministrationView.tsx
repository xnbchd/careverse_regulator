import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Users, Shield, Eye } from 'lucide-react'
import { useUserStore, getFilteredUsers } from '@/stores/userStore'
import UserFilters from './UserFilters'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const roleColors = {
  Administrator: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Inspector: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Reviewer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Analyst: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  suspended: 'bg-red-500',
}

export default function UserAdministrationView() {
  const {
    initialize,
    filters,
    roles,
    updateFilters,
    clearFilters,
  } = useUserStore()

  const users = useUserStore(getFilteredUsers)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'inactive').length}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <UserFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </div>
        <Button disabled>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {filters.search || filters.role !== 'all'
                    ? "No users match your filters."
                    : "No users in the system."}
                </p>
              </div>
              {(filters.search || filters.role !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-base">{user.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                        <span className="text-sm capitalize">{user.status}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                      {user.department && (
                        <Badge variant="outline">{user.department}</Badge>
                      )}
                      {user.lastLogin && (
                        <Badge variant="secondary" className="text-xs">
                          Last login {dayjs(user.lastLogin).fromNow()}
                        </Badge>
                      )}
                    </div>

                    {user.permissions.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Roles Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={roleColors[role.name]}>{role.name}</Badge>
                    <span className="text-sm text-muted-foreground">{role.userCount} users</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
