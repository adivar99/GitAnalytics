import { Component, Input } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';

@Component({
    selector: 'app-commit-history',
    templateUrl: './commit-history-chart.component.html',
    styleUrls: ['./commit-history-chart.component.scss']
})
export class CommitHistoryChart {
    @Input() data

    public chartOptions: ChartOptions = {
        responsive: true,
    }
    public chartLabels
    public chartType: ChartType = "line"

    ngOnInit() {
        console.log("COMMIT HISTORY CHART DATA", this.data);
    }
 }
