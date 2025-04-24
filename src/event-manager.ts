import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { SubscriberInterface } from './subscriber.interface';
import { Event } from './event';

@Injectable()
export class EventManager implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EventManager.name);
    private handlers: Map<string, SubscriberInterface[]> = new Map();
    private redisClient!: RedisClientType;
    private redisSubscriber!: RedisClientType;
    private instanceId: string = uuidv4(); // Unique identifier for this instance

    async onModuleInit() {
        const redisOptions = {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        };

        this.redisClient = createClient(redisOptions);
        this.redisSubscriber = createClient(redisOptions);

        await this.redisClient.connect();
        await this.redisSubscriber.connect();

        this.redisSubscriber.on('message', (channel, message) => {
            const { instanceId, event }: { instanceId: string; event: Event } = JSON.parse(message);
            if (instanceId !== this.instanceId) {
                this.notify(channel, event);
            }
        });

        this.logger.log('EventManager connected to Redis');
    }

    async onModuleDestroy() {
        await this.redisClient.quit();
        await this.redisSubscriber.quit();
    }

    createEventType(eventType: string): void {
        this.logger.log(`Creating event type: ${eventType}`);
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
            this.redisSubscriber.subscribe(eventType, (message) => {
                const { instanceId, event }: { instanceId: string; event: Event } = JSON.parse(message);
                if (instanceId !== this.instanceId) {
                    this.notify(eventType, event);
                }
            });
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
            this.redisSubscriber.subscribe(eventType, (message) => {
                const { instanceId, event }: { instanceId: string; event: Event } = JSON.parse(message);
                if (instanceId !== this.instanceId) {
                    this.notify(eventType, event);
                }
            });
        }
    }

    async notify(eventType: string, event: Event): Promise<void> {
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

        // Publish the event to Redis for other services
        await this.redisClient.publish(
            eventType,
            JSON.stringify({ instanceId: this.instanceId, event })
        );
    }
}