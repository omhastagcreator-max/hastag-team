import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, CheckCircle2, CircleDashed } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContentWidget({ brands }: { brands: any[] }) {
  return (
    <Card className="border-pink-500/20 shadow-lg shadow-pink-500/5 bg-gradient-to-br from-card to-pink-500/5">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center text-lg gap-2 text-pink-500">
          <Video className="h-5 w-5" />
          Influencer Video Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {brands.map((brand, i) => {
          // Mock video logic
          const hasVideos = i % 3 !== 0; // 2/3 of them have videos
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
              <Badge variant="outline" className={`gap-1 border ${hasVideos ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"}`}>
                {hasVideos ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
                {hasVideos ? 'Videos Created' : 'Pending Creator'}
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
