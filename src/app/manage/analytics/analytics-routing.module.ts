// import { NgModule } from '@angular/core';
// import { Routes, RouterModule } from '@angular/router';

// const routes: Routes = [
//   {
//     path: 'geography',
//     loadChildren: () => import('./geography/analytics.module').then(m => m.AnalyticsModule),
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class AnalyticsMainRoutingModule { }




// new SSR friendly code
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// 🌐 Define child routes for the Analytics feature module.
// ✅ Using lazy loading, which is compatible with Angular Universal (SSR)
const routes: Routes = [
  {
    path: 'geography',
    // Lazy-loads the AnalyticsModule only when /geography is accessed.
    // This reduces initial bundle size and improves performance.
    loadChildren: () =>
      import('./geography/analytics.module').then(m => m.AnalyticsModule),
  }
];

@NgModule({
  // Use forChild because this routing module is part of a feature module
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsMainRoutingModule { }
