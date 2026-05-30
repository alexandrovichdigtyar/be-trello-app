import { Kafka, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from './config/kafka';

class KafkaProducer {
  private readonly producer: Producer;
  private connected = false;

  constructor() {
    const kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.connected = false;
  }

  async publish<T>(topic: string, payload: T): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}

export const kafkaProducer = new KafkaProducer();
