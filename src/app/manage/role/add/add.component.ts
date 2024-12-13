import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { ModuleService } from '../../../services/module.service';
@Component({
    selector: 'app-role-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class RoleAddComponent implements OnInit {
    roleForm: FormGroup;
    errorMessage = '';
    submitted = false;
    moduleList: any = [];
    statuses: any[];
    permissions: any = [];
    sourceParentModules: any[];
    targetParentModules: any[];
    displaymodule: any = [];
    rolestatus: any;
    permissionerrors: boolean = false;
    defaultRadioAction: 'edit';
    constructor(private roleService: RoleService, private moduleService: ModuleService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router) { }

    ngOnInit(): void {
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.roleForm = this.formBuilder.group({
            rolename: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            description: [''],
            status: [{ label: 'Active', value: true }, Validators.required],
            selectAll: [],
            default_data: [false],
            disable: [false],
        });
        this.rolestatus = true;
        this.getModules();
        // this.getFirstLevelModule(1);
        // this.targetParentModules = [];
    }

    get f() {
        if (this.permissions.length > 0) {
            this.permissionerrors = true;
        }
        return this.roleForm.controls;
    }

    getModules() {
        this.moduleService.getModules().subscribe(
            data => {
                this.moduleList = data.data.items;
                let form = {};
                this.moduleList.forEach(element => {
                    this.roleForm.addControl(element.module, new FormControl());
                    this.roleForm.addControl(element.module + "_radio", new FormControl());
                    this.roleForm.get(element.module + "_radio").setValue('edit');
                    this.roleForm.get(element.module + "_radio").disable();
                    if (element.submodule != undefined) {
                        element.submodule.forEach(submodule => {
                            this.roleForm.addControl(submodule.module, new FormControl());
                            this.roleForm.addControl(submodule.module + "_radio", new FormControl());
                            this.roleForm.get(submodule.module + "_radio").setValue('edit');
                            this.roleForm.get(submodule.module + "_radio").disable();
                        })
                    }
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    onStatusSelect(event) {
        if (event) {
            this.rolestatus = event.label;
        }
    }

    selectAll(event) {
        if (event.checked) {
            this.moduleList.forEach(module => {
                this.roleForm.get(module.module).setValue(true);
                this.roleForm.get(module.module + "_radio").enable();
                if (typeof module.submodule !== "undefined") {
                    module.submodule.forEach(submodule => {
                        this.roleForm.get(submodule.module).setValue(true);
                        this.roleForm.get(submodule.module + "_radio").enable();
                    })
                }
            })
            this.permissions = this.moduleList;
        } else {
            this.moduleList.forEach(module => {
                this.roleForm.get(module.module).setValue(false);
                this.roleForm.get(module.module + "_radio").disable();
                if (typeof module.submodule !== "undefined") {
                    module.submodule.forEach(submodule => {
                        this.roleForm.get(submodule.module).setValue(false);
                        this.roleForm.get(submodule.module + "_radio").disable();
                    })
                }
            });
            this.permissions = [];
        }
    }

    setModuleCheckbox(event, modulename, module) {
        if (event.checked) {
            var obj = { "module": modulename, "level": 1, "permission": { "edit": true, "view": false }, "url": module.url, icon: module.icon };
            this.roleForm.get(module.module + "_radio").enable();
            console.log('Internal');
            this.permissions.push(obj);
            var index = this.findIndexById(modulename, this.moduleList);
            if (typeof this.moduleList[index]['submodule'] !== "undefined") {
                this.moduleList[index].submodule.forEach(submodule => {
                    this.roleForm.get(submodule.module).setValue(true);
                    this.roleForm.get(submodule.module + "_radio").enable();
                })
                var permissionsindex = this.findIndexById(modulename, this.permissions);
                this.permissions[permissionsindex]['submodule'] = this.moduleList[index].submodule;
            }
        } else {
            var index = this.findIndexById(modulename, this.moduleList);
            this.roleForm.get(module.module + "_radio").disable();
            if (typeof this.moduleList[index]['submodule'] !== "undefined") {
                this.moduleList[index].submodule.forEach(submodule => {
                    this.roleForm.get(submodule.module).setValue(false);
                    this.roleForm.get(submodule.module + "_radio").disable();
                })
            }
            if (index != -1) {
                this.permissions = this.permissions.filter(item => item.module !== modulename);
            }
        }
    }

    setSubModuleCheckbox(event, submodule, modulename) {
        if (event.checked) {
            var index = this.findIndexById(modulename, this.permissions);
            var subArray = [];
            var obj = { "module": submodule.module, "level": 2, "permission": { "edit": true, "view": false }, 'url': submodule.url, 'icon': submodule.icon };
            if (typeof this.permissions[index]['submodule'] !== "undefined") {
                this.permissions[index]['submodule'].push(obj);
            } else {
                subArray.push(obj);
                this.permissions[index]['submodule'] = subArray;
            }
        } else {
            this.roleForm.get(modulename).setValue(false);
            var permissionsindex = this.findIndexById(modulename, this.permissions);
            var submoduleindex = this.findIndexById(submodule.module, this.permissions[permissionsindex]['submodule']);
            if (submoduleindex != -1) {
                this.permissions[permissionsindex]['submodule'] = this.permissions[permissionsindex]['submodule'].filter(item => item.module !== submodule.module);
            }
        }
    }

    setModuleRadiobutton(event, modulename, action) {
        if (action == 'edit') {
            var obj = { "edit": true, "view": false };
        } else {
            var obj = { "edit": false, "view": true };
        }
        var index = this.findIndexById(modulename, this.permissions);
        this.permissions[index]['permission'] = obj;
        //change permission of submodules as well
        if (typeof this.permissions[index]['submodule'] !== "undefined") {
            this.permissions[index]['submodule'].forEach(submodule => {
                submodule.permission = obj;
                this.roleForm.get(submodule.module + "_radio").setValue(action);
            });
        }
    }

    setSubModuleRadiobutton(event, submodulename, modulename, action) {
        if (action == 'edit') {
            var obj = { "edit": true, "view": false };
        } else {
            var obj = { "edit": false, "view": true };
        }
        var index = this.findIndexById(modulename, this.permissions);
        var subModuleindex = this.findIndexById(submodulename, this.permissions[index]['submodule']);
        this.permissions[index]['submodule'][subModuleindex]['permission'] = obj;
    }

    findIndexById(name, arrayName) {
        let index = -1;
        for (let i = 0; i < arrayName.length; i++) {
            if (arrayName[i].module === name) {
                index = i;
                break;
            }
        }
        return index;
    }

    onSubmit() {

        if (this.permissions.length == 0) {
            this.permissionerrors = true;
            return;
        } else {
            this.permissionerrors = false;
        }
        this.submitted = true;

        // stop here if form is invalid
        if (this.roleForm.invalid) {
            return;
        }
        var roleData = this.roleForm.value;
        roleData['status'] = this.rolestatus;
        roleData['user_role_name'] = roleData['rolename'];
        roleData['user_role_description'] = roleData['description'];
        roleData['permissions'] = this.permissions;
        // display form values on success
        //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.roleForm.value, null, 4));
        // this.moduleList.forEach(element => {

        // });
        roleData = JSON.stringify(roleData, null, 4);
        //return;

        this.roleService.addRole(roleData).subscribe(
            data => {
                this.messageService.add({ key: 'toastmsg', severity: 'success', summary: 'Successful', detail: 'Role Added', life: 6000 });
                setTimeout(() => {
                    this.router.navigate(['/manage/role']);
                }, 1000);
            },
            ((err) => {
                this.messageService.add({ key: 'toastmsg', severity: 'error', summary: err.error.message, detail: 'Add Role failed', life: 6000 });
            })
        );
    }

    onReset() {
        this.submitted = false;
        this.roleForm.reset();
    }

    backLink() {
        this.router.navigate(['/manage/role']);
    }
}
