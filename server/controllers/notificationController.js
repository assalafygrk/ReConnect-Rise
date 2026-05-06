const Notification = require('../models/Notification');

// @desc    Get notifications for the current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    // Prefer role from header (for mock role switching)
    const role = req.headers['x-active-role'] || req.user.role;

    // Role aliases to handle variations like 'groupleader' vs 'group_leader'
    const roleAliases = {
      'group_leader': ['group_leader'],
      'special_advicer': ['special_advicer'],
      'official_member': ['official_member'],
      'welfare': ['welfare'],
    };

    const rolesToSearch = roleAliases[role] || [role];
    
    // Admins and Super Admins should see notifications for all management roles
    if (role === 'admin' || role === 'super_admin') {
      rolesToSearch.push(
        'admin', 'super_admin', 
        'group_leader', 
        'treasurer', 
        'welfare',
        'special_advicer'
      );
    }

    // Find notifications that:
    // 1. Are directed to this user
    // 2. Are directed to this user's role (or aliases)
    // 3. Are global
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { role: { $in: rolesToSearch } },
        { isGlobal: true }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Filter out notifications that the user has already read
    // Or we can return all and let the frontend handle the 'read' status
    // For role-based/global, we track reading per user.
    
    const notificationsWithReadStatus = notifications.map(notif => {
      const isRead = notif.readBy.includes(userId);
      return {
        ...notif.toObject(),
        read: isRead
      };
    });

    res.json(notificationsWithReadStatus);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Add user to readBy if not already there
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

// @desc    Clear all notifications (mark all as read)
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.readAll = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.headers['x-active-role'] || req.user.role;

    // Find all notifications for this user/role that haven't been read
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { role: role },
        { isGlobal: true }
      ],
      readBy: { $ne: userId }
    });

    // Update each notification
    await Promise.all(notifications.map(notif => {
      notif.readBy.push(userId);
      return notif.save();
    }));

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Read all error:', error);
    res.status(500).json({ message: 'Server error marking all notifications as read' });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
exports.sendNotification = async (req, res) => {
  try {
    const { recipient, role, title, message, type, link, isGlobal } = req.body;
    const senderRole = req.user.role;

    // Security check: Only certain roles can send notifications to others
    const allowedSenders = ['admin', 'super_admin', 'treasurer', 'group_leader', 'general_secretary', 'welfare_officer'];
    
    if (!allowedSenders.includes(senderRole) && !isGlobal === false) {
       // Regular members might only be able to notify admins or specific people
       // For now, let's restrict to allowedSenders for simplicity and security
       return res.status(403).json({ message: 'You are not authorized to send notifications' });
    }

    const notification = new Notification({
      recipient,
      role,
      title,
      message,
      type: type || 'info',
      link,
      isGlobal: isGlobal || false,
      sender: req.user._id // Add sender for tracking
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error creating notification' });
  }
};

// Internal utility to create notifications
exports.createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

