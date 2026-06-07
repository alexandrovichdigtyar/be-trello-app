import { KafkaConsumer } from './kafka-consumer';

export interface IHandler<TPayload> {
    handle(payload: TPayload): Promise<void>;
}

export abstract class BaseKafkaHandler<TPayload> implements IHandler<TPayload> {
    constructor(
        private readonly consumer: KafkaConsumer,
        private readonly topic: string,
    ) {}

    async listen(): Promise<void> {
        this.consumer.subscribe(this.topic, async (payload) => {
            await this.handle(payload as TPayload);
        });
    }

    abstract handle(payload: TPayload): Promise<void>;
}
