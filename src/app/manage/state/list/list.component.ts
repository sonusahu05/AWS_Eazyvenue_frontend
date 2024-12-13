import { Component, OnInit } from '@angular/core';
import { CountryService } from '../../country/service/country.service';
import { StateService } from '../service/state.service';
import { ConfirmationService, MessageService } from 'primeng/api';
//import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Countrylocation } from '../model/countrylocation';
import { environment } from "./../../../../environments/environment";
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  styles: [`
      :host ::ng-deep .p-dialog .product-image {
          width: 150px;
          margin: 0 auto 2rem auto;
          display: block;
      }

      @media screen and (max-width: 960px) {
          :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:last-child {
              text-align: center;
          }

          :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:nth-child(6) {
              display: flex;
          }
      }

  `],
  providers: [StateService, ConfirmationService, MessageService, TitleCasePipe]
})
export class ListComponent implements OnInit {
  paginationOption;
  errorMessage: String;
  states: Countrylocation[];
  submitted: boolean;
  cols: any[];
  totalStates = 0;

  constructor(private CountryService: CountryService, private stateService: StateService, private router: Router,
    private confirmationService: ConfirmationService, private messageService: MessageService, private titlecasePipe: TitleCasePipe) { }

  ngOnInit() {

    this.paginationOption = environment.pagination;

    this.cols = [
      { field: 'countryName', header: 'Name' },
      { field: 'status', header: 'Status' }
    ];

    this.refreshStateList();
  }

  refreshStateList() {
    var query = "filterByDisable=false&orderBy=name&sortBy=1";
    this.stateService.getstateList(query).subscribe((res) => {
      this.totalStates = res.data.totalCount;
      //console.log(this.states);
      this.states = res.data.items;
      // this.states.forEach(val => {
      //   val['countryname'] = val['countrydata'][0]['name'];
      //   val['countrycode'] = val['countrydata'][0]['code'];
      // })
    })


  }

  /************************************************************* */
  openNew() {
    this.router.navigateByUrl('/manage/location/state/add');
    //console.log('happy');

  }

  onEdit(state) {
    this.router.navigateByUrl('/manage/location/state/edit/' + state._id);
  }

  changeStatus(state) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(state.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        var stateData = '{"status":' + state.status + '}';
        this.stateService.editstate(stateData, state._id).subscribe(
          data => {
            this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'State Status Updated', life: 3000 });
            this.refreshStateList();
          },
          err => {
            this.errorMessage = err.error.message;
          }
        );
      },
      reject: () => {
        this.refreshStateList();
      }
    });
  }

  onDelete(state) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(state.name)) + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var disableStatus;
        if (state.disable == false) {
          disableStatus = true;
        } else {
          disableStatus = false;
        }
        var stateData = '{"disable":' + disableStatus + '}';
        this.stateService.editstate(stateData, state._id).subscribe((res) => {
          this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'State Deleted', life: 3000 });
          this.refreshStateList();
        })
      },
      reject: () => {
        //this.getUserDetails(user.id);
      }
    });
  }


}
