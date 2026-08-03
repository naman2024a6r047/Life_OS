import React from 'react';
import { 
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { FiClock, FiBookOpen, FiCheckCircle, FiActivity, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function ExamAnalytics({ examData }) {
    if (!examData) return null;

    const subjects = examData.subjects || [];
    const studyLogs = examData.studyLogs || [];

    // Calculate Subject Completion Data
    const subjectProgressData = subjects.map(sub => ({
        name: sub.name,
        progress: sub.progress_percentage || 0
    }));

    // Calculate Study Time per Subject Data
    const timePerSubjectMap = {};
    studyLogs.forEach(log => {
        const subName = log.Subject?.name || 'General Study';
        const hrs = (log.duration_minutes || 0) / 60;
        timePerSubjectMap[subName] = (timePerSubjectMap[subName] || 0) + hrs;
    });

    const timePerSubjectData = Object.keys(timePerSubjectMap).map(name => ({
        name,
        hours: Number(timePerSubjectMap[name].toFixed(1))
    }));

    // Calculate Daily Velocity (Time-Series)
    const dailyVelocityMap = {};
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
        const dateStr = dayjs().subtract(i, 'day').format('MMM DD');
        dailyVelocityMap[dateStr] = 0;
    }

    studyLogs.forEach(log => {
        const dateStr = dayjs(log.createdAt).format('MMM DD');
        const hrs = (log.duration_minutes || 0) / 60;
        if (dailyVelocityMap[dateStr] !== undefined) {
            dailyVelocityMap[dateStr] += hrs;
        } else {
            dailyVelocityMap[dateStr] = hrs;
        }
    });

    const dailyVelocityData = Object.keys(dailyVelocityMap).map(date => ({
        date,
        hours: Number(dailyVelocityMap[date].toFixed(1))
    }));

    // Summary stats
    const totalHours = (examData.total_study_hours || 0).toFixed(1);
    const completedSubjects = subjects.filter(s => s.is_completed || s.progress_percentage === 100).length;
    const avgSessionMins = studyLogs.length > 0 
        ? Math.round(studyLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0) / studyLogs.length) 
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold mb-2">Exam Telemetry & Analytics</h2>
                <p className="text-text-muted">Deep telemetry metrics tracking your revision velocity, subject focus, and study time distribution.</p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-3 text-text-muted mb-3">
                        <FiClock className="text-cyan-400 text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Time</span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{totalHours} <span className="text-sm text-text-muted font-medium">hrs</span></div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-3 text-text-muted mb-3">
                        <FiCheckCircle className="text-success text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">Completed Subjects</span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{completedSubjects} <span className="text-sm text-text-muted font-medium">/ {subjects.length}</span></div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-3 text-text-muted mb-3">
                        <FiActivity className="text-blue-400 text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg Session</span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{avgSessionMins} <span className="text-sm text-text-muted font-medium">mins</span></div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-3 text-text-muted mb-3">
                        <FiBookOpen className="text-amber-400 text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{studyLogs.length} <span className="text-sm text-text-muted font-medium">logged</span></div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Study Velocity Chart */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-4">
                    <h3 className="text-xl font-bold text-text-muted flex items-center gap-2">
                        <FiActivity className="text-cyan-400" /> Daily Study Hours Velocity
                    </h3>
                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyVelocityData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    formatter={(value) => [`${value} hrs`, 'Study Duration']}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Progress Chart */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-4">
                    <h3 className="text-xl font-bold text-text-muted flex items-center gap-2">
                        <FiCheckCircle className="text-success" /> Subject Completion Progress (%)
                    </h3>
                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectProgressData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis domain={[0, 100]} stroke="#64748b" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    formatter={(value) => [`${value}%`, 'Progress']}
                                />
                                <Bar dataKey="progress" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Study Time Allocation Breakdown */}
            {timePerSubjectData.length > 0 && (
                <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-4">
                    <h3 className="text-xl font-bold text-text-muted flex items-center gap-2">
                        <FiClock className="text-blue-400" /> Hours Logged Per Subject
                    </h3>
                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timePerSubjectData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    formatter={(value) => [`${value} hrs`, 'Logged Time']}
                                />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                                    {timePerSubjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Log History Breakdown Table */}
            <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-4">
                <h3 className="text-xl font-bold text-text-muted flex items-center gap-2">
                    <FiFileText className="text-amber-400" /> Recent Study Session Logs
                </h3>
                {studyLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-text-primary">
                            <thead className="bg-background/60 text-text-muted text-xs font-bold uppercase border-b border-border-subtle">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Duration</th>
                                    <th className="py-3 px-4">Chapters / Focus</th>
                                    <th className="py-3 px-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {studyLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-background/40 transition">
                                        <td className="py-3 px-4 font-mono text-text-muted">
                                            {dayjs(log.createdAt).format('MMM DD, YYYY · HH:mm')}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-cyan-400">
                                            {log.duration_minutes} mins
                                        </td>
                                        <td className="py-3 px-4 font-medium text-text-primary">
                                            {log.chapters_covered || 'Standard Study Session'}
                                        </td>
                                        <td className="py-3 px-4 text-text-muted italic">
                                            {log.notes || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-text-muted italic text-sm py-4">No study sessions logged yet. Use Focus Mode to start logging study time!</p>
                )}
            </div>
        </div>
    );
}
