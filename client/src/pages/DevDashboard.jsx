import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiTerminal, FiGitCommit, FiFolder, FiAward, FiGlobe, FiMapPin,
  FiGithub, FiLinkedin, FiTwitter, FiStar, FiExternalLink, FiCode
} from 'react-icons/fi';

export default function DevDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const topSkills = [
    { name: 'Python', pct: 90, color: 'bg-primary' },
    { name: 'JavaScript', pct: 85, color: 'bg-warning' },
    { name: 'TypeScript', pct: 75, color: 'bg-info' },
    { name: 'React', pct: 85, color: 'bg-info' },
    { name: 'Node.js', pct: 80, color: 'bg-success' },
    { name: 'PostgreSQL', pct: 70, color: 'bg-primary-light' },
    { name: 'Docker', pct: 65, color: 'bg-info' },
    { name: 'AWS', pct: 60, color: 'bg-warning' },
  ];

  const featuredProjects = [
    {
      title: 'Habit Tracker',
      tag: 'Featured',
      stars: 128,
      desc: 'A full-stack habit tracking application with analytics, reminders and streak system.',
      techs: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS']
    },
    {
      title: 'LifeOS Dashboard',
      stars: 96,
      desc: 'Personal productivity dashboard to track goals, tasks, habits, fitness and developer activity.',
      techs: ['React', 'Node.js', 'MongoDB', 'Chart.js']
    },
    {
      title: 'IoT Sensor Node',
      stars: 64,
      desc: 'Arduino based IoT node for environmental monitoring with LoRa communication.',
      techs: ['Arduino', 'C++', 'LoRa', 'DHT22']
    }
  ];

  const recentCommits = [
    { repo: 'habit-tracker', msg: 'Fix: authentication bug in login route', time: '2 hours ago' },
    { repo: 'lifeos-dashboard', msg: 'Feat: add analytics charts to dashboard', time: '1 day ago' },
    { repo: 'fastapi-learning', msg: 'Add: CRUD operations for user model', time: '2 days ago' },
    { repo: 'iot-sensor-node', msg: 'Update: optimize data packet format', time: '3 days ago' },
  ];

  const achievements = [
    { title: 'First Commit', date: 'Jan 2024', icon: '🚀', color: 'border-warning/50 bg-warning/10 text-warning' },
    { title: 'Pull Request Master', date: 'Feb 2024', icon: '🔀', color: 'border-info/50 bg-info/10 text-info' },
    { title: 'Code Reviewer', date: 'Mar 2024', icon: '🛡️', color: 'border-danger/50 bg-danger/10 text-danger' },
    { title: 'Streak 30 Days', date: 'Apr 2024', icon: '🔥', color: 'border-warning/50 bg-warning/10 text-warning' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
            <FiTerminal size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Developer Profile</h1>
            <p className="text-xs text-text-muted">Build. Learn. Share. Grow as a developer.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💻</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">45</p>
              <p className="text-[9px] text-text-muted">Projects</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔄</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">1,248</p>
              <p className="text-[9px] text-text-muted">Commits</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📁</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">18</p>
              <p className="text-[9px] text-text-muted">Repositories</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">12</p>
              <p className="text-[9px] text-text-muted">Achievements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'repositories', label: 'Repositories' },
          { id: 'contributions', label: 'Contributions' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'settings', label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Profile Card (8 cols) */}
        <div className="col-span-8 card p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-2xl font-bold">
                {(user?.username || 'N')[0].toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-surface" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{user?.username || 'Naman'}</h2>
                <span className="badge-primary text-[9px]">Lv. {user?.level || 13}</span>
              </div>
              <p className="text-xs text-text-muted font-medium mt-0.5">Full Stack Developer & Tech Enthusiast</p>
              <p className="text-xs text-text-secondary mt-2">
                I love building scalable web applications and exploring new technologies. Currently focusing on System Design and DevOps.
              </p>

              <div className="flex items-center gap-4 text-xs text-text-muted mt-3">
                <span className="flex items-center gap-1"><FiMapPin size={12} /> Jammu, India</span>
                <span className="flex items-center gap-1 text-info hover:underline"><FiGlobe size={12} /> naman.dev</span>
                <span>📅 Joined Jan 2024</span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <FiGithub className="text-text-secondary hover:text-white cursor-pointer" size={16} />
                <FiLinkedin className="text-text-secondary hover:text-white cursor-pointer" size={16} />
                <FiTwitter className="text-text-secondary hover:text-white cursor-pointer" size={16} />
                <FiGlobe className="text-text-secondary hover:text-white cursor-pointer" size={16} />
              </div>
            </div>

            {/* Role & Specs Box */}
            <div className="w-56 p-3 rounded-xl bg-surface-elevated text-xs space-y-2">
              <div>
                <p className="text-[10px] text-text-muted">Role</p>
                <p className="font-semibold text-text-primary">Full Stack Developer</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Experience</p>
                <p className="font-semibold text-text-primary">2+ Years</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Focus</p>
                <p className="font-semibold text-text-primary">Backend, DevOps, Cloud</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Currently Learning</p>
                <p className="font-semibold text-text-primary">System Design, Docker, Kubernetes</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Open to</p>
                <p className="font-semibold text-success">Collaboration & Full-time Opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Stats & Mini Calendar (4 cols) */}
        <div className="col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Developer Stats</h3>
            <span className="text-xs text-text-muted">This Month ▾</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">98</p>
              <p className="text-[9px] text-text-muted">Contributions</p>
              <span className="text-[8px] text-success font-semibold">↑ 24% from last month</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">12</p>
              <p className="text-[9px] text-text-muted">Pull Requests</p>
              <span className="text-[8px] text-success font-semibold">↑ 33% from last month</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">7</p>
              <p className="text-[9px] text-text-muted">Issues Closed</p>
              <span className="text-[8px] text-success font-semibold">↑ 16% from last month</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-elevated">
              <p className="text-lg font-bold font-mono text-text-primary">30</p>
              <p className="text-[9px] text-text-muted">Code Reviews</p>
              <span className="text-[8px] text-success font-semibold">↑ 20% from last month</span>
            </div>
          </div>

          {/* Mini Contribution Calendar */}
          <div>
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>Contribution Calendar</span>
              <span>&lt; May 2026 &gt;</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`h-3 rounded-[2px] ${i % 3 === 0 ? 'bg-success' : i % 5 === 0 ? 'bg-success/50' : 'bg-surface-elevated'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Top Skills (4 cols) */}
        <div className="col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Top Skills</h3>
            <span className="section-link">View All</span>
          </div>

          <div className="space-y-2.5">
            {topSkills.map(sk => (
              <div key={sk.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-text-primary">{sk.name}</span>
                  <span className="font-mono text-text-muted">{sk.pct}%</span>
                </div>
                <div className="progress-bar h-1.5">
                  <div className={`progress-fill ${sk.color}`} style={{ width: `${sk.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects (5 cols) */}
        <div className="col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Featured Projects</h3>
            <span className="section-link">View All</span>
          </div>

          <div className="space-y-3">
            {featuredProjects.map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-elevated/40 border border-border-subtle hover:border-border-hover transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-text-primary">{p.title}</h4>
                    {p.tag && <span className="badge-purple text-[8px]">{p.tag}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-mono text-[10px]"><FiStar size={11} /> {p.stars}</span>
                    <FiGithub size={13} className="hover:text-white cursor-pointer" />
                  </div>
                </div>
                <p className="text-[11px] text-text-muted mb-2">{p.desc}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.techs.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono text-info">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commits (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Recent Commits</h3>
            <span className="section-link">View All</span>
          </div>

          <div className="space-y-3">
            {recentCommits.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1 border-b border-border-subtle last:border-0">
                <div className="w-6 h-6 rounded-lg bg-info/10 text-info flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiGitCommit size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-text-primary">{c.repo}</p>
                  <p className="text-[10px] text-text-muted truncate">{c.msg}</p>
                  <p className="text-[8px] text-text-muted mt-0.5">{c.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* GitHub Activity Overview Heatmap (5 cols) */}
        <div className="col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">GitHub Activity Overview</h3>
            <span className="section-link">View Full Profile</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div><p className="font-bold font-mono text-text-primary">1,248</p><p className="text-[9px] text-text-muted">Total Commits</p></div>
            <div><p className="font-bold font-mono text-text-primary">45</p><p className="text-[9px] text-text-muted">Repositories</p></div>
            <div><p className="font-bold font-mono text-text-primary">312</p><p className="text-[9px] text-text-muted">Followers</p></div>
            <div><p className="font-bold font-mono text-text-primary">108</p><p className="text-[9px] text-text-muted">Following</p></div>
          </div>

          {/* GitHub Activity Grid */}
          <div className="grid grid-cols-12 gap-1 pt-2">
            {Array.from({ length: 48 }, (_, i) => (
              <div key={i} className={`h-3 rounded-[2px] ${i % 4 === 0 ? 'bg-success' : i % 2 === 0 ? 'bg-success/40' : 'bg-surface-elevated'}`} />
            ))}
          </div>

          <div className="flex justify-between text-[9px] text-text-muted pt-1">
            <span>🔥 Longest Streak: <strong className="text-text-primary font-mono">30 days</strong></span>
            <span>⚡ Current Streak: <strong className="text-text-primary font-mono">12 days</strong></span>
          </div>
        </div>

        {/* Languages Used Donut (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <h3 className="section-title">Languages Used</h3>
          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="100 176" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#6366F1" strokeWidth="12" strokeDasharray="70 206" strokeDashoffset="-100" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="50 226" strokeDashoffset="-170" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="30 246" strokeDashoffset="-220" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-text-primary text-center">Most Used<br />Languages</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-info font-medium">• TypeScript</span><span className="font-mono text-text-primary">35%</span></div>
            <div className="flex justify-between"><span className="text-primary font-medium">• Python</span><span className="font-mono text-text-primary">25%</span></div>
            <div className="flex justify-between"><span className="text-warning font-medium">• JavaScript</span><span className="font-mono text-text-primary">20%</span></div>
            <div className="flex justify-between"><span className="text-success font-medium">• HTML/CSS</span><span className="font-mono text-text-primary">10%</span></div>
          </div>
        </div>

        {/* Achievements Badges (4 cols) */}
        <div className="col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Achievements</h3>
            <span className="section-link">View All</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {achievements.map((a, i) => (
              <div key={i} className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${a.color}`}>
                <span className="text-xl mb-1">{a.icon}</span>
                <p className="text-[9px] font-bold leading-tight">{a.title}</p>
                <p className="text-[8px] opacity-75 mt-0.5">{a.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
