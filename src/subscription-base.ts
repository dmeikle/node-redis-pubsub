import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SubscriberInterface } from './subscriber.interface';
import { forEach } from 'lodash';
import {EventManager} from "./event-manager";

export type Subscription = {
    type: string;
    subscriber: SubscriberInterface;
};

export abstract class SubscriptionBase implements OnApplicationBootstrap {
    protected readonly logger: Logger = new Logger(this.constructor.name);
    protected subscriptions: Subscription[] = [];

    abstract getSubscriptions(): Subscription[];

    constructor(protected eventManager: EventManager) {}

    onApplicationBootstrap(): void {
        this.logger.log('Registering subscriptions.');
        this.registerSubscriptions();
        this.logger.log('Subscriptions setup completed.');
    }

    private registerSubscriptions(): void {
        const map: Subscription[] = this.getSubscriptions();
        forEach(map, (subscriber: Subscription) => {
            const subscriptionHandler: SubscriberInterface = subscriber.subscriber;
            if (!subscriptionHandler || !subscriptionHandler.handleEvent) {
                this.logger.error(`Handler for event type ${subscriber.type} is null or undefined`);
                return;
            }
            this.logger.log(`Registering subscription for ${subscriber.type} with handler ${subscriptionHandler.constructor.name}`);
            this.eventManager.subscribe(subscriber.type, subscriptionHandler);
        });
    }
}