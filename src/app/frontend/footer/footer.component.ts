import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { environment } from "./../../../environments/environment";
import { CustomValidators } from 'ng2-validation';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscribeService } from '../service/subscribeService.service';

@Component({
  selector: 'page-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  providers: [MessageService],
})
export class FooterComponent implements OnInit {
  sidebarVisible4: boolean;
  subscribeForm: FormGroup;
  submitted: boolean;
  public errorMessage: string;
  showSuccess: boolean = false;
  constructor(private formBuilder: FormBuilder, private messageService: MessageService, private router: Router, private subscribeService: SubscribeService) { }

  ngOnInit(): void {
    this.subscribeForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, CustomValidators.email]]
    });
  }

  get f() {
    return this.subscribeForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.subscribeForm.invalid) {
      return;
    }
    let subscribeData = this.subscribeForm.value;
    this.subscribeService.add(subscribeData).subscribe(res => {
      this.showSuccess = true;
      //this.messageService.add({key: 'bc', severity: 'success', summary: 'Successful', detail: 'Subscribe Successfully.', life: 2000});
      setTimeout(() => {
        // this.router.navigateByUrl("/footer");
        this.submitted = false;
        this.subscribeForm.reset();
      }, 300);
    },
      ((err) => {
        this.messageService.add({ key: 'toastmsg', severity: 'error', summary: "Error", detail: 'Failed to Subscribe', life: 6000 });
      })
    );
  }

  // onClickOffer(){
  //   this.sidebarVisible4 = true;
  // }
  // onHideSidebar(){
  //   this.sidebarVisible4 = false;
  // }
  
}
