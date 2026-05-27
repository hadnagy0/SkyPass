import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flightDuration',
  standalone: true
})
export class FlightDurationPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (!value) return '0m';
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  }
}
