import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../service/state.service';
import { CountryService } from '../../country/service/country.service';

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
  countrieslist: any=[];
  countries:any=[];
  countrycode:String;
  countryForm = new FormGroup({
    //country: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),
    state_code: new FormControl("", [Validators.required]),
    //id: new FormControl("", [Validators.required]),
    status: new FormControl(true)
  });


  constructor(
    private StateService: StateService,
    private countryService: CountryService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    this.pagetitle = 'Add State';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
    this.getCountry();
    if (!this.isAddMode) {
      this.pagetitle = 'Edit State';
      setTimeout(() => {  
        this.getStateDetails();      
      },200);
    }
  }
  getStateDetails(){
    this.StateService.getstate(this.id).subscribe(res => {
      this.countryForm.controls.name.setValue(res.name);          
      this.countryForm.controls.state_code.setValue(res.state_code);          
      this.countryForm.controls.status.setValue(res.status);
      this.countrieslist.forEach(element => {
        var countrySetObj = { "name": element.name, "id": element.id };            
        if (res.country_id == element.id) {
            this.countryForm.controls.country.setValue(countrySetObj);
        }          
      });
    });
  }
  getCountry() {
    var query="filterByDisable=false";
    this.countryService.getcountryList(query).subscribe((res) => {
      this.countries = res.data.items;
      this.countries.forEach(element=>{
        this.countrieslist.push({ "name": element.name, "id": element._id });
      })
    })

  }
  get f() {
    return this.countryForm.controls;
  }

  onSubmit() {
    if (this.isAddMode) {
      this.addState();
    } else {
      this.updateState();
    }
  }
  setCountry(event){
    this.countrycode = event.value.id;
  }

  addState() {
    this.submitted = true;
    if (this.countryForm.valid) {
      var stateData = this.countryForm.value;
      stateData['country_id'] = this.countrycode;      
      stateData = JSON.stringify(stateData, null, 4);   
      this.StateService.addstate(stateData).subscribe(res => {
        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'State Added', life: 6000});
        setTimeout(() => {          
            this.router.navigate(["/manage/location/state"]);
        }, 2000);    

      });
    }
  }

  updateState() {
    this.submitted = true;
    if (this.countryForm.valid) {
      var stateData = this.countryForm.value;
      stateData['country_id'] = this.countrycode;      
      stateData = JSON.stringify(stateData, null, 4);       
      this.StateService.editstate(stateData, this.id).subscribe(res => {
        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'State Updated', life: 6000});
        setTimeout(() => {          
            this.router.navigate(["/manage/location/state"]);
        }, 2000);         
      });
    }
  }


  cancelCountry() {
    this.router.navigate(["/manage/location/state"]);
  }
  onReset() {
    this.submitted = false;
    this.countryForm.reset();
}

}
