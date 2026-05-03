export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    GROUP_LEADER: 'groupleader',
    TREASURER: 'treasurer',
    WELFARE: 'welfare',
    SPECIAL_ADVISOR: 'special-advisor',
    MEETING_ORGANIZER: 'meeting-organizer',
    OFFICIAL_MEMBER: 'official-member',
    MEMBER: 'member',
};

import { 
    Crown, ShieldCheck, Shield, Star, Activity, UserCircle, 
    Landmark, Scale, HeartHandshake, Zap
} from 'lucide-react';

export const ROLE_CLASSES = {
    [ROLES.SUPER_ADMIN]: { class: 'Supreme', label: 'Super Admin', icon: Crown, color: '#E8820C' },
    [ROLES.ADMIN]: { class: 'Super', label: 'Admin', icon: ShieldCheck, color: '#3B82F6' },
    [ROLES.GROUP_LEADER]: { class: 'Class A', label: 'Group Leader', icon: Crown, color: '#F5A623' },
    [ROLES.TREASURER]: { class: 'Class B', label: 'Treasurer', icon: ShieldCheck, color: '#10B981' },
    [ROLES.SPECIAL_ADVISOR]: { class: 'Class C Upper', label: 'Special Advisor', icon: Star, color: '#8B5CF6' },
    [ROLES.WELFARE]: { class: 'Class C Lower', label: 'Welfare', icon: Shield, color: '#14B8A6' },
    [ROLES.MEETING_ORGANIZER]: { class: 'Class C Lower', label: 'Meeting Organizer', icon: Activity, color: '#F43F5E' },
    [ROLES.OFFICIAL_MEMBER]: { class: 'Class D', label: 'Official Member', icon: UserCircle, color: '#6B7280' },
    [ROLES.MEMBER]: { class: 'Class E', label: 'Member', icon: UserCircle, color: '#9CA3AF' },
};

export const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 999,
    [ROLES.ADMIN]: 100,
    [ROLES.GROUP_LEADER]: 80,
    [ROLES.TREASURER]: 70,
    [ROLES.SPECIAL_ADVISOR]: 60,
    [ROLES.WELFARE]: 50,
    [ROLES.MEETING_ORGANIZER]: 50,
    [ROLES.OFFICIAL_MEMBER]: 40,
    [ROLES.MEMBER]: 30,
};

