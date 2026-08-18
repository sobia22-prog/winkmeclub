import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no items to display.',
  icon = <Inbox className="w-10 h-10 text-slate-500" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-brand-surface/40 border border-dashed border-brand-border rounded-2xl">
      <div className="p-4 bg-brand-card rounded-2xl mb-4 border border-brand-border">{icon}</div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
};
