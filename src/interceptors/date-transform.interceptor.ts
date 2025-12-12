import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTime } from 'luxon';

@Injectable()
export class DateTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformDates(data))
    );
  }

  private transformDates(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Si es un objeto Date, corregir la interpretación incorrecta
    if (data instanceof Date) {
      return this.correctDateInterpretation(data);
    }

    // Si es un array, transformar cada elemento
    if (Array.isArray(data)) {
      return data.map(item => this.transformDates(item));
    }

    // Si es un objeto, transformar cada propiedad
    if (typeof data === 'object') {
      const transformed: any = {};
      for (const [key, value] of Object.entries(data)) {
        transformed[key] = this.transformDates(value);
      }
      return transformed;
    }

    // Para otros tipos de datos, devolver tal como están
    return data;
  }

  private correctDateInterpretation(date: Date): string {
    // Obtener la zona horaria del sistema
    const systemOffset = date.getTimezoneOffset(); // en minutos
    
    // Si hay un offset (no estamos en UTC), significa que las fechas de la BD
    // se están interpretando como hora local cuando en realidad son UTC
    if (systemOffset !== 0) {
      // La fecha que viene de la BD fue interpretada como hora local
      // pero en realidad es UTC, necesitamos corregir el offset
      const offsetHours = systemOffset / 60; // convertir minutos a horas
      const correctedDate = new Date(date.getTime() - (offsetHours * 60 * 60 * 1000));
      return correctedDate.toISOString();
    }
    
    // Si estamos en UTC, no hay corrección necesaria
    return date.toISOString();
  }
}
