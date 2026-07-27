import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, Award, ShieldAlert, Zap, Book, Dumbbell, Code } from 'lucide-react';
import clsx from 'clsx';

// Type Definitions
type User = { name: string; quote: string; dayStreak: number; totalXp: number; level: number; levelTitle: string; lifeScore: number; graceTokens: number; };
type Task = { id: string; title: string; status: string; category: string; };
type Partner = { id: string; name: string; status: string; lastSeen: string; };
type Inquiry = { id: string; message: string; partner: Partner; };
type Achievement = { id: string; title: string; description: string; xpAwarded: number; };

// Theme Colors
const COLORS = ['#F97316', '#8B5CF6', '#10B981', '#3B82F6', '#EAB308'];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyFocusHours, setWeeklyFocusHours] = useState(0);

  // Mock API Call for demo purposes, replace with actual fetch calls
  useEffect(() => {
    // In a real app: fetch('/api/user').then(res => res.json()).then(setUser)
    setUser({
      name: 'Ghanshyam Thakur',
      quote: 'Discipline today, freedom tomorrow.',
      dayStreak: 12,
      totalXp: 4500,
      level: 1,
      levelTitle: 'Pro Builder',
      lifeScore: 78,
      graceTokens: 3
    });

    setTasks([
      { id: '1', title: 'Complete NDA Math Mock Test', status: 'Active', category: 'Exam' },
      { id: '2', title: 'Read Chapter 4 of CDS History', status: 'Completed', category: 'Exam' },
      { id: '3', title: 'Morning 5km Run', status: 'Completed', category: 'Fitness' }
    ]);

    setPartners([
      { id: '1', name: 'Amit Singh', status: 'Online', lastSeen: '' },
      { id: '2', name: 'Priya Sharma', status: 'Offline', lastSeen: '2 hours ago' }
    ]);

    setInquiries([
      { id: '1', message: 'asked about your Day 12 (Skipped)', partner: { id: '1', name: 'Amit Singh', status: 'Online', lastSeen: '' } }
    ]);

    setAchievements([
      { id: '1', title: 'Marathoner', description: 'Log 10 consecutive fitness days', xpAwarded: 500 }
    ]);

    setWeeklyFocusHours(14.5);
  }, []);

  if (!user) return <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">Loading...</div>;

  const xpNextLevel = 5000;
  const progressPercent = Math.min((user.totalXp / xpNextLevel) * 100, 100);

  // Mock Chart Data
  const lifeScoreData = [ { name: 'May 1', score: 60 }, { name: 'May 10', score: 65 }, { name: 'May 20', score: 72 }, { name: 'May 30', score: 78 } ];
  const xpBreakdownData = [ { name: 'Challenges', value: 2000 }, { name: 'Study', value: 1000 }, { name: 'Fitness', value: 800 }, { name: 'Coding', value: 700 } ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1E293B] p-6 rounded-2xl shadow-lg border border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
            <p className="text-slate-400 mt-1 italic">"{user.quote}"</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Level {user.level} - <span className="text-[#F97316] font-semibold">{user.levelTitle}</span></p>
              <div className="w-48 h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F97316] to-[#EAB308]" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.totalXp} / {xpNextLevel} XP</p>
            </div>
          </div>
        </header>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Life Score" value={`${user.lifeScore}/100`} icon={<Award className="text-[#8B5CF6]" />} />
          <StatCard title="Active Challenges" value={tasks.filter(t => t.status === 'Active').length} icon={<Zap className="text-[#F97316]" />} />
          <StatCard title="Tasks Completed" value={`${tasks.filter(t => t.status === 'Completed').length} / 50`} icon={<CheckCircle className="text-[#10B981]" />} />
          <StatCard title="Focus Hours" value={`${weeklyFocusHours}h`} icon={<Clock className="text-[#3B82F6]" />} />
          <StatCard title="Grace Tokens" value={user.graceTokens} icon={<ShieldAlert className="text-[#EAB308]" />} />
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left: Tasks & Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Challenge */}
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Today's Progress</h2>
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={day} className={clsx(
                    "flex-1 text-center py-2 rounded-lg border",
                    idx < 3 ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]" : 
                    idx === 3 ? "bg-[#3B82F6]/20 border-[#3B82F6] text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                  )}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
                    <div className="flex items-center space-x-4">
                      {task.status === 'Completed' ? <CheckCircle className="text-[#10B981]" /> : <Clock className="text-[#F97316]" />}
                      <span className={task.status === 'Completed' ? "line-through text-slate-400" : "text-white"}>{task.title}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-900 text-slate-300">{task.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModuleCard title="Exam Mode" icon={<Book className="text-[#8B5CF6]" />} desc="CDS & NDA Prep Active" />
              <ModuleCard title="Gym Routine" icon={<Dumbbell className="text-[#10B981]" />} desc="3 days streak" />
              <ModuleCard title="Dev Profile" icon={<Code className="text-[#3B82F6]" />} desc="React & Node.js" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Accountability Partners */}
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Accountability Partners</h2>
              <div className="space-y-4">
                {partners.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.status === 'Online' ? 'Active Now' : p.lastSeen}</p>
                      </div>
                    </div>
                    <div className={clsx("w-3 h-3 rounded-full", p.status === 'Online' ? 'bg-[#10B981]' : 'bg-slate-500')} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Inquiries */}
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-red-900/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-red-500" /> Pending Inquiries</h2>
              {inquiries.map(i => (
                <div key={i.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200">
                  <span className="font-semibold">{i.partner.name}</span> {i.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ANALYTICS & TRENDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Placeholder */}
          <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
             <h2 className="text-xl font-bold text-white mb-4">Activity Heatmap (Yearly)</h2>
             {/* Simple grid representation of a heatmap */}
             <div className="flex flex-wrap gap-1 mt-4 opacity-80">
                {Array.from({ length: 180 }).map((_, i) => (
                  <div key={i} className={clsx("w-3 h-3 rounded-sm", Math.random() > 0.7 ? "bg-[#10B981]" : Math.random() > 0.5 ? "bg-[#10B981]/50" : "bg-slate-800")} />
                ))}
             </div>
          </div>

          {/* XP Donut Chart */}
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">XP Breakdown</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={xpBreakdownData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {xpBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-700 flex flex-col justify-center">
      <div className="flex items-center space-x-2 text-slate-400 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}

function ModuleCard({ title, icon, desc }: { title: string, icon: React.ReactNode, desc: string }) {
  return (
    <button className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-500 hover:bg-slate-700 transition flex items-center space-x-4 text-left w-full">
      <div className="p-3 bg-slate-900 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </button>
  );
}
