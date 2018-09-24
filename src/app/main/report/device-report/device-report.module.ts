import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceReportRoutingModule } from 'app/main/report/device-report/device-report-routing.module';
import { DeviceReportComponent } from 'app/main/report/device-report/device-report.component';
import { MaterialShared } from 'app/shared/material-shared';
import { DSpeedComponent } from './d-speed/d-speed.component';
import { DParkingComponent } from './d-parking/d-parking.component';
import { DeviceReportCustomTimeComponent } from './device-report-custom-time/device-report-custom-time.component';
import { CustomComponentModule } from 'app/cutom-component/custom-component.module';

@NgModule({
    imports: [
        CommonModule,
        DeviceReportRoutingModule,
        MaterialShared,
        CustomComponentModule
    ],
    declarations: [
        DeviceReportComponent,
        DSpeedComponent,
        DParkingComponent,
        DeviceReportCustomTimeComponent
    ],
    entryComponents: [
        DeviceReportCustomTimeComponent
    ]
})
export class DeviceReportModule { }
