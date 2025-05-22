import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { BannerService } from '../../../services/banner.service';
import { FileUpload } from 'primeng/fileupload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from "./../../../../environments/environment";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-banner-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  providers: [ConfirmationService, MessageService, BannerService]
})
export class BannerAddComponent implements OnInit {
  uploadedFiles: any[] = [];
  banner_image: FormArray;

  postTypes: any[] = [
    { name: 'Regular Post', value: 'regular' },
    { name: 'Featured Post', value: 'featured' },
    { name: 'Instagram Post', value: 'instagram' }
  ];

  categories: any[] = [
    { name: 'Technology', value: 'technology' },
    { name: 'Lifestyle', value: 'lifestyle' },
    { name: 'Travel', value: 'travel' },
    { name: 'Food', value: 'food' },
    { name: 'Fashion', value: 'fashion' },
    { name: 'Business', value: 'business' }
  ];

  tags: string[] = [];
  availableTags: string[] = ['trending', 'popular', 'new', 'featured', 'sponsored'];

  deletedattachments: any[] = [];
  filename: any = '';
  staticPath: string;
  bannerImage: any;
  statuses: any;
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  public isUpload: boolean = false;
  banner_content;
  banner_title;
  banner_url;
  bannerstatus: any;
  bannerImagesArray: any;
  banners: any[] = [
    { name: 'Banner 1', value: 'Banner 1' },
    { name: 'Banner 2', value: 'Banner 2' },
    { name: 'Banner 3', value: 'Banner 3' }
  ];
  selectedbannername: any = this.banners[0].value;
  bannerForm: FormGroup;

  constructor(
    private BannerService: BannerService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private messageService: MessageService,
    private elementRef: ElementRef
  ) { }

  @ViewChild('fileInput') fileInput: FileUpload;

  ngOnInit() {
    this.staticPath = environment.uploadUrl;
    this.pagetitle = 'Add Banner';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;

    this.statuses = [
      { name: 'Active', code: 'Active' },
      { name: 'In-Active', code: 'In-Active' }
    ];

    // Create form - Fixed form creation
    this.bannerForm = this.formBuilder.group({
      banner_title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      banner_content: ['', Validators.required],
      status: [true, Validators.required],
      disable: [false],

      // New fields
      post_type: ['regular', Validators.required],
      category: ['', Validators.required],
      tags: [[]],
      author: ['', Validators.required],
      reading_time: [''],
      meta_description: [''],

      // Featured post specific
      is_featured: [false],
      featured_order: [0],

      // Instagram specific
      instagram_url: [''],
      instagram_caption: [''],
      is_video: [false],

      // SEO fields
      seo_title: [''],
      seo_keywords: [''],

      // Publishing
      publish_date: [new Date()],
      is_published: [true]
    });

    // Load existing data if editing
    if (!this.isAddMode) {
      this.loadBannerData();
    }

    // Set initial reading time calculation
    this.calculateReadingTime();
  }

  get f() {
    return this.bannerForm.controls;
  }

  loadBannerData() {
    this.BannerService.getBannerDetails(this.id).subscribe(
      data => {
        if (data) {
          this.bannerForm.patchValue({
            banner_title: data.banner_title,
            slug: data.slug,
            banner_content: data.banner_content,
            status: data.status,
            post_type: data.post_type || 'regular',
            category: data.category,
            author: data.author,
            reading_time: data.reading_time,
            meta_description: data.meta_description,
            seo_title: data.seo_title,
            seo_keywords: data.seo_keywords,
            featured_order: data.featured_order || 0,
            instagram_url: data.instagram_url,
            instagram_caption: data.instagram_caption,
            is_video: data.is_video || false,
            publish_date: data.publish_date ? new Date(data.publish_date) : new Date(),
            is_published: data.is_published !== undefined ? data.is_published : true
          });

          this.tags = data.tags || [];

          if (data.banner_image && data.banner_image.length > 0) {
            this.setUploadedFiles(data.banner_image.map(img => img.banner_image_src));
          }

          // Calculate reading time after loading content
          this.calculateReadingTime();
        }
      },
      error => {
        console.error('Error loading banner data:', error);
        this.messageService.add({
          key: 'toastmsg',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load banner data',
          life: 6000
        });
      }
    );
  }

  onPostTypeChange(event) {
    const postType = event.value;

    if (postType === 'featured') {
      this.bannerForm.patchValue({ is_featured: true });
      this.bannerForm.get('featured_order').setValidators([Validators.required]);
    } else {
      this.bannerForm.patchValue({ is_featured: false });
      this.bannerForm.get('featured_order').clearValidators();
    }

    if (postType === 'instagram') {
      this.bannerForm.get('instagram_url').setValidators([Validators.required, Validators.pattern('https?://.+')]);
      this.bannerForm.get('instagram_caption').setValidators([Validators.required]);
    } else {
      this.bannerForm.get('instagram_url').clearValidators();
      this.bannerForm.get('instagram_caption').clearValidators();
    }

    this.bannerForm.get('featured_order').updateValueAndValidity();
    this.bannerForm.get('instagram_url').updateValueAndValidity();
    this.bannerForm.get('instagram_caption').updateValueAndValidity();
  }

