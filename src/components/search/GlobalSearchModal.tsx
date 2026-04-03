import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import { useCalendarStore, CalendarEvent } from '../../store/calendarStore';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { PriorityIcon } from '../task/PriorityIcon';
import { ProjectInitial } from '../project/ProjectInitial';
import { cn } from '../../utils/cn';
import { searchBarRef } from '../../utils/searchBarRef';
import { format, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'tasks' | 'events' | 'projects' | 'people' | 'pages';

interface ScoredResult {
  type: 'task' | 'event' | 'project' | 'user' | 'page';
  item: any;
  score: number;
}

interface DropdownPos { top: number; left: number; width: number; }

// ─── Pages / settings catalogue ──────────────────────────────────────────────

interface PageItem {
  id: string; label: string; description: string;
  path: string; category: 'navigation' | 'settings'; keywords: string[];
}

const PAGE_CATALOGUE: PageItem[] = [
  { id:'home',        label:'Home',                  description:'Dashboard and overview',                path:'/',           category:'navigation', keywords:['home','dashboard','overview','widgets'] },
  { id:'my-tasks',    label:'My Tasks',              description:'Tasks assigned to you',                 path:'/my-tasks',   category:'navigation', keywords:['tasks','my tasks','assigned','todo','overdue'] },
  { id:'inbox',       label:'Inbox',                 description:'Notifications and activity',            path:'/inbox',      category:'navigation', keywords:['inbox','notifications','messages','alerts','activity'] },
  { id:'calendar',    label:'Calendar',              description:'Events, meetings and deadlines',        path:'/calendar',   category:'navigation', keywords:['calendar','events','meetings','schedule','deadlines'] },
  { id:'goals',       label:'Goals',                 description:'Goals, OKRs and targets',               path:'/goals',      category:'navigation', keywords:['goals','okrs','objectives','targets','progress'] },
  { id:'portfolios',  label:'Portfolios',            description:'Collections of related projects',       path:'/portfolios', category:'navigation', keywords:['portfolios','portfolio','collections'] },
  { id:'teams',       label:'Teams',                 description:'Teams and members',                     path:'/teams',      category:'navigation', keywords:['teams','team','members','groups'] },
  { id:'settings',          label:'Settings',              description:'App settings and preferences',          path:'/settings',   category:'settings',  keywords:['settings','preferences','config'] },
  { id:'settings-profile',  label:'Profile',               description:'Edit name, avatar and account',         path:'/settings',   category:'settings',  keywords:['profile','account','name','avatar','bio','settings'] },
  { id:'settings-theme',    label:'Appearance & Theme',    description:'Dark mode, light mode and display',     path:'/settings',   category:'settings',  keywords:['appearance','dark mode','light mode','theme','display','color','settings'] },
  { id:'settings-notifs',   label:'Notification Settings', description:'Email and push notification prefs',     path:'/settings',   category:'settings',  keywords:['notifications','email','push','alerts','settings'] },
  { id:'settings-team',     label:'Team Members',          description:'Invite, remove and manage members',     path:'/settings',   category:'settings',  keywords:['team','members','invite','roles','permissions','settings'] },
  { id:'settings-security', label:'Security',              description:'Password, 2FA and access control',      path:'/settings',   category:'settings',  keywords:['security','password','2fa','two-factor','authentication','settings'] },
  { id:'settings-int',      label:'Integrations',          description:'Connect apps and third-party services', path:'/settings',   category:'settings',  keywords:['integrations','apps','connect','slack','github','settings'] },
  { id:'settings-billing',  label:'Billing & Plan',        description:'Subscription and payment details',      path:'/settings',   category:'settings',  keywords:['billing','plan','subscription','payment','upgrade','settings'] },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreText(h: string, n: string): number {
  if (!h || !n) return 0;
  const hl = h.toLowerCase(), nl = n.toLowerCase();
  if (hl === nl)         return 100;
  if (hl.startsWith(nl)) return 80;
  if (hl.includes(nl))   return 50;
  const words = nl.split(/\s+/).filter(Boolean);
  const hit   = words.filter((w) => hl.includes(w)).length;
  return hit > 0 ? 20 + (hit / words.length) * 20 : 0;
}
const st = (task: any,  q: string) => Math.max(scoreText(task.title,q)*1, scoreText(task.description,q)*.5, ...(task.tags||[]).map((t:string)=>scoreText(t,q)*.7));
const se = (e: CalendarEvent, q: string) => Math.max(scoreText(e.title,q)*1, scoreText(e.description,q)*.5, scoreText(e.type,q)*.6);
const sp = (p: any,  q: string) => Math.max(scoreText(p.name,q)*1, scoreText(p.description||'',q)*.5);
const su = (u: any,  q: string) => Math.max(scoreText(u.name,q)*1, scoreText(u.role||'',q)*.5, scoreText(u.email||'',q)*.4);
const sg = (pg: PageItem, q: string) => Math.max(scoreText(pg.label,q)*1, scoreText(pg.description,q)*.6, ...pg.keywords.map((k)=>scoreText(k,q)*.75));

// ─── Highlight ────────────────────────────────────────────────────────────────

function Hl({ text, q }: { text: string; q: string }) {
  if (!q || !text) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return <>
    {text.split(re).map((p, i) =>
      re.test(p)
        ? <mark key={i} className="bg-[#44AADF]/20 text-[#1E88C7] dark:text-[#44AADF] rounded-sm px-[2px] not-italic">{p}</mark>
        : <span key={i}>{p}</span>
    )}
  </>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const EV_ICON: Record<string, React.ReactNode> = {
  meeting:  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="12" height="10" rx="1.5"/><path d="M1 6h12M5 1v3M9 1v3" strokeLinecap="round"/></svg>,
  reminder: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1a4 4 0 014 4v3l1 2H2l1-2V5a4 4 0 014-4z" strokeLinejoin="round"/><path d="M5.5 11.5a1.5 1.5 0 003 0" strokeLinecap="round"/></svg>,
  deadline: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  task:     <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M4.5 7l2 2 3-3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  other:    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 5v3M7 9.5v.5" strokeLinecap="round"/></svg>,
};
const EV_COL: Record<string, string> = { blue:'#44AADF',purple:'#8B5CF6',pink:'#EC4899',green:'#22C55E',yellow:'#EAB308',red:'#EF4444' };

const SettingsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="7" cy="7" r="2.2"/>
    <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1" strokeLinecap="round"/>
  </svg>
);
const NavIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" strokeLinejoin="round"/>
  </svg>
);

// ─── Section label ────────────────────────────────────────────────────────────

const Divider = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#BBBBBB] dark:text-[#4A4A4A]">{label}</span>
    <span className="text-[10px] text-[#D0D0D0] dark:text-[#3A3A3A]">{count}</span>
    <div className="flex-1 h-px bg-[#F0F0F0] dark:bg-white/[0.05]" />
  </div>
);

