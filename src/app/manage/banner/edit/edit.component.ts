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
  selector: 'app-banner-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [ConfirmationService, MessageService, BannerService]
})
export class BannerEditComponent implements OnInit {
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
  bannerImage: any[] = [];
  bannerImages: any[] = [];
  statuses: any;
  submitted = false;
  id: string;
  pagetitle: string = 'Edit Banner';
  public isUpload: boolean = false;
  showProfile: boolean = false;
  responsiveOptions: any[] = [];
  bannerImagesArray: any[] = [];

  bannerForm: FormGroup;

  constructor(
    private BannerService: BannerService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private messageService: MessageService,
    private elementRef: ElementRef
  ) {
    this.bannerImage = [];
  }

  @ViewChild('fileInput') fileInput: FileUpload;

  ngOnInit() {
    this.staticPath = environment.uploadUrl;
    this.id = this.route.snapshot.paramMap.get("id");

    this.statuses = [
      { name: 'Active', code: 'Active' },
      { name: 'In-Active', code: 'In-Active' }
    ];

    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5
      },
      {
        breakpoint: '768px',
        numVisible: 3
      },
      {
        breakpoint: '560px',
        numVisible: 1
      }
    ];

    // Create form with all enhanced fields
    this.bannerForm = this.formBuilder.group({
      banner_title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      banner_content: ['', Validators.required],
      status: [true, Validators.required],
      disable: [false],

      // New enhanced fields
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

    // Load existing banner data
    this.loadBannerData();
  }

  get f() {
    return this.bannerForm.controls;
  }

  loadBannerData() {
    this.BannerService.getBannerDetails(this.id).subscribe(
      data => {
        if (data) {
          console.log('Loading banner data:', data);

          // Patch form with existing data
          this.bannerForm.patchValue({
            banner_title: data.banner_title,
            slug: data.slug,
            banner_content: data.banner_content,
            status: data.status,

            // Enhanced fields with fallbacks
            post_type: data.post_type || 'regular',
            category: data.category || '',
            author: data.author || '',
            reading_time: data.reading_time || '',
            meta_description: data.meta_description || '',
            seo_title: data.seo_title || '',
            seo_keywords: data.seo_keywords || '',
            featured_order: data.featured_order || 0,
            instagram_url: data.instagram_url || '',
            instagram_caption: data.instagram_caption || '',
            is_video: data.is_video || false,
            publish_date: data.publish_date ? new Date(data.publish_date) : new Date(),
            is_published: data.is_published !== undefined ? data.is_published : true,
            is_featured: data.is_featured || false
          });

          // Set tags
          this.tags = data.tags || [];

          // Handle existing images
          if (data.banner_image && data.banner_image.length > 0) {
            this.bannerImages = data.banner_image.map(img => ({
              banner_image_src: this.staticPath + img.banner_image_src
            }));
            this.showProfile = true;

            // Also set up for the new file upload system
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

    // Handle featured post validation
    if (postType === 'featured') {
      this.bannerForm.patchValue({ is_featured: true });
      this.bannerForm.get('featured_order').setValidators([Validators.required]);
    } else {
      this.bannerForm.patchValue({ is_featured: false });
      this.bannerForm.get('featured_order').clearValidators();
    }

    // Handle Instagram post validation
    if (postType === 'instagram') {
      this.bannerForm.get('instagram_url').setValidators([Validators.required, Validators.pattern('https?://.+')]);
      this.bannerForm.get('instagram_caption').setValidators([Validators.required]);
    } else {
      this.bannerForm.get('instagram_url').clearValidators();
      this.bannerForm.get('instagram_caption').clearValidators();
    }

    // Update validators
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

    this.changeDetectorRef.detectChanges();
  }

  // Legacy method for old image system
  removeBannerImages(imageSrc: string) {
    const index = this.bannerImages.findIndex(img => img.banner_image_src === imageSrc);
    if (index > -1) {
      const imageToDelete = this.bannerImages[index];
      this.deletedattachments.push(imageToDelete);
      this.bannerImages.splice(index, 1);

      if (this.bannerImages.length === 0) {
        this.showProfile = false;
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  // New file upload methods
  deleteFile(index: number) {
    if (index >= 0 && index < this.uploadedFiles.length) {
      this.uploadedFiles.splice(index, 1);

      if (this.bannerImage && index < this.bannerImage.length) {
        this.bannerImage.splice(index, 1);
      }

      if (this.fileInput && this.fileInput.files) {
        this.fileInput.files.splice(index, 1);
      }

      console.log('File deleted, remaining files:', this.uploadedFiles.length);
      this.changeDetectorRef.detectChanges();
    }
  }

  setUploadedFiles(fileData: any[] = []) {
    if (!Array.isArray(fileData)) {
      console.log('No file data or invalid format');
      return;
    }

    this.uploadedFiles = [];
    this.bannerImage = [];

    fileData.forEach((fileUrl, index) => {
      console.log('Loading existing file:', fileUrl);
      let filePath = environment.uploadUrl + fileUrl;

      this.loadFile(filePath).subscribe(
        blob => {
          var file = new File([blob], filePath.split("/").pop() || `image_${index}`, {
            type: blob.type,
            lastModified: Date.now()
          });

          if (this.fileInput && this.fileInput.files) {
            this.fileInput.files.push(file);
          }

          this.uploadedFiles.push(file);

          let reader = new FileReader();
          reader.onload = (e: any) => {
            this.bannerImage.push({
              'file': e.target.result,
              'name': file.name,
              'size': file.size,
              'type': file.type
            });
            this.changeDetectorRef.detectChanges();
          };
          reader.readAsDataURL(file);
        },
        error => {
          console.error('Error loading file:', filePath, error);
        }
      );
    });
  }

  loadFile(filepath): Observable<Blob> {
    return this.httpClient.get(filepath, {
      responseType: "blob"
    });
  }

  picUploader(event) {
    console.log('picUploader called with:', event);

    // Clear previous uploads
    this.bannerImage = [];
    this.uploadedFiles = [];

    if (!event.files || event.files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log('Files to process:', event.files.length);

    // Process each file
    for (let file of event.files) {
      console.log('Processing file:', file.name);

      // Add to uploaded files for display
      this.uploadedFiles.push(file);

      // Create FileReader to convert to base64
      let reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('File read successfully:', file.name);

        // Store the base64 result
        this.bannerImage.push({
          'file': e.target.result, // base64 string
          'name': file.name,
          'size': file.size,
          'type': file.type
        });

        console.log('Current bannerImage array:', this.bannerImage);
        this.changeDetectorRef.detectChanges();
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      // Read file as data URL (base64)
      reader.readAsDataURL(file);
    }

    // Set upload flag
    this.isUpload = true;
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
        const textContent = content.replace(/<[^>]*>/g, '');
        const metaDesc = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
        this.bannerForm.patchValue({ meta_description: metaDesc });
      }
    }

    // Recalculate reading time
    this.calculateReadingTime();

    if (this.bannerForm.invalid) {
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

    // Handle image uploads properly
    this.bannerImagesArray = [];

    console.log('Processing banner images:', this.bannerImage);

    if (this.bannerImage && this.bannerImage.length > 0) {
      this.bannerImage.forEach((element, index) => {
        this.bannerImagesArray.push({
          'file': element.file,
          'alt': bannerData.banner_title || 'Banner Image',
          'default': index === 0,
          'name': element.name || `image_${index}`,
          'type': element.type || 'image/jpeg'
        });
      });

      console.log('Prepared banner images array:', this.bannerImagesArray);
    } else {
      console.log('No banner images to process');
    }

    // Add images and tags to banner data
    bannerData['banner_images'] = this.bannerImagesArray;
    bannerData['tags'] = this.tags;
    bannerData['deleted_attachments'] = this.deletedattachments;

    console.log('Final banner data being sent:', bannerData);

    this.BannerService.updateBanner(this.id, JSON.stringify(bannerData)).subscribe(
      data => {
        console.log('Success response:', data);
        this.messageService.add({
          key: 'toastmsg',
          severity: 'success',
          summary: 'Successful',
          detail: 'Banner Updated Successfully!!',
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
          detail: error.error?.message || 'An error occurred while updating the banner',
          life: 6000
        });
      }
    );
  }

  onReset() {
    this.submitted = false;
    this.tags = [];
    this.uploadedFiles = [];
    this.bannerImage = [];
    this.bannerImages = [];
    this.deletedattachments = [];
    this.showProfile = false;
    this.isUpload = false;

    // Reset form to default values
    this.bannerForm.reset();
    this.bannerForm.patchValue({
      post_type: 'regular',
      status: true,
      is_published: true,
      publish_date: new Date(),
      disable: false,
      is_featured: false,
      featured_order: 0,
      is_video: false,
      tags: []
    });

    // Reload the original data
    this.loadBannerData();
  }

  backLink() {
    this.router.navigate(['/manage/banner']);
  }
}