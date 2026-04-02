import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useUserStore, selectCurrentUser } from '../store/userStore';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useUIStore } from '../store/uiStore';

export const SettingsPage: React.FC = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const { updateUser } = useUserStore();
  const { addToast, theme, setTheme } = useUIStore() as any;

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || '',
    timezone: currentUser?.timezone || 'America/New_York',
  });

  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    taskCommented: true,
    dueSoon: true,
    mentions: true,
    projectUpdates: false,
  });

  const handleSave = () => {
    if (!currentUser) return;
    updateUser(currentUser.id, {
      name: form.name,
      email: form.email,
      role: form.role,
      timezone: form.timezone,
    });
    if (typeof addToast === 'function') {
      addToast({ type: 'success', message: 'Profile updated successfully' });
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'CET (Paris)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  ];

  const ToggleRow: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#E0E0E0] dark:border-white/5">
      <div>
        <p className="text-sm font-medium text-[#111111] dark:text-white">{label}</p>
        <p className="text-xs text-[#555555] dark:text-[#A0A0A0]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors duration-150 ${
          checked
            ? 'bg-[#44AADF] border-[#44AADF] text-white'
            : 'bg-transparent border-[#D8D6D2] dark:border-white/20 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF]'
        }`}
      >
        {checked ? 'On' : 'Off'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {/* Profile */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Profile</h2>

            <div className="flex items-center gap-4 mb-5">
              {currentUser && (
                <Avatar user={currentUser} size="xl" />
              )}
              <div>
                <p className="text-sm font-medium text-[#111111] dark:text-white mb-0.5">{currentUser?.name}</p>
                <p className="text-xs text-[#555555] dark:text-[#A0A0A0]">{currentUser?.email}</p>
                <button className="text-xs text-[#44AADF] mt-1 hover:text-[#3399CE] transition-colors">
                  Change photo
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Input
                label="Job title"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
              <div>
                <label className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] block mb-1">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="w-full bg-white dark:bg-[#333333] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#111111] dark:text-white outline-none focus:ring-2 focus:ring-[#44AADF]/50"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Notifications</h2>

            <ToggleRow
              label="Task assigned"
              description="When someone assigns you a task"
              checked={notifications.taskAssigned}
              onChange={(v) => setNotifications((n) => ({ ...n, taskAssigned: v }))}
            />
            <ToggleRow
              label="Task completed"
              description="When a task you follow is completed"
              checked={notifications.taskCompleted}
              onChange={(v) => setNotifications((n) => ({ ...n, taskCompleted: v }))}
            />
            <ToggleRow
              label="Comments"
              description="When someone comments on your tasks"
              checked={notifications.taskCommented}
              onChange={(v) => setNotifications((n) => ({ ...n, taskCommented: v }))}
            />
            <ToggleRow
              label="Due soon reminders"
              description="When your tasks are due in 24 hours"
              checked={notifications.dueSoon}
              onChange={(v) => setNotifications((n) => ({ ...n, dueSoon: v }))}
            />
            <ToggleRow
              label="Mentions"
              description="When you're mentioned in a comment"
              checked={notifications.mentions}
              onChange={(v) => setNotifications((n) => ({ ...n, mentions: v }))}
            />
            <ToggleRow
              label="Project updates"
              description="When project status is updated"
              checked={notifications.projectUpdates}
              onChange={(v) => setNotifications((n) => ({ ...n, projectUpdates: v }))}
            />
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Appearance</h2>

            {/* Theme selector */}
            <div className="mb-4">
              <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] mb-2">Color Mode</p>
              <div className="flex gap-3">
                {/* Light option */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
                    theme === 'light'
                      ? 'border-[#44AADF] bg-[#44AADF]/5'
                      : 'border-[#E0E0E0] dark:border-white/10 hover:border-[#C0C0C0] dark:hover:border-white/20'
                  }`}
                >
                  {/* Light mode preview swatch */}
                  <div className="w-full h-16 rounded-lg bg-[#F0EFEC] border border-[#E0E0E0] overflow-hidden flex flex-col gap-1 p-2">
                    <div className="w-3/4 h-2 rounded bg-[#CCCCCC]" />
                    <div className="w-1/2 h-2 rounded bg-[#DDDDDD]" />
                    <div className="mt-auto w-full h-5 rounded bg-white border border-[#E0E0E0]" />
                  </div>
                  <span className={`text-xs font-medium ${theme === 'light' ? 'text-[#44AADF]' : 'text-[#555555] dark:text-[#A0A0A0]'}`}>
                    Light
                  </span>
                  {theme === 'light' && (
                    <span className="text-[10px] text-[#44AADF] font-semibold -mt-1">Active</span>
                  )}
                </button>

                {/* Dark option */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
                    theme === 'dark'
                      ? 'border-[#44AADF] bg-[#44AADF]/5'
                      : 'border-[#E0E0E0] dark:border-white/10 hover:border-[#C0C0C0] dark:hover:border-white/20'
                  }`}
                >
                  {/* Dark mode preview swatch */}
                  <div className="w-full h-16 rounded-lg bg-[#242424] border border-white/10 overflow-hidden flex flex-col gap-1 p-2">
                    <div className="w-3/4 h-2 rounded bg-[#444444]" />
                    <div className="w-1/2 h-2 rounded bg-[#3A3A3A]" />
                    <div className="mt-auto w-full h-5 rounded bg-[#2E2E2E] border border-white/10" />
                  </div>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-[#44AADF]' : 'text-[#555555] dark:text-[#A0A0A0]'}`}>
                    Dark
                  </span>
                  {theme === 'dark' && (
                    <span className="text-[10px] text-[#44AADF] font-semibold -mt-1">Active</span>
                  )}
                </button>
              </div>
            </div>

            {/* Active theme badge */}
            <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-[#44AADF]/30">
              <div className="w-4 h-4 rounded-full bg-[#44AADF]" />
              <span className="text-sm text-[#111111] dark:text-white font-medium">BullFit Theme</span>
              <span className="ml-auto text-xs text-[#44AADF]">Active</span>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-5">
            <h2 className="text-base font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h2>
            <p className="text-xs text-[#555555] dark:text-[#A0A0A0] mb-3">These actions cannot be undone.</p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
