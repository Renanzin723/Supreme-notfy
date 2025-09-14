import { lazy } from 'react';

// Lazy load heavy components
export const LazyNotificationExamples = lazy(() => 
  import('../NotificationExamples').then(module => ({
    default: module.default
  }))
);

export const LazyNotificationPreview = lazy(() => 
  import('../memoized/NotificationPreview').then(module => ({
    default: module.default
  }))
);

export const LazyDeviceStatusCard = lazy(() => 
  import('../memoized/DeviceStatusCard').then(module => ({
    default: module.default
  }))
);

// Lazy load admin components
export const LazyAdminDashboard = lazy(() => 
  import('../../pages/admin/AdminDashboardSimple').then(module => ({
    default: module.default
  }))
);

export const LazyAdminUsers = lazy(() => 
  import('../../pages/admin/AdminUsersSimple').then(module => ({
    default: module.default
  }))
);

export const LazyAdminSubscriptions = lazy(() => 
  import('../../pages/admin/AdminSubscriptionsSimple').then(module => ({
    default: module.default
  }))
);

// Lazy load brand pages
export const LazyBrandNubank = lazy(() => 
  import('../../pages/BrandNubank').then(module => ({
    default: module.default
  }))
);

export const LazyBrandSantander = lazy(() => 
  import('../../pages/BrandSantander').then(module => ({
    default: module.default
  }))
);

export const LazyBrandItau = lazy(() => 
  import('../../pages/BrandItau').then(module => ({
    default: module.default
  }))
);

export const LazyBrandInter = lazy(() => 
  import('../../pages/BrandInter').then(module => ({
    default: module.default
  }))
);

export const LazyBrandC6 = lazy(() => 
  import('../../pages/BrandC6').then(module => ({
    default: module.default
  }))
);

export const LazyBrandUtmify = lazy(() => 
  import('../../pages/BrandUtmify').then(module => ({
    default: module.default
  }))
);
