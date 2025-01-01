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
import {Logger} from "@nestjs/common";

type MessageHandler = (message: Record<string, string>) => void;

export class EventRegistry {
    private registry: Map<string, MessageHandler[]> = new Map();
    private readonly logger: Logger = new Logger(EventRegistry.name);

    public register(event: string, handler: MessageHandler): void {
        if (!this.registry.has(event)) {
            this.logger.log(`Registering event: ${event}`);
            this.registry.set(event, []);
        }
        this.registry.get(event)?.push(handler);
    }

    public notify(event: string, message: Record<string, string>): void {
        const handlers: MessageHandler[] | undefined = this.registry.get(event);
        if (handlers) {
            handlers.forEach((handler: MessageHandler) => {
                this.logger.log(`Calling handler for event: ${event}`);
                handler(message);
            });
        }
    }
}

export default EventRegistry;