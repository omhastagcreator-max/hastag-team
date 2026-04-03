import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminEmployees() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'sales' | 'admin' | 'client'>('employee');
  const [team, setTeam] = useState<'marketing' | 'web_dev' | 'content' | 'sales'>('web_dev');
  const [creating, setCreating] = useState(false);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    // Note: In a true production app, creating users from the client UI 
    // without a service role key will log out the admin. 
    // This maintains the existing demo architecture flow.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await supabase.from('profiles').update({ name, team: role === 'client' ? null : team }).eq('user_id', data.user.id);
      
      // Override default 'employee' role trigger
      if (role !== 'employee') {
        setTimeout(async () => {
           await supabase.from('user_roles').update({ role }).eq('user_id', data.user?.id);
        }, 500); // Small delay to let trigger finish
      }

      toast.success(`${role} ${email} created successfully!`);
      setEmail('');
      setPassword('');
      setName('');
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Manage Users
            </h1>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          </div>

          {showForm && (
            <MotionCard delay={0.1}>
              <CardHeader>
                <CardTitle className="text-lg">New User Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2 flex gap-2">
                       <div className="w-1/2 space-y-2">
                          <label className="text-sm font-medium text-foreground">Role</label>
                          <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       {role !== 'client' && (
                         <div className="w-1/2 space-y-2">
                            <label className="text-sm font-medium text-foreground">Team</label>
                            <Select value={team} onValueChange={(v: any) => setTeam(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web_dev">Web Dev</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="content">Content</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@agency.com" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={creating} className="w-full md:w-auto">
                      {creating ? 'Creating...' : 'Create Account'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </MotionCard>
          )}

          <MotionCard delay={0.2}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                Use the admin overview to see all employees and their activity. Creating 'Clients' will expose them to the Client Dashboard.
              </p>
            </CardContent>
          </MotionCard>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
