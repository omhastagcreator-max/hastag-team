import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminEmployees() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      // Update the profile name
      await supabase.from('profiles').update({ name }).eq('user_id', data.user.id);
      toast.success(`Employee ${email} created successfully!`);
      setEmail('');
      setPassword('');
      setName('');
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <AppLayout requiredRole="admin">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Manage Employees</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Create Employee
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Employee Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEmployee} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@agency.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Account'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              Use the admin overview to see all employees and their activity. Click on any employee to view detailed logs.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
