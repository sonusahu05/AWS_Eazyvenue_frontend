import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CountryService } from '../service/country.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AddComponent implements OnInit {
  submitted = false;
  id: string;
  isAddMode: boolean;
  pagetitle: string;
  countryForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    iso2: new FormControl("", [Validators.required]),
    status: new FormControl(true)
  });

  constructor(
    private CountryService: CountryService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }
  ngOnInit() {
    this.pagetitle = 'Add Country';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.pagetitle = 'Edit Country';
      this.CountryService.getCountry(this.id).subscribe(res => {
        this.countryForm.controls.name.setValue(res.name);
        this.countryForm.controls.iso2.setValue(res.iso2);
        this.countryForm.controls.status.setValue(res.status);
      });
    }
  }
  get f() {
    return this.countryForm.controls;
  }
  onSubmit() {
    if (this.isAddMode) {
      this.addCountry();
    } else {
      this.updateCountry();
    }
  }
  addCountry() {
    this.submitted = true;
    if (this.countryForm.valid) {
      this.CountryService.addCountry(this.countryForm.value).subscribe(res => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Country Added', life: 6000 });
        setTimeout(() => {
          this.router.navigate(["/manage/location/country"]);
        }, 2000);
      });
    }
  }
  updateCountry() {
    this.submitted = true;
    if (this.countryForm.valid) {
      this.CountryService.editCountry(this.countryForm.value, this.id).subscribe(res => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Country Updated', life: 6000 });
        setTimeout(() => {
          this.router.navigate(["/manage/location/country"]);
        }, 2000);
      });
    }
  }
  cancelCountry() {
    this.router.navigate(["/manage/location/country"]);
  }
}