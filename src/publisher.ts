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

const publisher: RedisClientType = createClient();

publisher.on('error', (err: Error) => {
    console.error('Redis client error:', err);
});

export const publishMessage = async (channel: string, message: Record<string, string>): Promise<void> => {
    try {
        await publisher.connect();
        const reply: number = await publisher.publish(channel, JSON.stringify(message));
        console.log(`Message published to ${channel}: ${JSON.stringify(message)}, reply: ${reply}`);
    } catch (err: unknown) {
        console.error('Error publishing message:', err);
    } finally {
        await publisher.disconnect();
    }
};