import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
@Component({
    selector: 'app-category-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class CategoryEditComponent implements OnInit {
    categoryForm: FormGroup;
    id;
    errorMessage = '';
    submitted = false;
    statuses: any = [];
    categorystatus: any;
    parentcategory: any;
    parentcategorycode: any;
    categorylist: any = [];
    public item: any[] = [];
    uploadedFiles: any[] = [];
    public imageProfile;
    public uploadedpic;
    public showUploadedpic = false;
    constructor(private categoryService: CategoryService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute) { }

    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.categoryForm = this.formBuilder.group({
            name: [''],
            description: [''],
            status: ['', [Validators.required]],
            parent_category: [''],
            disable: [false],
        });
        this.getCategoryDetails(this.id);
        //this.getAllCategory();        
    }

    // getAllCategory() {
    //     this.categoryService.getAllCategory().subscribe(
    //         data => {
    //             this.categorylist = data.data.items;
    //         },
    //         err => {
    //           this.errorMessage = err.error.message;
    //         }
    //     );    
    // }

    getCategoryDetails(id) {
        this.categoryService.getCategoryDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.categoryForm.patchValue({
                        name: this.item['name'],
                        description: this.item['description']
                    });
                    //this.categoryForm.get('status').setValue({name:  this.item['status'], code:  this.item['status']});
                    var statusobj;
                    if (this.item['status'] == true) {
                        statusobj = { label: 'Active', value: true };
                    } else {
                        statusobj = { label: 'In-Active', value: false };
                    }
                    this.categoryForm.get('status').setValue(statusobj);
                    this.categoryForm.get('parent_category').setValue({ name: this.item['parent_category'], code: this.item['parentcategorycode'] });
                    if (this.item['categoryImage'] != undefined) {
                        this.imageProfile = this.item['categoryImage'];
                        this.showUploadedpic = true;
                    } else {
                        this.showUploadedpic = false;
                    }
                }
                this.categoryForm.get('name').disable()
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    get f() {
        return this.categoryForm.controls;
    }

    onStatusSelect(event) {
        if (event) {
            this.categorystatus = event.value;
        }
    }

    onParentSelect(event) {
        if (event) {
            this.parentcategory = event.name;
            this.parentcategorycode = event.code;
        }
    }

    picUploader(event) {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
            var reader = new FileReader();
            reader.readAsDataURL(this.uploadedFiles[0]);
            reader.onload = () => { // called once readAsDataURL is completed
                this.uploadedpic = reader.result;
            }
        }
    }
    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.categoryForm.invalid) {
            return;
        }
        var categoryData = this.categoryForm.value;
        categoryData['status'] = this.categorystatus;
        categoryData['parent'] = this.parentcategorycode;
        categoryData['categoryImage'] = this.uploadedpic;
        delete categoryData.parent_category;

        categoryData = JSON.stringify(categoryData, null, 4);
        // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryForm.value, null, 4));
        // return;
        this.categoryService.updateCategory(this.id, categoryData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/category/category']);
                }, 2000);

            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Update Category failed', life: 6000 });
            })
        );
    }

    backLink() {
        this.router.navigate(['/manage/category/category']);
    }
}
