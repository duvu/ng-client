import * as _ from 'lodash';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Privilege } from 'app/shared/models/privilege';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ApplicationContext } from 'app/application-context';
import { PrivilegeService } from 'app/shared/services/privilege.service';
import { DeleteEvent } from 'app/shared/models/delete-event';
import { ConfirmDeleteComponent } from 'app/shared/components/confirm-delete/confirm-delete.component';
import { OptionalColumnPrivilegeComponent } from 'app/main/administration/privilege/optional-column-privilege/optional-column-privilege.component';
import { AddEditPrivilegeComponent } from 'app/main/administration/privilege/add-edit-privilege/add-edit-privilege.component';
import { merge } from 'rxjs/observable/merge';
import { catchError, map, switchMap } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import {of as observableOf} from 'rxjs/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { WaitingService } from 'app/shared/services/waiting.service';

@Component({
  selector: 'app-privilege',
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.scss']
})
export class PrivilegeComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Privilege> | null;
    dataChange: ReplaySubject<number> | null;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns = ['name', 'description','createdBy', 'createdOn', 'actions'];

    columns = {
        id:                 {selected: false, order: 0},
        name:               {selected: false, order: 1},
        description:        {selected: false, order: 7},
        createdBy:          {selected: false, order: 13},
        createdOn:          {selected: false, order: 14},
        updatedBy:          {selected: false, order: 15},
        updatedOn:          {selected: false, order: 16},
        actions:            {selected: false, order: 17}
    };

    resultsLength = 0;

    constructor(private dialog: MatDialog,
                private app: ApplicationContext,
                private spinner: WaitingService,
                private service: PrivilegeService) { }

    ngOnInit() {
        this.initTableSettings();
        this.dataChange = new ReplaySubject(1);
        this.dataSource = new MatTableDataSource();

        // this.dataChange = new BehaviorSubject(0);
        // this.sort.active = 'name';
        // this.sort.direction = 'asc';
        // this.dataSource = new BaseDataSource<Privilege>(
        //     this.service,
        //     this.progress,
        //     this.sort,
        //     this.paginator,
        //     this.dataChange);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.sort = this.sort;
        //this.dataSource.paginator = this.paginator;


        merge(this.sort.sortChange, this.paginator.page, this.dataChange)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.spinner.show(true);
                    return this.service!.searchAndSort(
                        this.paginator.pageIndex, this.paginator.pageSize,
                        this.sort.active, this.sort.direction);
                }),
                map(data => {
                    this.spinner.show(false);
                    this.resultsLength = data.totalElements;

                    return data.content;
                }),
                catchError(() => {
                    this.spinner.show(false);
                    return observableOf([]);
                })
            ).subscribe(data => this.dataSource.data = data);
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    initTableSettings(): void {
        try {
            const displayeds = JSON.parse(localStorage.getItem('pri-disp-cols'));
            if (displayeds != null) {
                this.displayedColumns = displayeds;
            }
        } catch (e) {
            console.log(e);
        }

        // 2. generate new columns
        _.forOwn(this.columns, (value, key) => {
            if (this.displayedColumns.includes(key)) {
                value.selected = true;
            }
        });
    }

    openDialogColumnOptions(): void {
        const dialogRef = this.dialog.open(OptionalColumnPrivilegeComponent, {
            data: this.columns
        });
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.displayedColumns = [];
                    _.forOwn(this.columns, (value, key) => {
                        if (value.selected) {
                            this.displayedColumns.push(key);
                        }
                    });
                }
                localStorage.setItem('pri-disp-cols', JSON.stringify(this.displayedColumns));
            }
        );
    }

    openDialogNewObject(): void {
        const data = new Privilege();
        const dialogRef = this.dialog.open(AddEditPrivilegeComponent, {
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.create(result);
            }
        });
    }

    create(privilege: Privilege): void {
        this.service.create(privilege).subscribe(
            data => {
                this.dataChange.next(data.id);
            }
        );
    }

    openDialogEditing(data: Privilege): void {
        const dialogRef = this.dialog.open(AddEditPrivilegeComponent, {
            // width: '600px',
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.update(result);
            }
        });
    }

    update(privilege: Privilege): void {
        this.service.update(privilege.id, privilege).subscribe(
            data => {},
            error => {},
            () => {
                this.dataChange.next(privilege.id);
            }
        );
    }

    openDialogConfirmDelete(privilege: Privilege): void {
        const data = new DeleteEvent();
        data.setId(privilege.id);
        data.setName(privilege.name);
        data.setType('Privilege');
        const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._delete(result);
            }
        });
    }

    _delete(privilege: Privilege): void {
        this.service._delete(privilege.id).subscribe(
            data => {
                this.dataChange.next(0);
            },
            error => {
                this.dataChange.next(error);
            },
            () => {
                this.dataChange.next(1);
            }
        );
    }
}
