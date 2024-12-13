import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { ModuleService } from '../../../services/module.service';
@Component({
    selector: 'app-role-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class RoleViewComponent implements OnInit {
    roleForm: FormGroup;
    id;
    errorMessage = '';
    submitted = false;
    permissionerrors: boolean = false;
    statuses: any = [];
    moduleList: any = [];
    rolestatus: any;
    permissions: any = [];
    public item: any[] = [];
    defaultData: boolean;
    constructor(private roleService: RoleService, private moduleService: ModuleService, private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService, private messageService: MessageService,
        private router: Router, private activeroute: ActivatedRoute) { }

    ngOnInit(): void {
        this.id = this.activeroute.snapshot.params.id;
        this.statuses = [
            { label: 'Active', value: true },
            { label: 'In-Active', value: false }
        ];
        this.roleForm = this.formBuilder.group({
            rolename: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z]*$')]],
            description: [''],
            status: [],
            selectAll: []
        });
        this.getModules();
        this.getRoleDetails(this.id);
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
                    if (element.submodule != undefined) {
                        element.submodule.forEach(submodule => {
                            this.roleForm.addControl(submodule.module, new FormControl());
                            this.roleForm.addControl(submodule.module + "_radio", new FormControl());
                            this.roleForm.get(submodule.module + "_radio").setValue('edit');
                        })
                    }
                });
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    getRoleDetails(id) {
        this.roleService.getRoleDetails(id).subscribe(
            data => {
                this.item = data;
                if (this.item) {
                    this.roleForm.patchValue({
                        rolename: this.item['user_role_name'],
                        description: this.item['user_role_description']
                    });
                    var statusobj;
                    if (this.item['status'] == true) {
                        statusobj = { label: 'Active', value: true };
                    } else {
                        statusobj = { label: 'In-Active', value: false };
                    }
                    this.defaultData = this.item['default_data'];
                    this.roleForm.get('status').setValue(statusobj);
                    this.roleForm.get('status').disable();
                    this.moduleList.forEach(module => {
                        this.item['permissions'].forEach(editModule => {
                            this.roleForm.get(module.module + "_radio").disable();
                            this.roleForm.get(module.module).disable();
                            if (module.module == editModule.module) {
                                if (editModule.permission.edit == true) {
                                    this.roleForm.get(module.module + "_radio").disable();
                                    this.roleForm.get(module.module + "_radio").setValue('edit');
                                } else {
                                    this.roleForm.get(module.module + "_radio").disable();
                                    this.roleForm.get(module.module + "_radio").setValue('view');
                                }
                                if (typeof editModule.submodule !== "undefined" && editModule.submodule.length > 0) {
                                    editModule.submodule.forEach(editSubModule => {
                                        this.roleForm.get(editSubModule.module).setValue(true);
                                        this.roleForm.get(editSubModule.module).disable();
                                        if (editSubModule.permission.edit == true && editSubModule.permission.view == false) {
                                            this.roleForm.get(editSubModule.module + "_radio").setValue('edit');
                                            this.roleForm.get(editSubModule.module + "_radio").disable();
                                        } else if (editSubModule.permission.view == true && editSubModule.permission.edit == false) {
                                            this.roleForm.get(editSubModule.module + "_radio").setValue('view');
                                            this.roleForm.get(editSubModule.module + "_radio").disable();
                                        }
                                    });
                                }
                                if (typeof module.submodule !== "undefined" && typeof editModule.submodule !== "undefined") {
                                    if (module.submodule.length == editModule.submodule.length) {
                                        this.roleForm.get(module.module).disable();
                                        this.roleForm.get(module.module).setValue(true);
                                    }
                                } else {
                                    this.roleForm.get(module.module).disable();
                                    this.roleForm.get(module.module).setValue(true);
                                }
                            }
                            var index = this.findIndexById(editModule.module, this.permissions);
                            if (index == -1) {
                                this.permissions.push(editModule);
                            }
                        });
                    });
                }

                this.roleForm.get('rolename').disable();
                this.roleForm.get('description').disable();
                this.roleForm.get('selectAll').disable();
            },
            err => {
                this.errorMessage = err.error.message;
            }
        );
    }

    // convenience getter for easy access to form fields
    get f() {
        if (this.permissions.length > 0) {
            this.permissionerrors = true;
        }
        return this.roleForm.controls;
    }

    selectAll(event) {
        if (event.checked) {
            this.permissions = [];

            this.moduleList.forEach(module => {
                this.roleForm.get(module.module).setValue(true);
                if (typeof module.submodule !== "undefined") {
                    module.submodule.forEach(submodule => {
                        this.roleForm.get(submodule.module).setValue(true);
                    })
                }
            })
            this.permissions = this.moduleList;
        } else {
            this.moduleList.forEach(module => {
                this.roleForm.get(module.module).setValue(false);
                if (typeof module.submodule !== "undefined") {
                    module.submodule.forEach(submodule => {
                        this.roleForm.get(submodule.module).setValue(false);
                    })
                }
            })
            this.permissions = [];

        }
    }

    setModuleCheckbox(event, modulename, module) {
        if (event.checked) {
            var obj = { "module": modulename, "level": 1, "permission": { "edit": true, "view": false } };
            this.permissions.push(obj);
            var index = this.findIndexById(modulename, this.moduleList);
            if (typeof this.moduleList[index]['submodule'] !== "undefined") {
                this.moduleList[index].submodule.forEach(submodule => {
                    this.roleForm.get(submodule.module).setValue(true);
                })
                var permissionsindex = this.findIndexById(modulename, this.permissions);
                this.permissions[permissionsindex]['submodule'] = this.moduleList[index].submodule;
            }
        } else {
            var index = this.findIndexById(modulename, this.moduleList);
            if (typeof this.moduleList[index]['submodule'] !== "undefined") {
                this.moduleList[index].submodule.forEach(submodule => {
                    this.roleForm.get(submodule.module).setValue(false);
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
            var obj = { "module": submodule.module, "level": 2, "permission": { "edit": true, "view": false } };
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

    onStatusSelect(event) {
        if (event) {
            this.rolestatus = event.value;
        }
    }

    editRole(id) {
        this.router.navigate(['/manage/role/' + id]);
    }

    backLink() {
        this.router.navigate(['/manage/role']);
    }
}
