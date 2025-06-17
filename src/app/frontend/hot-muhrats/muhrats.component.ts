import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-muhrats',
  templateUrl: './muhrats.component.html',
  styleUrls: ['./muhrats.component.scss']
})
export class HotMuhuratsComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() closeDrawer = new EventEmitter<void>();

  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  displayedMonths: any[] = [];
  importantDates: Date[] = [];
  currentMonthIndex: number = 0;
  currentYear: number = new Date().getFullYear(); // Dynamic current year
  minYear: number = 2025;
  maxYear: number = 2030;

  constructor(private router: Router) {}

  ngOnInit() {
    // Set current month index based on current date
    this.currentMonthIndex = new Date().getMonth();
    this.generateCalendars();
    this.setImportantDates();
  }

  generateCalendars() {
    this.displayedMonths = [];
    for (let month = 0; month < 12; month++) {
      this.displayedMonths.push(this.generateMonthData(this.currentYear, month));
    }
  }

  generateMonthData(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks = [];

    let currentWeek = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push(new Date(year, month, i - firstDay.getDay() + 1));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(year, month, day));
    }

    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, currentWeek.length - 6));
    }
    weeks.push(currentWeek);

    return {
      name: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
      number: month,
      weeks: weeks
    };
  }

  setImportantDates() {
    // Generate important dates for multiple years (2025-2030)
    this.importantDates = [];

    // Base dates pattern (month, day) - you can modify this pattern as needed
    const baseDatesPattern = [
      { month: 0, days: [16, 17, 19, 20, 21, 23, 24, 26] }, // January
      { month: 1, days: [2, 3, 5, 6, 7, 12, 13, 14, 15, 16, 18, 19, 20, 21] }, // February
      { month: 2, days: [1, 2, 6, 7, 12] }, // March
      { month: 3, days: [13, 14, 16, 17, 18, 20, 21, 25, 29] }, // April
      { month: 4, days: [5, 6, 7, 8, 18, 19, 20, 26, 27, 28] }, // May
      { month: 5, days: [2, 4, 5, 7, 8, 9] }, // June
      { month: 6, days: [18, 19, 20, 21] }, // July
      { month: 7, days: [1, 2, 6, 7, 12] }, // August
      { month: 8, days: [13, 14, 16, 17, 18, 20, 21, 25, 29] }, // September
      { month: 9, days: [5, 6, 7, 8, 18, 19, 20, 26, 27, 28] }, // October
      { month: 10, days: [2, 4, 5, 7, 8, 9] }, // November
      { month: 11, days: [18, 19, 20, 21] } // December
    ];

    // Generate dates for years 2025-2030
    for (let year = this.minYear; year <= this.maxYear; year++) {
      baseDatesPattern.forEach(monthData => {
        monthData.days.forEach(day => {
          this.importantDates.push(new Date(year, monthData.month, day));
        });
      });
    }
  }

  isImportantDate(date: Date): boolean {
    return this.importantDates.some(d =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  }

  onDateClick(date: Date) {
    if (this.isImportantDate(date)) {
      this.close();
      setTimeout(() => {
        this.router.navigate(['/banquet-halls/wedding/mumbai']);
      }, 0);
    } else {
      console.log('Clicked date:', date);
    }
  }

  close() {
    this.closeDrawer.emit();
  }

  previousMonths() {
    if (this.currentMonthIndex > 0) {
      this.currentMonthIndex -= 1;
    } else if (this.currentYear > this.minYear) {
      this.currentYear -= 1;
      this.currentMonthIndex = 11; // December of previous year
      this.generateCalendars();
    }
  }

  nextMonths() {
    if (this.currentMonthIndex < 11) {
      this.currentMonthIndex += 1;
    } else if (this.currentYear < this.maxYear) {
      this.currentYear += 1;
      this.currentMonthIndex = 0; // January of next year
      this.generateCalendars();
    }
  }

  // New method to change year directly
  onYearChange(newYear: number) {
    if (newYear >= this.minYear && newYear <= this.maxYear) {
      this.currentYear = newYear;
      this.currentMonthIndex = 0; // Reset to January when changing year
      this.generateCalendars();
    }
  }

  // Helper method to get available years
  getAvailableYears(): number[] {
    const years = [];
    for (let year = this.minYear; year <= this.maxYear; year++) {
      years.push(year);
    }
    return years;
  }
}