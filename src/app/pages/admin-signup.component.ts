import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MustMatch } from '../_helpers/must-match.validator';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-admin-signup',
    templateUrl: './admin-signup.component.html',
    styleUrls: ['./admin-signup.component.scss'],
    providers: [MessageService]
})
export class VendorSignupComponent implements OnInit {
    signupForm: FormGroup;
    RoleId = '66c835408eb0b667ac3cf529';
    roleName = 'venueowner';

    constructor(
      private fb: FormBuilder,
      private userService: UserService,
      private messageService: MessageService,
      private router: Router
    ) {}

    ngOnInit() {
      this.signupForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        mobileNumber: ['', Validators.required]
      }, {
        validator: MustMatch('password', 'confirmPassword')
      });
    }

    onSubmit() {
      if (this.signupForm.invalid) {
        return;
      }

      const formValues = this.signupForm.value;

      const payload = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        mobileNumber: formValues.mobileNumber,
        role: this.RoleId,
        userdata: {
            role: this.RoleId,
            rolename: this.roleName
        },
        status: true,
        disable: false,
        gender: 'Other',
        dob: moment().format('YYYY-MM-DD'),
        address: '',
        countrycode: 'US',
        countryname: 'United States',
        statecode: '',
        statename: '',
        citycode: '',
        cityname: '',
        zipcode: '',
        timeZone: moment.tz.guess(),
        timeZoneOffset: moment().format('Z')
      };

      this.userService.addUser(payload).subscribe(
        (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful!'
          });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error.message || 'Registration failed'
          });
        }
      );
    }
  }
