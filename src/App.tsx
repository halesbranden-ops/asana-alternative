import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { MyTasksPage } from './pages/MyTasksPage';
import { InboxPage } from './pages/InboxPage';
import { ProjectPage } from './pages/ProjectPage';
import { PortfoliosPage } from './pages/PortfoliosPage';
import { PortfolioDetailPage } from './pages/PortfolioDetailPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailPage } from './pages/GoalDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { CalendarPage } from './pages/CalendarPage';

import { useTaskStore } from './store/taskStore';
import { useProjectStore } from './store/projectStore';
import { useUserStore } from './store/userStore';
import { useNotificationStore } from './store/notificationStore';
import { useCommentStore } from './store/commentStore';
import { usePortfolioStore } from './store/portfolioStore';
import { useGoalStore } from './store/goalStore';
import { useTeamStore } from './store/teamStore';

import { mockTasks } from './data/mock/tasks.mock';
import { mockProjects, mockSections } from './data/mock/projects.mock';
import { mockUsers } from './data/mock/users.mock';
import { mockNotifications } from './data/mock/notifications.mock';
import { mockComments } from './data/mock/comments.mock';
import { mockPortfolios } from './data/mock/portfolios.mock';
import { mockGoals } from './data/mock/goals.mock';
import { mockTeams } from './data/mock/teams.mock';

const SEED_KEY = 'bullfit-seeded-v4';

function DataInitializer() {
  const { seedTasks } = useTaskStore();
  const { seedProjects } = useProjectStore();
  const { seedUsers } = useUserStore();
  const { seedNotifications } = useNotificationStore();
  const { seedComments } = useCommentStore();
  const { seedPortfolios } = usePortfolioStore();
  const { seedGoals } = useGoalStore();
  const { seedTeams } = useTeamStore();

  useEffect(() => {
    const alreadySeeded = localStorage.getItem(SEED_KEY);

    if (!alreadySeeded) {
      // Clear any old data (including previous versions)
      const keysToRemove = [
        'bullfit-tasks', 'bullfit-projects', 'bullfit-users', 'bullfit-notifications',
        'bullfit-comments', 'bullfit-portfolios', 'bullfit-goals', 'bullfit-teams',
        'bullfit-tasks-v2', 'bullfit-projects-v2', 'bullfit-users-v2', 'bullfit-notifications-v2',
        'bullfit-comments-v2', 'bullfit-portfolios-v2', 'bullfit-goals-v2', 'bullfit-teams-v2',
        'bullfit-seeded-v3',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Seed all data (empty arrays + current user only)
      seedUsers(mockUsers);
      seedProjects(mockProjects, mockSections);
      seedTasks(mockTasks);
      seedNotifications(mockNotifications);
      seedComments(mockComments);
      seedPortfolios(mockPortfolios);
      seedGoals(mockGoals);
      seedTeams(mockTeams);

      localStorage.setItem(SEED_KEY, 'true');
    } else {
      // Ensure the current user exists on subsequent loads
      const userState = useUserStore.getState();
      if (Object.keys(userState.users).length === 0) seedUsers(mockUsers);
    }
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <DataInitializer />
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="my-tasks" element={<MyTasksPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="portfolios" element={<PortfoliosPage />} />
          <Route path="portfolios/:portfolioId" element={<PortfolioDetailPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="goals/:goalId" element={<GoalDetailPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:teamId" element={<TeamDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
