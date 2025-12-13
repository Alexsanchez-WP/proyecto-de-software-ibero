import { Observer } from '../utils/Observer';

export class LoggingObserver implements Observer {
  update(data: any): void {
    console.log(`[LOGGING OBSERVER]: Event received - ${JSON.stringify(data)}`);
  }
}
