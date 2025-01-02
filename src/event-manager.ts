import { Injectable, Logger } from '@nestjs/common';
import { SubscriberInterface } from './subscriber.interface';

@Injectable()
export class EventManager {
    private readonly logger = new Logger(EventManager.name);
    private handlers: Map<string, SubscriberInterface[]> = new Map();

    createEventType(eventType: string): void {
        this.logger.log(`Creating event type: ${eventType}`);
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
    }

    subscribe(eventType: string, handler: SubscriberInterface): void {
        if (!handler || !handler.handleEvent) {
            this.logger.error(`Handler for event type ${eventType} is null or undefined`);
            return;
        }
        this.logger.log(`Handler ${handler.constructor.name} added for event type: ${eventType}`);
        if (this.handlers.has(eventType)) {
            this.handlers.get(eventType)?.push(handler);
        } else {
            this.handlers.set(eventType, [handler]);
        }
        this.logCurrentHandlers();
    }

    notify(eventType: string, event: Record<string, string>): void {
        this.logger.log(`Notifying handlers for event type: ${eventType}`);
        const handlers: SubscriberInterface[] | undefined = this.handlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => {
                if (handler) {
                    handler.handleEvent(event);
                } else {
                    this.logger.warn(`Handler for event type ${eventType} is null`);
                }
            });
        }
    }

    private logCurrentHandlers(): void {
        this.logger.log(`Current handlers: ${JSON.stringify(Array.from(this.handlers.entries()), null, 2)}`);
    }
}