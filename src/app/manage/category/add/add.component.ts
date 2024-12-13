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
export class CategoryAddComponent implements OnInit {
    categoryForm: FormGroup;
    errorMessage = '';
    submitted = false;
    categorystatus: any;
    // parentcategory: any;
    // parentcategorycode: any;
    statuses: any = [];
    categorylist: any = [];
    uploadedFiles: any[] = [];
    public uploadedpic;
    public showUploadedpic = false;
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
            disable: [false],
            default_data: [false],
            //parent_category:[]
        });
        this.categorystatus = true;
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

    // convenience getter for easy access to form fields
    get f() {
        return this.categoryForm.controls;
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.categoryForm.invalid) {
            return;
        }
        var categoryData = this.categoryForm.value;
        categoryData['status'] = this.categorystatus;
        // categoryData['parent'] =this.parentcategorycode;
        // categoryData['parentcategoryname'] =this.parentcategory;
        // display form values on success
        // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryForm.value, null, 4));
        // return;
        categoryData['categoryImage'] = this.uploadedpic;
        categoryData = JSON.stringify(categoryData, null, 4);
        this.categoryService.addCategory(categoryData).subscribe(
            data => {                
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Category Added', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/category/category']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add Category failed', life: 6000 });
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
            // this.parentcategory = event.name;
            // this.parentcategorycode = event.code;
        }
    }

    onReset() {
        this.submitted = false;
        this.categoryForm.reset();
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

    backLink() {
        this.router.navigate(['/manage/category/category']);
    }
}
