import { LayoutDashboard, ListTodo, Video, Users, BarChart3, LogOut, Briefcase, TrendingUp, Target, Handshake } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const employeeItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Tasks', url: '/tasks', icon: ListTodo },
  { title: 'Work Room', url: '/workroom', icon: Video },
];

const adminItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Projects', url: '/admin/projects', icon: Briefcase },
  { title: 'Employees', url: '/admin/employees', icon: Users },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
];

const clientItems = [
  { title: 'My Reports', url: '/client', icon: TrendingUp },
];

const salesItems = [
  { title: 'Sales Dashboard', url: '/sales', icon: LayoutDashboard },
];

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const items = role === 'admin' ? adminItems : role === 'client' ? clientItems : role === 'sales' ? salesItems : employeeItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-2 mb-8 px-2">
            <img src="/logo.png" alt="Hastag Team Logo" className="h-8 w-auto object-contain" />
            {!collapsed && <span className="font-bold text-lg text-sidebar-foreground">Hastag-Team</span>}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin' || item.url === '/dashboard'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && profile && (
          <div className="text-xs text-sidebar-foreground/60 mb-2 truncate">
            {profile.name || profile.email}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
