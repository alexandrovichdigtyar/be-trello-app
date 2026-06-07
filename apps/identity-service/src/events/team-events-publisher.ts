import { BaseKafkaPublisher } from '@trello-app/shared';
import { kafkaProducer } from '../kafka.producer';

export type TeamPayload = { teamId: string; name: string; producedAt: string };

export class TeamEventsPublisher extends BaseKafkaPublisher<string, TeamPayload> {
  protected onPublishFailed(error: unknown): void {
    console.error('[TeamEventsPublisher]', error);
  }
}

export const teamEventsPublisher = new TeamEventsPublisher(kafkaProducer);
