import { kafkaProducer } from '../kafka.producer';
import { TOPICS } from './topics';

type Team = { id: string; name: string; createdAt: Date; updatedAt?: Date | null };

export const TeamEvents = {
  created: (team: Team) =>
    kafkaProducer.publish({
      topic: TOPICS.TEAM_CREATED,
      key: team.id,
      payload: {
        teamId: team.id,
        name: team.name,
        createdAt: team.createdAt,
      },
    }),

  updated: (team: Team) =>
    kafkaProducer.publish({
      topic: TOPICS.TEAM_UPDATED,
      key: team.id,
      payload: {
        teamId: team.id,
        name: team.name,
        updatedAt: team.updatedAt,
      },
    }),

  deleted: (team: Team) =>
    kafkaProducer.publish({
      topic: TOPICS.TEAM_DELETED,
      key: team.id,
      payload: {
        teamId: team.id,
        name: team.name,
        producedAt: new Date().toISOString(),
      },
    }),
};
