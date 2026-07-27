const User = require('./User');
const Challenge = require('./Challenge');
const Milestone = require('./Milestone');
const MilestoneTask = require('./MilestoneTask');
const Friend = require('./Friend');
const ApprovalRequest = require('./ApprovalRequest');
const Review = require('./Review');

// Exam Mode Models
const ExamSession = require('./ExamSession');
const ActivityPauseState = require('./ActivityPauseState');
const ExamSubject = require('./ExamSubject');
const ExamTopic = require('./ExamTopic');
const StudyLog = require('./StudyLog');
const MockTest = require('./MockTest');

const WorkoutPlan = require('./WorkoutPlan');
const Exercise = require('./Exercise');
const CodingProfile = require('./CodingProfile');
const Skill = require('./Skill');
const ActivityLog = require('./ActivityLog');
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');
const PartnerIntervention = require('./PartnerIntervention');
const Penalty = require('./Penalty');
const sequelize = require('../config/db');

// User & Penalty
User.hasMany(Penalty, { foreignKey: 'user_id' });
Penalty.belongsTo(User, { foreignKey: 'user_id' });

// User & Challenge
User.hasMany(Challenge, { foreignKey: 'user_id' });
Challenge.belongsTo(User, { foreignKey: 'user_id' });

// Challenge & Milestone
Challenge.hasMany(Milestone, { foreignKey: 'challenge_id', as: 'milestones' });
Milestone.belongsTo(Challenge, { foreignKey: 'challenge_id' });

// Milestone & Task
Milestone.hasMany(MilestoneTask, { foreignKey: 'milestone_id', as: 'tasks' });
MilestoneTask.belongsTo(Milestone, { foreignKey: 'milestone_id' });

// User & Friends
User.hasMany(Friend, { foreignKey: 'user_id', as: 'sentRequests' });
User.hasMany(Friend, { foreignKey: 'friend_id', as: 'receivedRequests' });
Friend.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
Friend.belongsTo(User, { foreignKey: 'friend_id', as: 'recipient' });

// Approval Requests
Milestone.hasOne(ApprovalRequest, { foreignKey: 'milestone_id' });
ApprovalRequest.belongsTo(Milestone, { foreignKey: 'milestone_id' });

ApprovalRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
ApprovalRequest.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

// Reviews
ApprovalRequest.hasOne(Review, { foreignKey: 'approval_request_id' });
Review.belongsTo(ApprovalRequest, { foreignKey: 'approval_request_id' });
Review.belongsTo(User, { foreignKey: 'reviewer_id' });

// Exams
User.hasMany(ExamSession, { foreignKey: 'user_id' });
ExamSession.belongsTo(User, { foreignKey: 'user_id' });

ExamSession.hasMany(ExamSubject, { foreignKey: 'exam_session_id', as: 'subjects' });
ExamSubject.belongsTo(ExamSession, { foreignKey: 'exam_session_id' });

ExamSubject.hasMany(ExamTopic, { foreignKey: 'subject_id', as: 'topics' });
ExamTopic.belongsTo(ExamSubject, { foreignKey: 'subject_id' });

ExamSession.hasMany(StudyLog, { foreignKey: 'exam_session_id', as: 'studyLogs' });
StudyLog.belongsTo(ExamSession, { foreignKey: 'exam_session_id' });
ExamSubject.hasMany(StudyLog, { foreignKey: 'subject_id' });
StudyLog.belongsTo(ExamSubject, { foreignKey: 'subject_id', as: 'Subject' });

ExamSession.hasMany(MockTest, { foreignKey: 'exam_session_id', as: 'mockTests' });
MockTest.belongsTo(ExamSession, { foreignKey: 'exam_session_id' });

// Pause States
ExamSession.hasMany(ActivityPauseState, { foreignKey: 'exam_session_id' });
ActivityPauseState.belongsTo(ExamSession, { foreignKey: 'exam_session_id' });
User.hasMany(ActivityPauseState, { foreignKey: 'user_id' });
ActivityPauseState.belongsTo(User, { foreignKey: 'user_id' });


// Fitness
User.hasMany(WorkoutPlan, { foreignKey: 'user_id', as: 'workoutPlans' });
WorkoutPlan.belongsTo(User, { foreignKey: 'user_id' });

WorkoutPlan.hasMany(Exercise, { foreignKey: 'workout_plan_id', as: 'exercises' });
Exercise.belongsTo(WorkoutPlan, { foreignKey: 'workout_plan_id' });

// Developer
User.hasOne(CodingProfile, { foreignKey: 'user_id' });
CodingProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Skill, { foreignKey: 'user_id', as: 'skills' });
Skill.belongsTo(User, { foreignKey: 'user_id' });

// Analytics & Gamification
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'user_id' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id' });

// Partner Interventions & Accountability Penalties
User.hasMany(PartnerIntervention, { foreignKey: 'sender_id', as: 'sentInterventions' });
User.hasMany(PartnerIntervention, { foreignKey: 'receiver_id', as: 'receivedInterventions' });
PartnerIntervention.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
PartnerIntervention.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

const DailyReflection = require('./DailyReflection');
const TaskAttachment = require('./TaskAttachment');
const TransformationCheckpoint = require('./TransformationCheckpoint');

// Daily Reflection & Attachments Relationships
User.hasMany(DailyReflection, { foreignKey: 'user_id', as: 'reflections' });
DailyReflection.belongsTo(User, { foreignKey: 'user_id' });
Milestone.hasMany(DailyReflection, { foreignKey: 'milestone_id', as: 'reflections' });
DailyReflection.belongsTo(Milestone, { foreignKey: 'milestone_id' });

MilestoneTask.hasMany(TaskAttachment, { foreignKey: 'task_id', as: 'attachments' });
TaskAttachment.belongsTo(MilestoneTask, { foreignKey: 'task_id' });

User.hasMany(TransformationCheckpoint, { foreignKey: 'user_id', as: 'checkpoints' });
TransformationCheckpoint.belongsTo(User, { foreignKey: 'user_id' });

// Chat Messages
const ChatMessage = require('./ChatMessage');
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(ChatMessage, { foreignKey: 'receiver_id', as: 'receivedMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

module.exports = {
    sequelize,
    User,
    Challenge,
    Milestone,
    MilestoneTask,
    Friend,
    ApprovalRequest,
    Review,
    ExamSession,
    ActivityPauseState,
    ExamSubject,
    ExamTopic,
    StudyLog,
    MockTest,
    WorkoutPlan,
    Exercise,
    CodingProfile,
    Skill,
    ActivityLog,
    Badge,
    UserBadge,
    PartnerIntervention,
    DailyReflection,
    TaskAttachment,
    TransformationCheckpoint,
    Penalty,
    ChatMessage
};
