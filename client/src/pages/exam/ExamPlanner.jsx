import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiCheckCircle, FiCircle } from 'react-icons/fi';

export default function ExamPlanner({ examId, initialSubjects, onUpdate }) {
    const [subjects, setSubjects] = useState(initialSubjects || []);
    const [newSubject, setNewSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [topicInputs, setTopicInputs] = useState({});

    useEffect(() => {
        setSubjects(initialSubjects || []);
    }, [initialSubjects]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        
        setLoading(true);
        try {
            const res = await axios.post('/api/exams/subjects', 
                { exam_session_id: examId, name: newSubject },
                { headers: getAuthHeader() }
            );
            const created = { ...res.data, topics: [] };
            setSubjects([...subjects, created]);
            setNewSubject('');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding subject:', error);
            alert('Failed to add subject');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTopic = async (subjectId, e) => {
        e.preventDefault();
        const topicName = topicInputs[subjectId];
        if (!topicName || !topicName.trim()) return;

        try {
            const res = await axios.post('/api/exams/topics',
                { subject_id: subjectId, name: topicName },
                { headers: getAuthHeader() }
            );

            setSubjects(prevSubjects => prevSubjects.map(sub => {
                if (sub.id === subjectId) {
                    const currentTopics = sub.topics || [];
                    return { ...sub, topics: [...currentTopics, res.data] };
                }
                return sub;
            }));

            setTopicInputs(prev => ({ ...prev, [subjectId]: '' }));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding topic:', error);
            alert('Failed to add topic');
        }
    };

    const handleToggleTopic = async (topicId, subjectId) => {
        try {
            const res = await axios.put(`/api/exams/topics/${topicId}/toggle`, {}, {
                headers: getAuthHeader()
            });

            setSubjects(prevSubjects => prevSubjects.map(sub => {
                if (sub.id === subjectId) {
                    const updatedTopics = (sub.topics || []).map(t => t.id === topicId ? res.data : t);
                    const completedCount = updatedTopics.filter(t => t.is_completed).length;
                    const progress = updatedTopics.length > 0 ? Math.round((completedCount / updatedTopics.length) * 100) : 0;
                    return { ...sub, topics: updatedTopics, progress_percentage: progress };
                }
                return sub;
            }));

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error toggling topic:', error);
        }
    };

    const handleCompleteSubject = async (subjectId) => {
        try {
            const res = await axios.put(`/api/exams/subjects/${subjectId}/complete`, {}, {
                headers: getAuthHeader()
            });

            setSubjects(prevSubjects => prevSubjects.map(sub => sub.id === subjectId ? res.data : sub));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error completing subject:', error.response?.data || error);
            alert(error.response?.data?.message || 'Failed to mark subject complete');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Exam Planner & Date Sheet</h2>
                    <p className="text-text-muted">Map out your subjects and create granular topic checklists.</p>
                </div>
            </div>

            {/* Add Subject */}
            <div className="card p-6 rounded-2xl">
                <form onSubmit={handleAddSubject} className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Add a new subject (e.g., Operating Systems)" 
                        className="flex-1 bg-background/50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 text-text-primary"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-text-primary font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
                        <FiPlus /> Add Subject
                    </button>
                </form>
            </div>

            {/* Subject List */}
            <div className="grid grid-cols-1 gap-6">
                {subjects.map(subject => (
                    <div key={subject.id} className={`glass-card p-6 rounded-2xl border transition-all ${subject.is_completed ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-border-subtle'} space-y-6`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-text-muted flex items-center gap-2">
                                    {subject.name}
                                    {subject.is_completed && (
                                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-success/20 text-success border border-emerald-500/30">
                                            FINISHED ✓
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                                    Progress: {subject.progress_percentage || 0}%
                                </div>
                                <button
                                    onClick={() => handleCompleteSubject(subject.id)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        subject.is_completed 
                                            ? 'bg-success/30 text-emerald-300 border border-emerald-500/40 hover:bg-success/50'
                                            : 'bg-success hover:bg-success/80 text-text-primary shadow-lg shadow-emerald-600/20'
                                    }`}
                                >
                                    <FiCheckCircle />
                                    <span>{subject.is_completed ? 'Exam Finished' : 'Exam Complete'}</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Topic List */}
                        <div className="space-y-3">
                            {subject.topics && subject.topics.length > 0 ? (
                                subject.topics.map(topic => (
                                    <div 
                                        key={topic.id} 
                                        onClick={() => handleToggleTopic(topic.id, subject.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border-subtle/80 cursor-pointer hover:border-cyan-500/40 transition"
                                    >
                                        {topic.is_completed ? (
                                            <FiCheckCircle className="text-success text-lg" />
                                        ) : (
                                            <FiCircle className="text-text-muted text-lg" />
                                        )}
                                        <span className={`text-sm ${topic.is_completed ? 'line-through text-text-muted' : 'text-text-primary font-medium'}`}>
                                            {topic.name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-text-muted italic">No topics added yet. Add your first topic below.</p>
                            )}
                        </div>

                        {/* Add Topic Form */}
                        <form onSubmit={(e) => handleAddTopic(subject.id, e)} className="flex flex-col sm:flex-row gap-3 pt-2">
                            <input 
                                type="text" 
                                placeholder="Add a topic (e.g., Process Scheduling)"
                                className="flex-1 bg-background/60 border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-cyan-500"
                                value={topicInputs[subject.id] || ''}
                                onChange={(e) => setTopicInputs({ ...topicInputs, [subject.id]: e.target.value })}
                            />
                            <button type="submit" className="px-4 py-2 bg-surface-elevated hover:bg-surface text-cyan-400 font-semibold rounded-xl text-sm transition flex items-center gap-1 border border-border-subtle">
                                <FiPlus /> Add Topic
                            </button>
                        </form>
                    </div>
                ))}
                
                {subjects.length === 0 && (
                    <div className="text-center py-12 text-text-muted border border-dashed border-border-subtle rounded-2xl">
                        Add your first subject above to start planning.
                    </div>
                )}
            </div>
        </div>
    );
}
