import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent implements OnInit {

  errorMessage = '';
  
  constructor(
    private router: Router, 
    private route:ActivatedRoute) { }

  ngOnInit(): void {
    
  }

}
