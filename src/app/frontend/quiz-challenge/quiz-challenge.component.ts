import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { UserService } from '../../services/user.service';

interface SpinPrize {
    id: number;
    name: string;
    icon: string;
    color: string;
    angle: number;
}

@Component({
    selector: 'app-quiz-challenge',
    templateUrl: './quiz-challenge.component.html',
    styleUrls: ['./quiz-challenge.component.scss'],
    providers: [MessageService]
})
export class QuizChallengeComponent implements OnInit, OnDestroy {
    // Login popup states
    numberPopup: boolean = false;
    otpPopup: boolean = false;
    submitted: boolean = false;
    isLoggedIn: boolean = false;
    loggedInUser: any = null;

    // Forms
    mobileForm: FormGroup;

    // OTP related
    otpArray: string[] = [];
    showOtpErrors: boolean = false;
    otpError: string;
    otp: string;
    mobileNumber: string;
    oldUser: any = { userType: 'new' };
    userFirstName: string = '';
    userLastName: string = '';
    firstNameError: boolean = false;
    lastNameError: boolean = false;

    // Game states
    showWelcome: boolean = true;
    showQuiz: boolean = false; // Keep same name for template compatibility
    showResults: boolean = false;
    quizStarted: boolean = false; // Keep same name for template compatibility

    // Prize pool
    isRegisteredForPrizes: boolean = false;
    registrationNumber: string = '';

    // Auto popup timer
    popupTimer: any;

    // Spin wheel vouchers
    spinPrizes: SpinPrize[] = [
        {
            id: 1,
            name: "₹500 OFF",
            icon: "🎟️",
            color: "#E74C3C",
            angle: 90
        },
        {
            id: 2,
            name: "₹300 OFF", 
            icon: "🎫",
            color: "#4ECDC4",
            angle: 180
        },
        {
            id: 3,
            name: "₹200 OFF",
            icon: "💳",
            color: "#2ECC71",
            angle: 270
        },
        {
            id: 4,
            name: "Try Again",
            icon: "🔄",
            color: "#F39C12",
            angle: 360
        }
    ];

