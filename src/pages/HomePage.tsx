import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { TopBar } from '../components/layout/TopBar';
import { TaskCompletionChart } from '../components/dashboard/TaskCompletionChart';
import { WorkloadChart } from '../components/dashboard/WorkloadChart';
import { ProjectStatusSummary } from '../components/dashboard/ProjectStatusSummary';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { MyTasksWidget } from '../components/dashboard/MyTasksWidget';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { StatsWidget } from '../components/dashboard/StatsWidget';
import { WidgetShell } from '../components/dashboard/WidgetShell';
import {
  useDashboardStore, WidgetType, WidgetConfig, WIDGET_META,
} from '../store/dashboardStore';
import { useUserStore, selectCurrentUser } from '../store/userStore';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

// ─── Widget renderer ──────────────────────────────────────────────────────────
function WidgetContent({ type }: { type: WidgetType }) {
  switch (type) {
    case 'stats':           return <StatsWidget />;
    case 'task_completion': return <TaskCompletionChart />;
    case 'workload':        return <WorkloadChart />;
    case 'project_health':  return <ProjectStatusSummary />;
    case 'my_tasks':        return <MyTasksWidget />;
    case 'upcoming':        return <UpcomingDeadlines />;
    case 'activity':        return <RecentActivity />;
    case 'calendar':        return <CalendarWidget />;
    default:                return null;
  }
}

// ─── Add-widget panel ─────────────────────────────────────────────────────────
interface AddWidgetPanelProps {
  allWidgets: WidgetConfig[];
  onAdd: (type: WidgetType, column: 'main' | 'sidebar') => void;
  onClose: () => void;
}

