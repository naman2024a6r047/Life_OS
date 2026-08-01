const { ResourceCategory, Resource } = require('../models');
const { Op } = require('sequelize');

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

const getCategories = async (req, res) => {
    try {
        const categories = await ResourceCategory.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Resource, as: 'resources', attributes: ['id'] }],
            order: [['createdAt', 'ASC']]
        });

        const result = categories.map(c => ({
            ...c.toJSON(),
            resource_count: c.resources ? c.resources.length : 0
        }));

        res.json(result);
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, icon, color, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const category = await ResourceCategory.create({
            user_id: req.user.id,
            name,
            icon: icon || '📁',
            color: color || '#8B5CF6',
            description: description || null
        });

        res.status(201).json(category);
    } catch (err) {
        console.error('createCategory error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await ResourceCategory.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const { name, icon, color, description } = req.body;
        if (name !== undefined) category.name = name;
        if (icon !== undefined) category.icon = icon;
        if (color !== undefined) category.color = color;
        if (description !== undefined) category.description = description;

        await category.save();
        res.json(category);
    } catch (err) {
        console.error('updateCategory error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await ResourceCategory.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Unassign resources in this category before deleting
        await Resource.update({ category_id: null }, { where: { category_id: req.params.id } });
        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('deleteCategory error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── RESOURCES ───────────────────────────────────────────────────────────────

const getResources = async (req, res) => {
    try {
        const { Friend, User } = require('../models');
        const friends = await Friend.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: req.user.id },
                    { friend_id: req.user.id }
                ]
            }
        });
        const friendIds = friends.map(f => f.user_id === req.user.id ? f.friend_id : f.user_id);
        const userIds = [req.user.id, ...friendIds];

        const { category_id, search } = req.query;
        const where = { user_id: { [Op.in]: userIds } };

        if (category_id === 'uncategorized') {
            where.category_id = null;
            where.user_id = req.user.id; // Only show own uncategorized or should we show all? Show all is fine, but friend's might have category_id null too. Let's just keep where.category_id = null
        } else if (category_id && category_id !== 'all') {
            where.category_id = category_id;
        }

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const resources = await Resource.findAll({
            where,
            include: [
                { model: ResourceCategory, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
                { model: User, attributes: ['id', 'username', 'avatar_url'] }
            ],
            order: [['is_pinned', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(resources);
    } catch (err) {
        console.error('getResources error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const createResource = async (req, res) => {
    try {
        const { name, description, category_id, drive_file_id, drive_web_view_link, drive_web_content_link, mime_type, file_size, tags } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        // If category_id provided, ensure it belongs to the user
        if (category_id) {
            const cat = await ResourceCategory.findOne({ where: { id: category_id, user_id: req.user.id } });
            if (!cat) return res.status(403).json({ message: 'Invalid category' });
        }

        const resource = await Resource.create({
            user_id: req.user.id,
            category_id: category_id || null,
            name,
            description: description || null,
            drive_file_id: drive_file_id || null,
            drive_web_view_link: drive_web_view_link || null,
            drive_web_content_link: drive_web_content_link || null,
            mime_type: mime_type || null,
            file_size: file_size || null,
            tags: tags || []
        });

        const full = await Resource.findByPk(resource.id, {
            include: [{ model: ResourceCategory, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }]
        });

        res.status(201).json(full);
    } catch (err) {
        console.error('createResource error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const { name, description, category_id, tags, is_pinned } = req.body;
        if (name !== undefined) resource.name = name;
        if (description !== undefined) resource.description = description;
        if (category_id !== undefined) resource.category_id = category_id || null;
        if (tags !== undefined) resource.tags = tags;
        if (is_pinned !== undefined) resource.is_pinned = is_pinned;

        await resource.save();

        const full = await Resource.findByPk(resource.id, {
            include: [{ model: ResourceCategory, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }]
        });

        res.json(full);
    } catch (err) {
        console.error('updateResource error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        await resource.destroy();
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        console.error('deleteResource error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getResources,
    createResource,
    updateResource,
    deleteResource
};
