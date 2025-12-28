import { Component, OnInit } from '@angular/core';
import { PersonTableComponent } from '../../../tables/person-table/person-table.component';

@Component({
  selector: 'app-staff',
  template: `
    <app-person-table [isStudent]="false"></app-person-table>
  `
})
export class StaffComponent {
}

