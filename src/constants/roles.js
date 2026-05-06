export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    GROUP_LEADER: 'group_leader',
    TREASURER: 'treasurer',
    WELFARE: 'welfare',
    SPECIAL_ADVISER: 'special_advicer',
    OFFICIAL_MEMBER: 'official_member',
    MEMBER: 'member',
};

import { 
    Crown, ShieldCheck, Shield, Star, Activity, UserCircle, 
    Landmark, Scale, HeartHandshake, Zap, ShieldAlert
} from 'lucide-react';

export const ROLE_CLASSES = {
    [ROLES.SUPER_ADMIN]: { class: 'Supreme', label: 'Super Admin', icon: Crown, color: '#E8820C', protectIdentity: true },
    [ROLES.ADMIN]: { class: 'High Council', label: 'Admin', icon: ShieldCheck, color: '#E8820C' },
    [ROLES.GROUP_LEADER]: { class: 'Class A', label: 'Group Leader', icon: Crown, color: '#F5A623' },
    [ROLES.TREASURER]: { class: 'Class B', label: 'Treasurer', icon: Landmark, color: '#10B981' },
    [ROLES.WELFARE]: { class: 'Class C', label: 'Welfare', icon: HeartHandshake, color: '#14B8A6' },
    [ROLES.SPECIAL_ADVISER]: { class: 'Class C Upper', label: 'Special Advicer', icon: Star, color: '#8B5CF6' },
    [ROLES.OFFICIAL_MEMBER]: { class: 'Class D', label: 'Official Member', icon: UserCircle, color: '#6B7280' },
    [ROLES.MEMBER]: { class: 'Class E', label: 'Member', icon: UserCircle, color: '#9CA3AF' },
};

export const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 999,
    [ROLES.ADMIN]: 90,
    [ROLES.GROUP_LEADER]: 80,
    [ROLES.TREASURER]: 70,
    [ROLES.WELFARE]: 60,
    [ROLES.SPECIAL_ADVISER]: 50,
    [ROLES.OFFICIAL_MEMBER]: 40,
    [ROLES.MEMBER]: 30,
};

export const OFFICIAL_ROLES = [
    ROLES.GROUP_LEADER,
    ROLES.TREASURER,
    ROLES.WELFARE,
    ROLES.SPECIAL_ADVISER,
    ROLES.OFFICIAL_MEMBER
];

export const SYSTEM_NAME = "ReConnect & Rise System";
export const SYSTEM_AVATAR = "/system-avatar.png"; // We should generate this or use a default


