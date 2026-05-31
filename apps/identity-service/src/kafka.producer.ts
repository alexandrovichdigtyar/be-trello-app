import { Kafka, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from './config/kafka';

class KafkaProducer {
  private readonly producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish<T>(params: { topic: string; payload: T; key?: string }): Promise<void> {
    await this.producer.send({
      topic: params.topic,
      messages: [{ key: params.key, value: JSON.stringify(params.payload) }],
    });
  }
}

export const kafkaProducer = new KafkaProducer();
