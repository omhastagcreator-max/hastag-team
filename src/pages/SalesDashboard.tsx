import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Target, Handshake, Users, IndianRupee, PlusCircle, ArrowRightCircle, MessageSquare, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface LeadResponse {
  id: string;
  note: string;
  created_at: string;
}

import { useTasks } from '@/hooks/useTasks';
import { TaskCalendar } from '@/components/TaskCalendar';

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
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

  // Lead Response Log state
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leadResponses, setLeadResponses] = useState<LeadResponse[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchData = async () => {
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
    toast.success('Lead moved! ⚡');
    fetchData();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLeadId || !dealValue) return;

    const lead = leads.find(l => l.id === convertingLeadId);

    await supabase.from('deals').insert({
      lead_id: convertingLeadId,
      deal_value: Number(dealValue),
      service_type: serviceType,
      status: 'won'
    });

    // Auto-create a project from won deal (spec §3 sales → handoff to delivery)
    if (lead) {
      const projectType = serviceType === 'website' ? 'web_dev' : serviceType === 'ads' ? 'marketing' : 'combined';
      await supabase.from('projects').insert({
        name: `${lead.name} – ${serviceType}`,
        project_type: projectType,
        status: 'active'
      } as any);
    }

    await supabase.from('leads').update({ status: 'won' }).eq('id', convertingLeadId);

    setConvertingLeadId(null);
    setDealValue('');
    toast.success('Deal WON! Project created 🎉');
    fetchData();
  };

  const handleOpenLead = async (lead: Lead) => {
    setActiveLead(lead);
    const { data } = await supabase.from('lead_responses').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false });
    setLeadResponses(data || []);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !newNote) return;
    
    const { data } = await supabase.from('lead_responses').insert({
      lead_id: activeLead.id,
      user_id: user?.id,
      note: newNote
    }).select().single();
    
    if (data) {
      setLeadResponses([data, ...leadResponses]);
    }
    setNewNote('');
    toast.success('Response logged!');
  };

  const stats = useMemo(() => {
    const revenue = deals.filter(d => d.status !== 'lost').reduce((sum, d) => sum + Number(d.deal_value), 0);
    const wonDeals = deals.filter(d => d.status === 'won').length;
    const openDeals = deals.filter(d => d.status === 'open').length;
    return { revenue, wonDeals, openDeals };
  }, [deals]);

  const stages = ['new', 'contacted', 'qualified', 'won', 'lost'];

  return (
    <AppLayout requiredRole="sales">
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <Target className="h-7 w-7 text-primary" />
               <div>
                 <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales</h1>
                 <p className="text-xs text-muted-foreground">Close deals fast.</p>
               </div>
             </div>
             <Button onClick={() => navigate('/workroom')} variant="outline" size="sm" className="gap-2">
               <Video className="h-4 w-4" /> WorkRoom
             </Button>
          </div>

          <div className="mt-4 mb-4">
             <TaskCalendar tasks={tasks} onToggleTask={(t, next) => updateTask(t.id, { status: next })} />
          </div>

          {/* Top metrics */}
          <div className="grid grid-cols-3 gap-3">
            <MotionCard className="border border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pipeline Rev</p>
                <h2 className="text-2xl font-bold mt-1 flex items-center">
                  <IndianRupee className="h-5 w-5 text-green-500 -ml-1" />
                  {stats.revenue.toLocaleString()}
                </h2>
              </CardContent>
            </MotionCard>
            <MotionCard className="border border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Open Deals</p>
                <h2 className="text-2xl font-bold mt-1">{stats.openDeals}</h2>
              </CardContent>
            </MotionCard>
            <MotionCard className="border border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Leads</p>
                <h2 className="text-2xl font-bold mt-1">
                  {leads.filter(l => l.status !== 'won' && l.status !== 'lost').length}
                </h2>
              </CardContent>
            </MotionCard>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            {/* Lead Creation Form */}
            <div className="lg:col-span-1 space-y-4">
              <MotionCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><PlusCircle className="text-primary h-5 w-5" /> New Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
                      <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Elon Musk" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</label>
                      <Input value={contact} onChange={e => setContact(e.target.value)} required placeholder="elon@x.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Source</label>
                      <Select value={source} onValueChange={setSource}>
                         <SelectTrigger><SelectValue placeholder="Source..."/></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Inbound">Inbound</SelectItem>
                            <SelectItem value="Outbound">Outbound</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Launch Lead 🚀</Button>
                  </form>
                </CardContent>
              </MotionCard>
            </div>

            {/* Kanban Board — scrolls horizontally on mobile/tablet, fits on lg+ */}
            <div className="lg:col-span-3 overflow-x-auto">
              <div className="grid grid-cols-5 gap-3 min-w-[900px]">
                {stages.map((stage) => {
                  const stageLeads = leads.filter(l => l.status === stage);
                  return (
                    <div key={stage} className="flex flex-col h-[600px] border border-border/50 bg-card/30 rounded-xl overflow-hidden p-3 gap-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-bold text-sm uppercase tracking-wide px-2 py-1 bg-muted rounded">{stage}</h3>
                        <span className="text-xs font-bold text-muted-foreground">{stageLeads.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 p-1">
                        {stageLeads.map(lead => (
                          <div 
                            key={lead.id} 
                            onClick={() => handleOpenLead(lead)}
                            className="p-3 bg-card border border-border hover:border-primary/50 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md"
                          >
                            <h4 className="font-bold text-sm">{lead.name}</h4>
                            <p className="text-xs text-muted-foreground truncate mb-3">{lead.contact}</p>
                            <div className="flex justify-between items-center gap-1 flex-wrap">
                              {stage === 'qualified' ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-6 text-xs px-2 bg-green-500 hover:bg-green-600 text-white"
                                    onClick={(e) => { e.stopPropagation(); setConvertingLeadId(lead.id); }}
                                  >
                                    Won <IndianRupee className="w-3 h-3 ml-1" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs px-2 border-red-500/40 text-red-500 hover:bg-red-500/10"
                                    onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'lost'); }}
                                  >
                                    Lost
                                  </Button>
                                </>
                              ) : stage === 'won' || stage === 'lost' ? (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${stage === 'won' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}`}>
                                  {stage}
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 text-xs px-2"
                                  onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, stages[stages.indexOf(stage) + 1]); }}
                                >
                                  Advance &rarr;
                                </Button>
                              )}
                              {lead.source && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{lead.source}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      <Dialog open={convertingLeadId !== null} onOpenChange={(o) => !o && setConvertingLeadId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convert to Deal</DialogTitle></DialogHeader>
          <form onSubmit={handleConvert} className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Projected Value (₹)</label>
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
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Seal IT!</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeLead !== null} onOpenChange={(o) => !o && setActiveLead(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl flex items-center justify-between">
              <div>
                {activeLead?.name}
                <p className="text-sm text-muted-foreground font-normal mt-1">{activeLead?.contact}</p>
              </div>
              <Badge variant="secondary" className="uppercase text-xs">{activeLead?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <h4 className="font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Activity & Responses</h4>
            {leadResponses.map(res => (
              <div key={res.id} className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm">
                <p className="text-foreground">{res.note}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{new Date(res.created_at).toLocaleString()}</span>
              </div>
            ))}
            {leadResponses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No responses logged yet.</p>
            )}
          </div>
          
          <div className="border-t pt-4">
             <form onSubmit={handleAddNote} className="flex gap-2">
               <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Logged a call, sent an email..." required />
               <Button type="submit">Log Activity</Button>
             </form>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// Ensure Badge is imported (Missing in top block, I will just add the fallback line here)
function Badge({ children, variant, className }: any) {
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${className} ${variant==='secondary'?'bg-muted text-foreground':'bg-primary text-white'}`}>{children}</span>;
}
