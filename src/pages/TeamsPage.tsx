import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useTeamStore } from '../store/teamStore';
import { useUserStore } from '../store/userStore';
import { AvatarGroup } from '../components/ui/AvatarGroup';
import { User } from '../types';

export const TeamsPage: React.FC = () => {
  const teams = useTeamStore(useShallow((s) => Object.values(s.teams)));
  const users = useUserStore((s) => s.users);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Teams" subtitle={`${teams.length} teams`} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const members = team.memberIds.map((id) => users[id]).filter(Boolean) as User[];
              return (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-xl p-5 cursor-pointer hover:border-[#D0D0D0] dark:hover:border-white/20 transition-all group"
                >
                  {/* Team icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                    style={{ backgroundColor: team.color + '33', border: `1.5px solid ${team.color}` }}
                  >
                    {team.icon}
                  </div>

                  <h3 className="text-base font-bold text-[#111111] dark:text-white mb-1 group-hover:text-[#44AADF] transition-colors">{team.name}</h3>
                  <p className="text-xs text-[#555555] dark:text-[#A0A0A0] mb-4 line-clamp-2">{team.description}</p>

                  <div className="flex items-center justify-between">
                    <AvatarGroup users={members} max={5} size="xs" />
                    <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{members.length} members</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E0E0E0] dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{team.projectIds.length} projects</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
