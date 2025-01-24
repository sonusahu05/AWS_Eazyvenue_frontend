import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { FormLayoutDemoComponent } from './demo/view/formlayoutdemo.component';
import { InvalidStateDemoComponent } from './demo/view/invalidstatedemo.component';
import { FloatLabelDemoComponent } from './demo/view/floatlabeldemo.component';
import { PanelsDemoComponent } from './demo/view/panelsdemo.component';
import { OverlaysDemoComponent } from './demo/view/overlaysdemo.component';
import { MediaDemoComponent } from './demo/view/mediademo.component';
import { MenusDemoComponent } from './demo/view/menusdemo.component';
import { MessagesDemoComponent } from './demo/view/messagesdemo.component';
import { MiscDemoComponent } from './demo/view/miscdemo.component';
import { EmptyDemoComponent } from './demo/view/emptydemo.component';
import { ChartsDemoComponent } from './demo/view/chartsdemo.component';
import { FileDemoComponent } from './demo/view/filedemo.component';
import { DocumentationComponent } from './demo/view/documentation.component';
import { AppMainComponent } from './app.main.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';
import { AppErrorComponent } from './pages/app.error.component';
import { AppAccessdeniedComponent } from './pages/app.accessdenied.component';
import { AppLoginComponent } from './pages/app.login.component';
import { InputDemoComponent } from './demo/view/inputdemo.component';
import { ButtonDemoComponent } from './demo/view/buttondemo.component';
import { TableDemoComponent } from './demo/view/tabledemo.component';
import { ListDemoComponent } from './demo/view/listdemo.component';
import { TreeDemoComponent } from './demo/view/treedemo.component';
import { DisplayComponent } from './utilities/display.component';
import { ElevationComponent } from './utilities/elevation.component';
import { FlexboxComponent } from './utilities/flexbox.component';
import { GridComponent } from './utilities/grid.component';
import { IconsComponent } from './utilities/icons.component';
import { WidgetsComponent } from './utilities/widgets.component';
import { SpacingComponent } from './utilities/spacing.component';
import { TypographyComponent } from './utilities/typography.component';
import { TextComponent } from './utilities/text.component';
import { AppCrudComponent } from './pages/app.crud.component';
import { AppCalendarComponent } from './pages/app.calendar.component';
import { AppTimelineDemoComponent } from './pages/app.timelinedemo.component';
import { AppInvoiceComponent } from './pages/app.invoice.component';
import { AppHelpComponent } from './pages/app.help.component';
import { HomeComponent } from './frontend/home/home.component';
import { FrontendComponent } from './frontend/frontend.component';
import { PrivacypolicyComponent } from './frontend/privacy-policy/privacy-policy.component';
import { PolicyComponent } from './frontend/policy/policy.component';
import { TermsComponent } from './frontend/terms/terms.component';
import { HotMuhuratsComponent } from './frontend/hot-muhrats/muhrats.component';
import { ServicesComponent } from './frontend/services/services.component';
import { AdminComponent } from './manage/admin/admin.component';
import { AdminAddComponent } from './manage/admin/add/add.component';
import { AdminEditComponent } from './manage/admin/edit/edit.component';
import { AdminViewComponent } from './manage/admin/view/view.component';
import { VenueSlotAvailabilityComponent } from './manage/venue/slot-availability/slot-availability.component';
import { SlotManagementComponent } from './manage/slotmanagement/slot.component';
import { AddVenueSlotManagementComponent } from './manage/slotmanagement/add/add.component';
import { EditVenueSlotManagementComponent } from './manage/slotmanagement/edit/edit.component';
import { BannerComponent } from './manage/banner/banner.component';
import { BannerAddComponent } from './manage/banner/add/add.component';
import { BannerEditComponent } from './manage/banner/edit/edit.component';
import { CalendarComponent } from './manage/calendar/calendar.component';
import { EmptyComponent } from './manage/empty/empty.component';
import { RoleComponent } from './manage/role/role.component';
import { RoleAddComponent } from './manage/role/add/add.component';
import { RoleEditComponent } from './manage/role/edit/edit.component';
import { RoleViewComponent } from './manage/role/view/view.component';
import { CategoryComponent } from './manage/category/category.component';
import { CategoryAddComponent } from './manage/category/add/add.component';
import { CategoryEditComponent } from './manage/category/edit/edit.component';
import { CategoryViewComponent } from './manage/category/view/view.component';
import { SubcategoryComponent } from './manage/subcategory/subcategory.component';
import { SubcategoryAddComponent } from './manage/subcategory/add/add.component';
import { SubcategoryEditComponent } from './manage/subcategory/edit/edit.component';
import { SubcategoryViewComponent } from './manage/subcategory/view/view.component';
import { VenueorderListComponent } from './manage/venue/venueorder/list/list.component';
import { ViewvenueorderComponent } from './manage/venue/venueorder/view/view.component';
import { AuthGuard } from './services/auth.guard';
import { AboutUsComponent } from './frontend/about-us/about-us.component';
import { ContactUsComponent } from './frontend/contact-us/contact-us.component';
import { BlogComponent } from './frontend/blog/blog.component';
import { SignInComponent } from './frontend/sign-in/sign-in.component';
import { UserComponent } from './manage/user/user.component';
import { UserAddComponent } from './manage/user/add/add.component';
import { UserEditComponent } from './manage/user/edit/edit.component';
import { UserViewComponent } from './manage/user/view/view.component';
import { VenueDetailsComponent } from './frontend/venue-details/venue-details.component';
import { VenueCategoryListComponent } from './frontend/venue-category-list/venue-category-list.component';
import { AvailabilityComponent } from './frontend/my-account/availability/availability.component';
import { ViewCustomerVenueAvailabilityComponent } from './frontend/my-account/availability/view/view.component';
import { MyAccountComponent } from './frontend/my-account/my-account.component';
import { UserMyAccountEditComponent } from './frontend/my-account/edit/edit.component';
import { OrdersComponent } from './frontend/my-account/orders/orders.component';
import { ViewCustomerVenueOrderComponent } from './frontend/my-account/orders/view/view.component';
import { EventplannerListComponent } from './manage/eventmanager/list/list.component';
import { ResetPasswordComponent } from './frontend/reset-password/reset-password.component';
import { WishlistComponent } from './manage/wishlist/wishlist.component';
import { compareVenue } from './frontend/compare/compare.component';
import { VendorFilterListComponent } from './frontend/vendor-filter-list/vendor-filter-list.component';
import { VendorDetailsComponent } from './frontend/vendor-details/vendor-details.component';
import { VendorCompareComponent } from './frontend/vendor-compare/vendor-compare.component';
import { CancellationComponent } from './frontend/cancellation/cancellation.component';
@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: FrontendComponent,
                    canActivateChild: [AuthGuard],
                    data: {
                        role: ['user'],
                    },
                    children: [
                        { path: '', component: HomeComponent },
                        { path: 'about-us', component: AboutUsComponent },
                        {
                            path: 'cancellation',
                            component: CancellationComponent,
                        },
                        { path: 'contact-us', component: ContactUsComponent },
                        {
                            path: 'privacy-policy',
                            component: PrivacypolicyComponent,
                        },
                        { path: 'terms', component: TermsComponent },
                        {
                            path: 'hot-muhrats',
                            component: HotMuhuratsComponent,
                        },
                        { path: 'policy', component: PolicyComponent },
                        { path: 'services', component: ServicesComponent },
                        { path: 'blog', component: BlogComponent },
                        { path: 'sign-in', component: SignInComponent },
                        // { path: 'venue/:id', component: VenueDetailsComponent },
                        // Venue Details
                        {
                            path: 'venue/:metaurl',
                            component: VenueDetailsComponent,
                        },
                        //venue list
                        // { path: 'venue', component: VenueCategoryListComponent },
                        {
                            path: 'banquet-halls',
                            component: VenueCategoryListComponent,
                        },
                        //venue list with occasion
                        {
                            path: 'banquet-halls/:occasion',
                            component: VenueCategoryListComponent,
                        },
                        //venue list with occasion and city
                        {
                            path: 'banquet-halls/:occasion/:city',
                            component: VenueCategoryListComponent,
                        },
                        //venue list with occasion and city and subarea
                        {
                            path: 'banquet-halls/:occasion/:city/:subarea',
                            component: VenueCategoryListComponent,
                        },
                        //vendor Details Screen
                        {
                            path: 'vendor-detail/:location/:category/:metaurl',
                            component: VendorDetailsComponent,
                        },

                        {
                            path: 'vendor',
                            component: VendorFilterListComponent,
                        },
                        {
                            path: 'vendor/:category',
                            component: VendorFilterListComponent,
                        },
                        {
                            path: 'vendor/:category/:city',
                            component: VendorFilterListComponent,
                        },
                        {
                            path: 'vendor/:category/:city/:subarea',
                            component: VendorFilterListComponent,
                        },

                        { path: 'my-profile', component: MyAccountComponent },
                        {
                            path: 'edit-my-profile/:id',
                            component: UserMyAccountEditComponent,
                        },
                        { path: 'order', component: OrdersComponent },
                        {
                            path: 'availability',
                            component: AvailabilityComponent,
                        },
                        {
                            path: 'venue-order/view/:id',
                            component: ViewCustomerVenueOrderComponent,
                        },
                        {
                            path: 'venue-availability/view/:id',
                            component: ViewCustomerVenueAvailabilityComponent,
                        },
                        {
                            path: 'auth/reset-pass/:token',
                            component: ResetPasswordComponent,
                        },
                        { path: 'compare', component: compareVenue },
                        {
                            path: 'compare-vendor',
                            component: VendorCompareComponent,
                        },
                    ],
                },
                { path: '', redirectTo: '/manage', pathMatch: 'full' },
                {
                    path: 'manage',
                    component: AppMainComponent,
                    canActivate: [AuthGuard],
                    canActivateChild: [AuthGuard],
                    data: {
                        role: ['admin', 'vendor', 'venueowner'],
                    },
                    children: [
                        {
                            path: 'dashboard',
                            component: DashboardDemoComponent,
                        },
                        { path: 'admin', component: AdminComponent },
                        { path: 'admin/add', component: AdminAddComponent },
                        { path: 'admin/:id', component: AdminEditComponent },
                        {
                            path: 'admin/view/:id',
                            component: AdminViewComponent,
                        },
                        { path: 'empty', component: EmptyComponent },
                        { path: 'role', component: RoleComponent },
                        { path: 'role/add', component: RoleAddComponent },
                        { path: 'role/:id', component: RoleEditComponent },
                        { path: 'role/view/:id', component: RoleViewComponent },
                        {
                            path: 'category/category',
                            component: CategoryComponent,
                        },
                        {
                            path: 'category/category/add',
                            component: CategoryAddComponent,
                        },
                        {
                            path: 'category/category/:id',
                            component: CategoryEditComponent,
                        },
                        {
                            path: 'category/category/view/:id',
                            component: CategoryViewComponent,
                        },
                        {
                            path: 'category/subcategory',
                            component: SubcategoryComponent,
                        },
                        {
                            path: 'category/subcategory/add',
                            component: SubcategoryAddComponent,
                        },
                        {
                            path: 'category/subcategory/:id',
                            component: SubcategoryEditComponent,
                        },
                        {
                            path: 'category/subcategory/view/:id',
                            component: SubcategoryViewComponent,
                        },
                        { path: 'customer/user', component: UserComponent },
                        {
                            path: 'customer/user/add',
                            component: UserAddComponent,
                        },
                        {
                            path: 'customer/user/:id',
                            component: UserEditComponent,
                        },
                        {
                            path: 'customer/user/view/:id',
                            component: UserViewComponent,
                        },
                        {
                            path: 'cmsmodule',
                            loadChildren: () =>
                                import(
                                    './manage/cmsmodule/cmsmodule.module'
                                ).then((m) => m.CmsmoduleModule),
                        },
                        { path: 'banner', component: BannerComponent },
                        { path: 'banner/add', component: BannerAddComponent },
                        { path: 'banner/:id', component: BannerEditComponent },
                        { path: 'calendar', component: CalendarComponent },
                        {
                            path: 'customer/news-letter',
                            loadChildren: () =>
                                import(
                                    './manage/newsletter/newsletter.module'
                                ).then((m) => m.NewsLetterModule),
                        },
                        {
                            path: 'customer/contact-us',
                            loadChildren: () =>
                                import(
                                    './manage/contactus/contactus.module'
                                ).then((m) => m.ContactUsModule),
                        },
                        {
                            path: 'venue',
                            loadChildren: () =>
                                import('./manage/venue/venue.module').then(
                                    (m) => m.VenuemoduleModule
                                ),
                        },
                        {
                            path: 'vendor',
                            loadChildren: () =>
                                import('./manage/vendor/vendor.module').then(
                                    (m) => m.VendorModule
                                ),
                        },
                        {
                            path: 'caterer',
                            loadChildren: () =>
                                import('./manage/caterer/caterer.module').then(
                                    (m) => m.CatererModule
                                ),
                        },
                        {
                            path: 'customer/productreview',
                            loadChildren: () =>
                                import(
                                    './manage/productreview/productreview.module'
                                ).then((m) => m.ProductreviewModule),
                        },
                        {
                            path: 'customer/orderreview',
                            loadChildren: () =>
                                import(
                                    './manage/orderreview/orderreview.module'
                                ).then((m) => m.OrderreviewModule),
                        },
                        //{ path: 'location/country', loadChildren: () => import('./manage/country/country.module').then(m => m.CountryModule), },
                        {
                            path: 'venue/order/:venueid',
                            component: VenueorderListComponent,
                        },
                        {
                            path: 'venue/order/view/:venueid',
                            component: ViewvenueorderComponent,
                        },
                        // { path: 'venue/order/add', component: AddVenueSlotManagementComponent },
                        // { path: 'venue/order/:id', component: EditVenueSlotManagementComponent },
                        {
                            path: 'venue/slot',
                            component: SlotManagementComponent,
                        },
                        {
                            path: 'venue/slot/add',
                            component: AddVenueSlotManagementComponent,
                        },
                        {
                            path: 'venue/slot/:id',
                            component: EditVenueSlotManagementComponent,
                        },
                        {
                            path: 'venue/slot-availability/:id',
                            component: VenueSlotAvailabilityComponent,
                        },
                        {
                            path: 'eventplanner',
                            component: EventplannerListComponent,
                        },
                        {
                            path: 'location/state',
                            loadChildren: () =>
                                import('./manage/state/state.module').then(
                                    (m) => m.StateModule
                                ),
                        },
                        {
                            path: 'location/city',
                            loadChildren: () =>
                                import('./manage/city/city.module').then(
                                    (m) => m.CityModule
                                ),
                        },
                        {
                            path: 'location/subarea',
                            loadChildren: () =>
                                import('./manage/subarea/subarea.module').then(
                                    (m) => m.SubareaModule
                                ),
                        },
                        {
                            path: 'uikit/formlayout',
                            component: FormLayoutDemoComponent,
                        },
                        {
                            path: 'uikit/floatlabel',
                            component: FloatLabelDemoComponent,
                        },
                        {
                            path: 'uikit/invalidstate',
                            component: InvalidStateDemoComponent,
                        },
                        { path: 'uikit/input', component: InputDemoComponent },
                        {
                            path: 'uikit/button',
                            component: ButtonDemoComponent,
                        },
                        { path: 'uikit/table', component: TableDemoComponent },
                        { path: 'uikit/list', component: ListDemoComponent },
                        { path: 'uikit/tree', component: TreeDemoComponent },
                        { path: 'uikit/panel', component: PanelsDemoComponent },
                        {
                            path: 'uikit/overlay',
                            component: OverlaysDemoComponent,
                        },
                        { path: 'uikit/menu', component: MenusDemoComponent },
                        { path: 'uikit/media', component: MediaDemoComponent },
                        {
                            path: 'uikit/message',
                            component: MessagesDemoComponent,
                        },
                        { path: 'uikit/misc', component: MiscDemoComponent },
                        {
                            path: 'uikit/charts',
                            component: ChartsDemoComponent,
                        },
                        { path: 'uikit/file', component: FileDemoComponent },
                        {
                            path: 'utilities/display',
                            component: DisplayComponent,
                        },
                        {
                            path: 'utilities/elevation',
                            component: ElevationComponent,
                        },
                        {
                            path: 'utilities/flexbox',
                            component: FlexboxComponent,
                        },
                        { path: 'utilities/grid', component: GridComponent },
                        { path: 'utilities/icons', component: IconsComponent },
                        {
                            path: 'utilities/widgets',
                            component: WidgetsComponent,
                        },
                        {
                            path: 'utilities/spacing',
                            component: SpacingComponent,
                        },
                        {
                            path: 'utilities/typography',
                            component: TypographyComponent,
                        },
                        { path: 'utilities/text', component: TextComponent },
                        { path: 'pages/crud', component: AppCrudComponent },
                        {
                            path: 'pages/calendar',
                            component: AppCalendarComponent,
                        },
                        {
                            path: 'pages/timeline',
                            component: AppTimelineDemoComponent,
                        },
                        {
                            path: 'pages/invoice',
                            component: AppInvoiceComponent,
                        },
                        { path: 'pages/help', component: AppHelpComponent },
                        {
                            path: 'documentation',
                            component: DocumentationComponent,
                        },
                        { path: 'wishlist', component: WishlistComponent },
                    ],
                },
                { path: 'error', component: AppErrorComponent },
                { path: 'access', component: AppAccessdeniedComponent },
                { path: 'notfound', component: AppNotfoundComponent },
                { path: 'manage/login', component: AppLoginComponent },
                { path: 'manage/pages/empty', component: EmptyDemoComponent },
                // { path: '**', redirectTo: '/notfound' },
                { path: '**', redirectTo: '/' },
            ],
            { scrollPositionRestoration: 'enabled' }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
