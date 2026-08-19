import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryTag, SubTask } from '../types';
import {
  IconFocusTarget,
  IconCheck,
  IconClose,
  IconSparkle,
  IconAlert,
  IconCheckCircle,
} from './icons';

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

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

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
    triggerHaptic();
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  return (
    <div className="swift-glass-card w-full max-w-2xl mx-auto p-5 shadow-xs transition-all text-[color:var(--ink)]">
      {/* Top Status Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isRunning ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--ink)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--ink)]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--ink-mute)]"></span>
            )}
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[color:var(--ink-mute)]">
            {isRunning ? 'ACTIVE FOCUS OBJECTIVE' : 'TARGET GOAL ANCHOR'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--ink-mute)]">
          <span>Target Finish: <strong className="font-mono text-[color:var(--ink)]">{getEstimatedCompletionTime()}</strong></span>
        </div>
      </div>

      {/* Main Task Title Display / Inline Editor */}
      <div className="mb-4">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <input
              id="persistent-focal-task-input"
              name="persistentFocalTask"
              aria-label="What is your singular focal objective?"
              type="text"
              value={tempTask}
              onChange={(e) => setTempTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
              placeholder="What is your singular focal objective?"
              className="flex-1 px-3.5 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-sm font-medium text-[color:var(--ink)] focus:outline-none"
              autoFocus
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSaveTask}
              className="px-3.5 py-2 rounded-xl bg-[color:var(--ink)] text-[color:var(--paper)] font-bold text-xs cursor-pointer shadow-xs"
            >
              <IconCheck size={14} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[color:var(--line)]/30 transition-colors cursor-pointer"
            onClick={() => {
              triggerHaptic();
              setIsEditing(true);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[color:var(--line)]/50 text-[color:var(--ink)] mt-0.5 shrink-0">
                <IconFocusTarget size={16} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[color:var(--ink)] leading-snug">
                  {currentTask || 'Click to set target focus goal...'}
                </h3>
                <p className="text-[11px] text-[color:var(--ink-mute)] mt-0.5">
                  Click to modify goal or update intention
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Category Pills & Distraction Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--line)]/60 pt-3">
        {/* Category selector */}
        <div className="chip-rail max-w-full pb-0.5">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                triggerHaptic();
                onCategoryChange(cat);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide transition-all cursor-pointer ${
                category === cat
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Action button to log distraction or toggle subtasks */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              setShowSubtasks(!showSubtasks);
            }}
            className="liquid-glass-badge px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 hover:text-[color:var(--ink)] transition-colors cursor-pointer shadow-xs"
          >
            <IconSparkle size={12} />
            <span>Checklist ({completedSubtasksCount}/{subtasks.length})</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onAddDistraction();
            }}
            className="liquid-glass-badge px-3 py-1 rounded-full text-[11px] font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Log an unexpected distraction slip"
          >
            <IconAlert size={12} />
            <span>Slips ({distractionsCount})</span>
          </motion.button>
        </div>
      </div>

      {/* Expandable Subtask Checklist */}
      <AnimatePresence>
        {showSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="mt-3 pt-3 border-t border-[color:var(--line)]/60 space-y-2 overflow-hidden"
          >
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                id="persistent-subtask-input"
                name="newSubtaskText"
                aria-label="Add sub-task or checkpoint"
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add sub-task or checkpoint..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[color:var(--paper)] text-xs text-[color:var(--ink)] border border-[color:var(--line)] focus:outline-none"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="p-1.5 rounded-xl bg-[color:var(--ink)] text-[color:var(--paper)] cursor-pointer"
              >
                <IconCheck size={14} />
              </motion.button>
            </form>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <motion.div
                    key={st.id}
                    layout
                    className="flex items-center justify-between p-2 rounded-xl bg-[color:var(--paper)]/80 text-xs text-[color:var(--ink-soft)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtask(st.id)}
                      className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                    >
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${st.completed ? 'bg-[color:var(--ink)] border-[color:var(--ink)] text-[color:var(--paper)]' : 'border-[color:var(--line)]'}`}>
                        {st.completed && <IconCheck size={10} />}
                      </span>
                      <span className={st.completed ? 'line-through text-[color:var(--ink-mute)]' : ''}>
                        {st.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeSubtask(st.id)}
                      className="text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] p-0.5 cursor-pointer"
                    >
                      <IconClose size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
