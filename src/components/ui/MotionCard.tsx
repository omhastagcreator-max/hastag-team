import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface MotionCardProps extends ComponentProps<typeof Card> {
  delay?: number;
}

/**
 * Quiet MotionCard.
 *
 * UI/UX cleanup pass — the previous version applied a 3D tilt, mouse-tracking
 * springs, hover gradients, and a glass shimmer. That added visual noise on
 * every dashboard tile and slowed perceived interaction.
 *
 * The new version keeps a single, calm fade-in (300ms) and otherwise behaves
 * as a plain Card. No motion on hover, no tilt, no gradient overlay.
 */
export const MotionCard = ({ children, className, delay = 0, ...props }: MotionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={cn('h-full', className)}
    >
      <Card
        className={cn(
          'h-full border border-border/60 bg-card transition-colors hover:border-border',
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};
