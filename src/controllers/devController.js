const { CodingProfile, Skill } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        let profile = await CodingProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) {
            profile = await CodingProfile.create({ user_id: req.user.id });
        }
        const skills = await Skill.findAll({ where: { user_id: req.user.id }, order: [['level', 'DESC']] });
        
        res.status(200).json({ profile, skills });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dev profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { github_username, leetcode_username, daily_coding_goal_hours, portfolio_links, developer_info } = req.body;
        
        require('fs').appendFileSync('update_log.txt', JSON.stringify({ body: req.body, user: req.user.id }) + '\n');

        let profile = await CodingProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) {
            profile = await CodingProfile.create({ user_id: req.user.id });
        }

        profile.github_username = github_username || profile.github_username;
        profile.leetcode_username = leetcode_username || profile.leetcode_username;
        profile.daily_coding_goal_hours = daily_coding_goal_hours || profile.daily_coding_goal_hours;
        if (portfolio_links !== undefined) {
            profile.portfolio_links = portfolio_links;
            profile.changed('portfolio_links', true);
        }
        if (developer_info !== undefined) {
            profile.developer_info = developer_info;
            profile.changed('developer_info', true);
        }
        
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

exports.logHours = async (req, res) => {
    try {
        const { hours } = req.body;
        const profile = await CodingProfile.findOne({ where: { user_id: req.user.id } });
        if (profile) {
            profile.total_hours_coded += parseFloat(hours);
            await profile.save();
        }
        res.status(200).json({ message: 'Hours logged' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging hours' });
    }
};

exports.addSkill = async (req, res) => {
    try {
        const { name } = req.body;
        const skill = await Skill.create({
            user_id: req.user.id,
            name
        });
        res.status(201).json(skill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding skill' });
    }
};

exports.addXP = async (req, res) => {
    try {
        const { skill_id } = req.params;
        const { xp_gained } = req.body;
        
        const skill = await Skill.findOne({ where: { id: skill_id, user_id: req.user.id } });
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        skill.xp += parseInt(xp_gained);
        
        // Level up logic: Level N requires N * 100 XP to level up
        let xpRequired = skill.level * 100;
        while (skill.xp >= xpRequired) {
            skill.xp -= xpRequired;
            skill.level += 1;
            xpRequired = skill.level * 100;
        }

        await skill.save();
        res.status(200).json(skill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding XP' });
    }
};
