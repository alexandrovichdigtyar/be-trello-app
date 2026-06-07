import { KafkaProducer } from '@trello-app/shared';

export const kafkaProducer = new KafkaProducer(
  process.env.KAFKA_CLIENT_ID!,
  process.env.KAFKA_BROKERS!.split(','),
);