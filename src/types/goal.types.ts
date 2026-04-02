export type GoalStatus = 'on_track' | 'at_risk' | 'off_track' | 'achieved' | 'missed';
export type GoalTimeframe = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'annual';

export interface Goal {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  teamId: string | null;
  status: GoalStatus;
  progress: number;
  timeframe: GoalTimeframe;
  year: number;
  linkedProjectIds: string[];
  subGoalIds: string[];
  parentGoalId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
