import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, role, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user && role) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : role === 'client' ? '/client/dashboard' : role === 'sales' ? '/sales/dashboard' : '/employee/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    if (isForgotPassword) {
      const { error } = await useAuth().resetPassword(email);
      if (error) setError(error.message);
      else setResetSent(true);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="fixed inset-0 z-[0] bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 animate-gradient-xy pointer-events-none" />
      <div className="min-h-screen flex items-center justify-center bg-transparent px-4 relative z-10">
        <div className="w-full max-w-md">
          <MotionCard delay={0.1} className="w-full shadow-2xl border-white/10 glass-panel">
            <CardHeader className="text-center space-y-3 pb-2 pt-6">
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                className="mx-auto flex items-center justify-center"
              >
                <img src="/logo.png" alt="Hastag-Team Creator Logo" className="h-14 w-auto object-contain drop-shadow-xl" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Hastag-Team App
              </CardTitle>
              <CardDescription className="text-foreground/70">Sign in to track your workday</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20"
                  >
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    required
                    className="bg-background/50 border-white/10 focus:bg-background/80 transition-colors"
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground/90">Password</label>
                      <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary hover:underline" tabIndex={-1}>
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background/50 border-white/10 focus:bg-background/80 transition-colors"
                    />
                  </div>
                )}

                {resetSent && isForgotPassword ? (
                  <div className="text-sm text-green-500 bg-green-500/10 rounded-lg p-3 border border-green-500/20 text-center">
                    Check your email for the reset link!
                  </div>
                ) : (
                  <Button type="submit" className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow" disabled={submitting}>
                    {submitting ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                  </Button>
                )}

                {isForgotPassword && (
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="text-xs text-muted-foreground hover:text-foreground">
                      Back to sign in
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </MotionCard>
        </div>
      </div>
    </PageTransition>
  );
}
