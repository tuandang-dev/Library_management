const ActivityLog = require('../models/ActivityLog');

const CATEGORY_CONFIG = {
    authentication: {
        label: 'Authentication',
        icon: 'fa-key',
    },
    books: {
        label: 'Book Management',
        icon: 'fa-book',
    },
    users: {
        label: 'User Management',
        icon: 'fa-user',
    },
    attendance: {
        label: 'Attendance',
        icon: 'fa-qrcode',
    },
    system: {
        label: 'System',
        icon: 'fa-database',
    },
};

/**
 * @param {Object} params
 * @param {string} params.action
 * @param {'authentication'|'books'|'users'|'attendance'|'system'} params.category
 * @param {string} [params.description]
 * @param {Object} [params.user]
 * @param {string} [params.actorName]
 * @param {string} [params.actorRole]
 * @param {string} [params.categoryLabel]
 * @param {string} [params.icon]
 * @param {Date} [params.createdAt]
 */
async function logActivity({
    action,
    category = 'system',
    description = '',
    user = null,
    actorName = null,
    actorRole = null,
    categoryLabel = null,
    icon = null,
    createdAt = null,
}) {
    try {
        const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.system;

        let resolvedName = 'System';
        let resolvedRole = 'System';
        let resolvedUserId = null;

        if (user) {
            resolvedUserId = user._id || user.id || null;
            resolvedName = user.fullname || user.name || 'Unknown User';

            if (actorRole) {
                resolvedRole = actorRole;
            } else if (user.role === 'admin') {
                resolvedRole = 'Admin';
            } else {
                resolvedRole = 'Student';
            }
        } else if (actorName) {
            resolvedName = actorName;
            resolvedRole = actorRole || 'System';
        }

        const logEntry = new ActivityLog({
            action: action.trim(),
            category,
            categoryLabel: categoryLabel || config.label,
            description: description.trim(),
            userId: resolvedUserId,
            actor: {
                name: resolvedName,
                role: resolvedRole,
            },
            icon: icon || config.icon,
            ...(createdAt ? { createdAt } : {}),
        });

        await logEntry.save();
        return logEntry;
    } catch (error) {
        console.error(' [loggerHelper] Không thể ghi nhận Activity Log:', error.message);
        return null;
    }
}

async function seedSampleLogs() {
    try {
        const count = await ActivityLog.countDocuments();
        if (count > 0) {
            console.log(`ℹ️ [loggerHelper] ActivityLog đã có ${count} bản ghi. Bỏ qua nạp dữ liệu mẫu.`);
            return;
        }

        console.log('⏳ [loggerHelper] Bắt đầu khởi tạo 4 bản ghi nhật ký mẫu theo ảnh thiết kế...');

        const baseDate = new Date();
        const setSampleTime = (hours, minutes) => {
            const d = new Date(baseDate);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const sampleEntries = [
            {
                action: 'Book Borrowed',
                category: 'books',
                categoryLabel: 'Book Management',
                description: 'Student Alex Johnson borrowed "Introduction to Computer Science"',
                actorName: 'Sarah Chen',
                actorRole: 'Librarian',
                icon: 'fa-book',
                createdAt: setSampleTime(14, 30),
            },
            {
                action: 'User Created',
                category: 'users',
                categoryLabel: 'User Management',
                description: 'Created new student account for Emma Wilson',
                actorName: 'John Anderson',
                actorRole: 'Admin',
                icon: 'fa-user',
                createdAt: setSampleTime(14, 15),
            },
            {
                action: 'Login',
                category: 'authentication',
                categoryLabel: 'Authentication',
                description: 'Successful login to student dashboard',
                actorName: 'Alex Johnson',
                actorRole: 'Student',
                icon: 'fa-key',
                createdAt: setSampleTime(13, 45),
            },
            {
                action: 'Backup Completed',
                category: 'system',
                categoryLabel: 'System',
                description: 'Daily database backup completed successfully',
                actorName: 'System',
                actorRole: 'System',
                icon: 'fa-database',
                createdAt: setSampleTime(13, 30),
            },
        ];

        for (const item of sampleEntries) {
            await logActivity(item);
        }

        console.log(' [loggerHelper] Nạp thành công 4 bản ghi mẫu Activity Log!');
    } catch (error) {
        console.error('❌ [loggerHelper] Lỗi khi nạp dữ liệu mẫu:', error.message);
    }
}

module.exports = {
    logActivity,
    seedSampleLogs,
};