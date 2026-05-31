import { kafkaProducer } from '../kafka.producer';
import { TOPICS } from './topics';

type Team = { id: string };
type TeamMember = { userId: string };

export const TeamMemberEvents = {
  added: (team: Team, teamMember: TeamMember) =>
    kafkaProducer.publish({
      topic: TOPICS.TEAM_MEMBER_ADDED,
      key: team.id,
      payload: {
        teamId: team.id,
        userId: teamMember.userId,
        producedAt: new Date().toISOString(),
      },
    }),

  removed: (team: Team, teamMember: TeamMember) =>
    kafkaProducer.publish({
      topic: TOPICS.TEAM_MEMBER_REMOVED,
      key: team.id,
      payload: {
        teamId: team.id,
        userId: teamMember.userId,
        producedAt: new Date().toISOString(),
      },
    }),
};
