import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {Device} from "../../../../models/Device";
import {DeviceService} from "../../../../services/device.service";
import {DialogEvent} from "../../../../models/DialogEvent";
@Component({
    selector: 'confirm-delete',
    template: `
        <div>
            <div matDialogTitle>Deleting {{device.displayName}}</div>
            <div mat-dialog-content>
                <span>{{errorMessage}}</span>
                <span>You are going to delete the device #{{device.displayName}}, Confirm?</span>
            </div>
            <div mat-dialog-actions align="end">
                <button mat-button color="warn" (click)="destroy()">Delete</button>
                <button mat-button (click)="cancel()">Cancel</button>
            </div>
        </div>
    `,
    styles: [``]
})
export class ConfirmDeleteDeviceDialog {
    device: Device;
    event: DialogEvent;
    constructor(public dialogRef: MatDialogRef<ConfirmDeleteDeviceDialog>,
                private _service: DeviceService) {
        this.event = new DialogEvent();
    }

    destroy() {
        this._service.destroy(this.device.deviceID).subscribe(
            data => {
                this.event.setSuccess();
                this.event.message = "Deleted the device #" + this.device.displayName;
            },
            error => {
                this.event.setError();
                this.event.message = error.message;
                this.dialogRef.close(this.event);
            },
            () => {
                this.dialogRef.close(this.event);
            }
        );
    }
    cancel() {
        this.event.setCancel();
        this.dialogRef.close(this.event);
    }
}