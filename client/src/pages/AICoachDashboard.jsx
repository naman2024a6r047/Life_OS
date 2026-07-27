import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiDatabase, FiSearch, FiPlus, FiBookmark, FiDownload, FiUpload,
  FiFileText, FiVideo, FiBook, FiGlobe, FiFolder, FiMoreVertical,
  FiArrowRight, FiGrid, FiList, FiChevronDown, FiZap
} from 'react-icons/fi';

export default function AICoachDashboard() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Resources', count: 245, icon: '🗂️' },
    { id: 'materials', label: 'Study Materials', count: 86, icon: '📖' },
    { id: 'papers', label: 'Practice Papers', count: 42, icon: '📝' },
    { id: 'cheatsheets', label: 'Cheat Sheets', count: 28, icon: '📄' },
    { id: 'videos', label: 'Videos', count: 54, icon: '🎥' },
    { id: 'books', label: 'Books', count: 21, icon: '📚' },
    { id: 'tools', label: 'Tools & Websites', count: 14, icon: '🌐' },
  ];

  const featured = [
    {
      title: 'Python Cheatsheet',
      tag: 'Study Material',
      tagColor: 'purple',
      desc: 'Complete Python cheatsheet for quick reference and interviews.',
      type: 'PDF • 1.2 MB',
      icon: '🐍',
      bgColor: 'from-primary/20 to-purple/20',
    },
    {
      title: 'SQL Quick Guide',
      tag: 'Study Material',
      tagColor: 'purple',
      desc: 'Essential SQL queries with examples and use cases.',
      type: 'PDF • 850 KB',
      icon: '🛢️',
      bgColor: 'from-info/20 to-success/20',
    },
    {
      title: 'DSA Roadmap',
      tag: 'Roadmap',
      tagColor: 'info',
      desc: 'Step-by-step roadmap to master Data Structures & Algorithms.',
      type: 'PDF • 1.5 MB',
      icon: '🕸️',
      bgColor: 'from-primary/30 to-info/30',
    },
    {
      title: 'FastAPI Tutorial Series',
      tag: 'Video',
      tagColor: 'warning',
      desc: 'Complete FastAPI tutorial for beginners to advanced.',
      type: '12 Videos • 6.3 hrs',
      icon: '⚡',
      bgColor: 'from-warning/20 to-danger/20',
    },
  ];

  const library = [
    { name: 'Operating Systems Notes', type: 'PDF', category: 'Study Materials', size: '2.4 MB', date: 'May 15, 2026', tagColor: 'purple' },
    { name: 'GATE CSE Previous Year Papers', type: 'PDF', category: 'Practice Papers', size: '12.6 MB', date: 'May 14, 2026', tagColor: 'info' },
    { name: 'Web Development Roadmap', type: 'PDF', category: 'Roadmaps', size: '1.8 MB', date: 'May 13, 2026', tagColor: 'success' },
    { name: 'React Crash Course', type: 'VIDEO', category: 'Videos', size: '4.2 hrs', date: 'May 12, 2026', tagColor: 'warning' },
    { name: 'Data Structures Cheatsheet', type: 'PDF', category: 'Cheat Sheets', size: '950 KB', date: 'May 11, 2026', tagColor: 'purple' },
  ];

  const recentlyAdded = [
    { name: 'Docker Basics Guide', info: 'PDF • 1.1 MB', date: 'May 15, 2026', icon: '🐳' },
    { name: 'Git Cheat Sheet', info: 'PDF • 620 KB', date: 'May 15, 2026', icon: '🔀' },
    { name: 'ML Algorithms Summary', info: 'PDF • 2.2 MB', date: 'May 14, 2026', icon: '🤖' },
    { name: 'Linux Commands Cheat Sheet', info: 'PDF • 780 KB', date: 'May 14, 2026', icon: '🐧' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiDatabase size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Resources</h1>
            <p className="text-xs text-text-muted">Your ultimate study hub. Curated materials to help you learn better.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-12 py-2 rounded-xl bg-surface-elevated text-xs text-text-primary placeholder-text-muted border border-border-subtle focus:border-purple focus:outline-none w-64"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted bg-white/5 px-1.5 py-0.5 rounded border border-border-subtle">
              Ctrl + K
            </span>
          </div>
          <button className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Add Resource
          </button>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary">Browse by Category</h3>
          <button className="text-xs font-semibold text-purple hover:underline flex items-center gap-1">
            View All Categories <FiArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                selectedCategory === cat.id ? 'border-purple bg-purple/10' : 'border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated'
              }`}
            >
              <span className="text-lg block mb-1">{cat.icon}</span>
              <p className="text-[11px] font-bold text-text-primary truncate">{cat.label}</p>
              <p className="text-[9px] text-text-muted font-mono">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 9 Columns — Featured & Library */}
        <div className="lg:col-span-9 space-y-5">
          {/* Featured Resources (4 Cards) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary">Featured Resources</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featured.map((f, i) => (
                <div key={i} className="card overflow-hidden hover:border-purple/40 transition-all flex flex-col justify-between">
                  {/* Card Cover Banner */}
                  <div className={`p-4 bg-gradient-to-br ${f.bgColor} flex flex-col items-center justify-center text-center h-28 relative`}>
                    <span className="text-3xl mb-1">{f.icon}</span>
                    <h4 className="text-sm font-extrabold text-white">{f.title}</h4>
                  </div>
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`badge-${f.tagColor} text-[8px] mb-1 inline-block`}>{f.tag}</span>
                      <p className="text-[11px] font-bold text-text-primary">{f.title}</p>
                      <p className="text-[9px] text-text-muted leading-tight mt-0.5">{f.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[9px] text-text-muted font-mono">
                      <span>{f.type}</span>
                      <FiBookmark className="hover:text-purple cursor-pointer" size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Library Table */}
          <div className="card overflow-hidden space-y-3">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Resource Library</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted cursor-pointer hover:text-text-primary flex items-center gap-1">
                  All Types <FiChevronDown size={12} />
                </span>
                <span className="text-xs text-text-muted cursor-pointer hover:text-text-primary flex items-center gap-1">
                  Latest <FiChevronDown size={12} />
                </span>
                <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
                  <button className="px-2 py-1 bg-purple text-white"><FiList size={13} /></button>
                  <button className="px-2 py-1 text-text-muted hover:text-text-primary"><FiGrid size={13} /></button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-elevated/50 text-[10px] text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Size / Duration</th>
                    <th className="py-2.5 px-3">Added On</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {library.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-elevated/40">
                      <td className="py-3 px-4 font-bold text-text-primary flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center text-xs">
                          {row.type === 'PDF' ? '📄' : '🎥'}
                        </div>
                        <div>
                          <p className="leading-tight">{row.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border-subtle">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge-${row.tagColor} text-[8px]`}>{row.category}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{row.size}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{row.date}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-text-muted">
                          <FiBookmark className="hover:text-purple cursor-pointer" size={14} />
                          <FiMoreVertical className="hover:text-text-primary cursor-pointer" size={14} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border-subtle text-center">
              <button className="text-xs font-semibold text-purple hover:underline flex items-center justify-center gap-1 mx-auto">
                View More Resources <FiChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right 3 Columns — My Resources & Recently Added & Contribute */}
        <div className="lg:col-span-3 space-y-4">
          {/* My Resources Stats */}
          <div className="card p-4 space-y-3">
            <div className="section-header">
              <h3 className="section-title">My Resources</h3>
              <span className="section-link">View All</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiBookmark className="text-purple" /> Saved Items</span>
                <span className="font-bold font-mono text-text-primary">18</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiDownload className="text-success" /> Downloaded</span>
                <span className="font-bold font-mono text-text-primary">7</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiUpload className="text-warning" /> My Uploads</span>
                <span className="font-bold font-mono text-text-primary">3</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
                <span className="flex items-center gap-2 text-text-secondary"><FiFileText className="text-info" /> Recent Files</span>
                <span className="font-bold font-mono text-text-primary">12</span>
              </div>
            </div>
          </div>

          {/* Recently Added */}
          <div className="card p-4 space-y-3">
            <div className="section-header">
              <h3 className="section-title">Recently Added</h3>
              <span className="section-link">View All</span>
            </div>

            <div className="space-y-2.5">
              {recentlyAdded.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-text-primary leading-tight">{item.name}</p>
                      <p className="text-[9px] text-text-muted font-mono">{item.info}</p>
                    </div>
                  </div>
                  <span className="text-[8px] text-text-muted">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contribute & Earn Card */}
          <div className="card p-5 text-center space-y-3 bg-gradient-to-br from-primary/30 to-purple/30 border-purple/40">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-2xl shadow-glow-primary">
              🚀
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Contribute & Earn</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                Share helpful resources with the community and earn reward points!
              </p>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-slate-100 transition-all shadow-lg">
              Upload Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
