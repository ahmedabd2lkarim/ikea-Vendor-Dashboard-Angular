import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataUrl',
  standalone: true,
})
export class DataUrlPipe implements PipeTransform {
  transform(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }
}
