import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        visa: 'border-transparent bg-indigo-100 text-indigo-700',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-amber-100 text-amber-800',
        danger: 'border-transparent bg-red-100 text-red-700',
        ai: 'border-violet-200 bg-violet-50 text-violet-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
