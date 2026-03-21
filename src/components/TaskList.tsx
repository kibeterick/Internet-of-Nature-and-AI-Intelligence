import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
}

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Monitor ecosystem health", completed: false },
    { id: "2", title: "Plant native species", completed: false },
    { id: "3", title: "Analyze biodiversity data", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newTask, completed: false },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Date.now() : undefined,
            }
          : task,
      ),
    );

    // Trigger completion animation
    if (!completedTasks.has(id)) {
      setCompletedTasks((prev) => new Set([...prev, id]));
      setTimeout(() => {
        setCompletedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 1000);
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="glass rounded-2xl p-6 border border-emerald-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-emerald-900">Tasks</h3>
          <p className="text-sm text-emerald-600">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-lg font-bold text-emerald-600">
            {Math.round((completedCount / tasks.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Completion animation background */}
              {completedTasks.has(task.id) && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}

              {/* Checkmark animation */}
              {task.completed && completedTasks.has(task.id) && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-2xl"
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}

              <div
                className={`relative flex items-center gap-3 p-3 rounded-lg transition-all ${
                  task.completed
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-white border border-emerald-100 hover:border-emerald-300"
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {task.completed ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2 size={20} className="text-green-500" />
                    </motion.div>
                  ) : (
                    <Circle size={20} />
                  )}
                </button>

                <span
                  className={`flex-1 text-sm font-medium transition-all ${
                    task.completed
                      ? "text-emerald-600 line-through opacity-60"
                      : "text-emerald-900"
                  }`}
                >
                  {task.title}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add task input */}
      <div className="flex gap-2 pt-2 border-t border-emerald-100">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={addTask}
          className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Completion stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-100 text-xs">
        <div className="text-center">
          <p className="text-emerald-600 font-semibold">Total</p>
          <p className="text-lg font-bold text-emerald-900">{tasks.length}</p>
        </div>
        <div className="text-center">
          <p className="text-green-600 font-semibold">Completed</p>
          <p className="text-lg font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="text-center">
          <p className="text-amber-600 font-semibold">Pending</p>
          <p className="text-lg font-bold text-amber-600">
            {tasks.length - completedCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
