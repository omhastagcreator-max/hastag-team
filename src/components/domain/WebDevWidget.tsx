import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingBag, Server, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function WebDevWidget() {
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Configure Custom Domain & DNS', done: true, icon: <Server className="h-4 w-4" /> },
    { id: 2, label: 'CRO Optimization & Speed Test', done: false, icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 3, label: 'Payment Gateway Integration', done: false, icon: <ShieldCheck className="h-4 w-4" /> },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5 bg-gradient-to-br from-card to-blue-500/5">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center text-lg gap-2 text-blue-500">
          <ShoppingBag className="h-5 w-5" />
          Shopify Pre-Launch Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {tasks.map((task) => (
          <motion.div 
            key={task.id} 
            whileHover={{ scale: 1.01 }}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${task.done ? 'bg-blue-500/10 border-blue-500/20 text-muted-foreground' : 'bg-background hover:bg-muted border-border/50'}`}
            onClick={() => toggleTask(task.id)}
          >
            <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} className={task.done ? 'data-[state=checked]:bg-blue-500' : ''} />
            <div className={`flex items-center gap-2 font-medium text-sm ${task.done ? 'line-through' : 'text-foreground'}`}>
              <span className={task.done ? 'text-blue-500/50' : 'text-blue-500'}>{task.icon}</span>
              {task.label}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
