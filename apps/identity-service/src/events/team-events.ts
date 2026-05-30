import { kafkaProducer } from '../kafka.producer';
import { TOPICS } from './topics';

type Team = { id: string; name: string };

export const TeamEvents = {
  created: (team: Team) =>
    kafkaProducer.publish(TOPICS.TEAM_CREATED, {
      teamId: team.id,
      name: team.name,
      createdAt: new Date().toISOString(),
    }),

  updated: (team: Team) =>
    kafkaProducer.publish(TOPICS.TEAM_UPDATED, {
      teamId: team.id,
      name: team.name,
      createdAt: new Date().toISOString(),
    }),

  deleted: (team: Team) =>
    kafkaProducer.publish(TOPICS.TEAM_DELETED, {
      teamId: team.id,
      name: team.name,
      createdAt: new Date().toISOString(),
    }),
};
