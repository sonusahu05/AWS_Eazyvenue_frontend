import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
@Component({
    selector: 'app-category-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class SubcategoryAddComponent implements OnInit {
    categoryForm: FormGroup;
    errorMessage = '';
    submitted = false;
    uploadedFiles: any[] = [];
    categorystatus: any;
    parentcategory: any;
    parentcategorycode: any;
    statuses: any = [];

    public uploadedpic;
    public showUploadedpic = false;
    categorylist: any = [];
    constructor(private categoryService: CategoryService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router) { }

    ngOnInit(): void {
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.categoryForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.pattern('^[A-Za-z ]*$')]],
            description: [''],
            status: [{ label: 'Active', value: true }],
            parent_category: ['', Validators.required],
            disable: [false],
            default_data: [false],
        });
        this.categorystatus = true;
        this.getAllCategory();
    }

    getAllCategory() {
        var query;
        query = "filterByStatus=true";
        this.categoryService.getAllCategory(query).subscribe(
            data => {
                this.categorylist = data.data.items;
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.categoryForm.controls;
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
        categoryData['parentcategorycode'] = this.parentcategorycode;
        categoryData['parent_category'] = this.parentcategory;
        categoryData['categoryImage'] = this.uploadedpic;
        // display form values on success
        //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryForm.value, null, 4));
        //return;
        categoryData = JSON.stringify(categoryData, null, 4);
        this.categoryService.addCategory(categoryData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Sub Category Added', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/category/subcategory']);
                }, 1000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add Sub Category failed', life: 6000 });
            })
        );
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

    onReset() {
        this.submitted = false;
        this.categoryForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/category/subcategory']);
    }
}
