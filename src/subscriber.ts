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
import { createClient, RedisClientType } from 'redis';
import EventRegistry from './event-registry';

export class Subscriber {
    protected subscriber: RedisClientType;
    protected eventRegistry: EventRegistry;

    constructor(eventRegistry: EventRegistry) {
        this.subscriber = createClient();
        this.eventRegistry = eventRegistry;
        this.subscriber.on('error', (err: Error) => {
            console.error('Redis client error:', err);
        });
    }

    public async subscribeToChannel(channel: string): Promise<void> {
        try {
            await this.subscriber.connect();
            await this.subscriber.subscribe(channel, (err) => {
                if (err) {
                    console.error('Error subscribing to channel:', err);
                } else {
                    console.log(`Subscribed to ${channel}`);
                }
            });

            this.subscriber.on('message', (channel, message) => {
                const parsedMessage: Record<string, string> = JSON.parse(message);
                const event = parsedMessage.event;
                this.eventRegistry.notify(event, parsedMessage);
            });
        } catch (err: unknown) {
            console.error('Error subscribing to channel:', err);
        }
    }

    public async disconnect(): Promise<void> {
        await this.subscriber.disconnect();
    }
}

export default Subscriber;