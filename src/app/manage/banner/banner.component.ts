import { Component, OnInit, ViewChild } from '@angular/core';
import { BannerService } from '../../services/banner.service';
import { environment } from 'src/environments/environment';
const USER_API = environment.apiUrl;
import * as moment from "moment";
import { GalleriaModule } from 'primeng/galleria';
import { Table } from 'primeng/table';
import { Dropdown } from "primeng/dropdown";
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  styles: [`
    :host ::ng-deep .p-datatable-gridlines p-progressBar {
      width: 100%;
    }

    @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
        display: flex;
      }
    }

    .post-title-cell {
      max-width: 200px;
    }

    .post-slug {
      margin-top: 4px;
    }

    .post-excerpt {
      margin-top: 4px;
      color: #666;
    }

    .featured-order {
      margin-top: 4px;
      font-size: 0.8em;
      color: #007ad9;
    }

    .author-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .reading-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9em;
    }

    .tags-cell {
      max-width: 150px;
    }

    .tag-chip {
      font-size: 0.75em;
      height: 1.5rem;
    }

    .date-cell {
      position: relative;
    }

    .scheduled-indicator {
      margin-top: 4px;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
    }

    .summary-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .preview-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .preview-header {
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 1rem;
    }

    .preview-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9em;
      color: #666;
    }

    .preview-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .preview-content-body {
      margin: 2rem 0;
      line-height: 1.6;
    }

    .preview-instagram {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 2rem;
    }
  `],
  providers: [MessageService, ConfirmationService, TitleCasePipe, BannerService]
})
export class BannerComponent implements OnInit {
  // Existing properties
  productDialog: boolean;
  bannerlist: any[] = [];
  items: any[];
  totalCount: number;
  submitted: boolean;
  cols: any[];
  staticPath: string;
  totalRecords: number = 0;
  errorMessage = '';
  loading: boolean = true;
  adminRoleId: string;
  calvalue: Date;
  ucalvalue: Date;
  dcalvalue: Date;
  publishCalvalue: Date;

  // New properties for enhanced functionality
  postTypeFilter: any[] = [
    { label: 'All Types', value: null },
    { label: 'Regular Posts', value: 'regular' },
    { label: 'Featured Posts', value: 'featured' },
    { label: 'Instagram Posts', value: 'instagram' }
  ];

  selectedPostType: string = null;

  postTypes: any[] = [
    { name: 'Regular Post', value: 'regular' },
    { name: 'Featured Post', value: 'featured' },
    { name: 'Instagram Post', value: 'instagram' }
  ];

  categories: any[] = [
    { name: 'All Categories', value: null },
    { name: 'Technology', value: 'technology' },
    { name: 'Lifestyle', value: 'lifestyle' },
    { name: 'Travel', value: 'travel' },
    { name: 'Food', value: 'food' },
    { name: 'Fashion', value: 'fashion' },
    { name: 'Business', value: 'business' }
  ];

  publishedStatuses: any[] = [
    { label: 'All', value: null },
    { label: 'Published', value: true },
    { label: 'Draft', value: false }
  ];

  statuses: any[] = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  // Gallery and preview
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  displayImages: boolean = false;
  displayCustom: boolean = false;
  activeIndex: number = 0;

  // Preview dialog
  showPreviewDialog: boolean = false;
  previewPost: any = null;

  // Current date for comparison
  today: Date = new Date();

  private lastTableLazyLoadEvent: LazyLoadEvent;

  @ViewChild("dt", { static: false }) public dt: Table;
  @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;

