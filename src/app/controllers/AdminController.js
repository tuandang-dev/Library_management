class AdminController {
    // [GET] /admin/dashboard
    async dashboard(req, res) {
        try {
            const metrics = {
                totalUsers: {
                    value: '234',
                    growth: '+12 this month',
                },
                activeBooks: {
                    value: '1,247',
                    availability: '89% available',
                },
                dailyVisitors: {
                    value: '47',
                    timeLabel: 'Today',
                },
            };

            const topVisitorsChart = {
                labels: ['Alex Johnson', 'Maria Garcia', 'David Wilson', 'Emma Davis', 'Michael Brown'],
                data: [24, 21, 20, 18, 16],
            };

            const weeklyActivityChart = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                visitors: [48, 52, 48, 64, 58, 38, 24],
                borrowed: [12, 18, 15, 22, 19, 8, 4],
            };

            res.render('admin/dashboard', {
                layout: 'user',
                title: 'UCC Library - Admin Portal',
                isAdminPortal: true,
                isAdmin: true,
                isHomePage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                topVisitorsJson: JSON.stringify(topVisitorsChart),
                weeklyActivityJson: JSON.stringify(weeklyActivityChart),
            });
        } catch (error) {
            console.error('Lỗi tải Admin Dashboard:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải bảng điều khiển quản trị.',
            });
        }
    }
}

module.exports = new AdminController();