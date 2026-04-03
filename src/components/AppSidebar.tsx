import { LayoutDashboard, ListTodo, Video, Users, BarChart3, LogOut } from 'lucide-react';
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
  { title: 'Employees', url: '/admin/employees', icon: Users },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
];

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const items = role === 'admin' ? adminItems : employeeItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
              <img src="/logo.png" alt="Hastag-Team Logo" className="h-8 w-auto object-contain" />
          </SidebarGroupLabel>
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
