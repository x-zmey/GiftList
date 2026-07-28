import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TabsContext = createContext<{ value: string; onChange: (v: string) => void }>({ value: '', onChange: () => {} });

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1',
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
        className
      )}
      onClick={() => ctx.onChange(value)}
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn('mt-4', className)} {...props} />;
}
