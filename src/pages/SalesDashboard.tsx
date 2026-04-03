import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Target, Handshake, Users, DollarSign, PlusCircle, ArrowRightCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  name: string;
  contact: string;
  source: string | null;
  status: string;
}

interface Deal {
  id: string;
  lead_id: string | null;
  deal_value: number;
  service_type: string;
  status: string;
}

export default function SalesDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // New lead form
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [source, setSource] = useState('');

  // Conversion state
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [dealValue, setDealValue] = useState('');
  const [serviceType, setServiceType] = useState('combined');

  const fetchData = async () => {
    // In real app, consider pagination or assigned_to filtering
    const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leadsData) setLeads(leadsData);

    const { data: dealsData } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (dealsData) setDeals(dealsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    
    await supabase.from('leads').insert({
      name,
      contact,
      source,
      assigned_to: user?.id
    });
    
    setName('');
    setContact('');
    setSource('');
    toast.success('Lead created enthusiastically! 🚀');
    fetchData();
  };

  const updateLeadStatus = async (id: string, nextStatus: string) => {
    await supabase.from('leads').update({ status: nextStatus }).eq('id', id);
    toast.success('Lead status shifted! ⚡');
    fetchData();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLeadId || !dealValue) return;

    await supabase.from('deals').insert({
      lead_id: convertingLeadId,
      deal_value: Number(dealValue),
      service_type: serviceType
    });

    await supabase.from('leads').update({ status: 'converted' }).eq('id', convertingLeadId);

    setConvertingLeadId(null);
    setDealValue('');
    toast.success('Deal officially WON! 🎉');
    fetchData();
  };

  const stats = useMemo(() => {
    const revenue = deals.filter(d => d.status !== 'lost').reduce((sum, d) => sum + Number(d.deal_value), 0);
    const wonDeals = deals.filter(d => d.status === 'won').length;
    const openDeals = deals.filter(d => d.status === 'open').length;
    return { revenue, wonDeals, openDeals };
  }, [deals]);

  return (
    <AppLayout requiredRole="sales">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-2 mb-4">
             <Target className="h-8 w-8 text-primary animate-pulse" />
             <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent drop-shadow-sm">Sales Command Center</h1>
          </div>

          {/* Revenue Top Banner */}
          <div className="grid md:grid-cols-3 gap-6">
            <MotionCard delay={0.1} className="bg-gradient-to-br from-green-500/20 to-emerald-500/5 hover:border-green-500/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Pipeline Rev</p>
                    <h2 className="text-4xl font-extrabold flex items-center">
                      <DollarSign className="h-8 w-8 text-emerald-500 -ml-1" />
                      {stats.revenue.toLocaleString()}
                    </h2>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-md">
                     <DollarSign className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </MotionCard>
            
            <MotionCard delay={0.2} className="bg-gradient-to-br from-blue-500/20 to-cyan-500/5 hover:border-blue-500/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Open Deals</p>
                    <h2 className="text-4xl font-extrabold text-blue-500">{stats.openDeals}</h2>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-md">
                     <Handshake className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </MotionCard>

            <MotionCard delay={0.3} className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/5 hover:border-purple-500/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Active Leads</p>
                    <h2 className="text-4xl font-extrabold text-purple-500">
                      {leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length}
                    </h2>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-md">
                     <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <MotionCard delay={0.4}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PlusCircle className="text-primary h-5 w-5" /> Ignite New Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prospect Name</label>
                      <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Elon Musk" className="bg-background/50 focus:bg-background transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</label>
                      <Input value={contact} onChange={e => setContact(e.target.value)} required placeholder="elon@x.com" className="bg-background/50 focus:bg-background transition-colors"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Traffic Source</label>
                      <Select value={source} onValueChange={setSource}>
                         <SelectTrigger className="bg-background/50 focus:bg-background"><SelectValue placeholder="Source..."/></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Inbound">Inbound</SelectItem>
                            <SelectItem value="Outbound">Outbound</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">Launch Lead 🚀</Button>
                  </form>
                </CardContent>
              </MotionCard>

              {/* Conversion Modal Card Inline */}
              {convertingLeadId && (
                <MotionCard delay={0.1} className="border-green-500 shadow-xl shadow-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-500 flex items-center gap-2">💰 Structure Deal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleConvert} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Projected Value ($)</label>
                        <Input type="number" value={dealValue} onChange={e => setDealValue(e.target.value)} required placeholder="10000" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Service Pitch</label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="ads">Marketing Ads</SelectItem>
                             <SelectItem value="website">Web Development</SelectItem>
                             <SelectItem value="combined">Combined Stack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                         <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white">Seal IT!</Button>
                         <Button type="button" variant="ghost" onClick={() => setConvertingLeadId(null)}>Hold up</Button>
                      </div>
                    </form>
                  </CardContent>
                </MotionCard>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <MotionCard delay={0.5} className="h-[600px] flex flex-col">
                <CardHeader className="pb-4 border-b border-border/50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Active Leads Engine</span>
                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">{leads.filter(l => l.status !== 'converted').length} active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {leads.filter(l => l.status !== 'converted' && l.status !== 'lost').map(lead => (
                    <div key={lead.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all">
                       <div>
                         <h3 className="font-bold text-lg">{lead.name}</h3>
                         <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <span>{lead.contact}</span> 
                           {lead.source && <span className="bg-background px-2 py-0.5 rounded text-xs border border-border/50">{lead.source}</span>}
                         </p>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <Select value={lead.status} onValueChange={(val) => updateLeadStatus(lead.id, val)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button 
                            size="sm" 
                            variant="default"
                            className="h-8 shadow-sm group-hover:scale-105 transition-transform"
                            onClick={() => setConvertingLeadId(lead.id)}
                            disabled={convertingLeadId === lead.id}
                          >
                            Convert <ArrowRightCircle className="h-4 w-4 ml-1" />
                          </Button>
                       </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-50">
                      <Target className="h-16 w-16 mb-4" />
                      <p>Pipeline empty. Time to hunt.</p>
                    </div>
                  )}
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
