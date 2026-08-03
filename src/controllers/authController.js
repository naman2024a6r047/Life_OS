const { supabaseAdmin } = require('../config/supabaseClient');
const User = require('../models/User');
const ExamSession = require('../models/ExamSession');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Check if username is already taken in local DB
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: { username },
            email_confirm: true
        });

        if (authError) {
            // Handle Supabase-specific errors
            if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }
            console.error('Supabase auth error:', authError);
            return res.status(400).json({ message: authError.message });
        }

        // Create local user profile with the same UUID from Supabase Auth
        const newUser = await User.create({
            id: authData.user.id,
            username,
            email
        });

        // Sign in to get a session token
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email
        });

        // Return user data — the frontend will handle the actual sign-in via Supabase client
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                xp: newUser.xp,
                level: newUser.level
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate via Supabase Auth
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Ensure local user profile exists
        let user = await User.findByPk(data.user.id);
        
        if (!user) {
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            user = await User.create({
                id: data.user.id,
                username: data.user.user_metadata?.username || email.split('@')[0],
                email
            });
        }

        const activeExam = await ExamSession.findOne({ where: { user_id: user.id, is_active: true } });

        res.status(200).json({
            message: 'Logged in successfully',
            session: data.session,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level,
                avatar_url: user.avatar_url,
                current_streak: user.current_streak,
                is_in_exam_mode: !!activeExam
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const activeExam = await ExamSession.findOne({ where: { user_id: user.id, is_active: true } });
        const userObj = user.toJSON();
        userObj.is_in_exam_mode = !!activeExam;

        res.status(200).json(userObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const syncProfile = async (req, res) => {
    try {
        // This endpoint is called by the frontend after Supabase Auth login
        // to ensure the local Users row exists with the correct data
        const { supabaseUserId, username, email, providerRefreshToken } = req.body;

        if (!supabaseUserId || !email) {
            return res.status(400).json({ message: 'supabaseUserId and email are required' });
        }

        let user = await User.findByPk(supabaseUserId);

        if (!user) {
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            user = await User.create({
                id: supabaseUserId,
                username: username || email.split('@')[0],
                email
            });
        }
        
        // Save Google Refresh Token if provided (from Supabase OAuth login)
        if (providerRefreshToken) {
            user.google_refresh_token = providerRefreshToken;
            await user.save();
        }

        const activeExam = await ExamSession.findOne({ where: { user_id: user.id, is_active: true } });

        const userObj = user.toJSON();
        delete userObj.password_hash;
        userObj.is_in_exam_mode = !!activeExam;

        res.status(200).json({
            user: userObj
        });
    } catch (error) {
        console.error('Sync profile error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const googleAuthExchange = async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Authorization code is required' });
        }

        const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET; // Must add this to .env

        if (!clientId || !clientSecret) {
            return res.status(500).json({ message: 'Google Client ID or Secret not configured on backend' });
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirect_uri || 'postmessage',
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Google token exchange error:', data);
            return res.status(400).json({ message: 'Failed to exchange token', details: data });
        }

        const { access_token, refresh_token } = data;
        
        // Save refresh token to user
        const user = await User.findByPk(req.user.id);
        if (refresh_token) {
            user.google_refresh_token = refresh_token;
            await user.save();
        }

        res.status(200).json({ access_token, message: 'Google Auth successful' });
    } catch (error) {
        console.error('googleAuthExchange error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getGoogleToken = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.google_refresh_token) {
            return res.status(404).json({ message: 'No Google Refresh Token found for user' });
        }

        const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: user.google_refresh_token,
                grant_type: 'refresh_token'
            })
        });

        const data = await response.json();
        if (!response.ok) {
            // Refresh token might be revoked or invalid
            return res.status(400).json({ message: 'Failed to refresh token', details: data });
        }

        res.status(200).json({ access_token: data.access_token });
    } catch (error) {
        console.error('getGoogleToken error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { google_drive_folder_link, resource_drive_folder_link, avatar_url, bio } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (google_drive_folder_link !== undefined) {
            user.google_drive_folder_link = google_drive_folder_link;
        }

        if (resource_drive_folder_link !== undefined) {
            user.resource_drive_folder_link = resource_drive_folder_link;
        }

        if (avatar_url !== undefined) {
            user.avatar_url = avatar_url;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        await user.save();
        const userObj = user.toJSON();
        delete userObj.password_hash;
        delete userObj.google_refresh_token;
        res.status(200).json({ message: 'Profile updated', user: userObj });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    syncProfile,
    googleAuthExchange,
    getGoogleToken,
    updateProfile
};
