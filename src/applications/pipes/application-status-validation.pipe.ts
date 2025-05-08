import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ApplicationStatus } from '../dto/update-application-status.dto';

@Injectable()
export class ApplicationStatusValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ApplicationStatusValidationPipe.name);

  transform(value: any) {
    this.logger.debug(`Received value: ${JSON.stringify(value)}`);
console.log(value,'==========')
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Request body must be an object');
    }

    const status = value.status;
    if (!status) {
      throw new BadRequestException('Status is required');
    }

    const validStatuses = Object.values(ApplicationStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    this.logger.debug('Status validation passed');
    return value;
  }
} 