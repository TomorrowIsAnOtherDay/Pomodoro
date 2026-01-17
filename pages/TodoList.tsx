import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit2, X, Search, Filter, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { generateId, cn, getTodayString } from '../utils';
import ModeSwitchPrompt from '../components/ModeSwitchPrompt';

interface TodoListProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

type TabType = 'tasks' | 'trash';
type PendingAction =
  | { type: 'delete'; task: Task }
  | { type: 'restore'; task: Task }
  | { type: 'permanentDelete'; task: Task }
  | { type: 'emptyTrash' };

const TodoList: React.FC<TodoListProps> = ({ tasks, onUpdateTasks }) => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trashSearchQuery, setTrashSearchQuery] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(1);
  const [newTaskNote, setNewTaskNote] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  
  // Edit Task State
  const [editTask, setEditTask] = useState<Partial<Task>>({});

  // Tasks are saved in App.tsx, no need to save here to avoid duplicate saves

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: generateId(),
      title: newTaskTitle,
      note: newTaskNote,
      estPomodoros: newTaskEst,
      actPomodoros: 0,
      status: 'todo',
      priority: newTaskPriority,
      createdAt: Date.now(),
    };

    onUpdateTasks([task, ...tasks]);
    setNewTaskTitle('');
    setNewTaskEst(1);
    setNewTaskNote('');
    setNewTaskPriority('medium');
    setIsAdding(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    onUpdateTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingId(null);
    setEditTask({});
  };

  const handleDeleteTask = (task: Task) => {
    setPendingAction({ type: 'delete', task });
  };

  const handleToggleStatus = (task: Task) => {
    let newStatus: TaskStatus;
    if (task.status === 'todo') {
      newStatus = 'doing';
    } else if (task.status === 'doing') {
      newStatus = 'done';
    } else {
      newStatus = 'todo';
    }
    
    handleUpdateTask({
      ...task,
      status: newStatus,
    });
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTask({
      title: task.title,
      note: task.note,
      estPomodoros: task.estPomodoros,
      priority: task.priority,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTask({});
  };

  const saveEditing = (task: Task) => {
    handleUpdateTask({
      ...task,
      ...editTask,
    } as Task);
  };

  // Trash functions
  const deletedTasks = tasks.filter(t => t.deletedAt !== undefined);
  
  const handleRestore = (task: Task) => {
    setPendingAction({ type: 'restore', task });
  };

  const handlePermanentDelete = (task: Task) => {
    setPendingAction({ type: 'permanentDelete', task });
  };

  const handleEmptyTrash = () => {
    setPendingAction({ type: 'emptyTrash' });
  };

  const formatDeletedTime = (deletedAt: number) => {
    const now = Date.now();
    const diff = now - deletedAt;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Filter deleted tasks
  const filteredDeletedTasks = deletedTasks
    .filter((t) => {
      if (!trashSearchQuery) return true;
      const query = trashSearchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(query) ||
        (t.note && t.note.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      return (b.deletedAt || 0) - (a.deletedAt || 0);
    });

  // Filter and search tasks (exclude deleted tasks)
  const filteredTasks = tasks
    .filter((t) => {
      // Exclude deleted tasks
      if (t.deletedAt !== undefined) return false;
      
      // Status filter
      if (filter !== 'all' && t.status !== filter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          (t.note && t.note.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by status (todo > doing > done), then priority, then created
      const statusOrder = { todo: 1, doing: 2, done: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      
      return b.createdAt - a.createdAt;
    });

  const activeTasks = tasks.filter(t => t.deletedAt === undefined);
  const stats = {
    total: activeTasks.length,
    todo: activeTasks.filter(t => t.status === 'todo').length,
    doing: activeTasks.filter(t => t.status === 'doing').length,
    done: activeTasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {pendingAction && (
        <ModeSwitchPrompt
          title={
            pendingAction.type === 'restore'
              ? '恢复任务'
              : pendingAction.type === 'emptyTrash'
                ? '清空回收站'
                : '删除任务'
          }
          message={
            pendingAction.type === 'delete'
              ? `确定删除 "${pendingAction.task.title}" 吗？任务会被移动到回收站。`
              : pendingAction.type === 'restore'
                ? `确定恢复 "${pendingAction.task.title}" 吗？`
                : pendingAction.type === 'permanentDelete'
                  ? `确定永久删除 "${pendingAction.task.title}" 吗？此操作无法撤销。`
                  : `确定永久删除回收站内的 ${deletedTasks.length} 个任务吗？此操作无法撤销。`
          }
          confirmLabel={
            pendingAction.type === 'restore'
              ? '恢复'
              : pendingAction.type === 'emptyTrash'
                ? '清空回收站'
                : pendingAction.type === 'permanentDelete'
                  ? '永久删除'
                  : '删除'
          }
          cancelLabel="取消"
          confirmClassName={
            pendingAction.type === 'restore'
              ? 'bg-pomo-green'
              : 'bg-kiwi-pink'
          }
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            if (pendingAction.type === 'delete') {
              const updatedTasks = tasks.map(t =>
                t.id === pendingAction.task.id ? { ...t, deletedAt: Date.now() } : t
              );
              onUpdateTasks(updatedTasks);
            } else if (pendingAction.type === 'restore') {
              const updatedTasks = tasks.map(t =>
                t.id === pendingAction.task.id ? { ...t, deletedAt: undefined } : t
              );
              onUpdateTasks(updatedTasks);
            } else if (pendingAction.type === 'permanentDelete') {
              onUpdateTasks(tasks.filter(t => t.id !== pendingAction.task.id));
            } else if (pendingAction.type === 'emptyTrash') {
              onUpdateTasks(tasks.filter(t => t.deletedAt === undefined));
            }
            setPendingAction(null);
          }}
        />
      )}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="text-pomo-red text-4xl">📋</span> Task Studio
          </h1>
          {activeTab === 'trash' && deletedTasks.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="flex items-center gap-2 px-4 py-2 bg-pomo-red text-white rounded-lg font-medium hover:brightness-95 transition-colors"
            >
              <X size={18} />
              Empty Trash
            </button>
          )}
        </div>
        <p className="text-slate-500">Manage every task across active and archived work.</p>
      </div>

      {/* Tabs */}
      <div className="glass p-1 mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-medium transition-colors relative",
            activeTab === 'tasks'
              ? "bg-pomo-red text-white"
              : "text-slate-600 hover:text-pomo-red hover:bg-kiwi-pink/10"
          )}
        >
          Tasks
          {activeTasks.length > 0 && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {activeTasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('trash')}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-medium transition-colors relative",
            activeTab === 'trash'
              ? "bg-pomo-red text-white"
              : "text-slate-600 hover:text-pomo-red hover:bg-kiwi-pink/10"
          )}
        >
          🗑️ Trash
          {deletedTasks.length > 0 && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {deletedTasks.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'trash' ? (
        <>
          {/* Trash View */}
          {deletedTasks.length > 0 ? (
            <>
              {/* Search */}
              <div className="card p-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search deleted tasks..."
                    value={trashSearchQuery}
                    onChange={(e) => setTrashSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pomo-red focus:border-transparent outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              {/* Deleted Task List */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Deleted Tasks ({filteredDeletedTasks.length})
                </h2>
                <div className="space-y-3">
                  {filteredDeletedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <AlertCircle size={48} className="mb-2" />
                      <p className="text-sm">No tasks found matching your search.</p>
                    </div>
                  ) : (
                    filteredDeletedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50 opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                            <Trash2 size={14} className="text-slate-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-slate-600 line-through">
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs font-mono text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                  {task.actPomodoros}/{task.estPomodoros} 🍅
                                </span>
                              </div>
                            </div>
                            
                            {task.note && (
                              <p className="text-sm text-slate-400 mt-1 mb-2 line-through">{task.note}</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex gap-2 items-center">
                                <span className={cn(
                                  "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                                  task.priority === 'high' ? "bg-kiwi-pink/20 text-kiwi-pink" :
                                  task.priority === 'medium' ? "bg-kiwi-yellow/40 text-slate-700" :
                                  "bg-kiwi-cyan/20 text-kiwi-cyan"
                                )}>
                                  {task.priority}
                                </span>
                                <span className={cn(
                                  "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                                  task.status === 'todo' ? "bg-kiwi-yellow/40 text-slate-700" :
                                  task.status === 'doing' ? "bg-kiwi-pink/15 text-kiwi-pink" :
                                  "bg-kiwi-cyan/20 text-kiwi-cyan"
                                )}>
                                  {task.status}
                                </span>
                                {task.deletedAt && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDeletedTime(task.deletedAt)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRestore(task)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pomo-blue text-white rounded-lg hover:brightness-95 transition-colors"
                                  title="Restore"
                                >
                                  <RotateCcw size={14} />
                                  Restore
                                </button>
                                <button
                                  onClick={() => handlePermanentDelete(task)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pomo-red text-white rounded-lg hover:brightness-95 transition-colors"
                                  title="Permanently Delete"
                                >
                                  <X size={14} />
                                  Delete Forever
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Trash is Empty</h3>
              <p className="text-slate-500">
                Deleted tasks will be moved here. You can restore them or permanently delete them.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Tasks View */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 border-l-4 border-kiwi-cyan">
              <div className="text-sm text-slate-500 mb-1">Total Tasks</div>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="card p-4 border-l-4 border-kiwi-yellow">
              <div className="text-sm text-slate-500 mb-1">To Do</div>
              <div className="text-2xl font-semibold text-slate-900">{stats.todo}</div>
            </div>
            <div className="card p-4 border-l-4 border-kiwi-pink">
              <div className="text-sm text-slate-500 mb-1">In Progress</div>
              <div className="text-2xl font-semibold text-slate-900">{stats.doing}</div>
            </div>
            <div className="card p-4 border-l-4 border-pomo-green">
              <div className="text-sm text-slate-500 mb-1">Completed</div>
              <div className="text-2xl font-semibold text-slate-900">{stats.done}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pomo-red focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pomo-red outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="doing">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pomo-red outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

        {/* Add Task Button */}
        <div className="mb-4">
          {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-pomo-red text-white rounded-lg font-medium hover:brightness-95 transition-colors shadow-md"
          >
            <Plus size={20} />
            Add New Task
          </button>
        ) : (
          <form onSubmit={handleAddTask} className="card p-6 border-2 border-pomo-red">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Task title..."
                className="w-full text-xl font-medium bg-transparent border-b-2 border-slate-200 focus:border-pomo-red outline-none px-1 py-2"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Est. Pomodoros</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTaskEst}
                  onChange={(e) => setNewTaskEst(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Add notes..."
                value={newTaskNote}
                onChange={(e) => setNewTaskNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-pomo-red outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                  setNewTaskNote('');
                  setNewTaskEst(1);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pomo-red text-white rounded-lg font-medium hover:brightness-95 transition-colors"
              >
                Add Task
              </button>
            </div>
          </form>
        )}
        </div>

        {/* Task List */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Tasks ({filteredTasks.length})
          </h2>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="mb-2 text-4xl">📝</div>
                <p className="text-sm">No tasks found.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "border rounded-xl p-4 transition-all hover:shadow-md",
                    task.status === 'done' ? "bg-slate-50 opacity-75" : "bg-white",
                    task.status === 'doing' && "border-kiwi-pink/60 bg-kiwi-pink/10"
                  )}
                >
                {editingId === task.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTask.title || ''}
                      onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                      className="w-full text-lg font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pomo-red outline-none"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Est. Pomodoros</label>
                        <input
                          type="number"
                          min="1"
                          value={editTask.estPomodoros || 1}
                          onChange={(e) => setEditTask({ ...editTask, estPomodoros: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Priority</label>
                        <select
                          value={editTask.priority || 'medium'}
                          onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as TaskPriority })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={editTask.note || ''}
                      onChange={(e) => setEditTask({ ...editTask, note: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-20 resize-none"
                      placeholder="Notes..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEditing(task)}
                        className="px-4 py-1.5 text-sm bg-pomo-red text-white rounded-lg hover:brightness-95"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={cn(
                        "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        task.status === 'done'
                          ? "bg-pomo-green border-pomo-green text-white"
                          : task.status === 'doing'
                          ? "bg-kiwi-pink border-kiwi-pink text-white"
                          : "border-slate-300 hover:border-pomo-red text-transparent hover:text-pomo-red"
                      )}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={cn(
                          "font-medium text-slate-800",
                          task.status === 'done' && "line-through text-slate-500"
                        )}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {task.actPomodoros}/{task.estPomodoros} 🍅
                          </span>
                        </div>
                      </div>
                      
                      {task.note && (
                        <p className="text-sm text-slate-500 mt-1 mb-2">{task.note}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2 items-center">
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                            task.priority === 'high' ? "bg-kiwi-pink/20 text-kiwi-pink" :
                            task.priority === 'medium' ? "bg-kiwi-yellow/40 text-slate-700" :
                            "bg-kiwi-cyan/20 text-kiwi-cyan"
                          )}>
                            {task.priority}
                          </span>
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                            task.status === 'todo' ? "bg-kiwi-yellow/40 text-slate-700" :
                            task.status === 'doing' ? "bg-kiwi-pink/15 text-kiwi-pink" :
                            "bg-kiwi-cyan/20 text-kiwi-cyan"
                          )}>
                            {task.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1.5 text-slate-400 hover:text-kiwi-cyan hover:bg-kiwi-cyan/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1.5 text-slate-400 hover:text-kiwi-pink hover:bg-kiwi-pink/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default TodoList;
