import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
@Component({
    selector: 'app-category-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class SubcategoryViewComponent implements OnInit {
    categoryForm: FormGroup;
    id;
    errorMessage = '';
    submitted = false;
    statuses:any=[];
    categorystatus: any;
    parentcategory: any;
    parentcategorycode: any;
    categorylist: any = [];
    categoryId;
    public item: any[] = [];
    public imageProfile;
    categoryDefault;
    constructor(private categoryService: CategoryService, private formBuilder: FormBuilder, 
        private confirmationService: ConfirmationService, private messageService: MessageService, 
        private router: Router, private activeroute:ActivatedRoute) { }

    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            {label: 'Active', value: true},
            {label: 'In-Active', value: false}
        ];
        this.categoryForm = this.formBuilder.group({
            name: [''],
            description: [''],
            status:['Active', [Validators.required]],
            parent_category:['', [Validators.required]]
        });
        this.getCategoryDetails(this.id);
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

    getCategoryDetails(id) {
        this.categoryService.getCategoryDetails(id).subscribe(
            data => {
                this.item = data;
                if(this.item){
                    this.categoryForm.patchValue({
                        name: this.item['name'],
                        description: this.item['description']
                    });
                    var statusobj;
                    if(this.item['status'] == true) {                        
                        statusobj  ={label: 'Active', value: true};
                    } else {
                        statusobj  ={label: 'In-Active', value: false};
                    }
                    this.categoryForm.get('status').setValue(statusobj);
                    this.categoryForm.get('parent_category').setValue({name:  this.item['parent_category'], code:  this.item['parentcategorycode']});
                    if (this.item['categoryImage'] != undefined) {
                        this.imageProfile = this.item['categoryImage'];
                    }
                }
                this.categoryForm.get('name').disable();
                this.categoryForm.get('description').disable();
                this.categoryForm.get('parent_category').disable();
                this.categoryForm.get('status').disable();
                this.categoryId=id;
                this.categoryDefault = this.item['defaultdata'];
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
        if(event) {            
            this.categorystatus = event.value;
        }
    }

    onParentSelect(event) {
        if(event) {            
            this.parentcategory = event.name;
            this.parentcategorycode = event.code;
        }
    }

    editCategory(id) {
        this.router.navigate(['/manage/category/subcategory/'+id]);
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
        delete categoryData.parent_category;
        
        categoryData = JSON.stringify(categoryData, null, 4);
        // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.categoryForm.value, null, 4));
        // return;
        this.categoryService.updateCategory(this.id, categoryData).subscribe(
            data => {
                this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Sub Category Updated', life: 6000});
                setTimeout(() => {
                    this.router.navigate(['/manage/category/subcategory']);
                }, 1000);
            },
            ((err) => {
                this.messageService.add({key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Update Sub Category failed', life: 6000 });
            })
        );
    }

    backLink() {
        this.router.navigate(['/manage/category/subcategory']);
    }
}
