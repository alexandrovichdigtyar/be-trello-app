import { KafkaProducer } from './kafka-producer';

export interface IPublisher<TKey, TPayload> {
    publish(topic: string, key: TKey, payload: TPayload): Promise<void>;
}

export abstract class BaseKafkaPublisher<TKey, TPayload> implements IPublisher<TKey, TPayload> {
    constructor(private readonly producer: KafkaProducer) {}

    public async publish(topic: string, key: TKey, payload: TPayload): Promise<void> {
        try {
            await this.producer.send({
                topic,
                key: JSON.stringify(key),
                payload,
            });
        } catch (e) {
            this.onPublishFailed(e);
        }
    }

    protected onPublishFailed(error: unknown): void {
        // no-op
    }
}
