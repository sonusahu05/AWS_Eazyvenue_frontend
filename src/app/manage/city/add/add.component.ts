import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../../state/service/state.service';
import { CountryService } from '../../country/service/country.service';
import { CityService } from './../service/city.service';

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
  countrieslist: any = [];
  countries: any = [];
  statelist: any = [];
  states: any = [];
  countryid: String;
  stateid: String;
  cityForm = new FormGroup({
    //country: new FormControl("", [Validators.required]),
    state: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),
    //id: new FormControl("", [Validators.required]),
    status: new FormControl(true)
  });


  constructor(
    private stateService: StateService,
    private countryService: CountryService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private cityService: CityService
  ) { }


  ngOnInit() {
    this.pagetitle = 'Add City';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;
    //this.getCountry();
    this.getStates("IN");

    if (!this.isAddMode) {
      this.pagetitle = 'Edit City';
      setTimeout(() => {
        this.getCityDetails();
      }, 200);
    }
  }
  getCityDetails() {
    this.cityService.getcity(this.id).subscribe(res => {
      //console.log(res,"accres");
      this.cityForm.controls.name.setValue(res.name);
      //this.cityForm.controls.state_code.setValue(res.state_code);          
      this.cityForm.controls.status.setValue(res.status);
      this.getStates(res.country_id);
      this.stateid = res.state_id;
      this.countrieslist.forEach(element => {
        var countrySetObj = { "name": element.name, "id": element.id };
        if (res.country_id == element.id) {
          this.cityForm.controls.country.setValue(countrySetObj);
        }
      });
    });
  }
  getCountry() {
    var query = "";
    this.countryService.getcountryList(query).subscribe((res) => {
      this.countries = res.data.items;
      this.countries.forEach(element => {
        this.countrieslist.push({ "name": element.name, "id": element._id });
      })
    })
  }
  getStates(countryid) {
    var query = "filterByCountryCode=IN&filterByStatus=true&filterByDisable=false&orderBy=name&sortBy=1";
    this.stateService.getstateList(query).subscribe((res) => {
      this.statelist = [];
      //this.states = res;      
      this.states = res.data.items;
      this.states.forEach(element => {
        this.statelist.push({ "name": element.name, "id": element.id });
        if (this.stateid == element._id) {
          var stateSetObj = { "name": element.name, "id": element.id };
          this.cityForm.controls.state.setValue(stateSetObj);
        }
      })
    })
  }
  get f() {
    return this.cityForm.controls;
  }
  onSubmit() {
    //console.log(this.cityForm);
    if (this.isAddMode) {
      this.addState();
    } else {
      this.updateState();
    }
  }
  setCountry(event) {
    this.countryid = event.value.id;
    this.getStates(this.countryid);
  }
  setState(event) {
    this.stateid = event.value.id;
  }

  addState() {
    this.submitted = true;
    if (this.cityForm.valid) {
      var cityData = this.cityForm.value;
      cityData['country_id'] = 101;///this.countryid;     
      cityData['state_id'] = this.stateid;
      cityData = JSON.stringify(cityData, null, 4);
      this.cityService.addcity(cityData).subscribe(res => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'City Added', life: 6000 });
        setTimeout(() => {
          this.router.navigate(["/manage/location/city"]);
        }, 2000);

      });
    }
  }

  updateState() {
    this.submitted = true;
    if (this.cityForm.valid) {
      var cityData = this.cityForm.value;
      cityData['country_id'] = this.countryid;
      cityData['state_id'] = this.stateid;
      cityData = JSON.stringify(cityData, null, 4);
      this.cityService.editcity(cityData, this.id).subscribe(res => {
        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'City Updated', life: 6000 });
        setTimeout(() => {
          this.router.navigate(["/manage/location/city"]);
        }, 2000);
      });
    }
  }


  cancelCountry() {
    this.router.navigate(["/manage/location/city"]);
  }

  onReset() {
    this.submitted = false;
    this.cityForm.reset();
}
}
