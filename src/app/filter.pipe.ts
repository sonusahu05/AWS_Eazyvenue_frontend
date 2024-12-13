import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value : any[] ,filterString : string,propName: string): any[] {
    let result:any[]= [];
    if(!value || filterString === '' || propName === ''){
      return value;
    }
    value.forEach((a:any)=>{
      if(a[propName].toLowerCase().includes(filterString.toLowerCase())){
        result.push(a)
      }
    });
    return result;
  }

}
