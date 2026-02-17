"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Clock,
  Video,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPath } from "@/lib/api";

interface Props {
  dayNumber: number;
  weekStart: string;
  memberId?: string;
  memberName?: string;
}

/* ────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────── */
type TaskStatus = "triage" | "backlog" | "todo" | "in_progress" | "done" | "canceled";
type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

interface LinearTask {
  id: string;
  title: string;
  status: TaskStatus;
  statusName: string;
  statusColor: string;
  priority: TaskPriority;
  label: string;
  labelColor: string;
  identifier: string;
  dueDate: string | null;
  url: string;
}

const PRIORITY_ICON: Record<string, { color: string; bars: number }> = {
  urgent: { color: "#DC2626", bars: 4 },
  high: { color: "#F59E0B", bars: 3 },
  medium: { color: "#6366F1", bars: 2 },
  low: { color: "#9CA3AF", bars: 1 },
  none: { color: "#D1D5DB", bars: 0 },
};

const STATUS_STYLES: Record<string, string> = {
  triage: "border-stone-300 bg-stone-100",
  backlog: "border-stone-300 bg-stone-100",
  todo: "border-stone-300 bg-white",
  in_progress: "border-yellow-400 bg-yellow-400",
  done: "border-emerald-500 bg-emerald-500",
  canceled: "border-stone-300 bg-stone-300",
};

/* ────────────────────────────────────────────────
   Google Calendar style events (mock for now)
   ──────────────────────────────────────────────── */
interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  color: string;
  platform: string;
  participants: string[];
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Daily Stand-up", time: "09:00", duration: "15 min", color: "#7C3AED", platform: "Google Meet", participants: ["FE", "YG", "OA", "BA"] },
  { id: "e2", title: "Sprint Planning", time: "10:30", duration: "1h", color: "#059669", platform: "Zoom", participants: ["FE", "YG", "SA", "OA"] },
  { id: "e3", title: "1:1 with Murat", time: "14:00", duration: "30 min", color: "#DC2626", platform: "Google Meet", participants: ["FE", "MO"] },
  { id: "e4", title: "Mobile Team Sync", time: "16:00", duration: "45 min", color: "#F59E0B", platform: "Slack Huddle", participants: ["FE", "OA", "HI", "BT"] },
];

/* ────────────────────────────────────────────────
   Priority bar component
   ──────────────────────────────────────────────── */
function PriorityIcon({ priority }: { priority: string }) {
  const config = PRIORITY_ICON[priority] || PRIORITY_ICON.none;
  return (
    <div className="flex items-end gap-[1.5px] h-3 w-3 shrink-0" title={priority}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-[0.5px]"
          style={{
            height: `${4 + i * 2}px`,
            backgroundColor: i <= config.bars ? config.color : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────── */
export function TodayCard({ dayNumber, weekStart, memberId, memberName }: Props) {
  const [activeTab, setActiveTab] = useState<"tasks" | "events">("tasks");
  const [tasks, setTasks] = useState<LinearTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Linear tasks
  const fetchTasks = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    fetch(apiPath(`api/linear/tasks?memberId=${memberId}`))
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        if (data.tasks && data.tasks.length >= 0) {
          setTasks(data.tasks);
          setLinearConnected(true);
        }
      })
      .catch(() => {
        setLinearConnected(false);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysAround = () => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const days = getDaysAround();

  // Sort tasks: today deadline first, then by priority
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
  const filteredTasks = tasks
    .filter((t) => t.status !== "done" && t.status !== "canceled")
    .filter((t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.identifier.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aIsToday = a.dueDate === todayISO ? 0 : 1;
      const bIsToday = b.dueDate === todayISO ? 0 : 1;
      if (aIsToday !== bIsToday) return aIsToday - bIsToday;
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    });

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 row-span-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">Today</h3>
        </div>
        {linearConnected && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-stone-400 font-medium">Linear</span>
          </div>
        )}
      </div>

      {/* Mini calendar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <button className="text-stone-400 hover:text-stone-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-stone-900">
            {monthNames[today.getMonth()]} {today.getFullYear()}
          </span>
          <button className="text-stone-400 hover:text-stone-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between gap-1">
          {days.map((d) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <button
                key={d.toISOString()}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-xl text-center transition-colors flex-1",
                  isToday ? "bg-violet-600 text-white" : "hover:bg-stone-50 text-stone-600"
                )}
              >
                <span className="text-[10px] font-medium uppercase">{dayNames[d.getDay()]}</span>
                <span className="text-lg font-semibold mt-0.5">{String(d.getDate()).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-3 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-300 text-stone-900 placeholder:text-stone-400"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded font-medium">⌘1</span>
          <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-4">
        {(["tasks", "events"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === tab ? "text-stone-900 border-stone-900" : "text-stone-400 border-transparent hover:text-stone-600"
            )}
          >
            {tab === "tasks" ? `Tasks${filteredTasks.length > 0 ? ` (${filteredTasks.length})` : ""}` : "Events"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══ TASKS — Linear integration ═══ */}
        {activeTab === "tasks" && (
          <div className="space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                <span className="text-xs text-stone-400">Linear'dan yükleniyor...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-stone-400">
                  {linearConnected ? "No open tasks" : "Linear bağlı değil"}
                </p>
                {!linearConnected && (
                  <p className="text-xs text-stone-300 mt-1">LINEAR_API_KEY ekleyin</p>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isToday = task.dueDate === todayISO;
                const isOverdue = task.dueDate ? task.dueDate < todayISO : false;
                return (
                  <a
                    key={task.id}
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                      isToday ? "bg-violet-50/60 hover:bg-violet-50" :
                      isOverdue ? "bg-red-50/40 hover:bg-red-50/60" :
                      "hover:bg-stone-50"
                    )}
                  >
                    {/* Status circle */}
                    <div
                      className={cn(
                        "mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                        STATUS_STYLES[task.status] || STATUS_STYLES.todo
                      )}
                    >
                      {task.status === "in_progress" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] text-stone-400 font-mono">{task.identifier}</span>
                        <PriorityIcon priority={task.priority} />
                      </div>
                      <p className="text-[13px] text-stone-800 leading-snug">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {task.label && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: task.labelColor + "20",
                              color: task.labelColor,
                            }}
                          >
                            {task.label}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={cn(
                              "flex items-center gap-1 text-[10px]",
                              isToday ? "text-violet-600 font-medium" :
                              isOverdue ? "text-red-500 font-medium" :
                              "text-stone-400"
                            )}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {isToday ? "Today" :
                             isOverdue ? "Overdue" :
                             new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-300">{task.statusName}</span>
                      </div>
                    </div>

                    {/* External link on hover */}
                    <ExternalLink className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                  </a>
                );
              })
            )}
          </div>
        )}

        {/* ═══ EVENTS — Google Calendar style ═══ */}
        {activeTab === "events" && (
          <div className="space-y-2">
            {MOCK_EVENTS.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors"
              >
                <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-900 mb-0.5">{event.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                    <span className="font-medium">{event.time}</span>
                    <span className="text-stone-300">·</span>
                    <span>{event.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {event.participants.slice(0, 4).map((p, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-stone-200 border-[1.5px] border-white flex items-center justify-center text-[7px] font-bold text-stone-500">{p}</div>
                      ))}
                      {event.participants.length > 4 && (
                        <div className="w-5 h-5 rounded-full bg-stone-100 border-[1.5px] border-white flex items-center justify-center text-[7px] font-medium text-stone-400">+{event.participants.length - 4}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Video className="w-3 h-3" />
                      {event.platform}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
