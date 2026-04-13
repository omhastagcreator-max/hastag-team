import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Receipt, BellRing, ArrowLeft, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  date: string;
}

interface Alert {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{name: string, email: string} | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loginCount, setLoginCount] = useState(0);

  // Forms
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('pending');
  const [alertMsg, setAlertMsg] = useState('');

  const fetchData = async () => {
    if (!clientId) return;
    setLoading(true);

    const { data: pData } = await supabase.from('profiles').select('name, email').eq('user_id', clientId).single();
    if (pData) setProfile(pData);

    const { data: aData } = await supabase.from('activity_logs').select('id').eq('user_id', clientId).eq('action', 'login');
    setLoginCount(aData?.length || 0);

    const { data: tData } = await supabase.from('client_transactions').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (tData) setTransactions(tData);

    const { data: alData } = await supabase.from('client_alerts').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (alData) setAlerts(alData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return toast.error('Fill required fields');
    
    const { error } = await supabase.from('client_transactions').insert({
      client_id: clientId,
      amount: Number(amount),
      description: desc,
      status
    });
    
    if (error) toast.error('Error adding transaction');
    else {
      toast.success('Transaction registered');
      setAmount(''); setDesc(''); setStatus('pending');
      fetchData();
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMsg) return;
    const { error } = await supabase.from('client_alerts').insert({
      client_id: clientId,
      message: alertMsg,
      alert_type: 'outstanding_balance'
    });

    if (error) toast.error('Error setting alert');
    else {
      toast.success('Client Alert Queued');
      setAlertMsg('');
      fetchData();
    }
  };

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/admin/clients')} className="mb-2 -ml-3 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
          </Button>

          {loading ? (
            <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
          ) : !profile ? (
            <p>Client not found.</p>
          ) : (
            <>
              <div className="flex items-center justify-between bg-card border border-border/50 p-6 rounded-xl shadow-sm">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">Audited Logins</p>
                  <p className="text-4xl font-bold font-mono text-primary">{loginCount}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* TRANSACTIONS LEDGER */}
                <MotionCard delay={0.1} className="border border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-green-500" /> Transaction Ledger</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleCreateTransaction} className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="col-span-2 md:col-span-1">
                        <Input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Invoice / Description" value={desc} onChange={e => setDesc(e.target.value)} required />
                      </div>
                      <Button className="col-span-2 gap-2" variant="secondary"><PlusCircle className="h-4 w-4" /> Add Record</Button>
                    </form>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {transactions.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-3 border border-border/50 rounded bg-background">
                          <div>
                            <p className="text-sm font-medium">{t.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold">₹{t.amount}</p>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${t.status === 'paid' ? 'bg-green-500/20 text-green-500' : t.status === 'overdue' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No transactions on ledger.</p>}
                    </div>
                  </CardContent>
                </MotionCard>

                {/* OUTSTANDING ALERTS */}
                <MotionCard delay={0.2} className="border border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-amber-500" /> Dashboard Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleCreateAlert} className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">Force a pop-up alert on the client's screen upon their next login.</p>
                      <Input placeholder="Message (e.g. You have an outstanding balance...)" value={alertMsg} onChange={e => setAlertMsg(e.target.value)} required />
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 border-none" variant="outline"><BellRing className="h-4 w-4"/> Queue Alert</Button>
                    </form>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {alerts.map(a => (
                        <div key={a.id} className={`p-3 border rounded ${a.is_read ? 'opacity-50 border-border bg-background' : 'border-amber-500/50 bg-amber-500/10'}`}>
                          <p className="text-sm">{a.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                            <span className="text-[10px] uppercase font-bold">{a.is_read ? 'Read' : 'Unread'}</span>
                          </div>
                        </div>
                      ))}
                      {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No alerts bound to client.</p>}
                    </div>
                  </CardContent>
                </MotionCard>

              </div>
            </>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
