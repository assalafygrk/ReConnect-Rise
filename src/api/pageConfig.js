const BASE_URL = import.meta.env.VITE_API_URL;

export const PAGE_DEFAULTS = {
    dashboard: {
        heroGreeting: 'Ahlan wa Sahlan',
        heroBadgeText: 'Secure Executive Portal',
        heroSubtitle: 'Welcome to the Brotherhood Ledger. Your executive dashboard provides real-time oversight of treasury operations and community growth.',
        savingsGoal: 250000,
        systemNoticeTitle: 'Audit Report Ready',
        systemNoticeBody: 'Weekly treasury consolidation file generated.',
        strategyDirectives: [
            'Incentivize bulk quarterly contributions',
            'Transition to automated weekly direct debit',
            'Increase membership cap by 15%',
        ],
    },
    contributions: {
        pageHeadline: 'Contribution Ledger',
        pageSubtitle: 'Track and manage all weekly brother contributions.',
        weekLabel: 'Week',
        reminderText: 'Kindly ensure all contributions are submitted before end of Thursday.',
        cycleLabel: '7-day contribution cycle',
        lateFeeNotice: 'Late submissions are subject to a ₦200 administrative fee.',
    },
    disbursements: {
        pageHeadline: 'Asset Distribution Engine',
        pageSubtitle: 'Manage and audit all brotherhood disbursements.',
        approvalNotice: 'All disbursements require dual-authorization from Treasurer and Group Leader.',
        maxDisburseAmount: 500000,
        disbursementsEnabled: true,
    },
    loans: {
        pageHeadline: 'Credit & Leverage Gateway',
        pageSubtitle: 'Apply and manage brotherhood loan accounts.',
        maxLoanAmount: 200000,
        interestRate: 5,
        repaymentPeriodLabel: '6-month repayment cycle',
        loanRulesNotice: 'Loans are subject to approval by the executive committee. Misuse of credit may result in membership suspension.',
        loansEnabled: true,
    },
    members: {
        pageHeadline: 'Brotherhood Registry',
        pageSubtitle: 'The sovereign identity ledger of all brothers.',
        memberCapLabel: 'Maximum membership capacity',
        memberCap: 20,
        welcomeMessage: 'Each member of this brotherhood has taken an oath of commitment, integrity and mutual prosperity.',
        inductionNote: 'New members must be sponsored and vouched for by at least two existing members.',
    },
    votes: {
        pageHeadline: 'Governance Ballot',
        pageSubtitle: 'Democratic decision-making for the brotherhood.',
        quorumThreshold: 51,
        quorumLabel: 'Minimum quorum required for a valid vote',
        abstentionPolicy: 'Abstentions count towards quorum but not towards the majority.',
    },
    meetings: {
        pageHeadline: 'Summit Schedule',
        pageSubtitle: 'Official brotherhood assembly records.',
        platformName: 'Google Meet',
        defaultVenue: 'Brotherhood Hall, Abuja',
        meetingNotice: 'Attendance is compulsory. Notify the Group Leader at least 24 hours in advance if you cannot attend.',
    },
    chat: {
        channelName: 'Brotherhood General',
        pinnedAnnouncement: 'Welcome brothers. This channel is a sacred space — keep all discourse respectful and productive.',
        chatEnabled: true,
    },
    advice: {
        pageHeadline: 'Strategic Consensus',
        pageSubtitle: 'The Consultative Oracle — a space for institutional wisdom.',
        proposalRules: 'All proposals must be constructive, evidence-based and aligned with the brotherhood\'s core objectives.',
        proposalsEnabled: true,
    },
    wallet: {
        pageHeadline: 'Personal Vault',
        pageSubtitle: 'Your personal financial account within the brotherhood.',
        minBalanceNotice: 'Maintain a minimum balance of ₦500 to keep your wallet active.',
        transfersEnabled: true,
        transfersNotice: 'Wallet-to-wallet transfers are available to all active members.',
    },
    requests: {
        pageHeadline: 'Resource Petitions',
        pageSubtitle: 'Submit and track financial support requests.',
        maxPendingPerMember: 2,
        maxPendingNotice: 'Each member may have a maximum of {{max}} active pending requests at any time.',
        customCategories: ['Medical Emergency', 'Business Support', 'Education Aid', 'Home Repair', 'Welfare'],
    },
    documentary: {
        pageHeadline: 'Brotherhood Documentary',
        pageSubtitle: 'The sacred archive of our collective journey.',
        archiveNotice: 'This documentary archive is a record of our brotherhood\'s history, decisions and milestones.',
    },
    login: {
        pageHeadline: 'Unity, Growth & Support.',
        pageSubtitle: 'A private space for brothers to manage contributions, support one another, and grow together.',
        badgeText: 'Secured Brotherhood Portal',
        footerNote: 'Authorized members only',
        registrationEnabled: true,
        registrationLinkText: 'Register as a new user',
    },
    register: {
        pageHeadline: 'Join the Brotherhood.',
        pageSubtitle: 'Register your identity to access our shared vault, participate in decisions, and grow with the brotherhood.',
        badgeText: 'Secured Brotherhood Portal',
        step1Label: 'Primary Identity',
        step2Label: 'Authenticate Identity',
        registrationOpen: true,
        closedNotice: 'Registration is currently closed. Contact the Group Leader to request access.',
    },
    id_card: {
        cardTitle: 'Member Identification Card',
        departmentLabel: 'Member',
        termsLine1: 'This card is the property of the organization.',
        termsLine2: 'It must be presented upon request by authorized personnel.',
        termsLine3: 'If found, please return to any main office.',
        termsLine4: 'Loss of this card must be reported immediately to management.',
        validityYears: 1,
        showQrCode: true,
    },
};

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchAllPageConfigs() {
    try {
        const res = await fetch(`${BASE_URL}/page-configs`);
        if (!res.ok) throw new Error('Failed to load configs');
        const overrides = await res.json();
        
        const merged = {};
        Object.keys(PAGE_DEFAULTS).forEach(id => {
            merged[id] = { ...PAGE_DEFAULTS[id], ...(overrides[id] || {}) };
        });
        return merged;
    } catch {
        return PAGE_DEFAULTS;
    }
}

export async function setPageConfig(pageId, patch) {
    const res = await fetch(`${BASE_URL}/page-configs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pageId, config: patch }),
    });
    if (!res.ok) throw new Error('Failed to update config');
    return await res.json();
}

// Helper for single page (legacy support if needed)
export async function getPageConfig(pageId) {
    const all = await fetchAllPageConfigs();
    return all[pageId] || PAGE_DEFAULTS[pageId];
}

export async function resetPageConfig(pageId) {
    const res = await fetch(`${BASE_URL}/page-configs/reset/${pageId}`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset config');
    return await res.json();
}

export async function resetAllPageConfigs() {
    const res = await fetch(`${BASE_URL}/page-configs/reset-all`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset configs');
    return await res.json();
}
