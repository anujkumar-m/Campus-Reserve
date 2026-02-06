import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  GraduationCap,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Resources', url: '/resources', icon: Building2 },
    { title: 'All Bookings', url: '/bookings', icon: ClipboardList },
    { title: 'Approvals', url: '/approvals', icon: CheckCircle },
    { title: 'Users', url: '/users', icon: Users },
  ],
  faculty: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Resources', url: '/resources', icon: Building2 },
    { title: 'Book Resource', url: '/book', icon: PlusCircle },
    { title: 'My Bookings', url: '/my-bookings', icon: Calendar },
  ],
  student: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Resources', url: '/resources', icon: Building2 },
    { title: 'Request Booking', url: '/book', icon: PlusCircle },
    { title: 'My Requests', url: '/my-bookings', icon: Calendar },
  ],
  department: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Dept Resources', url: '/resources', icon: Building2 },
    { title: 'Approvals', url: '/approvals', icon: CheckCircle },
    { title: 'All Bookings', url: '/bookings', icon: ClipboardList },
  ],
  club: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Resources', url: '/resources', icon: Building2 },
    { title: 'Book Venue', url: '/book', icon: PlusCircle },
    { title: 'Upcoming Events', url: '/my-bookings', icon: Calendar },
  ],
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Campus Reserve</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <RouterNavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <RouterNavLink to="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </RouterNavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sign Out"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
