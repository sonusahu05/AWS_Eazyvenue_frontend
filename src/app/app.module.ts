import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { CustomFormsModule } from 'ng2-validation';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FullCalendarModule } from '@fullcalendar/angular';
import { GalleriaModule } from 'primeng/galleria';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { LightboxModule } from 'primeng/lightbox';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { SidebarModule } from 'primeng/sidebar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { AngMusicPlayerModule } from 'ang-music-player';
import { VimeModule } from '@vime/angular';
//import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { AppCodeModule } from './app.code.component';
import { AboutUsComponent } from './frontend/about-us/about-us.component';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AppConfigComponent } from './app.config.component';
import { AppRightpanelComponent } from './app.rightpanel.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { BannerComponent } from './manage/banner/banner.component';
import { BannerAddComponent } from './manage/banner/add/add.component';
import { BannerEditComponent } from './manage/banner/edit/edit.component';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { FormLayoutDemoComponent } from './demo/view/formlayoutdemo.component';
import { FloatLabelDemoComponent } from './demo/view/floatlabeldemo.component';
import { InvalidStateDemoComponent } from './demo/view/invalidstatedemo.component';
import { InputDemoComponent } from './demo/view/inputdemo.component';
import { ButtonDemoComponent } from './demo/view/buttondemo.component';
import { BlogComponent } from './frontend/blog/blog.component';
import { ContactUsComponent } from './frontend/contact-us/contact-us.component';
import { TableDemoComponent } from './demo/view/tabledemo.component';
import { ListDemoComponent } from './demo/view/listdemo.component';
import { AppTimelineDemoComponent } from './pages/app.timelinedemo.component';
import { TreeDemoComponent } from './demo/view/treedemo.component';
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
import { AppInvoiceComponent } from './pages/app.invoice.component';
import { AppHelpComponent } from './pages/app.help.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';
import { AppErrorComponent } from './pages/app.error.component';
import { AppAccessdeniedComponent } from './pages/app.accessdenied.component';
import { AppLoginComponent } from './pages/app.login.component';
import { CalendarComponent } from './manage/calendar/calendar.component';
import { CountryService } from './demo/service/countryservice';
import { CustomerService } from './demo/service/customerservice';
import { EventService } from './demo/service/eventservice';
import { IconService } from './demo/service/iconservice';
import { NodeService } from './demo/service/nodeservice';
import { PhotoService } from './demo/service/photoservice';
import { ProductService } from './demo/service/productservice';
import { MenuService } from './app.menu.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { PrivacypolicyComponent } from './frontend/privacy-policy/privacy-policy.component';
import { PolicyComponent } from './frontend/policy/policy.component';
import { ServicesComponent } from './frontend/services/services.component';
import { LoaderService } from './services/loader.service';
import { LoaderInterceptor } from './_helpers/loader-interceptor.service';
import { LoaderComponent } from './pages/loader/loader.component';
import { FrontendComponent } from './frontend/frontend.component';
import { HeaderComponent } from './frontend/header/header.component';
import { FooterComponent } from './frontend/footer/footer.component';
import { HomeComponent } from './frontend/home/home.component';
import { NavigationComponent } from './frontend/navigation/navigation.component';
import { RecentBlockComponent } from './frontend/recent-block/recent-block.component';
import { AgentsComponent } from './frontend/agents/agents.component';
import { AuthInterceptor } from './_helpers/auth.interceptor';
import { ManageComponent } from './manage/manage.component';
import { AdminLoginComponent } from './manage/login/login.component';
import { AdminComponent } from './manage/admin/admin.component';
import { AdminAddComponent } from './manage/admin/add/add.component';
import { AdminEditComponent } from './manage/admin/edit/edit.component';
import { AdminViewComponent } from './manage/admin/view/view.component';
import { SlotManagementComponent } from './manage/slotmanagement/slot.component';
import { AddVenueSlotManagementComponent } from './manage/slotmanagement/add/add.component';
import { EditVenueSlotManagementComponent } from './manage/slotmanagement/edit/edit.component';
import { VenueSlotAvailabilityComponent } from './manage/venue/slot-availability/slot-availability.component';
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

import { FrontendCategoryComponent } from './frontend/category/category.component';
import { SignInComponent } from './frontend/sign-in/sign-in.component';
import { UserComponent } from './manage/user/user.component';
import { UserAddComponent } from './manage/user/add/add.component';
import { UserEditComponent } from './manage/user/edit/edit.component';
import { UserViewComponent } from './manage/user/view/view.component';
import { VenueListComponent } from './frontend/venue-list/venue-list.component';
import { VenueDetailsComponent } from './frontend/venue-details/venue-details.component';
import { VenueCategoryListComponent } from './frontend/venue-category-list/venue-category-list.component';
import { MyAccountComponent } from './frontend/my-account/my-account.component';
import { UserMyAccountEditComponent } from './frontend/my-account/edit/edit.component';
import { OrdersComponent } from './frontend/my-account/orders/orders.component';
import { ViewCustomerVenueOrderComponent } from './frontend/my-account/orders/view/view.component';
import { ViewCustomerVenueAvailabilityComponent } from './frontend/my-account/availability/view/view.component';
import { EventplannerListComponent } from './manage/eventmanager/list/list.component';
import { ResetPasswordComponent } from './frontend/reset-password/reset-password.component';
import { WishlistComponent } from './manage/wishlist/wishlist.component';
import { compareVenue } from './frontend/compare/compare.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgOtpInputModule } from 'ng-otp-input';
import { FilterPipe } from './filter.pipe';
import { TermsComponent } from './frontend/terms/terms.component';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AvailabilityComponent } from './frontend/my-account/availability/availability.component';
import { VendorFilterListComponent } from './frontend/vendor-filter-list/vendor-filter-list.component';
import { VendorDetailsComponent } from './frontend/vendor-details/vendor-details.component';
import { VendorCompareComponent } from './frontend/vendor-compare/vendor-compare.component';
import { CancellationComponent } from './frontend/cancellation/cancellation.component';
import { FaqComponent } from './frontend/faq/faq.component';
import { HotMuhuratsComponent } from './frontend/hot-muhrats/muhrats.component';
FullCalendarModule.registerPlugins([
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
]);

