import React, { Suspense } from 'react';
import { SkeletonCard } from './ui/skeleton';
import LoadingSpinner from './ui/loading-spinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <SkeletonCard /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Specific fallbacks for different component types
export const LazyWrapperWithSpinner: React.FC<LazyWrapperProps> = ({ children }) => (
  <LazyWrapper fallback={
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  }>
    {children}
  </LazyWrapper>
);

export const LazyWrapperWithSkeleton: React.FC<LazyWrapperProps> = ({ children }) => (
  <LazyWrapper fallback={<SkeletonCard />}>
    {children}
  </LazyWrapper>
);

export default LazyWrapper;