const TAB_LABELS: Record<FilterTab,string> = { all:'All', tasks:'Tasks', events:'Events', projects:'Projects', people:'People', pages:'Pages' };

// ─── Main ─────────────────────────────────────────────────────────────────────

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, openTaskDetail } = useUIStore();
  const [query, setQuery]           = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selIdx, setSelIdx]         = useState(0);
  const [tab, setTab]               = useState<FilterTab>('all');
  const [pos, setPos]               = useState<DropdownPos | null>(null);
  const [recent, setRecent]         = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bullfit-recent-searches') || '[]'); } catch { return []; }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const allTasks    = useTaskStore(useShallow((s) => Object.values(s.tasks).filter((t) => !t.isArchived)));
  const allProjects = useProjectStore(useShallow((s) => Object.values(s.projects).filter((p) => !p.isArchived)));
  const allUsers    = useUserStore(useShallow((s) => Object.values(s.users)));
  const allEvents   = useCalendarStore(useShallow((s) => Object.values(s.events)));

  // debounce
  useEffect(() => { const t = setTimeout(() => setDebouncedQ(query), 160); return () => clearTimeout(t); }, [query]);

  // ⌘K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isSearchOpen ? closeSearch() : useUIStore.getState().openSearch();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isSearchOpen, closeSearch]);

  // measure header, reset on open
  useEffect(() => {
    if (!isSearchOpen) return;
    if (searchBarRef.current) {
      // walk up to the <header> element to get the full-width content area bounds
      const header = searchBarRef.current.closest('header') as HTMLElement | null;
      const el     = header ?? searchBarRef.current;
      const r      = el.getBoundingClientRect();
      setPos({ top: r.bottom, left: r.left, width: r.width });
    }
    setQuery(''); setDebouncedQ(''); setSelIdx(0); setTab('all');
    setTimeout(() => inputRef.current?.focus(), 25);
  }, [isSearchOpen]);

  // scored results
  const allResults = useMemo<ScoredResult[]>(() => {
    const q = debouncedQ.trim(); if (!q) return [];
    const mk = <T,>(arr: T[], fn: (x:T)=>number, type: ScoredResult['type'], cap: number) =>
      arr.map((x) => ({ type, item: x, score: fn(x) } as ScoredResult))
         .filter((r) => r.score > 0).sort((a,b) => b.score-a.score).slice(0, cap);
    const tasks    = mk(allTasks,       (t)=>st(t,q),  'task',    8);
    const events   = mk(allEvents,      (e)=>se(e,q),  'event',   5);
    const projects = mk(allProjects,    (p)=>sp(p,q),  'project', 4);
    const users    = mk(allUsers,       (u)=>su(u,q),  'user',    3);
    const pages    = mk(PAGE_CATALOGUE, (p)=>sg(p,q),  'page',    5);
    if (tab === 'tasks')    return tasks;
    if (tab === 'events')   return events;
    if (tab === 'projects') return projects;
    if (tab === 'people')   return users;
    if (tab === 'pages')    return pages;
    return [...tasks,...events,...projects,...users,...pages].sort((a,b)=>b.score-a.score);
  }, [debouncedQ, tab, allTasks, allEvents, allProjects, allUsers]);

  const taskR=allResults.filter(r=>r.type==='task'), eventR=allResults.filter(r=>r.type==='event'),
        projR=allResults.filter(r=>r.type==='project'), userR=allResults.filter(r=>r.type==='user'),
        pageR=allResults.filter(r=>r.type==='page');

  const q = debouncedQ.trim();
  const tC  = useMemo(()=>q?allTasks.filter(x=>st(x,q)>0).length:0,[q,allTasks]);
  const eC  = useMemo(()=>q?allEvents.filter(x=>se(x,q)>0).length:0,[q,allEvents]);
  const pC  = useMemo(()=>q?allProjects.filter(x=>sp(x,q)>0).length:0,[q,allProjects]);
  const uC  = useMemo(()=>q?allUsers.filter(x=>su(x,q)>0).length:0,[q,allUsers]);
  const pgC = useMemo(()=>q?PAGE_CATALOGUE.filter(x=>sg(x,q)>0).length:0,[q]);
  const tot = tC+eC+pC+uC+pgC;

  const saveRecent = useCallback((s:string) => {
    const n = [s,...recent.filter(x=>x!==s)].slice(0,8);
    setRecent(n); localStorage.setItem('bullfit-recent-searches',JSON.stringify(n));
  },[recent]);

  const pick = useCallback((r:ScoredResult) => {
    if (q) saveRecent(q);
    closeSearch();
    if (r.type==='task')    openTaskDetail(r.item.id);
    else if (r.type==='project') navigate(`/projects/${r.item.id}`);
    else if (r.type==='event')   navigate('/calendar');
    else if (r.type==='page')    navigate(r.item.path);
    else                         navigate('/settings');
  },[closeSearch,openTaskDetail,navigate,q,saveRecent]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key==='Escape') { closeSearch(); return; }
    if (e.key==='ArrowDown'){ e.preventDefault(); setSelIdx(i=>Math.min(i+1,allResults.length-1)); }
    if (e.key==='ArrowUp')  { e.preventDefault(); setSelIdx(i=>Math.max(i-1,0)); }
    if (e.key==='Enter' && allResults[selIdx]) pick(allResults[selIdx]);
  };

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-i="${selIdx}"]`) as HTMLElement|null;
    el?.scrollIntoView({block:'nearest'});
  },[selIdx]);

  if (!isSearchOpen || !pos) return null;

  // row render helpers — gIdx increments across all rendered rows for keyboard nav
  let gIdx = 0;

  const Row = ({ idx, onClick, children }: { idx:number; onClick:()=>void; children:React.ReactNode }) => (
    <button data-i={idx} onClick={onClick}
      className={cn('w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-100',
        selIdx===idx ? 'bg-[#44AADF]/[0.08] dark:bg-[#44AADF]/[0.10]' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
      )}>
      {children}
    </button>
  );

  const renderTask = (r: ScoredResult) => {
    const t=r.item, i=gIdx++, done=t.status==='done', ov=t.dueDate&&new Date(t.dueDate)<new Date()&&!done;
    return (
      <Row key={t.id} idx={i} onClick={()=>pick(r)}>
        <PriorityIcon priority={t.priority} size={13} showTooltip={false} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm text-[#111111] dark:text-white truncate',done&&'line-through opacity-40')}>
            <Hl text={t.title} q={q}/>
          </p>
          {t.description&&<p className="text-[11px] text-[#AAAAAA] dark:text-[#555555] truncate mt-px"><Hl text={t.description} q={q}/></p>}
        </div>
        <div className="flex gap-1.5 flex-shrink-0 items-center">
          {t.dueDate&&<span className={cn('text-[10px] px-1.5 py-px rounded',ov?'text-red-500 bg-red-500/8':'text-[#AAAAAA] bg-black/5 dark:bg-white/5')}>{format(parseISO(t.dueDate),'MMM d')}</span>}
          <span className={cn('text-[10px] px-2 py-px rounded-full capitalize',done?'bg-green-500/10 text-green-600 dark:text-green-400':t.status==='blocked'?'bg-red-500/10 text-red-500':'bg-black/5 dark:bg-white/5 text-[#AAAAAA] dark:text-[#555555]')}>{t.status.replace('_',' ')}</span>
        </div>
      </Row>
    );
  };

  const renderEvent = (r: ScoredResult) => {
    const e:CalendarEvent=r.item, i=gIdx++, col=EV_COL[e.color]||'#44AADF';
    return (
      <Row key={e.id} idx={i} onClick={()=>pick(r)}>
        <span className="flex-shrink-0" style={{color:col}}>{EV_ICON[e.type]??EV_ICON.other}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#111111] dark:text-white truncate"><Hl text={e.title} q={q}/></p>
          {e.description&&<p className="text-[11px] text-[#AAAAAA] dark:text-[#555555] truncate mt-px"><Hl text={e.description} q={q}/></p>}
        </div>
        <div className="flex gap-1.5 flex-shrink-0 items-center">
          <span className="text-[10px] text-[#AAAAAA] dark:text-[#555555]">{format(parseISO(e.start),e.allDay?'MMM d':'MMM d, h:mm a')}</span>
          <span className="text-[10px] px-2 py-px rounded-full capitalize" style={{background:col+'1A',color:col}}>{e.type}</span>
        </div>
      </Row>
    );
  };

  const renderProject = (r: ScoredResult) => {
    const p=r.item, i=gIdx++;
    return (
      <Row key={p.id} idx={i} onClick={()=>pick(r)}>
        <ProjectInitial name={p.name} color={p.color} size={22} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#111111] dark:text-white truncate"><Hl text={p.name} q={q}/></p>
          {p.description&&<p className="text-[11px] text-[#AAAAAA] dark:text-[#555555] truncate mt-px"><Hl text={p.description} q={q}/></p>}
        </div>
        <span className="text-[10px] text-[#AAAAAA] capitalize flex-shrink-0">{p.status.replace('_',' ')}</span>
      </Row>
    );
  };

  const renderUser = (r: ScoredResult) => {
    const u=r.item, i=gIdx++;
    return (
      <Row key={u.id} idx={i} onClick={()=>pick(r)}>
        <Avatar user={u} size="sm"/>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#111111] dark:text-white truncate"><Hl text={u.name} q={q}/></p>
          <p className="text-[11px] text-[#AAAAAA] dark:text-[#555555] truncate">{u.role||u.email||''}</p>
        </div>
      </Row>
    );
  };

  const renderPage = (r: ScoredResult) => {
    const p:PageItem=r.item, i=gIdx++, isSetting=p.category==='settings';
    return (
      <Row key={p.id} idx={i} onClick={()=>pick(r)}>
        <span className={cn('flex-shrink-0',isSetting?'text-[#8B5CF6]':'text-[#44AADF]')}>
          {isSetting ? <SettingsIcon/> : <NavIcon/>}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#111111] dark:text-white truncate"><Hl text={p.label} q={q}/></p>
          <p className="text-[11px] text-[#AAAAAA] dark:text-[#555555] truncate"><Hl text={p.description} q={q}/></p>
        </div>
        <span className={cn('text-[10px] px-2 py-px rounded-full flex-shrink-0',isSetting?'bg-purple-500/10 text-purple-500 dark:text-purple-400':'bg-[#44AADF]/10 text-[#44AADF]')}>
          {isSetting?'Settings':'Page'}
        </span>
      </Row>
    );
  };

  const showEmpty = q && allResults.length === 0;

  return createPortal(
    <>
      {/* Invisible full-screen close layer */}
      <div className="fixed inset-0 z-[59]" onClick={closeSearch}/>

      {/* Dropdown — flush under the header, no border, shadow only below */}
      <div
        className="fixed z-[60] animate-dropdown-open overflow-hidden"
        style={{
          top:    pos.top,
          left:   pos.left,
          width:  pos.width,
          borderRadius: '0 0 14px 14px',
          background: 'var(--dd-bg)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <style>{`:root{--dd-bg:#ffffff}html.dark{--dd-bg:#2A2A2A}`}</style>

        {/* ── Input row ── */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.07]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#44AADF" strokeWidth="1.6" className="flex-shrink-0">
            <circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelIdx(0); }}
            onKeyDown={onKey}
            placeholder="Search tasks, events, projects, settings…"
            className="flex-1 bg-transparent text-sm text-[#111111] dark:text-white placeholder-[#CCCCCC] dark:placeholder-[#444444] outline-none"
          />
          {query
            ? <button onClick={()=>{ setQuery(''); setDebouncedQ(''); inputRef.current?.focus(); }}
                className="text-[#CCCCCC] dark:text-[#444444] hover:text-[#888888] dark:hover:text-[#888888] transition-colors">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/></svg>
              </button>
            : <span className="text-[10px] font-mono text-[#CCCCCC] dark:text-[#444444] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">ESC</span>
          }
        </div>

        {/* ── Filter tabs ── */}
        {q && (
          <div className="flex items-center gap-px px-3 py-1.5 border-b border-black/[0.04] dark:border-white/[0.05]">
            {(['all','tasks','events','projects','people','pages'] as FilterTab[]).map((t) => {
              const counts:Record<FilterTab,number>={all:tot,tasks:tC,events:eC,projects:pC,people:uC,pages:pgC};
              const c=counts[t];
              return (
                <button key={t} onClick={()=>{setTab(t);setSelIdx(0);}}
                  className={cn('flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-100',
                    tab===t?'bg-[#44AADF]/12 text-[#44AADF]':'text-[#999999] dark:text-[#555555] hover:text-[#555555] dark:hover:text-[#AAAAAA] hover:bg-black/5 dark:hover:bg-white/5'
                  )}>
                  {TAB_LABELS[t]}
                  {c>0&&<span className={cn('text-[9px] min-w-[14px] text-center leading-none px-1 py-px rounded-full',tab===t?'bg-[#44AADF]/20 text-[#44AADF]':'bg-black/[0.06] dark:bg-white/10 text-[#AAAAAA] dark:text-[#555555]')}>{c}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Results list ── */}
        <div ref={listRef} className="overflow-y-auto overscroll-contain" style={{maxHeight:'min(60vh, calc(100dvh - 180px))'}}>

          {/* Idle / recent */}
          {!q && (
            <div className="py-2">
              {recent.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-5 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#CCCCCC] dark:text-[#444444]">Recent</span>
                    <button onClick={()=>{setRecent([]);localStorage.removeItem('bullfit-recent-searches');}}
                      className="text-[10px] text-[#CCCCCC] dark:text-[#444444] hover:text-[#888888] transition-colors">Clear</button>
                  </div>
                  {recent.map((s) => (
                    <button key={s} onClick={()=>{setQuery(s);inputRef.current?.focus();}}
                      className="w-full flex items-center gap-3 px-5 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors text-left">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[#CCCCCC] dark:text-[#444444] flex-shrink-0">
                        <circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-[#888888] dark:text-[#666666]">{s}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="py-7 text-center px-6">
                  <p className="text-sm text-[#BBBBBB] dark:text-[#444444]">Tasks · Events · Projects · People · Settings</p>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="py-8 text-center px-6">
              <p className="text-sm text-[#AAAAAA] dark:text-[#555555]">No results for "<span className="text-[#111111] dark:text-white font-medium">{query}</span>"</p>
            </div>
          )}

          {/* Results */}
          {q && !showEmpty && (
            tab === 'all' ? (
              <>
                {taskR.length >0&&<><Divider label="Tasks"              count={taskR.length}/>{taskR.map(renderTask)}</>}
                {eventR.length>0&&<><Divider label="Events & Reminders" count={eventR.length}/>{eventR.map(renderEvent)}</>}
                {projR.length >0&&<><Divider label="Projects"           count={projR.length}/>{projR.map(renderProject)}</>}
                {userR.length >0&&<><Divider label="People"             count={userR.length}/>{userR.map(renderUser)}</>}
                {pageR.length >0&&<><Divider label="Pages & Settings"   count={pageR.length}/>{pageR.map(renderPage)}</>}
              </>
            ) : (
              allResults.map((r) => {
                if (r.type==='task')    return renderTask(r);
                if (r.type==='event')   return renderEvent(r);
                if (r.type==='project') return renderProject(r);
                if (r.type==='user')    return renderUser(r);
                if (r.type==='page')    return renderPage(r);
                return null;
              })
            )
          )}

          {/* bottom breathing room */}
          {q && !showEmpty && <div className="h-2"/>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-2 border-t border-black/[0.04] dark:border-white/[0.05]">
          <div className="flex gap-3 text-[10px] text-[#CCCCCC] dark:text-[#444444]">
            <span><kbd className="font-mono bg-black/5 dark:bg-white/5 px-1 py-px rounded">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-black/5 dark:bg-white/5 px-1 py-px rounded">↵</kbd> open</span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-[#DDDDDD] dark:text-[#3A3A3A] uppercase">BullFit</span>
        </div>
      </div>
    </>,
    document.body
  );
};
