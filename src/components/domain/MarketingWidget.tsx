import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function MarketingWidget({ brands }: { brands: any[] }) {
  return (
    <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5 bg-gradient-to-br from-card to-purple-500/5">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center text-lg gap-2 text-purple-500">
          <Megaphone className="h-5 w-5" />
          Brand Campaign Status Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {brands.map((brand, i) => {
          // Mock active status logic: alternating items
          const isActive = i % 2 === 0;
          return (
            <motion.div 
              key={brand.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm">{brand.name}</span>
                <span className="text-xs text-muted-foreground">{brand.project_type}</span>
              </div>
              <Badge variant={isActive ? "default" : "secondary"} className={`gap-1 ${isActive ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-muted text-muted-foreground"}`}>
                <Activity className="h-3 w-3" />
                {isActive ? 'Campaigns Running' : 'Idle'}
              </Badge>
            </motion.div>
          );
        })}
        {brands.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No active brands assigned to you.</p>
        )}
      </CardContent>
    </Card>
  );
}
