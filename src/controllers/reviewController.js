const { ApprovalRequest, Milestone, Challenge, MilestoneTask, Review } = require('../models');

exports.submitForReview = async (req, res) => {
    try {
        const { milestone_id, reviewer_id, evidence_url, reflection } = req.body;

        const milestone = await Milestone.findByPk(milestone_id, {
            include: [{ model: Challenge }, { model: MilestoneTask, as: 'tasks' }]
        });

        if (!milestone) return res.status(404).json({ message: "Milestone not found" });
        if (milestone.Challenge.user_id !== req.user.id) return res.status(403).json({ message: "Not your milestone" });

        // Ensure all tasks are completed
        const uncompleted = milestone.tasks.filter(t => !t.is_completed);
        if (uncompleted.length > 0) return res.status(400).json({ message: "Complete all tasks first" });

        milestone.status = 'pending_review';
        await milestone.save();

        const request = await ApprovalRequest.create({
            milestone_id,
            requester_id: req.user.id,
            reviewer_id,
            evidence_url,
            reflection
        });

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting review' });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { is_approved, rating_understanding, rating_consistency, rating_quality, rating_overall, comment } = req.body;

        const request = await ApprovalRequest.findOne({
            where: { id: request_id, reviewer_id: req.user.id },
            include: [{ model: Milestone, include: [{ model: Challenge }] }]
        });

        if (!request || request.status !== 'pending') return res.status(404).json({ message: "Valid request not found" });

        request.status = is_approved ? 'approved' : 'rejected';
        await request.save();

        const review = await Review.create({
            approval_request_id: request.id,
            reviewer_id: req.user.id,
            rating_understanding,
            rating_consistency,
            rating_quality,
            rating_overall,
            comment
        });

        const milestone = request.Milestone;
        milestone.status = is_approved ? 'completed' : 'rejected';
        await milestone.save();

        if (is_approved) {
            // Unlock next milestone
            const nextMilestone = await Milestone.findOne({
                where: { challenge_id: milestone.challenge_id, status: 'locked' },
                order: [['start_date', 'ASC']]
            });
            if (nextMilestone) {
                nextMilestone.status = 'unlocked';
                await nextMilestone.save();
            } else {
                milestone.Challenge.status = 'completed';
                await milestone.Challenge.save();
            }
        } else {
            // Penalty Rule: Restart milestone
            if (milestone.Challenge.penalty_rule === 'restart_milestone') {
                milestone.status = 'unlocked';
                await milestone.save();
                await MilestoneTask.update({ is_completed: false }, { where: { milestone_id: milestone.id } });
            }
        }

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting review rating' });
    }
};

exports.getPendingReviews = async (req, res) => {
    try {
        const requests = await ApprovalRequest.findAll({
            where: { reviewer_id: req.user.id, status: 'pending' },
            include: ['requester', { model: Milestone, include: ['tasks'] }]
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pending reviews' });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const requests = await ApprovalRequest.findAll({
            where: { requester_id: req.user.id, status: { [Op.ne]: 'pending' } },
            include: ['reviewer', { model: Milestone, include: ['tasks', { model: Challenge }] }, { model: Review }]
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching my reviews' });
    }
};

exports.getReviewHistory = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const requests = await ApprovalRequest.findAll({
            where: { reviewer_id: req.user.id, status: { [Op.ne]: 'pending' } },
            include: ['requester', { model: Milestone, include: ['tasks', { model: Challenge }] }, { model: Review }]
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching review history' });
    }
};