  addTag(tag: string) {
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.bannerForm.patchValue({ tags: this.tags });
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.bannerForm.patchValue({ tags: this.tags });
  }

  generateSlug() {
    const title = this.bannerForm.get('banner_title')?.value;
    if (title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      this.bannerForm.patchValue({ slug: slug });
    }
  }

  // Fixed calculateReadingTime method
  calculateReadingTime() {
    const content = this.bannerForm.get('banner_content')?.value;
    if (content && typeof content === 'string' && content.trim().length > 0) {
      const wordsPerMinute = 200;
      // Remove HTML tags and count words
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      this.bannerForm.patchValue({ reading_time: `${readingTime} min read` });
    } else {
      this.bannerForm.patchValue({ reading_time: '' });
    }

    // Trigger change detection to update the UI
    this.changeDetectorRef.detectChanges();
  }

  onUpload(event, frmCrl, form) {
    this.uploadedFiles = []
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.isUpload = true;
    this.changeDetectorRef.detectChanges();
  }

  deleteFile(list, index) {
    this.deletedattachments.push(this.uploadedFiles[index]);
    this.uploadedFiles.splice(index, 1);
    this.fileInput.files.splice(index, 1);
  }

  setUploadedFiles(fileData: any = '') {
    fileData.forEach(file => {
      console.log(file);
      let filePath = environment.uploadUrl + file;
      this.loadFile(filePath).subscribe(i => {
        var file = new File([i], filePath.split("/").pop(), { type: i.type, lastModified: Date.now() });
        this.fileInput.files.push(file);
        this.uploadedFiles.push(file);
      });
    });
  }

  loadFile(filepath): Observable<Blob> {
    return this.httpClient.get(filepath, {
      responseType: "blob"
    });
  }

  onSubmit() {
    this.submitted = true;

    // Generate SEO fields if empty
    if (!this.bannerForm.get('seo_title')?.value) {
      this.bannerForm.patchValue({ seo_title: this.bannerForm.get('banner_title')?.value });
    }

    if (!this.bannerForm.get('meta_description')?.value) {
      const content = this.bannerForm.get('banner_content')?.value;
      if (content) {
        // Remove HTML tags and truncate
        const textContent = content.replace(/<[^>]*>/g, '');
        const metaDesc = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
        this.bannerForm.patchValue({ meta_description: metaDesc });
      }
    }

    // Calculate reading time before submission
    this.calculateReadingTime();

    if (this.bannerForm.invalid) {
      // Log form errors for debugging
      Object.keys(this.bannerForm.controls).forEach(key => {
        const control = this.bannerForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });

      this.messageService.add({
        key: 'toastmsg',
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields',
        life: 6000
      });
      return;
    }

    var bannerData = this.bannerForm.value;

    // Handle image uploads
    this.bannerImagesArray = [];
    if (this.bannerImage && this.bannerImage.length > 0) {
      this.bannerImage.forEach((element, index) => {
        this.bannerImagesArray.push({
          'file': element.file,
          'alt': bannerData.banner_title,
          'default': index === 0
        });
      });
    }

    bannerData['banner_images'] = this.bannerImagesArray;
    bannerData['tags'] = this.tags;

    const apiCall = this.isAddMode
      ? this.BannerService.addBanner(JSON.stringify(bannerData))
      : this.BannerService.updateBanner(this.id, JSON.stringify(bannerData));

    apiCall.subscribe(
      data => {
        const message = this.isAddMode ? 'Banner Added Successfully!!' : 'Banner Updated Successfully!!';
        this.messageService.add({
          key: 'toastmsg',
          severity: 'success',
          summary: 'Successful',
          detail: message,
          life: 6000
        });
        setTimeout(() => {
          this.router.navigate(['/manage/banner']);
        }, 2000);
      },
      error => {
        console.error('Submit error:', error);
        this.messageService.add({
          key: 'toastmsg',
          severity: 'error',
          summary: "Error",
          detail: error.error?.message || 'An error occurred',
          life: 6000
        });
      }
    );
  }

  onchangeSelect(event) {
    this.selectedbannername = event.value.value;
    this.changeDetectorRef.detectChanges();
  }

  onStatusSelect(event) {
    if (event) {
      this.bannerstatus = event.name;
    }
  }

  picUploader(event) {
    this.bannerImage = [];
    let index = 0;
    for (let file of event.files) {
      this.uploadedFiles.push(file);
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log(file.name);
        if (reader.result != null) {
          this.bannerImage.push({ 'file': reader.result });
          index++;
        }
      }
    }
  }

  onReset() {
    this.submitted = false;
    this.bannerForm.reset();
    this.tags = [];
    // Reset to default values
    this.bannerForm.patchValue({
      post_type: 'regular',
      status: true,
      is_published: true,
      publish_date: new Date(),
      disable: false
    });
  }

  backLink() {
    this.router.navigate(['/manage/banner']);
  }
}