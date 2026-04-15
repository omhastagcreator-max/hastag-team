import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, endOfDay, subWeeks, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface EmployeePerformance {
  user_id: string;
  name: string;
  email: string;
  totalHours: number;
  totalBreakHours: number;
  activeStatus: boolean;
}

export function EmployeePerformancePanel() {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerformance();
  }, [timeRange, dateRange]);

  const fetchPerformance = async () => {
    setLoading(true);

    let startDate: Date;
    let endDate: Date = new Date();

    if (timeRange === 'daily') {
      startDate = startOfDay(new Date());
    } else if (timeRange === 'weekly') {
      startDate = subWeeks(new Date(), 1);
    } else if (timeRange === 'monthly') {
      startDate = subMonths(new Date(), 1);
    } else if (timeRange === 'custom') {
      if (!dateRange?.from) return;
      startDate = startOfDay(dateRange.from);
      endDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    } else {
      startDate = startOfDay(new Date());
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const { data: profiles } = await supabase.from('profiles').select('user_id, name, email');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const { data: sessions } = await supabase
      .from('sessions')
      .select('user_id, start_time, end_time, break_time')
      .gte('start_time', startIso)
      .lte('start_time', endIso);

    const employeeUserIds = (roles || []).filter((r) => r.role === 'employee').map((r) => r.user_id);

    const summaries: EmployeePerformance[] = (profiles || [])
      .filter((p) => employeeUserIds.includes(p.user_id))
      .map((p) => {
        const userSessions = (sessions || []).filter((s) => s.user_id === p.user_id);
        let totalWorkedMinutes = 0;
        let totalBreakMinutes = 0;
        let isActive = false;

        userSessions.forEach((s) => {
          const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
          const start = new Date(s.start_time).getTime();
          const breakMin = s.break_time || 0;
          
          totalWorkedMinutes += Math.max(0, (end - start) / 60000 - breakMin);
          totalBreakMinutes += breakMin;

          if (!s.end_time && timeRange === 'daily') {
            isActive = true;
          }
        });

        return {
          user_id: p.user_id,
          name: p.name || p.email,
          email: p.email,
          totalHours: totalWorkedMinutes / 60,
          totalBreakHours: totalBreakMinutes / 60,
          activeStatus: isActive,
        };
      });

    setEmployees(summaries.sort((a, b) => b.totalHours - a.totalHours));
    setLoading(false);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Employee Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            {timeRange === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[260px] justify-start text-left font-normal h-8">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="text-muted-foreground text-center py-6 text-sm">Loading…</p>
        ) : employees.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">No performance data for this period.</p>
        ) : (
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {employees.map((emp) => (
              <button
                key={emp.user_id}
                onClick={() => navigate(`/admin/employees/${emp.user_id}`)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{emp.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{emp.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="flex flex-col text-right">
                    <span className="font-mono tabular-nums text-foreground">{emp.totalHours.toFixed(1)}h worked</span>
                    {emp.totalBreakHours > 0 && <span className="font-mono tabular-nums text-muted-foreground text-[10px]">{emp.totalBreakHours.toFixed(1)}h break</span>}
                  </div>
                  {emp.activeStatus && (
                    <Badge className="bg-green-500/15 text-green-600 border-0 ml-2">Active</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
