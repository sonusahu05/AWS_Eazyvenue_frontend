import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { AuthService } from './_services/auth.service';
import { TokenStorageService } from './_services/token-storage.service';
//import { TokenStorageService } from '../_services/token-storage.service';
import { CustomValidators } from './confirmed.validator';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { ConfirmationService, MessageService } from 'primeng/api';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit {
  submitted = false;
  tokenData: any;
  showsignupMsg: boolean = false;
  token;
  classToggled = false;
  availableClasses: string[] = ["light", "normal-header"];
  currentClassIdx: number = 0;
  bodyClass: string;
  resetPassForm: FormGroup;
  public showError: boolean = false;
  public errorMessage;
  // resetPassForm = new FormGroup({
  //   password: new FormControl("", [Validators.required]),
  //   confirmPassword: new FormControl("", [Validators.required]),
  //   reset_password_token: new FormControl("")
  // },
  //   CustomValidators.mustMatch('password', 'confirmPassword')
  // );



  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private httpClient: HttpClient,
    private messageService: MessageService,

  ) {
    this.bodyClass = this.availableClasses[this.currentClassIdx];
    this.changeBodyClass();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tokenData = params.reset_password_token;
    });
    this.token = this.route.snapshot.params.token;
    //this.resetPassForm.controls.reset_password_token.setValue(this.token);

    this.resetPassForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern("^(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])(?=[^0-9\n]*[0-9])(?=[^#?!@$%^&*\n-]*[#?!@$%^&*-]).{6,}$")]],
      confirmPassword: ['', Validators.required],
      reset_password_token: [this.token],
    }, {
      validator: MustMatch('password', 'confirmPassword'),
    });
  }
  public toggleField() {
    this.classToggled = !this.classToggled;
  }
  changeBodyClass() {
    // get html body element
    const bodyElement = document.body;
    if (bodyElement) {
      this.currentClassIdx = this.getNextClassIdx();
      const nextClass = this.availableClasses[this.currentClassIdx];
      const activeClass = this.availableClasses[this.getPrevClassIdx()];
      // remove existing class (needed if theme is being changed)
      bodyElement.classList.remove(activeClass);
      // add next theme class
      bodyElement.classList.add(nextClass);
      this.bodyClass = nextClass;
    }
  }
  getPrevClassIdx(): number {
    return this.currentClassIdx === 0
      ? this.availableClasses.length - 1
      : this.currentClassIdx - 1;
  }
  getNextClassIdx(): number {
    return this.currentClassIdx === this.availableClasses.length - 1
      ? 0
      : this.currentClassIdx + 1;
  }
  get f() {
    return this.resetPassForm.controls;
  }

  submit() {
    this.submitted = true;
    if (this.resetPassForm.valid) {
      this.userService.resetPassword(this.resetPassForm.value).subscribe(res => {
        this.submitted = false;
        this.showsignupMsg = true;
        this.showError = false;
        this.messageService.add({ key: 'toastMsg', severity: 'error', summary: this.errorMessage, detail: 'Password reset successfully.', life: 6000 });
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 2000);

      }, (error) => {
        this.showError = true;
        this.errorMessage = error.error.error;
      });
    }

  }

}
