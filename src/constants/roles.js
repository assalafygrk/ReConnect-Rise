export const ROLES = {
    ADMIN: 'admin',
    GROUP_LEADER: 'group_leader',
    TREASURER: 'treasurer',
    WELFARE: 'welfare',
    SPECIAL_ADVISOR: 'special_advisor',
    MEETING_ORGANIZER: 'meeting_organizer',
    OFFICIAL_MEMBER: 'official_member',
    MEMBER: 'member',
};

export const ROLE_CLASSES = {
    [ROLES.ADMIN]: { class: 'Super', label: 'Admin' },
    [ROLES.GROUP_LEADER]: { class: 'Class A', label: 'Group Leader' },
    [ROLES.TREASURER]: { class: 'Class B', label: 'Treasurer' },
    [ROLES.SPECIAL_ADVISOR]: { class: 'Class C Upper', label: 'Special Advisor' },
    [ROLES.WELFARE]: { class: 'Class C Lower', label: 'Welfare' },
    [ROLES.MEETING_ORGANIZER]: { class: 'Class C Lower', label: 'Meeting Organizer' },
    [ROLES.OFFICIAL_MEMBER]: { class: 'Class D', label: 'Official Member' },
    [ROLES.MEMBER]: { class: 'Class E', label: 'Member' },
};

export const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 100,
    [ROLES.GROUP_LEADER]: 80,
    [ROLES.TREASURER]: 70,
    [ROLES.SPECIAL_ADVISOR]: 60,
    [ROLES.WELFARE]: 50,
    [ROLES.MEETING_ORGANIZER]: 50,
    [ROLES.OFFICIAL_MEMBER]: 40,
    [ROLES.MEMBER]: 30,
};
