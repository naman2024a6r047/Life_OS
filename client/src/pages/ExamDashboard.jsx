import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiShield, FiClock, FiAlertTriangle, FiCheckCircle, FiHelpCircle,
  FiArrowLeft, FiArrowRight, FiBookmark, FiTerminal, FiTrash2,
  FiInfo, FiMaximize, FiLock, FiAward
} from 'react-icons/fi';

export default function ExamDashboard() {
  const { user } = useContext(AuthContext);
  const [selectedOption, setSelectedOption] = useState('B');
  const [currentQuestion, setCurrentQuestion] = useState(12);
  const [markedForReview, setMarkedForReview] = useState(false);

  const streak = user?.current_streak || 32;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100 || 1825;
  const level = user?.level || 13;

  // Question statuses for 30 grid palette
  const questionPalette = Array.from({ length: 30 }, (_, i) => {
    const qNum = i + 1;
    if (qNum === 12) return { qNum, status: 'current' };
    if (qNum === 13) return { qNum, status: 'review' };
    if (qNum <= 11) return { qNum, status: 'answered' };
    return { qNum, status: 'not-visited' };
  });

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiShield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Exam Mode</h1>
            <p className="text-xs text-text-muted">Focus. Perform. Achieve.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalXP}</p>
              <p className="text-[9px] text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💎</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">Level {level}</p>
              <p className="text-[9px] text-text-muted">Pro Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🛡️</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">3</p>
              <p className="text-[9px] text-text-muted">Grace Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column — Exam Question & Environment (9 cols) */}
        <div className="col-span-9 space-y-4">
          {/* Exam Info Header Card */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-mono font-bold">
                📄
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-text-primary">DSA Practice Test #7</h2>
                  <span className="badge-purple text-[9px]">In Progress</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                  <span>50 Questions</span>
                  <span>⏱️ 90 Minutes</span>
                  <span>📊 Medium</span>
                  <span>Started: 10:30 AM</span>
                </div>
              </div>
            </div>
            <button className="btn-outline text-xs text-danger hover:bg-danger/10 border-danger/40 px-4 py-2">
              End Exam
            </button>
          </div>

          {/* Exam Mode Active Warning Banner */}
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FiShield className="text-primary text-lg" />
              <div>
                <p className="text-xs font-bold text-text-primary">Exam Mode Active</p>
                <p className="text-[11px] text-text-muted">Leaving the page, opening new tabs or switching windows will be detected as a violation.</p>
              </div>
            </div>
            <button className="text-xs text-primary-light hover:text-primary font-semibold">View Guidelines</button>
          </div>

          {/* Question Card */}
          <div className="card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-primary">Question {currentQuestion} of 50</span>
                <button
                  onClick={() => setMarkedForReview(!markedForReview)}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                    markedForReview ? 'bg-warning/20 text-warning border-warning' : 'border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  <FiBookmark size={12} /> Mark for Review
                </button>
              </div>
              <span className="badge-success text-[10px]">+4 XP</span>
            </div>

            {/* Problem Statement */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-primary leading-relaxed">
                Given an array of integers <code className="text-primary-light font-mono px-1">nums</code>, return the length of the longest subarray with a sum equal to <code className="text-primary-light font-mono px-1">k</code>.
              </p>

              {/* Code Example Box */}
              <div className="p-4 rounded-xl bg-background border border-border-subtle font-mono text-xs text-text-secondary space-y-1">
                <p className="text-success font-semibold">Example:</p>
                <p><span className="text-primary-light">Input:</span> nums = [1, -1, 5, -2, 3], k = 3</p>
                <p><span className="text-primary-light">Output:</span> 4</p>
                <p><span className="text-primary-light">Explanation:</span> The subarray [1, -1, 5, -2] has sum = 3 and length = 4.</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {[
                { label: 'A', value: '3' },
                { label: 'B', value: '4' },
                { label: 'C', value: '5' },
                { label: 'D', value: '2' },
              ].map(opt => {
                const isSelected = selectedOption === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => setSelectedOption(opt.label)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-text-primary font-semibold ring-1 ring-primary'
                        : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated text-text-secondary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      isSelected ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border-subtle'
                    }`}>
                      {opt.label}
                    </div>
                    <span className="text-sm font-mono">{opt.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Question Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <button
                onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                className="btn-outline text-xs flex items-center gap-1.5"
              >
                <FiArrowLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setSelectedOption(null)}
                className="btn-ghost text-xs text-text-muted hover:text-danger flex items-center gap-1"
              >
                <FiTrash2 size={13} /> Clear Response
              </button>
              <button
                onClick={() => setCurrentQuestion(Math.min(50, currentQuestion + 1))}
                className="btn-primary text-xs flex items-center gap-1.5 bg-primary hover:bg-primary-dark px-5"
              >
                Next <FiArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="card p-3 flex items-center justify-around text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-success" />
              <span>Auto Save: <strong className="text-text-primary">Last saved: 10:42 AM</strong></span>
            </div>
            <div className="w-px h-4 bg-border-subtle" />
            <div className="flex items-center gap-2">
              <FiShield className="text-primary" />
              <span>Secure Mode: <strong className="text-text-primary">Monitoring active</strong></span>
            </div>
            <div className="w-px h-4 bg-border-subtle" />
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-success" />
              <span>Violations: <strong className="text-success">0 Detected</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column — Palette & Tools (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Time Remaining Timer Widget */}
          <div className="card p-4 text-center space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-bold text-text-primary">Time Remaining</span>
              <span className="text-primary-light cursor-pointer hover:underline">Hide</span>
            </div>
            {/* Circular Timer */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" stroke="#1C2039" strokeWidth="8" fill="none" />
                <circle cx="56" cy="56" r="48" stroke="#F59E0B" strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * 0.25}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold font-mono text-text-primary">01:23:45</span>
                <span className="text-[9px] text-text-muted">of 01:30:00</span>
              </div>
            </div>
            <p className="text-[10px] text-warning flex items-center justify-center gap-1">
              <FiAlertTriangle size={11} /> Do not close or refresh the page
            </p>
          </div>

          {/* Question Palette Grid */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary">Question Palette</span>
              <span className="text-primary-light cursor-pointer hover:underline">Hide</span>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 text-[9px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-success" /> Answered</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-warning" /> Review</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-surface-elevated border border-border-subtle" /> Not Visited</span>
            </div>
            {/* 30 Grid Palette */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {questionPalette.map(q => {
                let colorClass = 'bg-surface-elevated text-text-muted border border-border-subtle';
                if (q.status === 'answered') colorClass = 'bg-success text-white font-bold';
                if (q.status === 'current') colorClass = 'bg-primary text-white font-bold ring-2 ring-primary-light';
                if (q.status === 'review') colorClass = 'bg-warning text-white font-bold';
                return (
                  <button
                    key={q.qNum}
                    onClick={() => setCurrentQuestion(q.qNum)}
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-transform hover:scale-105 ${colorClass}`}
                  >
                    {q.qNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Progress */}
          <div className="card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary">Exam Progress</span>
              <span className="text-primary-light cursor-pointer hover:underline">Hide</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill bg-success" style={{ width: '24%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>12 / 50 answered</span>
              <span className="font-mono font-bold text-text-primary">24%</span>
            </div>
          </div>

          {/* Exam Tools Grid */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary">Exam Tools</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { icon: '🧮', label: 'Calculator' },
                { icon: '📝', label: 'Scratch Pad' },
                { icon: '🔖', label: 'Bookmarks', badge: 3 },
                { icon: '🚩', label: 'Report Issue' },
              ].map((tool, i) => (
                <div key={i} className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-hover transition-colors cursor-pointer relative flex flex-col items-center">
                  <span className="text-base mb-1">{tool.icon}</span>
                  <span className="text-[9px] text-text-secondary leading-tight">{tool.label}</span>
                  {tool.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple text-white text-[9px] font-bold flex items-center justify-center">
                      {tool.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
