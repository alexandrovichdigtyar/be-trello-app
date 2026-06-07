import { BaseKafkaPublisher } from '@trello-app/shared';
import { kafkaProducer } from '../kafka.producer';

export type TeamMemberPayload = { teamId: string; userId: string; producedAt: string };

export class TeamMemberEventsPublisher extends BaseKafkaPublisher<string, TeamMemberPayload> {
  protected onPublishFailed(error: unknown): void {
    console.error('[TeamMemberEventsPublisher]', error);
  }
}

export const teamMemberEventsPublisher = new TeamMemberEventsPublisher(kafkaProducer);