    // Spin wheel properties
    isSpinning: boolean = false;
    spinResult: SpinPrize | null = null;
    wheelRotation: number = 0;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.mobileForm = this.formBuilder.group({
            mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        });
    }

    ngOnInit() {
        this.checkLoginStatus();
        this.startAutoPopupTimer();
    }

    ngOnDestroy() {
        if (this.popupTimer) {
            clearTimeout(this.popupTimer);
        }
    }

    checkLoginStatus() {
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        if (this.isLoggedIn) {
            this.loggedInUser = this.tokenStorageService.getUser();
        }
    }

    startAutoPopupTimer() {
        // Show login popup after 4 seconds if user is not logged in
        if (!this.isLoggedIn) {
            this.popupTimer = setTimeout(() => {
                this.numberPopup = true;
                this.otpPopup = false;
            }, 4000);
        }
    }

    // Form getter
    get h() {
        return this.mobileForm.controls;
    }

    // Mobile number submission
    onSubmitNumber() {
        this.submitted = true;
        if (this.mobileForm.invalid) {
            return;
        }

        this.mobileNumber = this.mobileForm.value.mobileNumber;
        let data = { mobileNumber: this.mobileNumber };

        this.authService.otpLogin(data).subscribe(
            (res: any) => {
                this.otpPopup = true;
                this.oldUser = {
                    userType: res.firstName === '' ? 'new' : 'old',
                    firstName: res.firstName,
                    lastName: res.lastName,
                };
                this.submitted = false;
                this.numberPopup = false;
            },
            (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.error || 'Failed to send OTP'
                });
            }
        );
    }

    // OTP related methods
    pastedEvent(event: any) {
        let clipboardData = event.clipboardData || (window as any).clipboardData;
        let pastedText = clipboardData.getData('text');
        if (pastedText.length === 4 && /^\d+$/.test(pastedText)) {
            this.otpArray = pastedText.split('');
        }
    }

    move(e: any, p: any, c: any, n: any, i: any) {
        let length = c.value.length;
        this.showOtpErrors = false;
        let maxLength = 1;

        if (length === maxLength) {
            this.otpArray[i] = c.value;
            if (n !== '') {
                n.focus();
            }
        }

        if (e.key === 'Backspace') {
            this.otpArray[i] = '';
            if (p !== '') {
                p.focus();
            }
        }
    }

    validateFirstName() {
        this.firstNameError = this.userFirstName.length <= 3;
    }

    validateLastName() {
        this.lastNameError = this.userLastName.length <= 3;
    }

    otpSubmit() {
        this.otp = this.otpArray.join('');

        if (this.oldUser.userType === 'new') {
            if (this.userFirstName.length <= 3) {
                this.firstNameError = true;
                return;
            }
            if (this.userLastName.length <= 3) {
                this.lastNameError = true;
                return;
            }
        }

        if (this.otp == undefined || this.otp.length < 4) {
            this.showOtpErrors = true;
            return;
        }

        let data: any = {};
        data['mobileNumber'] = this.mobileNumber;
        data['firstName'] = this.userFirstName;
        data['lastName'] = this.userLastName;
        data['otp'] = this.otp;

        this.otpError = undefined;

        this.authService.verifyOtp(data).subscribe(
            (data: any) => {
                this.otpPopup = false;
                this.tokenStorageService.saveToken(data.data.access_token);
                this.tokenStorageService.saveUser(data.data.userdata);
                this.isLoggedIn = true;
                this.loggedInUser = data.data.userdata;
                this.mobileForm.reset();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Successfully logged in! You can now start the quiz.'
                });
            },
            (err: any) => {
                this.otpError = err.error.error;
            }
        );
    }

    resendOtp() {
        let data = { mobileNumber: this.mobileNumber };
        this.authService.otpLogin(data).subscribe(
            (data: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'OTP resent successfully'
                });
            },
            (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to resend OTP'
                });
            }
        );
    }

    changeMobileNumber() {
        this.numberPopup = true;
        this.otpPopup = false;
    }

    // Spin wheel functionality
    startSpinGame() {
        if (!this.isLoggedIn) {
            this.numberPopup = true;
            this.messageService.add({
                severity: 'warn',
                summary: 'Login Required',
                detail: 'Please login to start the spin challenge!'
            });
            return;
        }

        this.showWelcome = false;
        this.showQuiz = true;
        this.quizStarted = true;
    }

    spinWheel() {
        if (this.isSpinning) return;

        // Mobile detection for debugging
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('Is mobile device:', isMobile);

        this.isSpinning = true;
        this.spinResult = null;

        // Generate random spins (3-6 full rotations plus final position)
        const fullSpins = Math.floor(Math.random() * 4) + 3; // 3-6 full spins

        // Determine prize first with proper probability (60% vouchers, 40% try again)
        const random = Math.random();
        let prizeIndex = 0;

        if (random < 0.6) {
            // 60% chance for vouchers
            const voucherRandom = Math.random();
            if (voucherRandom < 0.33) {
                prizeIndex = 0; // ₹500 OFF (20% of total)
            } else if (voucherRandom < 0.66) {
                prizeIndex = 1; // ₹300 OFF (20% of total)
            } else {
                prizeIndex = 2; // ₹200 OFF (20% of total)
            }
        } else {
            // 40% chance for Try Again
            prizeIndex = 3;
        }

        // Calculate the target angle based on selected prize
        // Wheel sections: ₹500(0-90°), ₹300(90-180°), ₹200(180-270°), Try Again(270-360°)
        let targetAngleRange = [0, 0];
        switch(prizeIndex) {
            case 0: targetAngleRange = [15, 75]; break;   // ₹500 OFF (Section 1 - Top-right)
            case 1: targetAngleRange = [105, 165]; break; // ₹300 OFF (Section 2 - Bottom-right)
            case 2: targetAngleRange = [195, 255]; break; // ₹200 OFF (Section 3 - Bottom-left)
            case 3: targetAngleRange = [285, 345]; break; // Try Again (Section 4 - Top-left)
        }

        const finalAngle = Math.floor(Math.random() * (targetAngleRange[1] - targetAngleRange[0] + 1)) + targetAngleRange[0];

        // Calculate total rotation
        const totalRotation = (fullSpins * 360) + finalAngle;
        this.wheelRotation += totalRotation;

        console.log('Spin started - Expected prize:', this.spinPrizes[prizeIndex].name);
        console.log('Target angle range:', targetAngleRange);
        console.log('Final angle:', finalAngle);
        console.log('Total rotation:', totalRotation);

        // Use longer timeout for mobile devices due to potential performance differences
        const timeoutDuration = isMobile ? 3300 : 3100;

        // Wait for animation to complete, then determine the actual result
        setTimeout(() => {
            // Calculate the final position after rotation
            // Adjust for pointer position (pointer is at top = 270° in wheel coordinates)
            let finalPosition = (this.wheelRotation + 270) % 360;
            
            // Normalize to 0-360 range
            if (finalPosition < 0) finalPosition += 360;
            
            // Determine which section the wheel actually landed on based on pointer position
            let actualPrizeIndex = 0;
            if (finalPosition >= 0 && finalPosition < 90) {
                actualPrizeIndex = 0; // ₹500 OFF (Top-right section)
            } else if (finalPosition >= 90 && finalPosition < 180) {
                actualPrizeIndex = 1; // ₹300 OFF (Bottom-right section)
            } else if (finalPosition >= 180 && finalPosition < 270) {
                actualPrizeIndex = 2; // ₹200 OFF (Bottom-left section)
            } else {
                actualPrizeIndex = 3; // Try Again (Top-left section)
            }

            console.log('Wheel final rotation:', this.wheelRotation);
            console.log('Adjusted position for pointer:', finalPosition);
            console.log('Detected prize index:', actualPrizeIndex);
            console.log('Prize name:', this.spinPrizes[actualPrizeIndex].name);

            this.isSpinning = false;
            this.spinResult = this.spinPrizes[actualPrizeIndex];
            
            // Add small delay before showing results to ensure wheel has stopped visually
            setTimeout(() => {
                this.showResults = true;
                this.showQuiz = false;

                // Auto-register for voucher if won something
                if (this.spinResult && this.spinResult.id !== 4) {
                    this.registerForPrizes();
                }
            }, 300); // Additional 300ms delay for visual completion
            
        }, timeoutDuration); // Longer timeout for mobile devices
    }

    registerForPrizes() {
        if (this.isRegisteredForPrizes) return;

        // Generate a random voucher code
        this.registrationNumber = 'EAZY' + Date.now().toString().slice(-6);
        this.isRegisteredForPrizes = true;

        // In a real app, you would save this voucher to backend
        this.messageService.add({
            severity: 'success',
            summary: 'Congratulations!',
            detail: `You won ${this.spinResult?.name} voucher! Code: ${this.registrationNumber}`
        });
    }

    restartGame() {
        this.showResults = false;
        this.showWelcome = true;
        this.quizStarted = false;
        this.isSpinning = false;
        this.spinResult = null;
    }

    getPrizeMessage(): string {
        if (!this.spinResult) return '';

        if (this.spinResult.id === 4) {
            return "Don't give up! Try again for another chance to win amazing vouchers!";
        } else {
            return `Congratulations! You won a ${this.spinResult.name} voucher! Use it on your next venue booking.`;
        }
    }

    getPrizeValue(prizeId: number): string {
        const values = {
            1: '500', // ₹500 OFF voucher
            2: '300', // ₹300 OFF voucher  
            3: '200'  // ₹200 OFF voucher
        };
        return values[prizeId as keyof typeof values] || '0';
    }

    browseVenues() {
        this.router.navigate(['/venue-list']);
    }
}
