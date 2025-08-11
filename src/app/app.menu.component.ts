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

        // Fetch fresh permissions from backend using the new permission_access array
        this.loadMenuFromModulesAPI();
    }

    /**
     * @deprecated This method is now deprecated in favor of loadMenuFromModulesAPI 
     * which uses the new permission_access array from the role document.
     * This method is kept for backward compatibility only.
     */
    // loadUserPermissions() {
    //     // Get user ID from stored user data
    //     const userId = this.userData['userdata']._id;
    //     const userRoleId = this.userData['userdata'].role;

    //     // Fetch user's role and permissions from backend
    //     this.roleService.getRoleDetails(userRoleId).subscribe({
    //         next: (roleData) => {
    //             if (roleData && roleData.permissions) {
    //                 this.loggedInUserPermissions = roleData.permissions;
    //                 this.buildMenuFromPermissions();
    //             } else {
    //                 this.showErrorMenu('No permissions found for user role');
    //             }
    //         },
    //         error: (error) => {
    //             this.showErrorMenu('Backend connection failed - unable to load menu');
    //         }
    //     });
    // }

    loadUserPermissions() {
  if (!this.userData || !this.userData['userdata']) {
    console.error('User data not available.');
    this.showErrorMenu('User data not loaded');
    return;  // stop execution to avoid error
  }

  const userId = this.userData['userdata']._id;
  const userRoleId = this.userData['userdata'].role;

  this.roleService.getRoleDetails(userRoleId).subscribe({
    next: (roleData) => {
      if (roleData && roleData.permissions) {
        this.loggedInUserPermissions = roleData.permissions;
        this.buildMenuFromPermissions();
      } else {
        this.showErrorMenu('No permissions found for user role');
      }
    },
    error: () => {
      this.showErrorMenu('Backend connection failed - unable to load menu');
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
    refreshMenu() {
        this.loadMenuFromModulesAPI();
    }

    // Alternative method: Fetch modules from backend and filter by user permissions
    // loadMenuFromModulesAPI() {
    //     const userId = this.userData['userdata']._id;
    //     const userRoleId = this.userData['userdata'].role;
    loadMenuFromModulesAPI() {
  if (!this.userData || !this.userData['userdata']) {
    console.error('User data not loaded yet.');
    // Optionally, set default menu or return early to avoid errors
    this.model = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] }
    ];
    return;
  }

  const userId = this.userData['userdata']._id;
  const userRoleId = this.userData['userdata'].role;

        // Fetch both modules and user role in parallel
        Promise.all([
            this.moduleService.getModules().toPromise(),
            this.roleService.getRoleDetails(userRoleId).toPromise()
        ]).then(([modulesResponse, roleResponse]) => {
            // Handle different response formats
            let modules = modulesResponse;
            if (modulesResponse && modulesResponse.data) {
                modules = modulesResponse.data;
                
                // Check if modules has items property (like {totalCount: 13, items: Array(13)})
                if (modules.items && Array.isArray(modules.items)) {
                    modules = modules.items;
                }
            }
            
            if (modules && Array.isArray(modules) && roleResponse) {
                // PRIORITY 1: Check for new permission_access array
                if (roleResponse.permission_access && Array.isArray(roleResponse.permission_access) && roleResponse.permission_access.length > 0) {
                    this.buildMenuFromPermissionAccess(modules, roleResponse.permission_access);
                }
                // Check if permission_access exists but is empty
                else if (roleResponse.permission_access && Array.isArray(roleResponse.permission_access) && roleResponse.permission_access.length === 0) {
                    this.buildMenuFromPermissionAccess(modules, []); // This will show only Dashboard
                }
                // Check if permission_access field exists but is not an array
                else if (roleResponse.permission_access !== undefined && !Array.isArray(roleResponse.permission_access)) {
                    this.showErrorMenu('Invalid permission_access format in role');
                }
                // FALLBACK: Use old permissions array ONLY if permission_access doesn't exist at all
                else if (roleResponse.permission_access === undefined && roleResponse.permissions && Array.isArray(roleResponse.permissions)) {
                    const permittedModules = roleResponse.permissions.map(p => p.module);
                    const filteredModules = modules.filter(module => permittedModules.includes(module.module));
                    this.buildMenuFromModules(filteredModules, roleResponse.permissions);
                }
                // ERROR: No valid permission data found
                else {
                    this.showErrorMenu('No permission data found for user role - please update role with permission_access array');
                }
            } else {
                this.model = [
                    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
                    { label: 'Error: Backend Required', icon: 'pi pi-exclamation-triangle', routerLink: ['/manage/dashboard'] }
                ];
            }
        }).catch(error => {
            this.model = [
                { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
                { label: 'Error: Backend Connection Failed', icon: 'pi pi-exclamation-triangle', routerLink: ['/manage/dashboard'] }
            ];
        });
    }

    /**
     * Build menu using permission_access array from role (PRIMARY METHOD)
     * This matches module names in permission_access with modules collection
     */
    buildMenuFromPermissionAccess(modules: any[], permissionAccess: string[]) {
        // Store permission access for other methods
        this.loggedInUserPermissions = permissionAccess.map(moduleName => ({
            module: moduleName,
            permission: { edit: true, view: true }
        }));
        
        // Reset model to dashboard only
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
        ];

        // Filter modules based on permission_access array
        const allowedModules = modules.filter(module => 
            permissionAccess.includes(module.module)
        );

        // Build menu from allowed modules
        allowedModules.forEach(module => {
            let obj = {
                label: module.module,
                icon: 'pi ' + (module.icon || 'pi-circle'),
                routerLink: [module.url || '/manage/' + module.module.toLowerCase().replace(/\s+/g, '-')]
            };
            
            let subData = [];
            if (module.submodule && module.submodule.length > 0) {
                // Show all submodules if parent module is allowed
                module.submodule.forEach(submod => {
                    let subDataObj = {
                        label: submod.module,
                        icon: 'pi ' + (submod.icon || 'pi-circle'),
                        routerLink: [submod.url || '/manage/' + submod.module.toLowerCase().replace(/\s+/g, '-')]
                    };
                    subData.push(subDataObj);
                });
            }
            
            if (subData.length > 0) {
                let subObj = {
                    label: module.module,
                    icon: 'pi ' + (module.icon || 'pi-circle'),
                    routerLink: [module.url || '/manage/' + module.module.toLowerCase().replace(/\s+/g, '-')],
                    items: subData
                };
                this.model.push(subObj);
            } else {
                this.model.push(obj);
            }
        });
    }

    buildMenuFromModules(modules, userPermissions) {
        // Store permissions for other methods
        this.loggedInUserPermissions = userPermissions;
        
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

    /**
     * Show error menu when no valid permissions are found
     */
    showErrorMenu(errorMessage: string) {
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/manage/dashboard'] },
            { label: `Error: ${errorMessage}`, icon: 'pi pi-exclamation-triangle', routerLink: ['/manage/dashboard'] }
        ];
    }
}
