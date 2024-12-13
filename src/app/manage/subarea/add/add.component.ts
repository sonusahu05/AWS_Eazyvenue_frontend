import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../../state/service/state.service';
import { CountryService } from '../../country/service/country.service';
import { CityService } from '../../city/service/city.service';
import { SubareaService } from 'src/app/services/subarea.service';

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
  item:any=[];
  countrieslist: any=[];
  countries:any=[];
  statelist: any=[];
  states:any=[];
  citylist: any=[];
  cities:any=[];
  countryid:String;
  stateid:String;
  cityid;
  statename;
  statecode;
  errorMessage;
  subareaForm = new FormGroup({
    state: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
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
    private cityService: CityService,
    private subareaService: SubareaService
  ) { }


  ngOnInit() {
    this.pagetitle = 'Add Subarea';
    this.id = this.route.snapshot.paramMap.get("id");
    this.isAddMode = !this.id;    
    this.getStates("IN");
    
    if (!this.isAddMode) {
      this.pagetitle = 'Edit Subarea';
      setTimeout(() => {  
        //this.getCityDetails();      
        this.getSubarea();
      },200);
    }
  }
  getSubarea(){
    this.subareaService.getSubareaDetails(this.id).subscribe(res => {
      this.item = res;
      this.subareaForm.controls.name.setValue(res.name);          
      this.stateid = res.state_id;
      this.statelist.forEach(element => {
        var stateSetObj = { "name": element.name, "id": element.id };     
        if (res.state_id == element.id) {
          this.getCities(false,res.state_id);
          this.subareaForm.controls.state.setValue(stateSetObj);
        }           
      });
    });
  }  
  getStates(countryid) {
    var query="filterByCountryCode=IN&filterByStatus=true&filterByDisable=false&sortBy=name&orderBy=ASC";    
      this.stateService.getstateList(query).subscribe((res) => {
      this.statelist=[];
      this.states = res.data.items;
      this.states.forEach(element=>{
        this.statelist.push({ "name": element.name, "id": element.id });
      })
    })
  }
  getCities(fromForm, event) {
    if (fromForm == true) {
      this.statecode = event.value.id;
      this.statename = event.value.name;
    } else {      
      this.statecode = event;
    }    
    var query = "?filterByDisable=false&filterByStatus=true&sortBy=name&orderBy=ASC&filterByStateId=" + this.statecode;
    this.cityService.getcityList(query).subscribe(
      data => {
        this.citylist = [];
        var cities = data.data.items;
        cities.forEach(city => {
          this.citylist.push({ name: city.name, id: city.id });
          if (city.id == this.item['city_id']) {
            this.subareaForm.get('city').setValue({ name: city.name, id: city.id });
          }
        })
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }
  onCitySelect(event) {    
    this.cityid = event.value.id;
  }
  get f() {
    return this.subareaForm.controls;
  }
  onSubmit() {
    //console.log(this.subareaForm);
    if (this.isAddMode) {
      this.addSubarea();
    } else {
      this.updateSubarea();
    }
  }
  setCountry(event){
    this.countryid = event.value.id;
    this.getStates(this.countryid); 
  }
  setState(event){
    this.stateid = event.value.id;
  }

  addSubarea() {
    this.submitted = true;
    if (this.subareaForm.valid) {
      var subareaData = this.subareaForm.value;
      subareaData['state'] = this.statecode;     
      subareaData['city'] = this.cityid;
      subareaData = JSON.stringify(subareaData, null, 4);         
      this.subareaService.addSubarea(subareaData).subscribe(res => {
        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Subarea Added', life: 6000});
        setTimeout(() => {          
            this.router.navigate(["/manage/location/subarea"]);
        }, 2000);    

      });
    }
  }

  updateSubarea() {
    this.submitted = true;
    if (this.subareaForm.valid) {
      var subareaData = this.subareaForm.value;
      subareaData['city'] = this.cityid;     
      subareaData['state'] = this.statecode;
      subareaData = JSON.stringify(subareaData, null, 4);     
      this.subareaService.updateSubarea(this.id,subareaData).subscribe(res => {
        this.messageService.add({key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Subarea Updated', life: 6000});
        setTimeout(() => {          
            this.router.navigate(["/manage/location/subarea"]);
        }, 2000);         
      });
    }
  }


  cancelCountry() {
    this.router.navigate(["/manage/location/subarea"]);
  }


}
