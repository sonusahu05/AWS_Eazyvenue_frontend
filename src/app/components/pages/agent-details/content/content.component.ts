import { Component } from '@angular/core';
import { AgentHelperService } from 'src/app/components/helper/agent-helper.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent extends AgentHelperService {
}
