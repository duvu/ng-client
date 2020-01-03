import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from 'app/main/administration/account/component/account-list/account.component';
import {EditAccountComponent} from "./component/account-edit/edit-account.component";
import {AuthGuard} from "../../../guards/auth.guard";
import {AddAccountComponent} from "./component/account-add/add-account.component";

const routes: Routes = [
    {
        path: '', component: AccountComponent,
        children:[

        ]
    },
    { path: 'add', component: AddAccountComponent, canActivate: [AuthGuard] },
    { path: ':id', component: EditAccountComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountRoutingModule { }
