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
      new Date(2025, 0, 16),
      new Date(2025, 0, 17),
      new Date(2025, 0, 19),
      new Date(2025, 0, 20),
      new Date(2025, 0, 21),
      new Date(2025, 0, 23),
      new Date(2025, 0, 24),
      new Date(2025, 0, 26),
      new Date(2025, 1, 2),
      new Date(2025, 1, 3),
      new Date(2025, 1, 5),
      new Date(2025, 1, 6),
      new Date(2025, 1, 7),
      new Date(2025, 1, 12),
      new Date(2025, 1, 13),
      new Date(2025, 1, 14),
      new Date(2025, 1, 15),
      new Date(2025, 1, 16),
      new Date(2025, 1, 18),
      new Date(2025, 1, 19),
      new Date(2025, 1, 20),
      new Date(2025, 1, 21),
      new Date(2025, 2, 1),
      new Date(2025, 2, 2),
      new Date(2025, 2, 6),
      new Date(2025, 2, 7),
      new Date(2025, 2, 12),
      new Date(2025, 3, 13),
      new Date(2025, 3, 14),
      new Date(2025, 3, 16),
      new Date(2025, 3, 17),
      new Date(2025, 3, 18),
      new Date(2025, 3, 20),
      new Date(2025, 3, 21),
      new Date(2025, 3, 25),
      new Date(2025, 3, 29),
      new Date(2025, 4, 5),
      new Date(2025, 4, 6),
      new Date(2025, 4, 7),
      new Date(2025, 4, 8),
      new Date(2025, 4, 18),
      new Date(2025, 4, 19),
      new Date(2025, 4, 20),
      new Date(2025, 4, 26),
      new Date(2025, 4, 27),
      new Date(2025, 4, 28),
      new Date(2025, 5, 2),
      new Date(2025, 5, 4),
      new Date(2025, 5, 5),
      new Date(2025, 5, 7),
      new Date(2025, 5, 8),
      new Date(2025, 5, 9),
      new Date(2025, 6, 18),
      new Date(2025, 6, 19),
      new Date(2025, 6, 20),
      new Date(2025, 6, 21),
      new Date(2025, 7, 1),
      new Date(2025, 7, 2),
      new Date(2025, 7, 6),
      new Date(2025, 7, 7),
      new Date(2025, 7, 12),
      new Date(2025, 8, 13),
      new Date(2025, 8, 14),
      new Date(2025, 8, 16),
      new Date(2025, 8, 17),
      new Date(2025, 8, 18),
      new Date(2025, 8, 20),
      new Date(2025, 8, 21),
      new Date(2025, 8, 25),
      new Date(2025, 8, 29),
      new Date(2025, 9, 5),
      new Date(2025, 9, 6),
      new Date(2025, 9, 7),
      new Date(2025, 9, 8),
      new Date(2025, 9, 18),
      new Date(2025, 9, 19),
      new Date(2025, 9, 20),
      new Date(2025, 9, 26),
      new Date(2025, 9, 27),
      new Date(2025, 9, 28),
      new Date(2025, 10, 2),
      new Date(2025, 10, 4),
      new Date(2025, 10, 5),
      new Date(2025, 10, 7),
      new Date(2025, 10, 8),
      new Date(2025, 10, 9),
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
      this.currentMonthIndex -= 1; // Move back by one month
    }
  }

  nextMonths() {
    if (this.currentMonthIndex < this.displayedMonths.length - 1) {
      this.currentMonthIndex += 1; // Move forward by one month
    }
  }
}
