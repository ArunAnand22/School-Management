import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonTableComponent } from '../../../tables/person-table/person-table.component';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, PersonTableComponent],
  template: `
    <app-person-table [isStudent]="false"></app-person-table>
  `
})
export class StaffComponent {
}

