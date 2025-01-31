import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as iconv from 'iconv-lite';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.map(item => this.sanitizeData(item));
        }
        return this.sanitizeData(data);
      })
    );
  }

  private sanitizeData(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj };

    // Convert dates to ISO format
    if (result.createdAt instanceof Date) {
      result.createdAt = result.createdAt.toISOString();
    }
    if (result.updatedAt instanceof Date) {
      result.updatedAt = result.updatedAt.toISOString();
    }

    // Process each field in the object
    for (const key in result) {
      if (typeof result[key] === 'string') {
        result[key] = this.sanitizeString(result[key]);
      } else if (typeof result[key] === 'object' && !Array.isArray(result[key]) && !(result[key] instanceof Date)) {
        result[key] = this.sanitizeData(result[key]);
      }
    }

    return result;
  }

  private sanitizeString(text: string): string {
    // Remove 'ç' character if it's prepended to every character
    if (text.split('').every((char, index) => index === 0 || text[index - 1] === 'ç')) {
      text = text.split('ç').join('');
    }

    // Decode from Latin1 to UTF-8 if needed
    if (/[\x80-\xFF]/.test(text)) {
      try {
        const buffer = Buffer.from(text, 'binary');
        text = iconv.decode(buffer, 'latin1');
      } catch (e) {
        console.error('Error decoding string:', e);
      }
    }

    // Remove any remaining invalid characters
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    // Fix common special characters
    const replacements = new Map([
      [/\?[Cc]one/g, 'Ícone'],
      [/[Ii]cone/g, 'Ícone'],
      [/pagina/gi, 'página'],
      [/pagína/gi, 'página'],
      [/\bHome\b/g, 'Home'],
      [/\bpara\b/g, 'para'],
      [/\binicial\b/g, 'inicial']
    ]);

    // Apply replacements
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }

    return text;
  }
} 