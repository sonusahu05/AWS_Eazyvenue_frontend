import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboarddemo.scss'],
})
export class DashboardDemoComponent implements OnInit {

    chart1: any;

    chartOptions1: any;

    chart2: any;

    chartOptions2: any;

    ngOnInit() {
        this.chart1 = {
            labels: ['8Sun', '9Mon', '10Thu', '11Wed', '12Fri', '13Sat', '14Sun'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [12, 19, 3, 5, 2, 3, 9],
                    borderColor: [
                        '#FFA928',
                    ],
                    borderWidth: 4,
                    fill: true,
                    backgroundColor: [
                        'rgba(255, 169, 40, .2)'
                    ],
                    tension: .4
                }
            ]
        };

        this.chartOptions1 = {
            plugins: {
                legend: {
                    display: false,
                }
            },
            maintainAspectRatio: false,
            hover: {
                mode: 'index'
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    display: false,
                }
            }
        };

        this.chart2 = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [12, 19, 3, 5, 2, 3, 9],
                    borderColor: [
                        getComputedStyle(document.body).getPropertyValue('--primary-color') || '#2c84d8',
                    ],
                    borderWidth: 4,
                    fill: true,
                    backgroundColor: [
                        getComputedStyle(document.body).getPropertyValue('--primary-lighter-color') || '#2c84d8',
                    ],
                    tension: .4
                }
            ]
        };

        this.chartOptions2 = {
            plugins: {
                legend: {
                    display: false,
                }
            },
            maintainAspectRatio: false,
            hover: {
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color:    'transparent',
                    },
                    ticks: {
                        color: '#BFC2C6'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color:  'rgba(191, 194, 198, .45)',
                        borderDash:[5, 10],
                    },
                    ticks: {
                        color:  '#BFC2C6',
                        min: 0,
                        stepSize: 5,
                    }
                }
            }
        };
    }
}
