import { SubscriptionBase, Subscription } from '../src';
import { EventManager } from '../src/event-manager';
import { SubscriberInterface } from '../src';

class TestSubscriber implements SubscriberInterface {
    handleEvent(message: Record<string, string>): void {
        console.log(message);
    }
}

class TestSubscriptionBase extends SubscriptionBase {
    getSubscriptions(): Subscription[] {
        return [
            { type: 'TestEvent', subscriber: new TestSubscriber() },
        ];
    }
}

describe('SubscriptionBase', () => {
    let eventManager: EventManager;
    let subscriptionBase: TestSubscriptionBase;

    beforeEach(() => {
        eventManager = new EventManager();
        subscriptionBase = new TestSubscriptionBase(eventManager);
    });

    it('should register subscriptions on bootstrap', () => {
        const spy = jest.spyOn(eventManager, 'subscribe');
        subscriptionBase.onApplicationBootstrap();
        expect(spy).toHaveBeenCalledWith('TestEvent', expect.any(Function));
    });

    it('should log an error for null handlers', () => {
        const loggerSpy = jest.spyOn(subscriptionBase['logger'], 'error').mockImplementation(() => {});
        const faultySubscriptionBase = new TestSubscriptionBase(eventManager);
        jest.spyOn(faultySubscriptionBase, 'getSubscriptions').mockReturnValue([
            { type: 'TestEvent', subscriber: null as any },
        ]);
        faultySubscriptionBase.onApplicationBootstrap();
        expect(loggerSpy).toHaveBeenCalledWith('Handler for event type TestEvent is null or undefined');
    });
});