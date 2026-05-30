import { kafkaProducer } from '../kafka.producer';
import { TOPICS } from './topics';

type Team = { id: string };
type TeamMember = { userId: string };

export const TeamMemberEvents = {
  added: (team: Team, teamMember: TeamMember) =>
    kafkaProducer.publish(TOPICS.TEAM_MEMBER_ADDED, {
      teamId: team.id,
      userId: teamMember.userId,
      createdAt: new Date().toISOString(),
    }),

  removed: (team: Team, teamMember: TeamMember) =>
    kafkaProducer.publish(TOPICS.TEAM_MEMBER_REMOVED, {
      teamId: team.id,
      userId: teamMember.userId,
      createdAt: new Date().toISOString(),
    }),
};
