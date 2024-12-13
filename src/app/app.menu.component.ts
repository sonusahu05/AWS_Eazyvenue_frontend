import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { TokenStorageService } from './services/token-storage.service';
import { RoleService } from './services/role.service';
import { ModuleService } from './services/module.service';
@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    styleUrls: ['./app.menu.component.scss']

})
export class AppMenuComponent implements OnInit {
    userData;
    model: any[];
    myRoleStyle: string = '';
    isActiveCss: boolean = false;
    rolelist: any[];
    loggedInUserRole: any[];
    userRole;
    public userPermissions;
    public loggedInUserPermissions;
    public errorMessage;
    public moduleList: any[];
    constructor(public appMain: AppMainComponent,
        private tokenStorage: TokenStorageService,
        private roleService: RoleService,
        private moduleService: ModuleService,

    ) {

    }
    ngOnInit() {
        this.userData = this.tokenStorage.getUser();
        this.userRole = this.userData['userdata'].rolename;
        this.loggedInUserPermissions = this.tokenStorage.getUserPermissions();
        this.userPermissions = this.tokenStorage.getRolelist();
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        ];

        this.loggedInUserPermissions.forEach(menuData => {
            let obj = {
                label: menuData.module, icon: 'pi ' + menuData.icon, routerLink: [menuData.url]
            };
            let subData = [];
            if (menuData.submodule) {
                menuData.submodule.forEach(element => {
                    let subDataObj = { label: element.module, icon: 'pi ' + element.icon, routerLink: [element.url], };
                    subData.push(subDataObj);
                });
            }
            if (subData.length > 0) {
                let subObj = {
                    label: menuData.module, icon: 'pi ' + menuData.icon, routerLink: [menuData.url],
                    items: subData
                };
                this.model.push(subObj);
            } else {
                this.model.push(obj);
            }

        }

        );
        // setTimeout(() => {
        //     this.rolelist = this.tokenStorage.getRolelist();
        //     this.loggedInUserRole = this.rolelist['permissions'];
        //     console.log(this.loggedInUserRole);
        //     this.model = [
        //         { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        //     ];
        //     if( this.loggedInUserRole != undefined){
        //         this.loggedInUserRole.forEach(menuData => {
        //             var obj = { label: menuData.module, icon: 'pi ' + menuData.icon, routerLink: [menuData.url] };
        //             this.model.push(obj);
        //         });
        //     }
        // }, 400);
    }
}