  constructor(
    private BannerService: BannerService,
    private router: Router,
    private titlecasePipe: TitleCasePipe,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.staticPath = environment.uploadUrl;

    this.cols = [
      { field: 'banner_title', header: 'Post Title' },
      { field: 'post_type', header: 'Post Type' },
      { field: 'category', header: 'Category' },
      { field: 'banner_image', header: 'Featured Image' },
      { field: 'author', header: 'Author' },
      { field: 'reading_time', header: 'Reading Time' },
      { field: 'tags', header: 'Tags' },
      { field: 'is_published', header: 'Published' },
      { field: 'status', header: 'Status' },
      { field: 'publish_date', header: 'Publish Date' },
      { field: 'created_at', header: 'Created On' },
      { field: 'created_by', header: 'Created By' },
      { field: 'actions', header: 'Actions' }
    ];
    this.loadBanners({
        first: 0,
        rows: 10,
        sortField: undefined,
        sortOrder: undefined,
        filters: {}
      });
  }

  addNewBanner() {
    this.router.navigate(['/manage/banner/add']);
  }

  editBanner(id: string) {
    this.router.navigate(['/manage/banner/' + id]);
  }

  previewBanner(banner: any) {
    this.previewPost = banner;
    this.showPreviewDialog = true;
  }

  duplicateBanner(banner: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to duplicate this post?',
      header: 'Confirm Duplication',
      icon: 'pi pi-question-circle',
      accept: () => {
        // Create a copy of the banner data
        const duplicateData = {
          ...banner,
          banner_title: banner.banner_title + ' (Copy)',
          slug: banner.slug + '-copy',
          is_published: false,
          created_at: new Date(),
          id: undefined,
          _id: undefined
        };

        this.BannerService.addBanner(JSON.stringify(duplicateData)).subscribe(
          (response) => {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'success',
              summary: 'Success',
              detail: 'Post duplicated successfully',
              life: 6000
            });
            this.loadBanners(this.lastTableLazyLoadEvent);
          },
          (error) => {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to duplicate post',
              life: 6000
            });
          }
        );
      }
    });
  }

  openInstagramPost(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onPostTypeFilter(event: any) {
    if (event.value) {
      this.dt.filter(event.value, 'post_type', 'equals');
    } else {
      this.dt.filter('', 'post_type', 'equals');
    }
  }

  // Helper methods for display
  getPostTypeLabel(postType: string): string {
    const type = this.postTypes.find(t => t.value === postType);
    return type ? type.name : postType || 'Regular Post';
  }

  getPostTypeSeverity(postType: string): string {
    switch (postType) {
      case 'featured': return 'success';
      case 'instagram': return 'info';
      default: return 'secondary';
    }
  }

  getPostTypeIcon(postType: string): string {
    switch (postType) {
      case 'featured': return 'pi pi-star';
      case 'instagram': return 'pi pi-instagram';
      default: return 'pi pi-file';
    }
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.name : category || 'Uncategorized';
  }

  // Statistics methods
  getPublishedCount(): number {
    return this.bannerlist.filter(banner => banner.is_published === true).length;
  }

  getDraftCount(): number {
    return this.bannerlist.filter(banner => banner.is_published === false).length;
  }

  getFeaturedCount(): number {
    return this.bannerlist.filter(banner => banner.post_type === 'featured').length;
  }

  loadBanners(event: LazyLoadEvent) {
    this.loading = true;
    this.lastTableLazyLoadEvent = event;

    let query = "?filterByDisable=false";
    let pagenumber: number;
    let params = "";

    // Pagination
    if (event.first == 0) {
      pagenumber = 1;
    } else {
      pagenumber = (event.first / event.rows) + 1;
    }

    // Filters
    if (event.filters) {
      if (event.filters["banner_title"]) {
        params += "&filterByBannerTitle=" + event.filters["banner_title"].value;
      }
      if (event.filters["post_type"]) {
        params += "&filterByPostType=" + event.filters["post_type"].value;
      }
      if (event.filters["category"]) {
        params += "&filterByCategory=" + event.filters["category"].value;
      }
      if (event.filters["author"]) {
        params += "&filterByAuthor=" + event.filters["author"].value;
      }
      if (event.filters["is_published"] !== undefined) {
        params += "&filterByPublished=" + event.filters["is_published"].value;
      }
      if (event.filters["status"] !== undefined) {
        params += "&filterByStatus=" + event.filters["status"].value;
      }
      if (event.filters["publish_date"]) {
        const publishDate = moment(event.filters["publish_date"].value).format("YYYY-MM-DD");
        params += "&filterByPublishDate=" + publishDate;
      }
      if (event.filters["created_at"]) {
        const createdAt = moment(event.filters["created_at"].value).format("YYYY-MM-DD");
        params += "&filterByCreatedAt=" + createdAt;
      }
      if (event.filters["createdby"]) {
        params += "&filterByCreatedby=" + event.filters["createdby"].value;
      }
    }

    // Pagination and params
    query += "&pageSize=" + event.rows + "&pageNumber=" + pagenumber + params;

    // Sorting
    if (event.sortField && event.sortOrder !== undefined) {
      const orderBy = event.sortOrder === 1 ? "DESC" : "ASC";
      query += "&sortBy=" + event.sortField + "&orderBy=" + orderBy;
    }

    // Load banners
    this.BannerService.getbannerList(query).subscribe(
      data => {
        this.loading = false;

        // Debug: Log the entire response to understand the structure
        console.log('Full API Response:', data);

        this.bannerlist = data.items || [];
        this.totalRecords = data.totalCount || 0;

        // Process dates and add gallery visibility property
        this.bannerlist.forEach(element => {
          element.created_at = new Date(element.created_at);
          element.publish_date = element.publish_date ? new Date(element.publish_date) : null;
          element.bannerVisible = false; // For gallery display

          // Ensure banner_image is an array
          if (element.banner_image && !Array.isArray(element.banner_image)) {
            element.banner_image = [element.banner_image];
          }
        });

        // Debug: Log processed data
        console.log('Processed bannerlist:', this.bannerlist);
        console.log('Total records:', this.totalRecords);
      },
      err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error loading banners';
        console.error('Error loading banners:', err);
        this.messageService.add({
          key: 'toastmsg',
          severity: 'error',
          summary: 'Error',
          detail: this.errorMessage,
          life: 6000
        });
      }
    );
  }

  clear() {
    // Clear all filters
    this.dt.filter('', 'banner_title', 'contains');
    this.dt.filter('', 'post_type', 'equals');
    this.dt.filter('', 'category', 'equals');
    this.dt.filter('', 'author', 'contains');
    this.dt.filter('', 'is_published', 'equals');
    this.dt.filter('', 'status', 'equals');
    this.dt.filter('', 'publish_date', 'dateIs');
    this.dt.filter('', 'created_at', 'dateIs');
    this.dt.filter('', 'createdby', 'contains');

    // Clear date values
    this.calvalue = null;
    this.ucalvalue = null;
    this.dcalvalue = null;
    this.publishCalvalue = null;
    this.selectedPostType = null;

    // Clear dropdown
    if (this.pDropDownId) {
      this.pDropDownId.clear(null);
      this.pDropDownId.value = '';
    }

    this.messageService.add({
      key: 'toastmsg',
      severity: 'info',
      summary: 'Filters Cleared',
      detail: 'All filters have been cleared',
      life: 3000
    });
  }

  deleteBanner(banner: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete "' + banner.banner_title + '"?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const disableStatus = !banner.disable;
        const bannerData = JSON.stringify({ disable: disableStatus });

        this.BannerService.updateBanner(banner.id, bannerData).subscribe(
          res => {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'success',
              summary: 'Success',
              detail: 'Post deleted successfully',
              life: 6000
            });
            setTimeout(() => {
              this.loadBanners(this.lastTableLazyLoadEvent);
            }, 1000);
          },
          err => {
            this.messageService.add({
              key: 'toastmsg',
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to delete post',
              life: 6000
            });
          }
        );
      }
    });
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }
}