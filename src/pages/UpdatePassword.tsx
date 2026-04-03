import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setSubmitting(true);
    
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      // Log out to force a clean login with the new password
      setTimeout(() => {
        signOut().then(() => navigate('/login'));
      }, 3000);
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-background to-muted relative overflow-hidden p-12">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
          </div>
          <div className="relative z-10 w-full max-w-md space-y-6">
             <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Secure Your Account</h1>
             <p className="text-xl text-muted-foreground font-medium">Update your password to continue accessing the HashTag-Team productivity suite.</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 relative">
          <MotionCard className="w-full max-w-[400px] border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl relative z-10 border-t-blue-500/30">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex justify-center mb-2">
                <ShieldAlert className="h-12 w-12 text-primary drop-shadow-md" />
              </div>
              <CardTitle className="text-3xl text-center font-bold tracking-tight">Update Password</CardTitle>
              <CardDescription className="text-center text-sm font-medium opacity-90">Enter your new secure password</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              {success ? (
                <div className="space-y-4 text-center animate-in fade-in zoom-in-95">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Password Updated!</h3>
                  <p className="text-sm text-muted-foreground">You will be redirected to the login page momentarily.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/90">New Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background/50 border-white/10 focus:bg-background/80 transition-colors"
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              )}
            </CardContent>
          </MotionCard>
        </div>
      </div>
    </PageTransition>
  );
}
