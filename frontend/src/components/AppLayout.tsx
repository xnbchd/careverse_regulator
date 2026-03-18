import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import {
  AppstoreOutlined,
  AuditOutlined,
  DownOutlined,
  BellOutlined,
  DashboardOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  PartitionOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import type { PortalUser } from '@/types/auth'
import { useThemeStore } from '@/stores/themeStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const FALLBACK_BRAND_ICON = '/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a'

interface AppLayoutProps {
  children: React.ReactNode
  currentRoute: string
  pageTitle: string
  pageSubtitle?: string
  onNavigate: (route: string) => void
  onOpenNotifications: () => void
  onLogout: () => void
  onSwitchToDesk: () => void
  user: PortalUser | null
}

function getUserInitials(fullName?: string, email?: string): string {
  const value = fullName || email || 'U'
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function selectedMenuKeyForRoute(route: string): string {
  if (route.startsWith('license-management')) return 'license-management'
  if (route.startsWith('affiliations')) return 'affiliations'
  if (route.startsWith('inspection')) return 'inspection'
  if (route.startsWith('users-roles')) return 'users-roles'
  if (route.startsWith('regulator-settings')) return 'regulator-settings'
  if (route.startsWith('dashboard')) return 'dashboard'
  return 'dashboard'
}

export default function AppLayout({
  children,
  currentRoute,
  pageTitle,
  pageSubtitle,
  onNavigate,
  onOpenNotifications,
  onLogout,
  onSwitchToDesk,
  user,
}: AppLayoutProps) {
  const { token } = theme.useToken()
  const { isMobile, isTablet } = useResponsive()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [brandLogoFailed, setBrandLogoFailed] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const isDarkMode = mode === 'dark'

  useEffect(() => {
    setCollapsed(isTablet)
  }, [isTablet])

  const selectedMenuKey = useMemo(() => selectedMenuKeyForRoute(currentRoute), [currentRoute])
  const pageContext = selectedMenuKey === 'dashboard' ? 'Workspace overview' : 'Operational workspace'
  const displayUsername = user?.name || user?.email || 'User'
  const displayCompany = user?.companyDisplayName || user?.company || 'Company not configured'
  const brandTitle = user?.companyDisplayName || user?.company || 'Compliance360'
  const brandSubtitle = user?.companyAbbr || 'Regulator Portal'
  const brandLogoUrl = user?.companyLogo || FALLBACK_BRAND_ICON

  useEffect(() => {
    setBrandLogoFailed(false)
  }, [brandLogoUrl])

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'modules',
      icon: <AppstoreOutlined />,
      label: 'Modules',
      children: [
        {
          key: 'license-management',
          icon: <SafetyCertificateOutlined />,
          label: 'Licenses',
        },
        {
          key: 'affiliations',
          icon: <PartitionOutlined />,
          label: 'Affiliations',
        },
        {
          key: 'inspection',
          icon: <AuditOutlined />,
          label: 'Inspection',
        },
      ],
    },
    {
      key: 'administration',
      icon: <SettingOutlined />,
      label: 'Administration',
      children: [
        {
          key: 'users-roles',
          icon: <TeamOutlined />,
          label: 'Users & Roles',
        },
        {
          key: 'regulator-settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
      ],
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'View profile',
    },
    {
      key: 'switch-desk',
      icon: <LinkOutlined />,
      label: 'Switch to Desk',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ]

  const handleMenuClick = (e: { key: string }) => {
    onNavigate(e.key)
    if (isMobile || isTablet) {
      setMobileMenuVisible(false)
    }
  }

  const handleUserMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      onLogout()
      return
    }

    if (e.key === 'switch-desk') {
      onSwitchToDesk()
      return
    }

    onNavigate(e.key)
  }

  const headerActionButtonStyle = {
    width: isMobile ? '36px' : '40px',
    height: isMobile ? '36px' : '40px',
    fontSize: isMobile ? '15px' : '16px',
  }
  const notificationCount = 0

  const renderLogo = () => (
    <div
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0' : '0 24px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        marginBottom: '8px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(15, 118, 110, 0.16)',
          border: '1px solid rgba(15, 118, 110, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f766e',
          fontSize: '16px',
          fontWeight: 600,
          overflow: 'hidden',
        }}
      >
        {brandLogoUrl && !brandLogoFailed ? (
          <img
            src={brandLogoUrl}
            alt={brandTitle}
            className="header-brand-logo"
            onError={() => setBrandLogoFailed(true)}
          />
        ) : (
          (brandTitle || 'C').trim().charAt(0).toUpperCase()
        )}
      </div>
      {!collapsed && (
        <div style={{ marginLeft: '12px' }}>
          <Text style={{ margin: 0, color: token.colorText, lineHeight: 1.2, fontSize: '14px', fontWeight: 600 }}>
            {brandTitle}
          </Text>
          <Text type="secondary" style={{ fontSize: '10px', fontWeight: 500 }}>{brandSubtitle}</Text>
        </div>
      )}
    </div>
  )

  const renderSidebar = () => (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={80}
      theme={isDarkMode ? 'dark' : 'light'}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        zIndex: 100,
      }}
    >
      {renderLogo()}
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[selectedMenuKey]}
        defaultOpenKeys={['modules', 'administration']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', fontSize: '12px' }}
      />
    </Sider>
  )

  const renderMobileDrawer = () => (
    <Drawer
      placement="left"
      closable={false}
      onClose={() => setMobileMenuVisible(false)}
      open={mobileMenuVisible}
      width={isMobile ? 280 : 300}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ display: 'none' }}
    >
      {renderLogo()}
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[selectedMenuKey]}
        defaultOpenKeys={['modules', 'administration']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', fontSize: '12px' }}
      />
    </Drawer>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && !isTablet && renderSidebar()}
      {(isMobile || isTablet) && renderMobileDrawer()}

      <Layout
        style={{
          marginLeft: (isMobile || isTablet) ? 0 : collapsed ? 80 : 260,
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Header
          className="hq-header-shell reg-header-shell"
          style={{
            padding: isMobile ? '0 12px' : '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '64px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="reg-header-main">
            <div className="reg-header-left">
              <Button
                type="text"
                icon={(isMobile || isTablet) ? <MenuUnfoldOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => ((isMobile || isTablet) ? setMobileMenuVisible(true) : setCollapsed(!collapsed))}
                className="reg-header-icon-btn reg-header-icon-btn--menu"
                style={headerActionButtonStyle}
              />

              <div className="reg-header-divider" />

              <div className="reg-header-context">
                <Text className="reg-header-eyebrow">{pageContext}</Text>
                <Text className="reg-header-title">{pageTitle}</Text>
                {pageSubtitle && <Text className="reg-header-subtitle">{pageSubtitle}</Text>}
              </div>
            </div>

            <div className="reg-header-right">
              <Tooltip title="Notifications">
                {notificationCount > 0 ? (
                  <Badge count={notificationCount} size="small">
                    <Button
                      type="text"
                      icon={<BellOutlined />}
                      className="reg-header-icon-btn"
                      style={headerActionButtonStyle}
                      onClick={onOpenNotifications}
                    />
                  </Badge>
                ) : (
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="reg-header-icon-btn"
                    style={headerActionButtonStyle}
                    onClick={onOpenNotifications}
                  />
                )}
              </Tooltip>

              <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                <Button
                  type="text"
                  icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleMode}
                  className="reg-header-icon-btn reg-header-icon-btn--theme"
                  style={headerActionButtonStyle}
                />
              </Tooltip>

              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} trigger={['click']} placement="bottomRight">
                <button type="button" className="reg-header-user-trigger" aria-label="User menu">
                  <Avatar size="default" src={user?.userImage || undefined} className="reg-header-user-avatar">
                    {getUserInitials(user?.fullName, user?.email)}
                  </Avatar>
                  {!isMobile && (
                    <span className="reg-header-user-meta">
                      <Text className="reg-header-user-name">{displayUsername}</Text>
                      <Text className="reg-header-user-company">{displayCompany}</Text>
                    </span>
                  )}
                  {!isMobile && <DownOutlined className="reg-header-user-caret" />}
                </button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className="hq-content-shell">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
