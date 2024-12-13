import { Component, OnInit } from '@angular/core';
import { ContactService } from 'src/app/components/helper/contact-helper.service';
import { Contact } from '../../../models/contact';
import data from '../../../data/faqs.json';

@Component({ 
  selector: 'app-contact-block',
  templateUrl: './contact-block.component.html',
  styleUrls: ['./contact-block.component.css']
})
export class ContactBlockComponent implements OnInit {
  public faqs = data;
  model = new Contact;
  submitted = false;
  error: {} | undefined; 
  constructor(private contactService: ContactService) { }
  onSubmit() {
    this.submitted = true; 
    return this.contactService.contactForm(this.model).subscribe(
      data => this.model = data,
      error => this.error = error
    );
  }
  resolved(captchaResponse: string) {
      console.log(`Resolved response token: ${captchaResponse}`);
  }

  ngOnInit(): void {
  }


}
