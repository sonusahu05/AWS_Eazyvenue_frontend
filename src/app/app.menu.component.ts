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
        
        // Initialize with Dashboard only
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        ];

        // Fetch fresh permissions from backend
        // Option 1: Fetch role permissions directly
        this.loadUserPermissions();
        
        // Option 2: Fetch all modules and filter by permissions (uncomment to use)
        // this.loadMenuFromModulesAPI();
    }

    loadUserPermissions() {
        // Get user ID from stored user data
        const userId = this.userData['userdata']._id;
        const userRoleId = this.userData['userdata'].role;

        // Fetch user's role and permissions from backend
        this.roleService.getRoleDetails(userRoleId).subscribe({
            next: (roleData) => {
                if (roleData && roleData.permissions) {
                    this.loggedInUserPermissions = roleData.permissions;
                    this.buildMenuFromPermissions();
                } else {
                    console.warn('No permissions found for user role');
                }
            },
            error: (error) => {
                console.error('Error fetching user permissions:', error);
                // Fallback to localStorage if backend call fails
                this.loggedInUserPermissions = this.tokenStorage.getUserPermissions();
                this.buildMenuFromPermissions();
            }
        });
    }

    buildMenuFromPermissions() {
        // Reset model to dashboard only
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        ];

        // Build menu from fresh permissions
        this.loggedInUserPermissions.forEach(menuData => {
            let obj = {
                label: menuData.module, 
                icon: 'pi ' + menuData.icon, 
                routerLink: [menuData.url]
            };
            
            let subData = [];
            if (menuData.submodule) {
                menuData.submodule.forEach(element => {
                    let subDataObj = { 
                        label: element.module, 
                        icon: 'pi ' + element.icon, 
                        routerLink: [element.url] 
                    };
                    subData.push(subDataObj);
                });
            }
            
            if (subData.length > 0) {
                let subObj = {
                    label: menuData.module, 
                    icon: 'pi ' + menuData.icon, 
                    routerLink: [menuData.url],
                    items: subData
                };
                this.model.push(subObj);
            } else {
                this.model.push(obj);
            }
        });
    }

    // Method to refresh menu (can be called when modules are updated)
    refreshMenu(useModulesAPI: boolean = false) {
        if (useModulesAPI) {
            this.loadMenuFromModulesAPI();
        } else {
            this.loadUserPermissions();
        }
    }

    // Alternative method: Fetch modules from backend and filter by user permissions
    loadMenuFromModulesAPI() {
        const userId = this.userData['userdata']._id;
        const userRoleId = this.userData['userdata'].role;

        // Fetch both modules and user role in parallel
        Promise.all([
            this.moduleService.getModules().toPromise(),
            this.roleService.getRoleDetails(userRoleId).toPromise()
        ]).then(([modulesResponse, roleResponse]) => {
            if (modulesResponse && roleResponse && roleResponse.permissions) {
                // Get user's permitted module names
                const permittedModules = roleResponse.permissions.map(p => p.module);
                
                // Filter modules based on user permissions
                const filteredModules = modulesResponse.filter(module => 
                    permittedModules.includes(module.module)
                );

                // Build menu from filtered modules
                this.buildMenuFromModules(filteredModules, roleResponse.permissions);
            }
        }).catch(error => {
            console.error('Error fetching modules and permissions:', error);
            // Fallback to localStorage approach
            this.loggedInUserPermissions = this.tokenStorage.getUserPermissions();
            this.buildMenuFromPermissions();
        });
    }

    buildMenuFromModules(modules, userPermissions) {
        // Reset model to dashboard only
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        ];

        // Build menu from modules with user permissions
        modules.forEach(module => {
            // Find user's permission for this module
            const userPermission = userPermissions.find(p => p.module === module.module);
            
            if (userPermission) {
                let obj = {
                    label: module.module,
                    icon: 'pi ' + module.icon,
                    routerLink: [module.url]
                };
                
                let subData = [];
                if (module.submodule && userPermission.submodule) {
                    module.submodule.forEach(submod => {
                        // Check if user has permission for this submodule
                        const hasSubPermission = userPermission.submodule.find(userSub => 
                            userSub.module === submod.module
                        );
                        
                        if (hasSubPermission) {
                            let subDataObj = {
                                label: submod.module,
                                icon: 'pi ' + submod.icon,
                                routerLink: [submod.url]
                            };
                            subData.push(subDataObj);
                        }
                    });
                }
                
                if (subData.length > 0) {
                    let subObj = {
                        label: module.module,
                        icon: 'pi ' + module.icon,
                        routerLink: [module.url],
                        items: subData
                    };
                    this.model.push(subObj);
                } else {
                    this.model.push(obj);
                }
            }
        });
    }
}
