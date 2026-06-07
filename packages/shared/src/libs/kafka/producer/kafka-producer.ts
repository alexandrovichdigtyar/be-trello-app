import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer {
    private readonly producer: Producer;
    private readonly kafka: Kafka;

    constructor(clientId: string, brokers: string[]) {
        this.kafka = new Kafka({ clientId, brokers });
        this.producer = this.kafka.producer();
    }

    async send({ topic, key, payload }: { topic: string; key: string; payload: unknown }): Promise<void> {
        await this.producer.send({
            topic,
            messages: [{ key, value: JSON.stringify(payload) }],
        });
    }

    async connect(): Promise<void> {
        await this.producer.connect();
    }

    async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }
}
