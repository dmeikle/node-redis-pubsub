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
import { EventManager } from '../src/event-manager';
import { SubscriberInterface } from '../src/subscriber.interface';

class TestSubscriber implements SubscriberInterface {
    handleEvent(message: Record<string, string>): void {
        console.log(message);
    }
}

describe('EventManager', () => {
    let eventManager: EventManager;

    beforeEach(() => {
        eventManager = new EventManager();
    });

    it('should create an event type', () => {
        eventManager.createEventType('TestEvent');
        expect(eventManager['handlers'].has('TestEvent')).toBe(true);
    });

    it('should subscribe a handler to an event type', () => {
        const handler = new TestSubscriber();
        eventManager.createEventType('TestEvent');
        eventManager.subscribe('TestEvent', handler);
        expect(eventManager['handlers'].get('TestEvent')).toContain(handler);
    });

    it('should not subscribe a null handler', () => {
        eventManager.createEventType('TestEvent');
        eventManager.subscribe('TestEvent', null as any);
        expect(eventManager['handlers'].get('TestEvent')).toHaveLength(0);
    });

    it('should notify handlers of an event', () => {
        const handler = new TestSubscriber();
        jest.spyOn(handler, 'handleEvent');
        eventManager.createEventType('TestEvent');
        eventManager.subscribe('TestEvent', handler);
        eventManager.notify('TestEvent', { message: 'Hello' });
        expect(handler.handleEvent).toHaveBeenCalledWith({ message: 'Hello' });
    });
});