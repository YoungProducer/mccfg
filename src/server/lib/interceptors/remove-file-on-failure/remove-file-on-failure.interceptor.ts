import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { existsSync, unlinkSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Can be used in pair with `FileInterceptor`
 *
 * Will remove created file if request failed for any reasons
 */
@Injectable()
export class RemoveFileOnFailureInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      catchError((err) => {
        const file: Express.Multer.File = req['file'];

        const pathToFile = !!file
          ? join(
              isAbsolute(file.destination) ? '' : process.cwd(),
              file.destination,
              file.filename,
            )
          : undefined;

        const isExist = pathToFile && existsSync(pathToFile);

        if (isExist) {
          unlinkSync(pathToFile);
        }

        return throwError(() => err);
      }),
    );
  }
}
