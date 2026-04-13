import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

/**
 * Minimal comment system per UI/UX brief §7:
 *   - Input box, list of comments, timestamp, user name. No chat-like UI.
 *
 * Stateless / presentational. Pass `comments` and `onAdd`. Submitting clears
 * the input optimistically; persistence is the parent's responsibility.
 */

export interface CommentItem {
  id: string;
  user_name: string;
  body: string;
  created_at: string;
}

interface CommentListProps {
  comments: CommentItem[];
  onAdd?: (body: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function CommentList({ comments, onAdd, placeholder = 'Write a comment…', disabled }: CommentListProps) {
  const [draft, setDraft] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || !onAdd) return;
    setDraft('');
    await onAdd(value);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border border-border rounded-md p-3 bg-card">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium truncate">{c.user_name}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {format(new Date(c.created_at), 'MMM dd, HH:mm')}
                </span>
              </div>
              <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))
        )}
      </div>

      {onAdd && (
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={disabled || !draft.trim()}>Post</Button>
        </form>
      )}
    </div>
  );
}
