import { Injectable, AfterContentInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import agents from '../data/agents/agents.json';

@Injectable({
  providedIn: 'root'
}) 
export class AgentHelperService implements AfterContentInit, OnInit {
  // pagination
  page: number = 1;
  public agentblock = agents;
  public agentdetails = agents;
  constructor( private route: ActivatedRoute) {

  }
  // Agent Details
  public setAgent(id: any) {
    this.agentdetails = agents.filter((item: { id: any; }) => { return item.id == id });
  }
  ngAfterContentInit(): void {
    this.setAgent(this.route.snapshot.params.id);
  }
  ngOnInit(): void {
  }
}
