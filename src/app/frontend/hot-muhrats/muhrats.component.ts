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
  currentMonthIndex: number = 0; // Track the current month index

  constructor(private router: Router) {} // Inject Router

  ngOnInit() {
    this.generateCalendars();
    this.setImportantDates();
  }

  generateCalendars() {
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      this.displayedMonths.push(this.generateMonthData(currentYear, month));
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
    this.importantDates = [
      new Date(2024, 0, 16),
      new Date(2024, 0, 17),
      new Date(2024, 0, 20),
      new Date(2024, 0, 21),
      new Date(2024, 0, 22),
      new Date(2024, 0, 27),
      new Date(2024, 0, 28),
      new Date(2024, 0, 30),
      new Date(2024, 0, 31),
      new Date(2024, 1, 4),
      new Date(2024, 1, 6),
      new Date(2024, 1, 7),
      new Date(2024, 1, 8),
      new Date(2024, 1, 12),
      new Date(2024, 1, 13),
      new Date(2024, 1, 17),
      // ... add more dates as needed
    ];
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
      this.close(); // Close the modal
      setTimeout(() => {
        this.router.navigate(['/banquet-halls/wedding/mumbai']); // Redirect to the specified route
      }, 0); // Use setTimeout to ensure the close action is processed first
    } else {
      console.log('Clicked date:', date);
    }
  }

  close() {
    this.closeDrawer.emit();
  }

  previousMonths() {
    if (this.currentMonthIndex > 0) {
      this.currentMonthIndex -= 1; // Move back by one month
    }
  }

  nextMonths() {
    if (this.currentMonthIndex < this.displayedMonths.length - 1) {
      this.currentMonthIndex += 1; // Move forward by one month
    }
  }
}
