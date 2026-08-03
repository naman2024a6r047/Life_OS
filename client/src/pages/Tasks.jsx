import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare } from 'react-icons/fi';

export default function Tasks() {
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
          <h1 className="text-xl font-bold">Tasks</h1>
          <p className="text-xs text-text-muted">Manage your daily tasks and to-dos.</p>
        </div>
      </div>
      <div className="card p-8 text-center text-text-muted">
        <p>Task management coming soon.</p>
      </div>
    </motion.div>
  );
}
