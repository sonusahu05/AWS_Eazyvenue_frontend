import { Component } from '@angular/core';
import { BlogHelperService } from 'src/app/components/helper/blog-helper.service';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent extends BlogHelperService {


}
