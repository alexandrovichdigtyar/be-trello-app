import { Kafka, Consumer } from 'kafkajs';

export interface KafkaConsumerConfig {
    clientId: string;
    brokers: string[];
    groupId: string;
}

export class KafkaConsumer {
    private readonly consumer: Consumer;
    private readonly kafka: Kafka;

    constructor({ clientId, brokers, groupId }: KafkaConsumerConfig) {
        this.kafka = new Kafka({ clientId, brokers });
        this.consumer = this.kafka.consumer({ groupId });
    }

    async connect(): Promise<void> {
        await this.consumer.connect();
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }

    async subscribe(
        topic: string,
        onMessageCallback: (payload: unknown, meta: { topic: string; partition: number }) => void,
    ): Promise<void> {
        await this.consumer.subscribe({ topic, fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const messageValue = message.value?.toString();
                if (!messageValue) return;

                try {
                    const parsedMessage = JSON.parse(messageValue);
                    onMessageCallback(parsedMessage, { topic, partition });
                } catch (e) {
                    onMessageCallback(message, { topic, partition });
                }
            },
        });
    }
}
