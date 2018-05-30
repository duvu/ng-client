import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChange,
    ViewChild
} from '@angular/core';
import { DeviceReportService } from 'app/shared/services/device-report.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DeviceSpeeedReport } from 'app/shared/models/device-speeed-report';

import { merge, of as observableOf} from 'rxjs';
import { catchError, map, startWith, switchMap} from 'rxjs/operators';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { WaitingService } from 'app/shared/services/waiting.service';

@Component({
    selector: 'app-d-speed',
    templateUrl: './d-speed.component.html',
    styleUrls: ['./d-speed.component.scss']
})
export class DSpeedComponent implements OnChanges, OnInit, AfterViewInit {
    private _device: number;
    private _from: number;
    private _to: number;

    dataSource: MatTableDataSource<DeviceSpeeedReport>;
    resultsLength: number;
    dataChange: ReplaySubject<any>;

    displayedColumns = ['devId', 'deviceId', 'deviceName', 'heading', 'latitude', 'longitude', 'altitude', 'odometerKM', 'speedKPH', 'address', 'status', 'timestamp'];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private deviceReportService: DeviceReportService,
                private spinner: WaitingService) {
        this.dataChange = new ReplaySubject(1);
    }

    get device(): number {
        return this._device;
    }

    @Input()
    set device(value: number) {
        this._device = value;
    }

    get from(): number {
        return this._from;
    }

    @Input()
    set from(value: number) {
        this._from = value;
    }

    get to(): number {
        return this._to;
    }

    @Input()
    set to(value: number) {
        this._to = value;
    }

    ngOnInit(): void {
        this.dataSource = new MatTableDataSource();
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
        this.dataChange.next(100);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page, this.dataChange)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.spinner.show(true);
                    if (!this.device) {
                        return observableOf({});
                    }
                    return this.deviceReportService!.getSpeedReport(this.device, this.from, this.to,
                        this.paginator.pageIndex, this.paginator.pageSize,this.sort.active, this.sort.direction);
                }),
                map((data: any) => {
                    this.resultsLength = data.totalElements;
                    return data.content;
                }),
                catchError(() => {
                    return observableOf([]);
                })
            ).subscribe(
                data => {
                    this.dataSource.data = data;
                    this.spinner.show(false);
            });
    }
}