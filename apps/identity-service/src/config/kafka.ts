export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'identity-service';
