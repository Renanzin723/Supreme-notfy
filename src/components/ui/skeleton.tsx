import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Predefined skeleton components
const SkeletonCard: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const SkeletonButton: React.FC = () => (
  <Skeleton className="h-10 w-24" />
);

const SkeletonInput: React.FC = () => (
  <Skeleton className="h-10 w-full" />
);

const SkeletonAvatar: React.FC = () => (
  <Skeleton className="h-10 w-10 rounded-full" />
);

const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

export {
  Skeleton,
  SkeletonCard,
  SkeletonButton,
  SkeletonInput,
  SkeletonAvatar,
  SkeletonText
};