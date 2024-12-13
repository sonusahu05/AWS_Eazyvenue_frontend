import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
// import { UserService } from '../../../services/user.service';
// import { RoleService } from '../../../services/role.service';
import { CommonService } from '../../../services/common.service';
import { DateValidator, TimeValidator } from '../../../_helpers/must-match.validator';
import { CustomValidators } from 'ng2-validation';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { maxYearFunction } from '../../../_helpers/utility';
import { CategoryService } from 'src/app/services/category.service';
import { EventService } from 'src/app/demo/service/eventservice';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SlotService } from 'src/app/services/slot.service';
import { TitleCasePipe } from '@angular/common';
import { saveAs } from 'file-saver/src/FileSaver';
import { PostAvailabilityService } from 'src/app/services/postAvailability.service';
import { LazyLoadEvent } from 'primeng/api';
import { Dropdown } from "primeng/dropdown";
@Component({
    selector: 'app-slot-availability',
    templateUrl: './slot-availability.component.html',
    styleUrls: ['./slot-availability.component.scss'],
    providers: [MessageService, ConfirmationService, TitleCasePipe],
})
export class VenueSlotAvailabilityComponent implements OnInit {
    postAvailabilityForm: FormGroup;
    addSlotForm: FormGroup;
    calendarSearchForm: FormGroup;
    deletePostAvailabilityForm: FormGroup;
    errorMessage = '';
    submitted = false;
    minYear = environment.minYear;
    yearRange;
    events: any[];
    options: any;
    header: any;
    eventDialog: boolean;
    deleteEventDialog: boolean;
    changedEvent: any;
    slotList: any[] = [];
    clickedEvent = null;
    recurring;
    trainerList: any[] = [];
    venueId;
    trainerRoleId;
    slotDetails: any[] = [];
    addSloteventDialog;
    maxDate: Date;
    minTime: Date;
    timeValue: any;
    trainerListaddSlot: any[] = [];
    statuses: any = [];
    slotStatus: any;
    searchBy: any[];
    rowGroupMetadata: any;
    totalRecords: 0;
    totalpostAvailabilityRecords = 0;
    virtualDatabase: any;
    searchby;
    startDate: Date;
    endDate: Date;
    dcalvalue: Date;
    downloadFlg: boolean;
    public imageProfile;
    showProfile = false;
    loading: boolean;
    paginationOption;
    slotListArr: any[] = [];
    slotsArr: any[] = [];
    slotDataArr: any[] = [];
    defaultDate;
    today;
    todayAsStr: any;
    minDateValue;
    maxDateValue;
    currentYear;
    yearDiff;
    maxYear;
    selectedSlotDate;
    showCalendar: boolean;
    selectedStartDate;
    selectedEndDate;
    downloadUserList: any;
    slotId: any[];
    postAvailabilityList: any[] = [];
    postAvailabilityDataArr: any[] = [];
    postAvailabilityStatus;
    loadCalendarObj;
    viewOptions;
    showViewCalendar: boolean;
    sDate;
    eDate;
    selectedTrainer;
    postAvailabilityAdded: boolean;
    deleteEventId;
    selectedSlotListArr: any[] = [];
    slotAction: boolean;
    oldSlotListArr: any[] = [];
    globalSlotObj;
    alreadyAdded: boolean;
    slotType;
    public minDuration: Date = new Date(0, 0, 0, 0, 15, 0, 0);
    private lastTableLazyLoadEvent: LazyLoadEvent;
    allDayArray: any[] = [];
    calvalue: Date;
    ucalvalue: Date;
    public id;
    @ViewChild("dt", { static: false }) public dt: Table;
    @ViewChild("pDropDownId", { static: false }) pDropDownId: Dropdown;
    @ViewChild("pDropDownId2", { static: false }) pDropDownId2: Dropdown;
    constructor(private titlecasePipe: TitleCasePipe, private el: ElementRef, private commonService: CommonService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService, private categoryService: CategoryService, private eventService: EventService, private slotService: SlotService, private postAvailabilityService: PostAvailabilityService,
        private router: Router, private activateRoute: ActivatedRoute) { }
    ngOnInit(): void {
        this.id = this.activateRoute.snapshot.params.id;
        this.yearDiff = environment.yearDiff;
        this.currentYear = new Date();
        this.currentYear = this.currentYear.getFullYear();
        this.maxYear = moment({ year: this.currentYear + this.yearDiff }).format('YYYY');
        this.yearRange = this.currentYear + ":" + this.maxYear;
        this.events = [];
        this.slotAction = false;
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.downloadFlg = false;
        this.addSlotForm = this.formBuilder.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            status: [{ label: 'Active', value: true }, Validators.required],
            disable: [false],
        }, {
            validator: TimeValidator('startTime', 'endTime')
        });
        this.calendarSearchForm = this.formBuilder.group({
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
        }, {
            validator: DateValidator('startDate', 'endDate')
        });
        this.deletePostAvailabilityForm = this.formBuilder.group({
            yes: [true],
            disable: [true],
        });
        this.slotStatus = true;
        this.postAvailabilityStatus = true;
        this.alreadyAdded = false;
        this.defaultDate = new Date();
        this.minDateValue = new Date();
        this.maxDateValue = new Date();
        this.maxDateValue.setFullYear(this.maxYear);
        this.slotType = "postAvailability";
        //this.getTrainerLIst();
        this.changedEvent = { title: '', start: null, end: '', allDay: null };
        this.showCalendar = false;
        this.showViewCalendar = true;
        //To load default Calendar
        this.sDate = moment(new Date()).format('YYYY-MM-DD');
        this.eDate = moment(this.sDate).add(1, 'months').endOf('month').format('YYYY-MM-DD');
        this.eDate = moment(this.eDate).add(1, 'days').format('YYYY-MM-DD');
        this.selectedStartDate = this.sDate;
        this.selectedEndDate = this.eDate;
        this.postAvailabilityAdded = false;
        this.calendarSearchForm.get('startDate').setValue(moment(this.defaultDate).format('DD-MM-YYYY'));
        this.calendarSearchForm.get('endDate').setValue(moment(this.defaultDate).format('DD-MM-YYYY'));
        this.postAvailabilityForm = this.formBuilder.group({
            // slot: ['', Validators.required],
            // recurring: [false],
            trainer: [''],
            // postAvailabilityStatus: [{ label: 'Active', value: true }, Validators.required],
            disable: [false],
        });
        this.getSlotsList(this.lastTableLazyLoadEvent);
        let loadCalendarObj = {
            startDate: this.selectedStartDate,
            endDate: this.selectedEndDate,
            venueId: this.id
        }
        this.getPostAvailabilityList(loadCalendarObj);
        this.allDayArray = [
            { id: '0', dayName: "Sunday" },
            { id: '0', dayName: "Monday" },
            { id: '0', dayName: "Tuesday" },
            { id: '0', dayName: "Wednesday" },
            { id: '0', dayName: "Thursday" },
            { id: '0', dayName: "Friday" },
            { id: '0', dayName: "Saturday" },
        ];
    }
    // convenience getter for easy access to form fields
    get f() {
        return this.postAvailabilityForm.controls;
    }
    // convenience getter for easy access to form fields
    get slotf() {
        return this.addSlotForm.controls;
    }
    // convenience getter for easy access to form fields
    get calendarSearchf() {
        return this.calendarSearchForm.controls;
    }
    onRecurringSelect(event) {
        if (event.checked) {
            this.recurring = true;
        } else {
            this.recurring = false;
        }
    }
    closePostAvailabilityForm() {
        this.eventDialog = false;
        this.postAvailabilityForm.reset();
    }
    selectStartDate(event) {
        this.selectedStartDate = moment(event).format("YYYY-MM-DD");
    }
    selectEndDate(event) {
        this.selectedEndDate = moment(event).format("YYYY-MM-DD");
    }
    loadCalendarOnSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        // if (this.calendarSearchForm.invalid) {
        //     return;
        // }
        this.submitted = true;
        // stop here if form is invalid
        // if (this.calendarSearchForm.invalid) { 
        //     return;
        // }
        let postAvailabilityData = this.calendarSearchForm.value;
        postAvailabilityData['slotData'] = this.selectedSlotListArr;
        postAvailabilityData['venueId'] = this.id;
        // postAvailabilityData['startDate'] = moment(this.selectedStartDate).format('DD-MM-YYYY');
        // postAvailabilityData['endDate'] = moment(this.selectedEndDate).format('DD-MM-YYYY');
        var startDate = moment.tz(moment(this.selectedStartDate).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm Z', moment.tz.guess());
        postAvailabilityData['startDate'] = startDate.format('');
        // //var eddate = new Date(this.selectedEndDate);        
        var enddate = moment.tz(moment(this.selectedEndDate).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm Z', moment.tz.guess());
        postAvailabilityData['endDate'] = enddate.format('');
        postAvailabilityData['recurring'] = true;
        this.postAvailabilityService.addPostAvailability(postAvailabilityData).subscribe(
            data => {
                this.messageService.add({ key: 'calendarSearchtoastmsg', severity: 'success', summary: 'Successful', detail: "Added Post Availability ", life: 6000 });
                this.calendarSearchForm.reset();
                // this.slotListArr = [];
                //this.eventDialog = false;
                this.selectedSlotListArr = [];
                // this.calendarSearchForm.reset();
                // //this.slotListArr = this.oldSlotListArr;
                // this.oldSlotListArr.forEach(slot => {
                //     let slotObj = {
                //         id: slot.id,
                //         slot: slot.slot,
                //         slotRecurringStatus: true,
                //     }
                //     //this.calendarSearchForm.get(slot.slot).disable();
                //     this.slotListArr.push(slotObj);
                // })
                setTimeout(() => {
                    // this.selectedSlotListArr = [];
                    // this.eventDialog = false;
                    let loadCalendarObj = {
                        startDate: this.selectedStartDate,
                        endDate: this.selectedEndDate,
                        venueId: this.id
                    }
                    //setTimeout(() => {
                    this.calendarSearchForm.get('startDate').setValue(moment(this.selectedStartDate).format('DD-MM-YYYY'));
                    this.calendarSearchForm.get('endDate').setValue(moment(this.selectedEndDate).format('DD-MM-YYYY'));
                    //window.location.reload();
                    // this.getSlotsList(this.lastTableLazyLoadEvent);
                    this.getPostAvailabilityList(loadCalendarObj);
                    //}, 2000);
                }, 2000);
            }, err => {
                this.messageService.add({ key: 'calendarSearchtoastmsg', severity: 'error', summary: 'error', detail: err.error, life: 3000 });
            }
        );
    }
    loadViewCalendar() {
        this.showViewCalendar = true;
        let startDate = moment(new Date()).format('YYYY-MM-DD');
        let endDate = moment(startDate).add(1, 'months').endOf('month').format('YYYY-MM-DD');
        endDate = moment(endDate).add(2, 'year').format('YYYY-MM-DD');
        this.eventService.getEvents().then(events => {
            events = [];
            this.events = events;
            this.viewOptions = { ...this.viewOptions, ...{ events: events } };
        });
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        this.viewOptions = {
            initialDate: new Date(),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            editable: false,
            selectable: true,
            selectMirror: true,
            //dayMaxEvents: true,
            allDaySlot: false,
            showNonCurrentDates: false,
            validRange: {
                start: startOfMonth,
                end: endDate
            },
            eventClick: (e) => {
                this.eventDialog = true;
                this.selectedSlotDate = e.event.start;
                if (e.event.classNames == "view") {
                    this.eventDialog = false;
                }
            }
        };
    }
    loadPostAvailabilityCalendar(event) {
        let startDate = this.sDate;
        let endDate = moment(this.sDate).add('2', 'year').format("YYYY-MM-DD");
        let sDate = new Date(startDate);
        let edate = new Date(endDate);
        let time = edate.getTime() - sDate.getTime();
        let days = time / (1000 * 3600 * 24); //Diference in Days
        this.showCalendar = true;
        let query = "?filterByVenueId=" + this.id;
        this.postAvailabilityService.getPostAvailabilityList(query).subscribe(
            data => {
                this.loading = false;
                if (data.data != undefined && data.data != '') {
                    this.postAvailabilityList = data.data.items;
                    this.totalpostAvailabilityRecords = data.data.totalCount;
                    let count = 0;
                    this.postAvailabilityList.forEach(element => {
                        //We are getting time slot date into UTC so we are converting date into local time.
                        // if (this.slotListArr.length > 0) {
                        //this.slotListArr.forEach(slot => {
                        let postAvailabilityObj = {
                            id: element.id,
                            slot: element.slot,
                            slotDate: element.slotdate, //moment(element.slotdate), //.format("YYYY-MM-DD"),
                            slotendDate: element.slotenddate, //moment(element.slotendDate),//.format("YYYY-MM-DD"),
                            slotday: element.slotday,
                        }
                        //if (element.slotId == slot.id) {
                        if (element.disable == false) {
                            // setTimeout(() => {
                            this.postAvailabilityDataArr.push(postAvailabilityObj);
                            // }, 2000);
                        }
                        //}
                        //});
                        //}
                    });
                }
                this.eventService.getEvents().then(events => {
                    events = [];
                    this.events = events;
                    //Use to show add event
                    for (let i = 0; i <= days; i++) {
                        let calendarDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
                        this.events.push({ id: i, title: "Add slot", start: calendarDate, classNames: "add" });
                    }
                    //Use to show View event
                    this.postAvailabilityDataArr.forEach(postAvailability => {
                        for (let i = 0; i <= days; i++) {
                            let date = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
                            let newStartDate = new Date(startDate);
                            // newStartDate.setHours(postAvailability.slotStartHours);
                            // newStartDate.setMinutes(postAvailability.slotStartMinutes);
                            let newSDate = moment(newStartDate).add(i, 'days').format('YYYY-MM-DD HH:mm');
                            let newEndDate = new Date(startDate);
                            // newEndDate.setHours(postAvailability.slotEndHours);
                            // newEndDate.setMinutes(postAvailability.slotEndMinutes);
                            let newEDate = moment(newEndDate).add(i, 'days').format('YYYY-MM-DD HH:mm');
                            // if (date === postAvailability.slotDate) {
                            //     this.events.push({ id: postAvailability.id, title: "<span style='height: 100% !important;width: 100% !important;text-align: center'>Slot: " + postAvailability.slot + "</span>", classNames: "view", start: newSDate, end: newEDate, color: '#08b394', slotEventOverlap: false });
                            // }
                            if (date === moment(postAvailability.slotDate).local().format("YYYY-MM-DD")) {
                                var slotTime = moment(postAvailability.slotDate).local().format("h:mm a") + " - " + moment(postAvailability.slotendDate).local().format("h:mm a");
                                this.events.push({ id: postAvailability.id, title: "Slots: " + postAvailability.slot, classNames: "view", start: newSDate, end: newEDate, color: '#08b394' });
                            }
                        }
                    });
                    //this.postAvailabilityDataArr = [];
                    this.options = {
                        ...this.options, ...{ events: events }, eventContent: function (info) {
                            let addTrashHtml = "<i class='pi pi-trash float-left' style='color:red'></i>&nbsp;&nbsp;";
                            let addHtml = "<i class='pi pi-plus float-right'></i>";
                            let title = info.event.title;
                            if (info.event.classNames == "view") {
                                return { html: addTrashHtml + title };
                            } else if (info.event.classNames == "add") {
                                return { html: title + addHtml };
                            } else {
                                return { html: title };
                            }
                        },
                        // eventDisplay: function( info ) {
                        // }
                    };
                });
            },
            err => {
                this.errorMessage = err.error.message;
            });
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment(endDate).add(2, 'year').format('YYYY-MM-DD');
        this.options = {
            initialDate: new Date(),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            editable: false,
            selectable: true,
            selectMirror: true,
            expandRows: true,
            allDaySlot: false,
            showNonCurrentDates: false,
            validRange: {
                start: startOfMonth,
                end: endDate
            },
            eventClick: (e) => {
                this.eventDialog = true;
                this.selectedSlotDate = e.event.start;
                //this.postAvailabilityForm.reset();
                this.postAvailabilityForm = this.formBuilder.group({
                    // slot: ['', Validators.required],
                    // recurring: [false],
                    trainer: [''],
                    // postAvailabilityStatus: [{ label: 'Active', value: true }, Validators.required],
                    disable: [false],
                });
                this.slotListArr.forEach(slot => {
                    this.postAvailabilityForm.addControl(slot.id, new FormControl());
                    this.postAvailabilityForm.addControl(slot.slot, new FormControl({ value: '', disabled: true }));
                    this.postAvailabilityList.forEach(post => {
                        if (post.slotId == slot.id && moment(this.selectedSlotDate, "YYYY-MM-DD").isSame(moment(post.slotdate).local().format("YYYY-MM-DD"))) {
                            if (post.disable == false && moment(this.selectedSlotDate, "YYYY-MM-DD").isSame(moment(post.slotdate).local().format("YYYY-MM-DD"))) {
                                this.postAvailabilityForm.get(post.slotId).setValue(true);
                                this.postAvailabilityForm.get(post.slotId).disable();
                            }
                            if (post.recurring == true) {
                                if (post.disable == false && moment(this.selectedSlotDate, "YYYY-MM-DD").isSame(moment(post.slotdate).local().format("YYYY-MM-DD"))) {
                                    this.postAvailabilityForm.get(slot.slot).disable();
                                }
                                this.postAvailabilityForm.get(slot.slot).setValue(true);
                            }
                            let obj = { slot: slot.slot, recurring: post.recurring, id: slot.id };
                            this.alreadyAdded = true;
                            this.selectedSlotListArr.push(obj);
                        }
                    })
                })
                this.deleteEventDialog = false;
                if (e.event.classNames == "view") {
                    this.deleteEventId = e.event.id;
                    this.eventDialog = false;
                    //this.deleteEventDialog = true;
                    let slotObj = {
                        slotId: e.event.id,
                        slotName: e.event.title,
                    }
                    this.onPostAvailabilityDeleteSubmit(slotObj);
                    this.postAvailabilityForm.reset();
                }
            }
        };
        this.events = [];
        this.postAvailabilityDataArr = [];
    }
    onAddSlotClick() {
        this.addSloteventDialog = true;
    }
    setDownloadFlag() {
        this.downloadFlg = false;
    }
    getPostAvailabilityList(event) {
        //let query = "?filterByDisable=false";
        let query = "?filterByVenueId=" + this.id;
        this.postAvailabilityService.getPostAvailabilityList(query).subscribe(
            data => {
                this.loading = false;
                if (data.data != undefined && data.data != '') {
                    this.postAvailabilityList = data.data.items;
                    this.totalpostAvailabilityRecords = data.data.totalCount;
                    let count = 0;
                    this.postAvailabilityList.forEach(element => {
                        element.created_at = new Date(element.created_at);
                        element.updated_at = new Date(element.updated_at);
                        //We are getting time slot date into UTC so we are converting date into local time.
                        // if (this.slotListArr.length > 0) {
                        //this.slotListArr.forEach(slot => {
                        // let postAvailabilityObj = {
                        //     id: element.id,
                        //     slot: element.slotTime,
                        //     slotDate: moment(element.slotdate).format("YYYY-MM-DD"),
                        //     slotday: element.slotday,
                        // }
                        //if (element.slotId == slot.id) {
                        // if (element.disable == false) {
                        //     // setTimeout(() => {
                        //     this.postAvailabilityDataArr.push(postAvailabilityObj);
                        //     // }, 2000);
                        // }
                        //}
                        //});
                        //}
                    });
                }
            },
            err => {
                this.errorMessage = err.error.message;
            });
        this.loadPostAvailabilityCalendar(event);
    }
    getSlotsList(event: LazyLoadEvent) {
        this.lastTableLazyLoadEvent = event;
        this.slotListArr = [];
        let query = "?filterByDisable=false";
        let pagenumber = 1;
        let params = "";
        let rows;
        this.slotService.getSlotList(query).subscribe(
            data => {
                this.loading = false;
                this.slotList = data.data.items;
                this.totalRecords = data.data.totalCount;
                this.slotList.forEach(element => {
                    element.created_at = moment(element.created_at).local().format("DD-MM-YYYY");
                    element.updated_at = moment(element.updated_at).local().format("DD-MM-YYYY");
                    let recurringCheckSTatus = true;
                    let slotObj = {
                        id: element.id,
                        slot: element.slot,
                        slotRecurringStatus: recurringCheckSTatus,
                        created_at: element.created_at,
                        updated_at: element.updated_at,
                    }
                    if (element.disable == false && element.status == true) {
                        this.slotListArr.push(slotObj);
                        this.calendarSearchForm.addControl(element.id, new FormControl());
                        this.calendarSearchForm.addControl(slotObj.slot, new FormControl());
                    }
                    this.oldSlotListArr = this.slotListArr;
                });
            },
            err => {
                this.errorMessage = err.error.message;
            });
    }
    onPostAvailabilitySubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.postAvailabilityForm.invalid) {
            return;
        }
        let postAvailabilityData = this.postAvailabilityForm.value;
        this.slotsArr = this.postAvailabilityForm.value.slot;
        let slotCount = this.selectedSlotListArr.length;
        let count = 0;
        let errorCount = 0;
        if (this.selectedSlotListArr.length == 0) {
            this.messageService.add({ key: 'postAvailabilityToastmsg', severity: 'error', detail: 'Please select atlease one slot which is not already exist.', life: 6000 });
            return;
        }
        var startDate = moment.tz(moment(this.selectedSlotDate).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm Z', moment.tz.guess());
        // //var eddate = new Date(this.selectedEndDate);        
        var enddate = moment.tz(moment(this.selectedSlotDate).format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm Z', moment.tz.guess());
        this.selectedSlotListArr.forEach(slotElement => {
            this.slotId = slotElement.slotId;
            let postAvailabilityObj = {
                slotdata: slotElement,
                slotId: slotElement.slotId,
                venueId: this.id,
                recurring: false,
                startDate: startDate.format(''),
                endDate: enddate.format(''),
                slotdate: moment(this.selectedSlotDate).format('DD-MM-YYYY'),
                // status: this.postAvailabilityStatus,
                disable: false,
            }
            this.postAvailabilityService.addPostAvailability(postAvailabilityObj).subscribe(
                data => {
                    count++;
                    if (slotCount == count) {
                        this.messageService.add({ key: 'postAvailabilityToastmsg', severity: 'success', summary: 'Successful', detail: 'Post Availability Added', life: 6000 });
                        setTimeout(() => {
                            this.slotListArr = [];
                            this.eventDialog = false;
                            this.selectedSlotListArr = [];
                            this.postAvailabilityForm.reset();
                            //this.slotListArr = this.oldSlotListArr;
                            this.oldSlotListArr.forEach(slot => {
                                let slotObj = {
                                    id: slot.id,
                                    slot: slot.slot,
                                    slotRecurringStatus: true,
                                }
                                this.postAvailabilityForm.get(slot.slot).disable();
                                this.slotListArr.push(slotObj);
                            })
                            let loadCalendarObj = {
                                startDate: this.selectedStartDate,
                                endDate: this.selectedEndDate,
                                venueId: this.id
                            }
                            //setTimeout(() => {
                            this.calendarSearchForm.get('startDate').setValue(moment(this.sDate).format('DD-MM-YYYY'));
                            this.calendarSearchForm.get('endDate').setValue(moment(this.eDate).format('DD-MM-YYYY'));
                            this.getPostAvailabilityList(loadCalendarObj);
                            //}, 2000);
                        }, 2000);
                    }
                },
                ((err) => {
                    errorCount++;
                    if (slotCount == errorCount + 1) {
                        this.messageService.add({ key: 'postAvailabilityToastmsg', severity: 'error', summary: err.error.message, detail: err.error.error, life: 6000 });
                        this.selectedSlotListArr = [];
                    }
                })
            );
        });
    }
    onStatusSelect(event) {
        if (event) {
            this.slotStatus = event.value;
        }
    }
    onPostAvailabilityStatusSelect(event) {
        if (event) {
            this.postAvailabilityStatus = event.value;
        }
    }
    onSlotSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.addSlotForm.invalid) {
            return;
        }
        let addSlotData = this.addSlotForm.value;
        let startTime = this.addSlotForm.value['startTime'];
        let endTime = this.addSlotForm.value['endTime'];
        let startTimeHoursM = moment(startTime).format('HH:mm');
        let endTimeHoursM = moment(endTime).format('HH:mm');
        addSlotData['status'] = this.slotStatus;
        addSlotData['startTime'] = startTimeHoursM;
        addSlotData['endTime'] = endTimeHoursM;
        addSlotData['venueId'] = this.id;
        addSlotData['slotType'] = this.slotType;
        addSlotData['disable'] = 'false';
        addSlotData = JSON.stringify(addSlotData, null, 4);
        this.slotService.addSlot(addSlotData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Added', life: 6000 });
                setTimeout(() => {
                    this.addSloteventDialog = false;
                    this.addSlotForm.reset();
                    this.getSlotsList(this.lastTableLazyLoadEvent);
                    //this.router.navigate(['/manage/trainer/calendar']);
                }, 2000);
            },
            ((err) => {
                this.messageService.add({ key: 'addSlotToastmsg', severity: 'error', summary: err.error.message, detail: 'Add Slot failed', life: 6000 });
                this.addSlotForm.reset();
                this.getSlotsList(this.lastTableLazyLoadEvent);
            })
        );
    }
    // save() {
    //     this.eventDialog = false;
    //     this.clickedEvent.setProp('title', this.changedEvent.title);
    //     this.clickedEvent.setStart(this.changedEvent.start);
    //     this.clickedEvent.setEnd(this.changedEvent.end);
    //     this.clickedEvent.setAllDay(this.changedEvent.allDay);
    //     this.changedEvent = { title: '', start: null, end: '', allDay: null };
    // }
    reset() {
        this.submitted = false;
        this.postAvailabilityForm.reset();
        this.selectedSlotListArr = [];
    }
    resetdeletepostAvailabilityForm() {
        this.submitted = false;
        this.postAvailabilityForm.reset();
    }
    resetAddSlotForm() {
        this.submitted = false;
        this.addSlotForm.reset();
    }
    changeStatus(slot) {
        var slotTime = slot.startTime.hours + ":" + slot.startTime.minutes + " - " + slot.endTime.hours + ":" + slot.endTime.minutes;
        this.confirmationService.confirm({
            message: 'Are you sure you want to change the status of  ' + (this.titlecasePipe.transform(slotTime)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                let courseData = '{"status":' + slot.status + '}';
                this.slotService.updateSlot(slot.id, courseData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Status Updated', life: 3000 });
                        this.getSlotsList(this.lastTableLazyLoadEvent);
                        // this.getSlotDetails(slot.id);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                        this.getSlotsList(this.lastTableLazyLoadEvent);
                    }
                );
            },
            reject: () => {
                this.getSlotsList(this.lastTableLazyLoadEvent);
            }
        });
    }
    deleteSlot(slot) {
        var slotTime = slot.startTime.hours + ":" + slot.startTime.minutes + " - " + slot.endTime.hours + ":" + slot.endTime.minutes;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(slotTime)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                let disableStatus;
                if (slot.disable == false) {
                    disableStatus = true;
                } else {
                    disableStatus = false;
                }
                let slotData = '{"disable":' + disableStatus + '}';
                this.slotService.updateSlot(slot.id, slotData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Deleted', life: 3000 });
                        this.getSlotsList(this.lastTableLazyLoadEvent);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
                //this.getUserDetails(user.id);
            }
        });
    }
    onPostAvailabilityDeleteSubmit(slot) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + (this.titlecasePipe.transform(slot.slotName)) + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                let disableStatus = true;
                let deleteData = '{"disable":' + disableStatus + '}';
                this.postAvailabilityService.updatePostAvailability(slot.slotId, deleteData).subscribe(
                    data => {
                        this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Slot Deleted', life: 3000 });
                        setTimeout(() => {
                            this.deleteEventDialog = false;
                            let loadCalendarObj = {
                                startDate: this.selectedStartDate,
                                endDate: this.selectedEndDate,
                                venueId: this.id
                            }
                            this.getPostAvailabilityList(loadCalendarObj);
                        }, 2000);
                        this.getSlotsList(this.lastTableLazyLoadEvent);
                    },
                    err => {
                        this.errorMessage = err.error.message;
                    }
                );
            },
            reject: () => {
            }
        });
    }
    cancelPostAvailability() {
        this.deleteEventDialog = false;
    }
    onSlotSelect(slot, event, day) {
        if (this.alreadyAdded == true) {
            this.selectedSlotListArr = [];
        }
        // this.selectedSlotListArr = [];
        // if (action == 'slot' && event.checked == true) {
        //     this.alreadyAdded = false;
        //     let slotObj = {
        //         id: slot.id,
        //         slot: slot.slot,
        //         slotRecurringStatus: false,
        //     }
        //     let slotIndex = this.findIndexById(slot.slot, this.slotListArr);
        //     // this.postAvailabilityForm.addControl(slot.slot, new FormControl({value: '', disabled: false}, Validators.required));
        //     this.postAvailabilityForm.get(slot.slot).enable();
        //     //this.slotListArr[slotIndex] = slotObj;
        //     let obj = { slot: slot.slot, recurring: false, id: slot.id };
        //     this.selectedSlotListArr.push(obj);
        //     this.slotAction = true;
        // }
        // if (action == 'slot' && event.checked == false) {
        //     let slotObj = {
        //         id: slot.id,
        //         slot: slot.slot,
        //         slotRecurringStatus: true,
        //     }
        //     let slotIndex = this.findIndexById(slot.slot, this.slotListArr);
        //     //this.postAvailabilityForm.addControl(slot.slot, new FormControl({value: '', disabled: true}, Validators.required));
        //     //this.slotListArr[slotIndex] = slotObj;
        //     this.postAvailabilityForm.get(slot.slot).disable();
        //     let index = this.findIndexById(slot.slot, this.selectedSlotListArr);
        //     this.selectedSlotListArr.splice(index, 1);
        // }
        if (event.checked == true) {
            this.alreadyAdded = false;
            if (this.slotAction == false) {
                this.messageService.add({ key: 'postAvailabilityDeleteToastmsg', severity: 'error', summary: 'Successful', detail: 'Please Select atleast one slot.', life: 3000 });
            }
            let obj = { slot: slot.slot, slotId: slot.id, slotday: day, status: true, disable: false };
            let index = this.findSlotIndexById(slot.slot, this.selectedSlotListArr, day);
            if (index == -1) {
                this.selectedSlotListArr.push(obj);
            } else {
                this.selectedSlotListArr[index] = obj;
            }
        }
        if (event.checked == false) {
            // let obj = { slot: slot.slot, recurring: false, id: slot.id };
            let index = this.findSlotIndexById(slot.slot, this.selectedSlotListArr, day);
            this.calendarSearchForm.get(slot.id).setValue(false);
            // this.selectedSlotListArr[index] = obj;
            this.selectedSlotListArr.splice(index, 1);
        }
    }
    findSlotIndexById(name, arrayName, day) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].slot === name && arrayName[i].slotday === day) {
                index = i;
                break;
            }
        }
        return index;
    }
    onAllSlotSelect(slot, event, action) {
        if (event.checked == true && action == "All") {
            this.allDayArray.forEach(day => {
                let obj = { slot: slot.slot, venueId: this.id, slotId: slot.id, slotday: day.dayName, status: true, disable: false };
                let index = this.findSlotIndexById(slot.slot, this.selectedSlotListArr, day.dayName);
                if (index == -1) {
                    // this.calendarSearchForm.get(slot.slot).setValue(moment(this.sDate).format('DD-MM-YYYY'));
                    this.calendarSearchForm.get(slot.slot).setValue(true);
                    // if(day.dayName) {
                    this.selectedSlotListArr.push(obj);
                    // }
                }
                if (index != -1) {
                    let notExistingIndex = this.findSlotIndexById(slot.slot, this.selectedSlotListArr, day);
                    if (index == notExistingIndex) {
                        this.selectedSlotListArr.splice(index, 1);
                    }
                }
            });
        }
        if (event.checked == false && action == "All") {
            this.allDayArray.forEach(day => {
                let obj = { slot: slot.slot, venueId: this.id, id: slot.id, slotday: day.dayName, status: true, disable: false };
                let index = this.findSlotIndexById(slot.slot, this.selectedSlotListArr, day.dayName);
                if (index != -1) {
                    //    // this.calendarSearchForm.get(slot.slot).setValue(moment(this.sDate).format('DD-MM-YYYY'));
                    //     this.calendarSearchForm.get(slot.id).setValue(true);
                    //     this.selectedSlotListArr.push(obj);
                    this.selectedSlotListArr.splice(index, 1);
                    this.calendarSearchForm.get(slot.slot).setValue(false);
                }
            });
        }
    }
    findIndexById(name, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].slot === name) {
                index = i;
                break;
            }
        }
        return index;
    }
    /**
     * Use to add more columns in the table.
    */
    addColumns() {
        let showp1Table = this.el.nativeElement.querySelector(".p1-table-columns");
        showp1Table.classList.remove('hide-columns');
        showp1Table.classList.add('show-columns');
        let hidep2Table = this.el.nativeElement.querySelector(".p2-table-columns");
        hidep2Table.classList.remove('show-columns');
        hidep2Table.classList.add('hide-columns');
    }
    /**
    * Use to remove more columns in the table.
    */
    removeColumns() {
        let showp2Table = this.el.nativeElement.querySelector(".p2-table-columns");
        showp2Table.classList.remove('hide-columns');
        showp2Table.classList.add('show-columns');
        let hidep1Table = this.el.nativeElement.querySelector(".p1-table-columns");
        hidep1Table.classList.add('hide-columns');
        hidep1Table.classList.remove('show-columns');
    }
    clear() {
        this.startDate = null;
        this.endDate = null;
        this.searchby = '';
        this.dt.filter('', 'startTime', 'contains');
        this.dt.filter('', 'endTime', 'contains');
        this.dt.filter('', 'status', 'contains');
        this.dt.filter('', 'created_at', 'dateIs');
        this.dt.filter('', 'createdby', 'contains');
        this.dt.filter('', 'updated_at', 'dateIs');
        this.dt.filter('', 'updatedby', 'contains');
        this.calvalue = null;
        this.ucalvalue = null;
        this.dcalvalue = null;
        this.pDropDownId2.clear(null);
        if (this.pDropDownId) {
            this.pDropDownId.clear(null);
        }
    }
    exportExcel() {
        this.downloadFlg = true;
        //this.getSlotsList(this.lastTableLazyLoadEvent);
        let propertiesRemove = ['slotRecurringStatus', 'created_by', 'venueId', 'enduserName', 'status', 'role', 'profilepic', 'createdby', 'updatedby', 'disable', 'countrycode', 'statecode', 'venueId', 'courseId', 'courseCategory', 'id', 'startTime', 'endTime', 'createdBy', 'created_at', 'updatedby', 'updated_at'];
        this.downloadUserList = this.slotListArr;
        this.downloadUserList.forEach(function (item) {
            propertiesRemove.forEach(function (prop) {
                delete item[prop];
            });
        });
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.downloadUserList);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            this.saveAsExcelFile(excelBuffer, "Slots");
        });
    }
    saveAsExcelFile(buffer: any, fileName: string): void {
        import("file-saver").then(FileSaver => {
            let EXCEL_TYPE =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            let EXCEL_EXTENSION = ".xlsx";
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            let filename;
            filename = fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION;
            saveAs(data, filename);
        });
    }
}