const AddWidgetPanel: React.FC<AddWidgetPanelProps> = ({ allWidgets, onAdd, onClose }) => {
  const placed = new Set(allWidgets.map((w) => w.type));
  const available = (Object.keys(WIDGET_META) as WidgetType[]).filter((t) => !placed.has(t));

  if (available.length === 0) {
    return (
      <div className="mt-4 p-4 bg-white dark:bg-[#2E2E2E] rounded-xl border border-[#E0E0E0] dark:border-white/10 text-center">
        <p className="text-sm text-[#555555] dark:text-[#A0A0A0]">All widgets are on your dashboard.</p>
        <button onClick={onClose} className="mt-2 text-xs text-[#44AADF] hover:text-[#3399CE]">Close</button>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white dark:bg-[#2E2E2E] rounded-xl border border-[#E0E0E0] dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">Add Widgets</h3>
        <button onClick={onClose} className="text-xs text-[#999999] hover:text-[#555555] dark:hover:text-[#A0A0A0]">Done</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {available.map((type) => {
          const meta = WIDGET_META[type];
          return (
            <div
              key={type}
              className="flex flex-col gap-2 p-3 rounded-xl border border-[#E0E0E0] dark:border-white/10 hover:border-[#44AADF]/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl leading-none">{meta.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] dark:text-white leading-tight">{meta.label}</p>
                  <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B] leading-tight mt-0.5">{meta.description}</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-auto">
                <button
                  onClick={() => { onAdd(type, 'main'); onClose(); }}
                  className="flex-1 text-[10px] py-1 rounded-md bg-[#44AADF]/10 hover:bg-[#44AADF]/20 text-[#44AADF] font-medium transition-colors"
                >
                  + Left col
                </button>
                <button
                  onClick={() => { onAdd(type, 'sidebar'); onClose(); }}
                  className="flex-1 text-[10px] py-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] font-medium transition-colors"
                >
                  + Right col
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Column droppable ─────────────────────────────────────────────────────────
interface ColumnProps {
  droppableId: string;
  widgets: WidgetConfig[];
  isEditMode: boolean;
  onRemove: (id: string) => void;
  emptyLabel: string;
}

const Column: React.FC<ColumnProps> = ({ droppableId, widgets, isEditMode, onRemove, emptyLabel }) => (
  <Droppable droppableId={droppableId}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={cn(
          'flex flex-col gap-4 min-h-[120px] rounded-xl transition-colors',
          snapshot.isDraggingOver && 'bg-[#44AADF]/5 ring-2 ring-[#44AADF]/20 ring-dashed p-1'
        )}
      >
        {widgets.length === 0 && isEditMode && (
          <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-[#E0E0E0] dark:border-white/10 text-xs text-[#999999] dark:text-[#6B6B6B]">
            {emptyLabel}
          </div>
        )}
        {widgets.map((widget, index) => (
          <WidgetShell
            key={widget.id}
            id={widget.id}
            index={index}
            isEditMode={isEditMode}
            onRemove={() => onRemove(widget.id)}
          >
            <WidgetContent type={widget.type} />
          </WidgetShell>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const {
    mainWidgets, sideWidgets,
    isEditMode, setEditMode,
    setMainWidgets, setSideWidgets,
    addWidget, removeWidget,
    resetToDefault,
  } = useDashboardStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Drag-and-drop handler ──────────────────────────────────────────────────
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcList  = source.droppableId      === 'main' ? [...mainWidgets] : [...sideWidgets];
    const destList = destination.droppableId === 'main' ? [...mainWidgets] : [...sideWidgets];

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const [moved] = srcList.splice(source.index, 1);
      srcList.splice(destination.index, 0, moved);
      if (source.droppableId === 'main') setMainWidgets(srcList);
      else setSideWidgets(srcList);
    } else {
      // Move between columns
      const [moved] = srcList.splice(source.index, 1);
      destList.splice(destination.index, 0, moved);
      if (source.droppableId === 'main') {
        setMainWidgets(srcList);
        setSideWidgets(destList);
      } else {
        setSideWidgets(srcList);
        setMainWidgets(destList);
      }
    }
  };

  const allWidgets = [...mainWidgets, ...sideWidgets];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Home"
        actions={
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={() => { resetToDefault(); setShowAddPanel(false); }}
                  className="text-xs text-[#999999] dark:text-[#6B6B6B] hover:text-[#555555] dark:hover:text-[#A0A0A0] transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowAddPanel((v) => !v)}
                  className="px-3 py-1 rounded-md text-xs font-medium border border-[#44AADF]/50 text-[#44AADF] hover:bg-[#44AADF]/10 transition-colors"
                >
                  + Add Widget
                </button>
                <button
                  onClick={() => { setEditMode(false); setShowAddPanel(false); }}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-[#44AADF] text-white hover:bg-[#3399CE] transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1 rounded-md text-xs font-medium border border-[#D8D6D2] dark:border-white/20 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF] transition-colors"
              >
                Edit Dashboard
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">

          {/* Greeting */}
          <div className="mb-6">
            <h1
              className="text-2xl font-black text-[#111111] dark:text-white"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {greeting}, <span>{currentUser?.name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="text-[#555555] dark:text-[#A0A0A0] text-sm mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Edit mode banner */}
          {isEditMode && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-[#44AADF]/10 border border-[#44AADF]/30 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#44AADF] flex-shrink-0">
                <path d="M7 1v6M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="text-xs text-[#44AADF] font-medium">
                Drag widgets to reorder or move between columns. Click <strong>×</strong> to remove a widget.
              </p>
            </div>
          )}

          {/* Dashboard grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main column (2/3) */}
              <div className="lg:col-span-2">
                <Column
                  droppableId="main"
                  widgets={mainWidgets}
                  isEditMode={isEditMode}
                  onRemove={removeWidget}
                  emptyLabel="Drop widgets here"
                />
              </div>

              {/* Sidebar column (1/3) */}
              <div className="lg:col-span-1">
                <Column
                  droppableId="sidebar"
                  widgets={sideWidgets}
                  isEditMode={isEditMode}
                  onRemove={removeWidget}
                  emptyLabel="Drop widgets here"
                />
              </div>
            </div>
          </DragDropContext>

          {/* Add widget panel */}
          {isEditMode && showAddPanel && (
            <AddWidgetPanel
              allWidgets={allWidgets}
              onAdd={addWidget}
              onClose={() => setShowAddPanel(false)}
            />
          )}

        </div>
      </div>
    </div>
  );
};
