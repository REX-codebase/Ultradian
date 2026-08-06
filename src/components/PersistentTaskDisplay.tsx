import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Tag,
  Plus,
  CheckCircle2,
  Circle,
  X,
  Clock,
  AlertTriangle,
  Edit3,
  Check,
  Sparkles,
} from 'lucide-react';
import { CategoryTag, SubTask } from '../types';

interface PersistentTaskDisplayProps {
  currentTask: string;
  onTaskChange: (task: string) => void;
  category: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  secondsLeft: number;
  isRunning: boolean;
  distractionsCount: number;
  onAddDistraction: () => void;
}

const CATEGORIES: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'];

export const PersistentTaskDisplay: React.FC<PersistentTaskDisplayProps> = ({
  currentTask,
  onTaskChange,
  category,
  onCategoryChange,
  secondsLeft,
  isRunning,
  distractionsCount,
  onAddDistraction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTask, setTempTask] = useState(currentTask);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Calculate estimated completion time
  const getEstimatedCompletionTime = () => {
    const now = new Date();
    const completionDate = new Date(now.getTime() + secondsLeft * 1000);
    return completionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveTask = () => {
    if (tempTask.trim()) {
      onTaskChange(tempTask.trim());
    } else {
      setTempTask(currentTask);
    }
    setIsEditing(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-5 shadow-xs backdrop-blur-sm transition-all duration-300">
      {/* Top Status Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            {isRunning ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
            {isRunning ? 'ACTIVE FOCUS OBJECTIVE' : 'TARGET GOAL ANCHOR'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>Target Finish: <strong className="text-stone-800 dark:text-stone-200">{getEstimatedCompletionTime()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Task Title Display / Inline Editor */}
      <div className="mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempTask}
              onChange={(e) => setTempTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
              placeholder="What is your singular focal objective?"
              className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
              autoFocus
            />
            <button
              onClick={handleSaveTask}
              className="px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="group flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 mt-0.5 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100 leading-snug">
                  {currentTask || 'Click to set target focus goal...'}
                </h3>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  Click to modify goal or update intention
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 rounded-lg text-stone-400 opacity-60 group-hover:opacity-100 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-all shrink-0"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Distraction Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800/80 pt-3">
        {/* Category selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <Tag className="w-3 h-3 text-stone-400 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-all ${
                category === cat
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-bold'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action button to log distraction or toggle subtasks */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border transition-all ${
              subtasks.length > 0
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                : 'text-stone-400 border-dashed border-stone-200 dark:border-stone-800 hover:text-stone-600'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Intention Checklist ({completedSubtasksCount}/{subtasks.length})</span>
          </button>

          <button
            onClick={onAddDistraction}
            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-700/80 text-[11px] font-semibold transition-all flex items-center space-x-1"
            title="Log an unexpected distraction"
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Distractions ({distractionsCount})</span>
          </button>
        </div>
      </div>

      {/* Expandable Subtask Checklist */}
      <AnimatePresence>
        {showSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 overflow-hidden"
          >
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add sub-task or focus checkpoint..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50/50 dark:bg-stone-800/40 text-xs text-stone-800 dark:text-stone-200"
                  >
                    <button
                      onClick={() => toggleSubtask(st.id)}
                      className="flex items-center space-x-2 text-left flex-1"
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through text-stone-400' : ''}>
                        {st.text}
                      </span>
                    </button>

                    <button
                      onClick={() => removeSubtask(st.id)}
                      className="text-stone-400 hover:text-red-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
