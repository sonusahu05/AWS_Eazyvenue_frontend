import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
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
    selector: 'app-venue-slot-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class EditVenueSlotManagementComponent implements OnInit {
    slotForm: FormGroup;
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
    public id;
    public item;
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
        private router: Router, private slotService: SlotService, private activeroute: ActivatedRoute,
        private VenueService: VenueService) { }
    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
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
        this.slotForm = this.formBuilder.group({
            slot: ['', Validators.required],
            description: [''],
            status: [{ label: 'Active', value: true }, Validators.required],
            disable: [false],
        },);
        this.getVenueList();
        this.getSlotDetails(this.id);
    }
    // convenience getter for easy access to form fields    
    get f() {
        return this.slotForm.controls;
    }
    getSlotDetails(id) {
        this.slotService.getSlotDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.slotForm.patchValue({
                        slot: this.item['slot'],
                        description: this.item['description'],
                    });
                    var statusobj;
                    if (this.item['status'] == true) {
                        statusobj = { label: 'Active', value: true };
                    } else {
                        statusobj = { label: 'In-Active', value: false };
                    }
                    this.slotForm.get('status').setValue(statusobj);
                }
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );

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
        if (this.slotForm.invalid) {
            return;
        }
        let slotData = this.slotForm.value;
        slotData['status'] = this.slotStatus;

        slotData = JSON.stringify(slotData, null, 4);
        console.log(slotData);
        this.slotService.updateSlot(this.id, slotData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Updated', life: 6000 });
                setTimeout(() => {
                    this.slotForm.reset();
                    this.submitted = false;
                    this.router.navigate(['/manage/venue/slot']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'addSlotToastmsg', severity: 'error', summary: err.error.message, detail: 'Update Slot failed', life: 6000 });
                this.slotForm.reset();
                this.submitted = false;
            })
        );
    }
    onReset() {
        this.submitted = false;
        this.slotForm.reset();
    }
    backLink() {
        this.router.navigate(['/manage/venue/slot']);
    }
}