@NgModule({
    imports: [
        BrowserModule,
        AngMusicPlayerModule,
        // VimeModule,
        //NgxAudioPlayerModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        AvatarGroupModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CustomFormsModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        ChartModule,
        CheckboxModule,
        ChipsModule,
        ChipModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        DragDropModule,
        FieldsetModule,
        FileUploadModule,
        FullCalendarModule,
        GalleriaModule,
        InplaceModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        KnobModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        RippleModule,
        ScrollPanelModule,
        ScrollTopModule,
        SelectButtonModule,
        SkeletonModule,
        SidebarModule,
        SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SplitterModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TagModule,
        TerminalModule,
        TieredMenuModule,
        TimelineModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,
        AppCodeModule,
        VimeModule,
        InfiniteScrollModule,
        NgOtpInputModule,
        NgxOtpInputModule,
        NgxSliderModule,
    ],
    declarations: [
        AboutUsComponent,
        AppComponent,
        FaqComponent,
        AppMainComponent,
        AppRightpanelComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppConfigComponent,
        AppTopBarComponent,
        AppFooterComponent,
        DashboardDemoComponent,
        FormLayoutDemoComponent,
        FloatLabelDemoComponent,
        InvalidStateDemoComponent,
        InputDemoComponent,
        BlogComponent,
        ButtonDemoComponent,
        SignInComponent,
        CalendarComponent,
        ContactUsComponent,
        TableDemoComponent,
        ListDemoComponent,
        TreeDemoComponent,
        PanelsDemoComponent,
        OverlaysDemoComponent,
        MediaDemoComponent,
        MenusDemoComponent,
        MessagesDemoComponent,
        MessagesDemoComponent,
        MiscDemoComponent,
        ChartsDemoComponent,
        EmptyDemoComponent,
        FileDemoComponent,
        DocumentationComponent,
        DisplayComponent,
        ElevationComponent,
        FlexboxComponent,
        GridComponent,
        IconsComponent,
        WidgetsComponent,
        SpacingComponent,
        TypographyComponent,
        TextComponent,
        AppCrudComponent,
        AppCalendarComponent,
        AppLoginComponent,
        AppInvoiceComponent,
        AppHelpComponent,
        AppNotfoundComponent,
        AppErrorComponent,
        AppTimelineDemoComponent,
        AppAccessdeniedComponent,
        SlotManagementComponent,
        AddVenueSlotManagementComponent,
        EditVenueSlotManagementComponent,
        VenueSlotAvailabilityComponent,
        EventplannerListComponent,
        BannerComponent,
        BannerAddComponent,
        BannerEditComponent,
        HomeComponent,
        FrontendComponent,
        HeaderComponent,
        NavigationComponent,
        CategoryComponent,
        RecentBlockComponent,
        AgentsComponent,
        VenueorderListComponent,
        ViewvenueorderComponent,
        FooterComponent,
        LoaderComponent,
        ManageComponent,
        AdminLoginComponent,
        AdminComponent,
        AdminAddComponent,
        AdminEditComponent,
        AdminViewComponent,
        EmptyComponent,
        RoleComponent,
        RoleAddComponent,
        RoleEditComponent,
        RoleViewComponent,
        FrontendCategoryComponent,
        CategoryAddComponent,
        CategoryEditComponent,
        CategoryViewComponent,
        SubcategoryComponent,
        SubcategoryAddComponent,
        SubcategoryEditComponent,
        SubcategoryViewComponent,
        UserComponent,
        PrivacypolicyComponent,
        PolicyComponent,
        TermsComponent,
        HotMuhuratsComponent,
        ServicesComponent,
        UserAddComponent,
        UserEditComponent,
        UserViewComponent,
        VenueListComponent,
        VenueDetailsComponent,
        VenueCategoryListComponent,
        MyAccountComponent,
        UserMyAccountEditComponent,
        OrdersComponent,
        ViewCustomerVenueOrderComponent,
        ResetPasswordComponent,
        WishlistComponent,
        compareVenue,
        FilterPipe,
        AvailabilityComponent,
        ViewCustomerVenueAvailabilityComponent,
        VendorFilterListComponent,
        VendorDetailsComponent,
        VendorCompareComponent,
        CancellationComponent,
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,
        MenuService,
        AppMainComponent,
        AppComponent,
        LoaderService,
        // REQUIRED IF YOU USE JWT AUTHENTICATION
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoaderInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
