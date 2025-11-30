import React, { useState } from 'react';
import { Plus, Check, Trash2, MoreVertical, PlayCircle, AlertCircle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { generateId, cn } from '../utils';

interface TaskSectionProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSelectActive: (id: string) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSelectActive,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(1);
  const [newTaskNote, setNewTaskNote] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

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

    onAddTask(task);
    setNewTaskTitle('');
    setNewTaskEst(1);
    setNewTaskNote('');
    setIsAdding(false);
  };

  const handleToggleStatus = (task: Task) => {
    onUpdateTask({
      ...task,
      status: task.status === 'done' ? 'todo' : 'done',
    });
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === 'all') return true;
      if (filter === 'done') return t.status === 'done';
      return t.status !== 'done';
    })
    .sort((a, b) => {
      // Sort by done status (done at bottom), then priority (high > medium > low), then created
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
        <div className="flex gap-2">
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-100 border-none text-sm rounded-lg px-3 py-1 text-gray-600 focus:ring-2 focus:ring-pomo-red outline-none"
            >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="done">Done</option>
            </select>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded-full bg-pomo-red text-white hover:bg-red-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
          <input
            type="text"
            placeholder="What are you working on?"
            className="w-full text-lg font-medium bg-transparent border-b-2 border-gray-200 focus:border-pomo-red outline-none px-1 py-2 mb-3"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
               <label className="text-xs text-gray-500 uppercase font-bold mb-1">Est Pomodoros</label>
               <input
                type="number"
                min="1"
                max="10"
                value={newTaskEst}
                onChange={(e) => setNewTaskEst(parseInt(e.target.value) || 1)}
                className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
               />
            </div>
            <div className="flex flex-col">
               <label className="text-xs text-gray-500 uppercase font-bold mb-1">Priority</label>
               <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                className="bg-white border border-gray-200 rounded px-2 py-1 text-sm"
               >
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
               </select>
            </div>
          </div>
          <textarea
            placeholder="Add a note..."
            value={newTaskNote}
            onChange={(e) => setNewTaskNote(e.target.value)}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2 mb-3 h-20 resize-none focus:ring-1 focus:ring-pomo-red outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
             <div className="text-7xl mb-4 opacity-60">📝</div>
             <p className="text-base text-gray-500 font-medium">Stay clear, add a task to start</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "group relative border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer",
                activeTaskId === task.id ? "border-pomo-red bg-red-50/30 ring-1 ring-pomo-red" : "border-gray-100 bg-white",
                task.status === 'done' ? "opacity-60 bg-gray-50" : ""
              )}
              onClick={() => onSelectActive(task.id)}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(task);
                  }}
                  className={cn(
                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    task.status === 'done'
                      ? "bg-pomo-green border-pomo-green text-white"
                      : "border-gray-300 hover:border-pomo-red text-transparent hover:text-pomo-red"
                  )}
                >
                  <Check size={14} strokeWidth={3} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h3 className={cn("font-medium text-gray-800 truncate pr-2", task.status === 'done' && "line-through text-gray-500")}>
                        {task.title}
                     </h3>
                     <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                             {task.actPomodoros}/{task.estPomodoros} 🍅
                         </span>
                         {activeTaskId === task.id && task.status !== 'done' && (
                             <span className="text-xs text-pomo-red font-bold animate-pulse">ACTIVE</span>
                         )}
                     </div>
                  </div>
                  
                  {task.note && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.note}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                          <span className={cn(
                              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                              task.priority === 'high' ? "bg-red-100 text-red-600" :
                              task.priority === 'medium' ? "bg-orange-100 text-orange-600" :
                              "bg-blue-100 text-blue-600"
                          )}>
                              {task.priority}
                          </span>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                              <Trash2 size={14} />
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
  );
};

export default TaskSection;
