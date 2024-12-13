import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (!control.value) return null;
        if (!matchingControl.value) return null;
        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

export function DateValidator(startDate: string, endDate: string) {
    return (formGroup: FormGroup) => {
        const startDateControl = formGroup.controls[startDate];
        const endDateControl = formGroup.controls[endDate];
        if (!startDateControl.value) return null;
        if (!endDateControl.value) return null;
      
        
        // set error on control if validation fails
        var startD = moment(startDateControl.value, 'DD-MM-YYYY').utc().toDate();//Date format should be "DD-MM-YYYY"
        var endD = moment(endDateControl.value, 'DD-MM-YYYY').utc().toDate();
         if (moment(startD).isAfter(moment(endD))) {
            startDateControl.setErrors({ startDateError: true });
         }else{
            startDateControl.setErrors(null);
         }

    }
}

export function TimeValidator(startTime: string, endTime: string) {
    

    return (formGroup: FormGroup) => {
        const startTimeControl = formGroup.controls[startTime];
        const endTimeControl = formGroup.controls[endTime];
        if (!startTimeControl.value) return null;
        if (!endTimeControl.value) return null;
        var startTimeHoursM = moment(startTimeControl.value).format('HH:mm');
        var endTimeHoursM = moment(endTimeControl.value).format('HH:mm');
        // set error on control if validation fails
        if (endTimeHoursM <= startTimeHoursM) {
            startTimeControl.setErrors({ startTimeError: true });
        }else{
            startTimeControl.setErrors(null);
        }

    }
}