import { Injectable, AfterContentInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import listingcategory from '../../assets/demo/data/category.json';
import listingblock from '../../assets/demo/data/listing.json';
import selectdata from '../../assets/demo/data/selectdata.json';
import agents from '../../assets/demo/data/agents.json';

@Injectable({
  providedIn: 'root'
})
export class ListingHelperService implements AfterContentInit, OnInit  {
  // pagination
  page: number = 1;
  public listingblock = listingblock;
  public listingdetails = listingblock;
  public category = listingcategory;
  public agents = agents;
  public listingcategory = listingcategory;
  public select = selectdata;
  constructor(private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer) {

  }
  options = {
    allowClear: false
  };
  // category
  public getCategories(items: string | any[]) {
    var elems = listingcategory.filter((item: { id: string; }) => {
      return items.includes(item.id)
    });
    return elems;
  }
  public getAgent(items: string | any[]) {
    var elems = agents.filter((item: { id: string; }) => {
      return items.includes(item.id)
    });
    return elems;
  }
  public getTrending() {
    var elems = listingblock.filter((item: { star: boolean; }) => {
      return item.star === true
    });
    return elems;
  }
  // Count Category
  public setCategoriesCount() {
    for (var i = 0; i < this.listingcategory.length; i++) {
      var count = this.listingblock.filter((post: { category: number[]; }) => { return post.category.includes(parseInt(this.listingcategory[i].id)) });
      count = count.length;
      this.listingcategory[i].count = count;
    }
  }
  // Recent post
  public changeToMonth(month: string | number | any) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month];
  }

  public setDemoDate() {
    var today = new Date();
    this.listingblock.slice(0, 5).map((listing: { timestamp: number; postdate: string; }) => (
      listing.timestamp = today.getTime() - (3 * 24 * 60 * 60 * 1000),
      // Remove this date on your live demo. This is only used for preview purposed. Your date should actually be updated
      // in the blog.json object
      listing.postdate = `${today.getDate()} ${this.changeToMonth(today.getMonth())}, ${today.getFullYear()}`
    ));
  }
  public getRecentListing() {
    var elems = listingblock.filter((listing: { timestamp: number | any; postdate: string | number | Date; }) => {
      return listing.timestamp < new Date(listing.postdate);
    });
    return elems;
  }
  // Related post
  public getListingByCategory(items: string | any[]) {
    var elems = listingblock.filter((listing: { id: string; category: any[]; }) => { return parseInt(listing.id) !== parseInt(this.route.snapshot.params.id) && listing.category.some(r => items.includes(r)) });
    return elems;
  }
  // Filter
  // Category Filter
  public setCategory(id: any) {
    this.listingcategory = id;
  }
  public getCategory() {
    return this.listingcategory;
  }
  public getPostsByCategory(catId: string) {
    return this.listingblock = listingblock.filter((item: { category: number[]; }) => { return item.category.includes(parseInt(catId)) });
  }
  // Agent Filter
  public setAgent(id: any) {
    this.agents = id;
  }
  public getAgentPost() {
    return this.agents;
  }
  public getPostsByAgents(agentId: string) {
    return this.listingblock = listingblock.filter((item: { agent: number[]; }) => { return item.agent.includes(parseInt(agentId)) });
  }
  // Fetch All filter
  public setPosts() {
    var postsByCategory = this.getCategory() != undefined ? this.getPostsByCategory(this.getCategory()) : '',
      postsByAgent = this.getAgentPost() != undefined ? this.getPostsByAgents(this.getAgentPost()) : '';

    if ((postsByCategory != '' || postsByCategory != undefined || postsByCategory != null) && postsByCategory.length > 0) {
      this.listingblock = postsByCategory;
    } else if ((postsByAgent != '' || postsByAgent != undefined || postsByAgent != null) && postsByAgent.length > 0) {
      this.listingblock = postsByAgent;
    } 
  }
  // Listing Details
  public setListing(id: any) {
    this.listingdetails = listingblock.filter((item: { id: any; }) => { return item.id == id });
  }
  ngAfterContentInit(): void {
    this.setCategory(this.route.snapshot.params.catId);
    this.setAgent(this.route.snapshot.params.agentId);
    this.setPosts();
    this.setListing(this.route.snapshot.params.id);
  }
  ngOnInit(): void {
    this.setCategoriesCount();
    this.setDemoDate();
  }
  // Listing Navigation
  public listingNavigationStyleOne(items: string | any[], index: number) {
    var output = [],
      id, item;
    if (items[index - 1] !== undefined && index - 1 !== -1) {
      item = items[index - 1];
      id = item.id;
      // Show the previous button 
      output.push("<div class='post-single-pagination post-prev'> <i class='fas fa-arrow-left'></i> <a href='/listing-details-v1/" + item.id + "' class='post-single-pagination-content'> <span>Prev Wedding</span> <h6>" + item.title.slice(0, 40) + "</h6> </a> </div>");
    }
    if (items[index + 1] !== undefined && index <= items.length - 1) {
      // Show next button 
      item = items[index + 1];
      id = item.id;
      output.push("<div class='post-single-pagination post-next'> <a href='/listing-details-v1/" + item.id + "' class='post-single-pagination-content'> <span>Next Wedding</span><h6>" + item.title.slice(0, 40) + "</h6> </a> <i class='fas fa-arrow-right'></i></div>");
    }

    return output;
  }
  // 
  public listingNavigationStyleTwo(items: string | any[], index: number) {
    var output = [],
      id, item;
    if (items[index - 1] !== undefined && index - 1 !== -1) {
      item = items[index - 1];
      id = item.id;
      // Show the previous button 
      output.push("<div class='post-single-pagination post-prev'> <i class='fas fa-arrow-left'></i> <a href='/listing-details-v2/" + item.id + "' class='post-single-pagination-content'> <span>Prev Wedding</span> <h6>" + item.title.slice(0, 40) + "</h6> </a> </div>");
    }
    if (items[index + 1] !== undefined && index <= items.length - 1) {
      // Show next button 
      item = items[index + 1];
      id = item.id;
      output.push("<div class='post-single-pagination post-next'> <a href='/listing-details-v2/" + item.id + "' class='post-single-pagination-content'> <span>Next Wedding</span><h6>" + item.title.slice(0, 40) + "</h6> </a> <i class='fas fa-arrow-right'></i></div>");
    }

    return output;
  }
  // 
  public listingNavigationStyleThree(items: string | any[], index: number) {
    var output = [],
      id, item;
    if (items[index - 1] !== undefined && index - 1 !== -1) {
      item = items[index - 1];
      id = item.id;
      // Show the previous button 
      output.push("<div class='post-single-pagination post-prev'> <i class='fas fa-arrow-left'></i> <a href='/listing-details-v3/" + item.id + "' class='post-single-pagination-content'> <span>Prev Wedding</span> <h6>" + item.title.slice(0, 40) + "</h6> </a> </div>");
    }
    if (items[index + 1] !== undefined && index <= items.length - 1) {
      // Show next button 
      item = items[index + 1];
      id = item.id;
      output.push("<div class='post-single-pagination post-next'> <a href='/listing-details-v3/" + item.id + "' class='post-single-pagination-content'> <span>Next Wedding</span><h6>" + item.title.slice(0, 40) + "</h6> </a> <i class='fas fa-arrow-right'></i></div>");
    }

    return output;
  }
  // sanitize url
  public sanitnizeAudioURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
}
