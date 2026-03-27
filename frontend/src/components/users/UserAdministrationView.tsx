import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, UserPlus, Upload, Activity, UserCheck, UserX } from "lucide-react"
import { useUserStore } from "@/stores/userStore"
import { fetchUsers } from "@/api/userManagementApi"
import { showError } from "@/utils/toast"
import UserFilters from "./UserFilters"
import UsersTable from "./UsersTable"
import RolesSection from "./RolesSection"
import ActivityReportSection from "./ActivityReportSection"
import CreateUserDialog from "./CreateUserDialog"
import EditUserDialog from "./EditUserDialog"
import DisableUserDialog from "./DisableUserDialog"
import ResetPasswordDialog from "./ResetPasswordDialog"
import BulkUploadDialog from "./BulkUploadDialog"
import type { FrappeUser, PortalRole } from "@/types/user"
import type { UserTab } from "@/stores/userStore"

export default function UserAdministrationView() {
  const {
    users,
    totalUsers,
    pagination,
    filters,
    isLoading,
    roles,
    activeTab,
    setUsers,
    setFilters,
    clearFilters,
    setActiveTab,
    setLoading,
  } = useUserStore()

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [resetPwOpen, setResetPwOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<FrappeUser | null>(null)
  const [disableAction, setDisableAction] = useState<"disable" | "enable">("disable")

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const enabledFilter =
        filters.status === "active" ? 1 : filters.status === "disabled" ? 0 : undefined

      const result = await fetchUsers({
        page: filters.page,
        page_size: filters.page_size,
        search: filters.search || undefined,
        enabled: enabledFilter as 0 | 1 | undefined,
        include_roles: 1,
      })

      // Client-side role filtering since the backend doesn't support it
      let filteredUsers = result.users
      if (filters.role && filters.role !== "all") {
        filteredUsers = filteredUsers.filter((u) => u.roles.includes(filters.role as PortalRole))
      }

      setUsers(filteredUsers, result.pagination)
    } catch {
      showError("Failed to load users")
      setLoading(false)
    }
  }, [filters.page, filters.page_size, filters.search, filters.status, filters.role])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Stats
  const activeCount = users.filter((u) => u.enabled === 1).length
  const disabledCount = users.filter((u) => u.enabled === 0).length

  const handleEdit = (user: FrappeUser) => {
    setSelectedUser(user)
    setEditOpen(true)
  }

  const handleDisable = (user: FrappeUser) => {
    setSelectedUser(user)
    setDisableAction("disable")
    setDisableOpen(true)
  }

  const handleEnable = (user: FrappeUser) => {
    setSelectedUser(user)
    setDisableAction("enable")
    setDisableOpen(true)
  }

  const handleResetPassword = (user: FrappeUser) => {
    setSelectedUser(user)
    setResetPwOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User & Role Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage portal users, roles, and activity reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserTab)}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Users
            {totalUsers > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {totalUsers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-md border border-border/60 dark:shadow-none dark:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-border/60 dark:shadow-none dark:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCount}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-border/60 dark:shadow-none dark:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roles.length}</p>
                    <p className="text-sm text-muted-foreground">Roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-border/60 dark:shadow-none dark:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <UserX className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disabledCount}</p>
                    <p className="text-sm text-muted-foreground">Disabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <UserFilters
            filters={filters}
            onFilterChange={(f) => setFilters({ ...f, page: 1 })}
            onClearFilters={clearFilters}
          />

          {/* Users table */}
          <UsersTable
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDisable={handleDisable}
            onEnable={handleEnable}
            onResetPassword={handleResetPassword}
          />

          {/* Pagination */}
          {pagination && pagination.count > pagination.page_size && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page <= 1}
                onClick={() => setFilters({ page: pagination.current_page - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Page {pagination.current_page} of{" "}
                {Math.ceil(pagination.count / pagination.page_size)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.end >= pagination.count}
                onClick={() => setFilters({ page: pagination.current_page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Roles tab */}
        <TabsContent value="roles" className="mt-6">
          <RolesSection roles={roles} users={users} onRefreshUsers={loadUsers} />
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity" className="mt-6">
          <ActivityReportSection />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={loadUsers} />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onSuccess={loadUsers}
      />

      <DisableUserDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        user={selectedUser}
        action={disableAction}
        onSuccess={loadUsers}
      />

      <ResetPasswordDialog open={resetPwOpen} onOpenChange={setResetPwOpen} user={selectedUser} />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={loadUsers}
      />
    </div>
  )
}
