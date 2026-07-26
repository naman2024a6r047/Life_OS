const { WorkoutPlan, Exercise, TransformationCheckpoint } = require('../models');

exports.getWeeklyPlan = async (req, res) => {
    try {
        const plans = await WorkoutPlan.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Exercise, as: 'exercises' }],
            order: [['day_of_week', 'ASC']]
        });
        res.status(200).json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching workout plans' });
    }
};

exports.createWorkoutPlan = async (req, res) => {
    try {
        const { day_of_week, muscle_group, exercises } = req.body;

        const plan = await WorkoutPlan.create({
            user_id: req.user.id,
            day_of_week,
            muscle_group
        });

        if (exercises && exercises.length > 0) {
            const exerciseRecords = exercises.map(ex => ({
                workout_plan_id: plan.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                target_weight: ex.target_weight
            }));
            await Exercise.bulkCreate(exerciseRecords);
        }

        res.status(201).json(plan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating workout plan' });
    }
};

exports.toggleExercise = async (req, res) => {
    try {
        const { exercise_id } = req.params;
        const exercise = await Exercise.findByPk(exercise_id, {
            include: [{ model: WorkoutPlan }]
        });

        if (!exercise || exercise.WorkoutPlan.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        exercise.is_completed = !exercise.is_completed;
        await exercise.save();

        res.status(200).json(exercise);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling exercise' });
    }
};

exports.addExercise = async (req, res) => {
    try {
        const { workout_plan_id, name, sets, reps, target_weight, rest_time_seconds, notes } = req.body;
        if (!workout_plan_id || !name) {
            return res.status(400).json({ message: 'Workout plan ID and exercise name are required' });
        }

        const exercise = await Exercise.create({
            workout_plan_id,
            name,
            sets: sets || 3,
            reps: reps || 10,
            target_weight: target_weight || 0,
            rest_time_seconds: rest_time_seconds || 60,
            notes: notes || '',
            is_completed: false
        });

        res.status(201).json(exercise);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding exercise' });
    }
};

exports.deleteExercise = async (req, res) => {
    try {
        const { exercise_id } = req.params;
        const exercise = await Exercise.findByPk(exercise_id);
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
        await exercise.destroy();
        res.status(200).json({ message: 'Exercise deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting exercise' });
    }
};

exports.deleteWorkoutPlan = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const plan = await WorkoutPlan.findOne({ where: { id: plan_id, user_id: req.user.id } });
        if (!plan) return res.status(404).json({ message: 'Workout plan not found' });
        await Exercise.destroy({ where: { workout_plan_id: plan_id } });
        await plan.destroy();
        res.status(200).json({ message: 'Workout plan reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting workout plan' });
    }
};

exports.getCheckpoints = async (req, res) => {
    try {
        const checkpoints = await TransformationCheckpoint.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(checkpoints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching checkpoints' });
    }
};

exports.createCheckpoint = async (req, res) => {
    try {
        const { 
            weight_kg, body_fat_pct, waist_cm, chest_cm, arms_cm, 
            muscle_mass_kg, bmi, body_water_pct, visceral_fat, 
            measurements, health_metrics,
            photo_front_url, photo_left_url, photo_right_url, photo_back_url, notes 
        } = req.body;
        
        if (!weight_kg) {
            return res.status(400).json({ message: 'Body weight is required' });
        }

        const today = new Date().toISOString().split('T')[0];
        let cp = await TransformationCheckpoint.findOne({
            where: { user_id: req.user.id, date: today }
        });

        if (cp) {
            // Update existing checkpoint for today
            cp.weight_kg = weight_kg;
            if (body_fat_pct !== undefined) cp.body_fat_pct = body_fat_pct;
            if (waist_cm !== undefined) cp.waist_cm = waist_cm;
            if (chest_cm !== undefined) cp.chest_cm = chest_cm;
            if (arms_cm !== undefined) cp.arms_cm = arms_cm;
            if (muscle_mass_kg !== undefined) cp.muscle_mass_kg = muscle_mass_kg;
            if (bmi !== undefined) cp.bmi = bmi;
            if (body_water_pct !== undefined) cp.body_water_pct = body_water_pct;
            if (visceral_fat !== undefined) cp.visceral_fat = visceral_fat;
            if (measurements !== undefined) cp.measurements = measurements;
            if (health_metrics !== undefined) cp.health_metrics = health_metrics;
            if (photo_front_url !== undefined) cp.photo_front_url = photo_front_url;
            if (photo_left_url !== undefined) cp.photo_left_url = photo_left_url;
            if (photo_right_url !== undefined) cp.photo_right_url = photo_right_url;
            if (photo_back_url !== undefined) cp.photo_back_url = photo_back_url;
            if (notes !== undefined) cp.notes = notes;
            
            await cp.save();
            return res.status(200).json(cp);
        } else {
            // Create new checkpoint
            const count = await TransformationCheckpoint.count({ where: { user_id: req.user.id } });
            cp = await TransformationCheckpoint.create({
                user_id: req.user.id,
                checkpoint_number: count + 1,
                date: today,
                weight_kg,
                body_fat_pct: body_fat_pct || null,
                waist_cm: waist_cm || null,
                chest_cm: chest_cm || null,
                arms_cm: arms_cm || null,
                muscle_mass_kg: muscle_mass_kg || null,
                bmi: bmi || null,
                body_water_pct: body_water_pct || null,
                visceral_fat: visceral_fat || null,
                measurements: measurements || {},
                health_metrics: health_metrics || {},
                photo_front_url: photo_front_url || null,
                photo_left_url: photo_left_url || null,
                photo_right_url: photo_right_url || null,
                photo_back_url: photo_back_url || null,
                notes: notes || ''
            });
            return res.status(201).json(cp);
        }
    } catch (error) {
        console.error('Create/Update checkpoint error:', error);
        res.status(500).json({ message: 'Error saving checkpoint' });
    }
};
