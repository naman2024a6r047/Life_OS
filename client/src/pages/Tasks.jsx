import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiSquare, FiClock, FiBatteryCharging } from 'react-icons/fi';
import axios from 'axios';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tasks/today');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      // Optimistically update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
      await axios.put(`/api/tasks/${taskId}/toggle`);
    } catch (err) {
      console.error('Failed to update task', err);
      // Revert if error
      fetchTasks();
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'P1': return 'text-red-500 bg-red-500/10';
      case 'P2': return 'text-orange-500 bg-orange-500/10';
      case 'P3': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 md:p-8 space-y-6 max-w-5xl mx-auto text-text-primary"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <FiCheckSquare size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Today's Tasks</h1>
          <p className="text-xs text-text-muted">Manage your daily tasks and to-dos.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="card p-8 text-center text-text-muted">
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-8 text-center text-text-muted">
          <p>No tasks scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className={`card p-4 flex items-center gap-4 transition-all ${task.is_completed ? 'opacity-50' : 'hover:border-primary/50'}`}>
              <button onClick={() => handleToggle(task.id)} className="text-primary focus:outline-none">
                {task.is_completed ? <FiCheckSquare size={24} /> : <FiSquare size={24} />}
              </button>
              <div className="flex-1">
                <h3 className={`font-semibold ${task.is_completed ? 'line-through text-text-muted' : ''}`}>{task.title}</h3>
                <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                  {task.Milestone?.Challenge && (
                    <span className="flex items-center gap-1" style={{ color: task.Milestone.Challenge.color || '#6366F1' }}>
                      <FiCheckSquare size={12} />
                      {task.Milestone.Challenge.title}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)} font-medium`}>
                    {task.priority}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={12} />
                    {task.estimated_minutes} min
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <FiBatteryCharging size={12} />
                    {task.energy_level} energy
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
