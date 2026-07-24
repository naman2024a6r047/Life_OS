import axios from 'axios';
import { supabase } from './supabaseClient';

// Client-Side Standalone API Adapter for Dist-Only Static Hosting
export function initClientApiAdapter() {
    axios.interceptors.request.use(async (config) => {
        // If config.url starts with /api/, handle client-side if no backend is responding
        return config;
    });

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { config, response } = error;
            // Handle 404 / Network Error on /api/ endpoints for static dist deployment
            if ((!response || response.status === 404 || error.code === 'ERR_NETWORK') && config && config.url && config.url.startsWith('/api/')) {
                try {
                    const mockData = await handleStaticApiFallback(config);
                    return {
                        data: mockData,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config
                    };
                } catch (fallbackErr) {
                    console.warn('Static API fallback handling:', fallbackErr.message);
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );
}

async function handleStaticApiFallback(config) {
    const url = config.url;
    const method = (config.method || 'get').toLowerCase();
    const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    // Get current user session from Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;
    const userId = currentUser?.id || 'demo_user_id';
    const userEmail = currentUser?.email || 'user@lifeos.dev';
    const username = currentUser?.user_metadata?.username || userEmail.split('@')[0];

    // Helper for LocalStorage fallback
    const getLocal = (key, defaultVal = []) => JSON.parse(localStorage.getItem(`lifeos_dist_${key}`) || JSON.stringify(defaultVal));
    const setLocal = (key, val) => localStorage.setItem(`lifeos_dist_${key}`, JSON.stringify(val));

    // 1. IMAGE UPLOAD (/api/upload)
    if (url === '/api/upload' && method === 'post') {
        const base64Image = data.image;
        if (!base64Image) throw new Error('Image data missing');

        const matches = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        let ext = 'png';
        let buffer;
        if (matches) {
            ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const binaryStr = atob(matches[2]);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            buffer = bytes.buffer;
        }

        const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        // Attempt direct upload to Supabase Storage Bucket
        try {
            const { data: storageData, error: storageErr } = await supabase.storage
                .from('lifeos-uploads')
                .upload(safeFilename, buffer, { contentType: `image/${ext}`, upsert: true });

            if (!storageErr && storageData) {
                const { data: publicUrlData } = supabase.storage
                    .from('lifeos-uploads')
                    .getPublicUrl(safeFilename);

                if (publicUrlData?.publicUrl) {
                    return { url: publicUrlData.publicUrl, message: 'Uploaded to Supabase Cloud Storage' };
                }
            }
        } catch (sErr) {
            console.log('Supabase storage direct upload fallback:', sErr.message);
        }

        // Return Data URL if storage bucket fails
        return { url: base64Image, message: 'Image stored inline' };
    }

    // 2. AUTH SYNC PROFILE (/api/auth/sync-profile)
    if (url === '/api/auth/sync-profile' && method === 'post') {
        const userObj = {
            id: userId,
            username: username,
            email: userEmail,
            xp: 350,
            level: 3,
            current_streak: 7
        };
        setLocal('user_profile', userObj);
        return { user: userObj };
    }

    // 3. CHALLENGES / GOALS (/api/challenges)
    if (url === '/api/challenges' && method === 'get') {
        let challenges = getLocal('challenges', null);
        if (!challenges || challenges.length === 0) {
            const todayStr = new Date().toISOString().split('T')[0];
            const start90 = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];
            const end90 = new Date(Date.now() + 59 * 86400000).toISOString().split('T')[0];

            challenges = [
                {
                    id: 'g1',
                    title: 'Master Full Stack Development',
                    description: 'Become a full stack developer by learning and building real world projects.',
                    category: 'Development',
                    start_date: start90,
                    end_date: end90,
                    status: 'active',
                    milestones: Array.from({ length: 9 }, (_, i) => ({
                        id: `m_${i+1}`,
                        title: `Milestone ${i+1}: Days ${i*10+1}-${(i+1)*10}`,
                        status: i < 3 ? 'completed' : i === 3 ? 'unlocked' : 'locked',
                        tasks: i === 3 ? [
                            { id: 't31', title: 'Learn React 19 – Components, Props, State', is_completed: true, priority: 'P1' },
                            { id: 't32', title: 'React – useEffect, Events and Forms', is_completed: false, priority: 'P1' },
                            { id: 't33', title: 'React Router DOM – Navigation & Routing', is_completed: false, priority: 'P2' },
                            { id: 't34', title: 'Node.js – Express.js Basics', is_completed: false, priority: 'P1' },
                            { id: 't35', title: 'REST API – CRUD Operations', is_completed: false, priority: 'P1' },
                            { id: 't36', title: 'Connect React Frontend with Express API', is_completed: false, priority: 'P1' },
                            { id: 't37', title: 'Authentication – JWT Basics', is_completed: false, priority: 'P2' },
                            { id: 't38', title: 'Deploy Full Stack App on Render', is_completed: false, priority: 'P3' },
                            { id: 't39', title: 'Add Protected Routes & Logout', is_completed: false, priority: 'P2' },
                            { id: 't40', title: 'Build a Mini Project – Task Manager', is_completed: false, priority: 'P1' },
                        ] : [
                            { id: `t_${i}_1`, title: `Sprint task for milestone ${i+1}`, is_completed: i < 3 }
                        ]
                    }))
                },
                {
                    id: 'g2',
                    title: 'Crack Semester Exams',
                    description: 'Prepare thoroughly for all university end-semester examinations.',
                    category: 'Academics',
                    start_date: new Date(Date.now() - 17 * 86400000).toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 43 * 86400000).toISOString().split('T')[0],
                    status: 'active',
                    milestones: [
                        { id: 'm2_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't2_1', title: 'Cover Unit 1 & 2', is_completed: true }] }
                    ]
                },
                {
                    id: 'g3',
                    title: 'Fitness Transformation',
                    description: 'Consistently hit the gym and achieve peak physical condition.',
                    category: 'Fitness',
                    start_date: new Date(Date.now() - 44 * 86400000).toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
                    status: 'active',
                    milestones: [
                        { id: 'm3_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't3_1', title: 'Bench press baseline', is_completed: true }] }
                    ]
                },
                {
                    id: 'g4',
                    title: 'Build 5 Projects',
                    description: 'Construct 5 production-ready full stack portfolio applications.',
                    category: 'Projects',
                    start_date: new Date(Date.now() - 24 * 86400000).toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
                    status: 'active',
                    milestones: [
                        { id: 'm4_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't4_1', title: 'Build Project 1', is_completed: true }] }
                    ]
                },
                {
                    id: 'g5',
                    title: 'Daily Learning Habit',
                    description: 'Read and learn for at least 1 hour every single day without fail.',
                    category: 'Habit',
                    start_date: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 113 * 86400000).toISOString().split('T')[0],
                    status: 'active',
                    milestones: [
                        { id: 'm5_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't5_1', title: 'Read 10 pages', is_completed: true }] }
                    ]
                }
            ];
            setLocal('challenges', challenges);
        }
        return challenges;
    }

    if (url === '/api/challenges' && method === 'post') {
        const challenges = getLocal('challenges', []);
        const todayStr = new Date().toISOString().split('T')[0];
        const endStr = new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0];

        const newChallenge = {
            id: `ch_${Date.now()}`,
            ...data,
            status: 'active',
            start_date: todayStr,
            end_date: endStr,
            milestones: [
                {
                    id: `ms_${Date.now()}_1`,
                    title: 'Milestone 1: 10-Day Sprint (Day 1 - Day 10)',
                    start_date: todayStr,
                    deadline: endStr,
                    status: 'unlocked',
                    tasks: [
                        { id: `t_${Date.now()}_1`, title: 'Day 1: Initial Setup & Environment Verification', priority: 'P1', energy_level: 'high', estimated_minutes: 45, is_completed: false, date: todayStr },
                        { id: `t_${Date.now()}_2`, title: 'Day 2: Data Structures & Core Logic Implementation', priority: 'P1', energy_level: 'high', estimated_minutes: 60, is_completed: false, date: todayStr }
                    ]
                }
            ]
        };
        const updated = [newChallenge, ...challenges];
        setLocal('challenges', updated);
        return newChallenge;
    }

    if (url.startsWith('/api/challenges/') && method === 'get') {
        const id = url.replace('/api/challenges/', '');
        const challenges = getLocal('challenges', []);
        let found = challenges.find(c => c.id === id) || challenges[0];

        const todayStr = new Date().toISOString().split('T')[0];
        const endStr = new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0];

        if (!found) {
            found = {
                id: id,
                title: '100 Days of Python & System Architecture',
                description: 'Master Python 3.12, AsyncIO, FastAPI, and Distributed Microservices',
                category: 'Engineering & Code',
                difficulty: 'LEGENDARY',
                status: 'active',
                start_date: todayStr,
                end_date: endStr,
                milestones: [
                    {
                        id: `ms_${id}_1`,
                        title: 'Milestone 1: 10-Day Python Mastery Sprint (Day 1 - Day 10)',
                        start_date: todayStr,
                        deadline: endStr,
                        status: 'unlocked',
                        tasks: [
                            { id: `t_${id}_1`, title: 'Day 1: Setup Python 3.12 Virtualenv & Poetry', priority: 'P1', energy_level: 'high', estimated_minutes: 45, is_completed: true, date: todayStr },
                            { id: `t_${id}_2`, title: 'Day 2: Master AsyncIO, Generators & Decorators', priority: 'P1', energy_level: 'high', estimated_minutes: 60, is_completed: false, date: todayStr },
                            { id: `t_${id}_3`, title: 'Day 3: Build High-Performance Async Crawler', priority: 'P2', energy_level: 'medium', estimated_minutes: 90, is_completed: false, date: todayStr }
                        ]
                    }
                ]
            };
        } else if (!found.milestones || found.milestones.length === 0) {
            found.milestones = [
                {
                    id: `ms_${found.id}_1`,
                    title: 'Milestone 1: 10-Day Sprint (Day 1 - Day 10)',
                    start_date: todayStr,
                    deadline: endStr,
                    status: 'unlocked',
                    tasks: [
                        { id: `t_${found.id}_1`, title: 'Day 1: Setup & Initial Sprint Tasks', priority: 'P1', energy_level: 'high', estimated_minutes: 45, is_completed: false, date: todayStr },
                        { id: `t_${found.id}_2`, title: 'Day 2: Logic & Feature Execution', priority: 'P1', energy_level: 'high', estimated_minutes: 60, is_completed: false, date: todayStr }
                    ]
                }
            ];
        }

        return found;
    }

    if (url.startsWith('/api/challenges/') && method === 'delete') {
        const id = url.replace('/api/challenges/', '');
        let challenges = getLocal('challenges', []);
        challenges = challenges.filter(c => c.id !== id);
        setLocal('challenges', challenges);
        return { message: 'Goal deleted successfully' };
    }

    // 4. TASKS (/api/tasks)
    if (url === '/api/tasks' && method === 'post') {
        const challenges = getLocal('challenges', []);
        const newTask = {
            id: `task_${Date.now()}`,
            ...data,
            is_completed: false
        };

        challenges.forEach(ch => {
            ch.Milestones?.forEach(ms => {
                if (ms.id === data.milestone_id) {
                    ms.MilestoneTasks = ms.MilestoneTasks || [];
                    ms.MilestoneTasks.push(newTask);
                }
            });
        });

        setLocal('challenges', challenges);
        return newTask;
    }

    if (url.includes('/toggle') && method === 'put') {
        const taskId = url.split('/')[3];
        const challenges = getLocal('challenges', []);
        let toggledTask = null;

        challenges.forEach(ch => {
            ch.Milestones?.forEach(ms => {
                ms.MilestoneTasks?.forEach(t => {
                    if (t.id === taskId) {
                        t.is_completed = !t.is_completed;
                        toggledTask = t;
                    }
                });
            });
        });

        setLocal('challenges', challenges);
        return toggledTask || { is_completed: true };
    }

    // 5. FRIENDS & PARTNERS (/api/friends)
    if (url === '/api/friends' && method === 'get') {
        let partners = getLocal('partners', null);
        if (!partners) {
            partners = [
                {
                    id: 'partner_alex',
                    username: 'alex_partner',
                    email: 'alex_partner@lifeos.dev',
                    level: 4,
                    xp: 1850,
                    current_streak: 12
                }
            ];
            setLocal('partners', partners);
        }
        return partners;
    }

    if (url.startsWith('/api/friends/search') && method === 'get') {
        return [
            { id: 'user_dev', username: 'dev_hero', level: 5, xp: 2400 },
            { id: 'user_sarah', username: 'sarah_code', level: 3, xp: 1200 },
            { id: 'partner_alex', username: 'alex_partner', level: 4, xp: 1850 }
        ];
    }

    if (url.startsWith('/api/friends/telemetry') && method === 'get') {
        return {
            partner: {
                id: 'partner_alex',
                username: 'alex_partner',
                email: 'alex_partner@lifeos.dev',
                level: 4,
                xp: 1850,
                current_streak: 12,
                exam_mode_active: false
            },
            challenges: [
                {
                    id: 'ch_partner',
                    title: 'DSA 100 Hard Questions Challenge',
                    category: 'Algorithms',
                    status: 'active',
                    Milestones: [
                        {
                            id: 'ms_partner_1',
                            title: 'Milestone 1: Dynamic Programming',
                            MilestoneTasks: [
                                { id: 'pt_1', title: 'Solve 3 Hard DP Problems', is_completed: true, priority: 'P1' },
                                { id: 'pt_2', title: 'Write System Design Cache Doc', is_completed: false, priority: 'P2' }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    if (url === '/api/friends/interventions/unread-count' && method === 'get') {
        return { count: 0 };
    }

    // 6. FITNESS & GYM (/api/fitness/weekly & /api/fitness/checkpoints)
    if (url === '/api/fitness/weekly' && method === 'get') {
        let weekly = getLocal('fitness_weekly', null);
        if (!weekly) {
            weekly = [
                {
                    id: 'plan_mon',
                    day_of_week: 1,
                    muscle_group: 'Chest & Triceps',
                    exercises: [
                        { id: 'ex_1', name: 'Barbell Bench Press', sets: 4, reps: 10, target_weight: 80, is_completed: true },
                        { id: 'ex_2', name: 'Incline Dumbbell Press', sets: 3, reps: 12, target_weight: 30, is_completed: false }
                    ]
                },
                {
                    id: 'plan_tue',
                    day_of_week: 2,
                    muscle_group: 'Back & Biceps',
                    exercises: [
                        { id: 'ex_3', name: 'Barbell Deadlift', sets: 4, reps: 6, target_weight: 140, is_completed: false }
                    ]
                }
            ];
            setLocal('fitness_weekly', weekly);
        }
        return weekly;
    }

    if (url === '/api/fitness/checkpoints' && method === 'get') {
        return getLocal('fitness_checkpoints', []);
    }

    if (url === '/api/fitness/checkpoint' && method === 'post') {
        const checkpoints = getLocal('fitness_checkpoints', []);
        const newCp = {
            id: `cp_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...data
        };
        const updated = [newCp, ...checkpoints];
        setLocal('fitness_checkpoints', updated);
        return newCp;
    }

    if (url === '/api/fitness/exercise' && method === 'post') {
        const weekly = getLocal('fitness_weekly', []);
        const newEx = {
            id: `ex_${Date.now()}`,
            ...data,
            is_completed: false
        };
        weekly.forEach(w => {
            if (w.id === data.workout_plan_id) {
                w.exercises = w.exercises || [];
                w.exercises.push(newEx);
            }
        });
        setLocal('fitness_weekly', weekly);
        return newEx;
    }

    if (url.includes('/api/fitness/exercise/') && url.includes('/toggle') && method === 'put') {
        const exId = url.split('/')[4];
        const weekly = getLocal('fitness_weekly', []);
        weekly.forEach(w => {
            w.exercises?.forEach(ex => {
                if (ex.id === exId) ex.is_completed = !ex.is_completed;
            });
        });
        setLocal('fitness_weekly', weekly);
        return { message: 'Exercise toggled' };
    }

    // Default Fallback
    return [];
}
