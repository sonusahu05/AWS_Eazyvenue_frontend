import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { CommonService } from '../../../services/common.service';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
import { VenueService } from '../../venue/service/venue.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { SlotService } from 'src/app/services/slot.service';
@Component({
    selector: 'app-venue-slot-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class AddVenueSlotManagementComponent implements OnInit {
    addSlotForm: FormGroup;
    errorMessage = '';
    submitted = false;
    minYear = environment.minYear;
    yearRange;
    venueList: any[] = [];
    totalRecords;
    htmlContent = '';
    public slotList: any[] = [];
    public slotStatus;
    public venueId;
    config: AngularEditorConfig = {
        editable: true,
        sanitize: false,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        placeholder: 'Enter text here...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Arial',
        toolbarHiddenButtons: [
            ['bold']
        ],
        customClasses: [
            {
                name: "quote",
                class: "quote",
            },
            {
                name: 'redText',
                class: 'redText'
            },
            {
                name: "titleText",
                class: "titleText",
                tag: "h1",
            },
        ]
    };
    public statuses;
    constructor(private roleService: RoleService, private commonService: CommonService, private userService: UserService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private slotService: SlotService,
        private VenueService: VenueService) { }
    ngOnInit(): void {
        this.yearRange = this.minYear + ":" + maxYearFunction();
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.slotList = [
            { 'id': 1, name: 'Morning' },
            { 'id': 2, name: 'Evening' },
            { 'id': 3, name: 'Full Day' },
        ];
        this.addSlotForm = this.formBuilder.group({
            slot: ['', Validators.required],
            description: [''],
            status: [{ label: 'Active', value: true }, Validators.required],
            disable: [false],
        },);
        this.getVenueList();
    }
    // convenience getter for easy access to form fields    
    get f() {
        return this.addSlotForm.controls;
    }
    getVenueList() {
        let query = "?filterByDisable=false";
        this.VenueService.getvenueList(query).subscribe((data) => {
            this.venueList = data.data.items;
            this.totalRecords = data.data.totalCount;
        })
    }
    onStatusSelect(event) {
        if (event) {
            this.slotStatus = event.value;
        }
    }
    onVenueSelect(event) {
        if (event) {
            this.venueId = event.id;
            console.log(event);
        }
    }
    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.addSlotForm.invalid) {
            return;
        }
        let addSlotData = this.addSlotForm.value;
        addSlotData['status'] = this.slotStatus;

        addSlotData = JSON.stringify(addSlotData, null, 4);
        console.log(addSlotData);
        this.slotService.addSlot(addSlotData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Added', life: 6000 });
                setTimeout(() => {
                    this.addSlotForm.reset();
                    this.submitted = false;
                    this.router.navigate(['/manage/venue/slot']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'addSlotToastmsg', severity: 'error', summary: err.error.message, detail: 'Add Slot failed', life: 6000 });
                this.addSlotForm.reset();
                this.submitted = false;
            })
        );
    }
    onReset() {
        this.submitted = false;
        this.addSlotForm.reset();
    }
    backLink() {
        this.router.navigate(['/manage/venue/slot']);
    }
  
}
