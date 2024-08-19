import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjectRoutingModule } from './project-routing.module';
import { CommitHistoryChart } from './charts/commit-history-chart/commit-history-chart.component';
import { ProjectComponent } from './project.component';

@NgModule({
    declarations: [
        ProjectComponent,
        CommitHistoryChart,
    ],
    imports: [
        CommonModule,
        ProjectRoutingModule,
        FormsModule,
    ]
})
export class ProjectModule{}