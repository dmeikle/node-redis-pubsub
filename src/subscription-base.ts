/*
 * MIT License
 * 
 * Copyright (c) 2024 Quantum Unit Solutions
 * Author: David Meikle
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventManager } from './event-manager';
import { SubscriberInterface } from './subscriber.interface';
import { forEach } from 'lodash';

export type Subscription = {
    type: string;
    subscriber: SubscriberInterface;
};

export abstract class SubscriptionBase implements OnApplicationBootstrap {
    protected readonly logger = new Logger(this.constructor.name);
    abstract getSubscriptions(): Subscription[];

    constructor(protected eventManager: EventManager) {}

    onApplicationBootstrap(): void {
        this.registerSubscriptions();
        this.logger.log('Subscriptions setup completed.');
    }

    private registerSubscriptions(): void {
        const map: Subscription[] = this.getSubscriptions();
        forEach(map, (subscriber: Subscription) => {
            const subscriptionHandler: SubscriberInterface = subscriber.subscriber;
            console.log(`Registering subscription for ${subscriber.type} with handler ${subscriptionHandler.constructor.name}`);
            this.eventManager.subscribe(subscriber.type, subscriptionHandler.handleEvent.bind(subscriptionHandler));
        });
    }
}