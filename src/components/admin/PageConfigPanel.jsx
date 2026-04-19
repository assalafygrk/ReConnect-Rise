import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, MessageSquare, FileText,
    MessageCircle, RotateCcw, Save, ChevronRight, ChevronDown,
    ToggleLeft, ToggleRight, Plus, Trash2, Info, Settings2,
    ImageUp, Type, RefreshCw, Building2
} from 'lucide-react';
import { usePageConfigAdmin } from '../../context/PageConfigContext';
import { getPageConfig, setPageConfig, resetPageConfig, resetAllPageConfigs, PAGE_DEFAULTS } from '../../api/pageConfig';
import { useBrand } from '../../context/BrandContext';

// ─── Page meta ──────────────────────────────────────────────────────────────
const PAGES = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#E8820C' },
    { id: 'contributions', label: 'Contributions', icon: ListChecks, color: '#10b981' },
    { id: 'disbursements', label: 'Disbursements', icon: Wallet, color: '#6366f1' },
    { id: 'loans', label: 'Loans', icon: HandCoins, color: '#f59e0b' },
    { id: 'members', label: 'Members', icon: Users, color: '#1A1A2E' },
    { id: 'votes', label: 'Votes', icon: Vote, color: '#8b5cf6' },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays, color: '#0ea5e9' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#14b8a6' },
    { id: 'advice', label: 'Advice Room', icon: MessageCircle, color: '#ec4899' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, color: '#f43f5e' },
    { id: 'requests', label: 'Requests', icon: FileQuestion, color: '#84cc16' },
    { id: 'documentary', label: 'Documentary', icon: FileText, color: '#64748b' },
    { id: 'login', label: 'Login Page', icon: Settings2, color: '#0284c7' },
    { id: 'register', label: 'Registration', icon: Settings2, color: '#7c3aed' },
    { id: 'id_card', label: 'ID Card', icon: Settings2, color: '#0f766e' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 flex items-center gap-2">
                {label}
                {hint && (
                    <span title={hint} className="cursor-help text-black/20 hover:text-black/40 transition-colors">
                        <Info size={11} />
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

function TextInput({ value, onChange, placeholder, multiline }) {
    const cls = "w-full bg-gray-50 border border-black/5 focus:border-[#E8820C]/30 rounded-2xl px-5 py-3.5 text-sm font-medium text-[#1A1A2E] outline-none transition-all focus:bg-white focus:shadow-sm resize-none";
    return multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function NumberInput({ value, onChange, min, max, prefix, suffix }) {
    return (
        <div className="flex items-center bg-gray-50 border border-black/5 focus-within:border-[#E8820C]/30 rounded-2xl overflow-hidden transition-all focus-within:bg-white focus-within:shadow-sm">
            {prefix && <span className="pl-5 text-sm text-black/30 font-bold shrink-0">{prefix}</span>}
            <input
                type="number" min={min} max={max}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 bg-transparent px-4 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none min-w-0"
            />
            {suffix && <span className="pr-5 text-sm text-black/30 font-bold shrink-0">{suffix}</span>}
        </div>
    );
}

function Toggle({ value, onChange, onLabel = 'Enabled', offLabel = 'Disabled' }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${value
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-gray-50 border-black/5 text-black/30'}`}
        >
            {value ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
            {value ? onLabel : offLabel}
        </button>
    );
}

function ListEditor({ items, onChange, placeholder }) {
    const add = () => onChange([...items, '']);
    const upd = (i, v) => onChange(items.map((x, idx) => idx === i ? v : x));
    const del = (i) => onChange(items.filter((_, idx) => idx !== i));
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                    <input
                        value={item}
                        onChange={e => upd(i, e.target.value)}
                        placeholder={placeholder || 'Enter item...'}
                        className="flex-1 bg-gray-50 border border-black/5 focus:border-[#E8820C]/30 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white transition-all"
                    />
                    <button type="button" onClick={() => del(i)} className="p-2.5 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button type="button" onClick={add}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#E8820C] hover:text-[#1A1A2E] transition-colors px-1 py-1">
                <Plus size={14} /> Add item
            </button>
        </div>
    );
}

// ─── Per-page config form ─────────────────────────────────────────────────────
function PageForm({ pageId, config, onChange }) {
    const set = (key, val) => onChange({ ...config, [key]: val });

    const text = (key, label, hint, multiline) => (
        <Field key={key} label={label} hint={hint}>
            <TextInput value={config[key] ?? ''} onChange={v => set(key, v)} multiline={multiline} />
        </Field>
    );
    const num = (key, label, hint, prefix, suffix, min = 0, max) => (
        <Field key={key} label={label} hint={hint}>
            <NumberInput value={config[key] ?? 0} onChange={v => set(key, v)} prefix={prefix} suffix={suffix} min={min} max={max} />
        </Field>
    );
    const toggle = (key, label, onL, offL) => (
        <Field key={key} label={label}>
            <Toggle value={!!config[key]} onChange={v => set(key, v)} onLabel={onL} offLabel={offL} />
        </Field>
    );
    const list = (key, label, hint, placeholder) => (
        <Field key={key} label={label} hint={hint}>
            <ListEditor items={config[key] ?? []} onChange={v => set(key, v)} placeholder={placeholder} />
        </Field>
    );

    const forms = {
        dashboard: () => (<>
            {text('heroGreeting', 'Hero Greeting', 'Big name greeting on the dashboard')}
            {text('heroBadgeText', 'Badge Label', 'Small badge above the title')}
            {text('heroSubtitle', 'Hero Subtitle', 'Paragraph beneath the greeting', true)}
            {num('savingsGoal', 'Community Savings Goal', 'Target pool balance', '₦', undefined, 1000)}
            {text('systemNoticeTitle', 'Notice Title', 'Bottom notification card title')}
            {text('systemNoticeBody', 'Notice Body', 'Bottom notification card description')}
            {list('strategyDirectives', 'Strategy Directives', 'Listed under goal tracker', 'Enter directive...')}
        </>),
        contributions: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {text('weekLabel', 'Week Label', 'Label for the contribution week column')}
            {text('reminderText', 'Reminder Text', 'Displayed to members as a contribution reminder', true)}
            {text('cycleLabel', 'Cycle Label', 'Short description of the contribution cycle')}
            {text('lateFeeNotice', 'Late Fee Notice', 'Shown when contributions are overdue', true)}
        </>),
        disbursements: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {text('approvalNotice', 'Approval Notice', 'Displayed as a requirement banner', true)}
            {num('maxDisburseAmount', 'Max Disbursement Limit', 'Maximum single disbursement', '₦', undefined, 0)}
        </>),
        loans: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {toggle('loansEnabled', 'Loan Module Status', 'Active', 'Suspended')}
            {num('maxLoanAmount', 'Maximum Loan Amount', undefined, '₦', undefined, 0)}
            {num('interestRate', 'Interest Rate', undefined, undefined, '%', 0, 100)}
            {text('repaymentPeriodLabel', 'Repayment Period Label')}
            {text('loanRulesNotice', 'Loan Rules Notice', 'Displayed prominently on the loans page', true)}
        </>),
        members: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {num('memberCap', 'Leadership-approved Member Cap', undefined, undefined, ' brothers', 1, 100)}
            {text('welcomeMessage', 'Welcome Message', 'Displayed on the members page header', true)}
            {text('inductionNote', 'Induction Note', 'Shown when adding new members', true)}
        </>),
        votes: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {num('quorumThreshold', 'Quorum Threshold', 'Minimum % of members required for a valid vote', undefined, '%', 1, 100)}
            {text('abstentionPolicy', 'Abstention Policy', 'Explain how abstentions are counted', true)}
        </>),
        meetings: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {text('platformName', 'Virtual Platform', 'e.g. Google Meet, Zoom')}
            {text('defaultVenue', 'Default Physical Venue')}
            {text('meetingNotice', 'Attendance Notice', 'Displayed on the meetings page', true)}
        </>),
        chat: () => (<>
            {text('channelName', 'Channel Name', 'Main chat channel display name')}
            {toggle('chatEnabled', 'Chat Status', 'Open', 'Locked')}
            {text('pinnedAnnouncement', 'Pinned Announcement', 'Pinned message at top of chat', true)}
        </>),
        advice: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {toggle('proposalsEnabled', 'Proposal Submission', 'Open', 'Locked')}
            {text('proposalRules', 'Proposal Rules Notice', 'Rules text shown when submitting', true)}
        </>),
        wallet: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {toggle('transfersEnabled', 'Wallet Transfers', 'Enabled', 'Disabled')}
            {text('minBalanceNotice', 'Minimum Balance Notice', undefined, true)}
            {text('transfersNotice', 'Transfers Notice', 'Shown next to the transfer button', true)}
        </>),
        requests: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {num('maxPendingPerMember', 'Max Pending Requests Per Member', undefined, undefined, ' max', 1, 20)}
            {list('customCategories', 'Request Categories', 'Custom support request categories', 'e.g. Medical Emergency')}
        </>),
        documentary: () => (<>
            {text('pageHeadline', 'Page Headline')}
            {text('pageSubtitle', 'Page Subtitle', undefined, true)}
            {text('archiveNotice', 'Archive Notice', 'Shown on the documentary page', true)}
        </>),

        login: () => (<>
            {text('pageHeadline', 'Hero Headline', 'Large text on the left side of login page', false)}
            {text('pageSubtitle', 'Hero Subtitle', 'Paragraph beneath the headline', true)}
            {text('badgeText', 'Security Badge Text', 'Small badge label above the headline')}
            {text('footerNote', 'Footer Divider Note', 'Text between the horizontal rules at the bottom')}
            {toggle('registrationEnabled', 'Show Registration Link', 'Visible', 'Hidden')}
            {text('registrationLinkText', 'Registration Link Label', 'Text of the link to register page')}
        </>),

        register: () => (<>
            {text('pageHeadline', 'Hero Headline', 'Large text on the left branding panel')}
            {text('pageSubtitle', 'Hero Subtitle', 'Paragraph beneath the headline', true)}
            {text('badgeText', 'Security Badge Text')}
            {text('step1Label', 'Step 1 Subtitle', 'Label shown under the form heading on step 1')}
            {text('step2Label', 'Step 2 Subtitle', 'Label shown under the form heading on step 2')}
            {toggle('registrationOpen', 'Registration Status', 'Open to new members', 'Closed')}
            {text('closedNotice', 'Registration Closed Notice', 'Shown when registration is closed', true)}
        </>),

        id_card: () => (<>
            {text('cardTitle', 'Card Title', 'Header label for the ID card section')}
            {text('departmentLabel', 'Department Label', 'The department field value printed on the card')}
            {toggle('showQrCode', 'Show QR Code', 'Visible', 'Hidden')}
            {num('validityYears', 'Card Validity (Years)', 'How many years before the card expires', undefined, ' yr(s)', 1, 10)}
            <Field label="Terms & Conditions" hint="Four lines printed on the back of the card">
                <div className="space-y-2">
                    {['termsLine1', 'termsLine2', 'termsLine3', 'termsLine4'].map((k, i) => (
                        <TextInput key={k} value={config[k] ?? ''} onChange={v => set(k, v)} placeholder={`Line ${i + 1}...`} />
                    ))}
                </div>
            </Field>
        </>),
    };

    const render = forms[pageId];
    if (!render) return <p className="text-sm text-black/30 italic">No configurable properties for this page.</p>;
    return <div className="space-y-6">{render()}</div>;
}

// ─── System Branding Panel ────────────────────────────────────────────────────
function BrandPanel() {
    const { brand, updateBrand, resetBrand } = useBrand();
    const [local, setLocal] = useState({ ...brand });
    const [dirty, setDirty] = useState(false);
    const logoInputRef = useRef(null);

    const set = (key, val) => { setLocal(prev => ({ ...prev, [key]: val })); setDirty(true); };

    const handleLogoFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { set('logoUrl', reader.result); };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        updateBrand(local);
        setDirty(false);
        toast.success('Brand settings saved — changes are now live system-wide!');
    };

    const handleReset = () => {
        resetBrand();
        setLocal({ orgName: 'ReConnect & Rise', orgSlogan: 'Empowering Communities', logoUrl: '/logo.svg' });
        setDirty(false);
        toast.success('Brand reset to defaults');
    };

    return (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#252545] rounded-[2rem] p-6 md:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8820C]/20 text-[#E8820C] flex items-center justify-center">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">System Branding</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Name, slogan & logo — changes apply everywhere</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white/60 hover:bg-white/10 transition-all">
                        <RefreshCw size={12} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!dirty}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${dirty ? 'bg-[#E8820C] text-white hover:-translate-y-0.5 shadow-lg' : 'bg-white/5 text-white/20 cursor-default'
                            }`}
                    >
                        <Save size={12} /> Save Brand
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="md:col-span-2 flex items-center gap-6">
                    <div
                        className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-[#E8820C]/50 transition-all"
                        onClick={() => logoInputRef.current?.click()}
                        title="Click to change logo"
                    >
                        {local.logoUrl ? (
                            <img src={local.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <ImageUp size={24} className="text-white/20" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold text-white/60">Organization Logo</p>
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8820C]/10 text-[#E8820C] text-[10px] font-black uppercase tracking-widest border border-[#E8820C]/20 hover:bg-[#E8820C]/20 transition-all"
                        >
                            <ImageUp size={14} /> Upload New Logo
                        </button>
                        <p className="text-[9px] text-white/20">PNG or SVG recommended. Will appear on ID cards, login page, and sidebar.</p>
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={handleLogoFile} />
                </div>

                {/* Org Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                        <Type size={11} /> Organization Name
                    </label>
                    <input
                        type="text"
                        value={local.orgName}
                        onChange={e => set('orgName', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E8820C]/40 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none transition-all focus:bg-white/10"
                        placeholder="e.g. ReConnect & Rise"
                    />
                </div>

                {/* Slogan */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                        <Type size={11} /> Tagline / Slogan
                    </label>
                    <input
                        type="text"
                        value={local.orgSlogan}
                        onChange={e => set('orgSlogan', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E8820C]/40 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none transition-all focus:bg-white/10"
                        placeholder="e.g. Empowering Communities"
                    />
                </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {local.logoUrl && <img src={local.logoUrl} alt="Preview" className="w-full h-full object-contain" />}
                </div>
                <div>
                    <p className="text-sm font-black text-white leading-tight">{local.orgName || 'Organization Name'}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{local.orgSlogan || 'Tagline'}</p>
                </div>
                <span className="ml-auto text-[9px] font-black text-white/20 uppercase tracking-widest">Live Preview</span>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PageConfigPanel() {
    const { resetAll, updatePageConfig } = usePageConfigAdmin();
    const [selectedPage, setSelectedPage] = useState(PAGES[0].id);
    const [localConfig, setLocalConfig] = useState(() => getPageConfig(PAGES[0].id));
    const [dirty, setDirty] = useState(false);

    const selectPage = (id) => {
        setSelectedPage(id);
        setLocalConfig(getPageConfig(id));
        setDirty(false);
    };

    const handleChange = (patch) => {
        setLocalConfig(patch);
        setDirty(true);
    };

    const handleSave = () => {
        setPageConfig(selectedPage, localConfig);
        updatePageConfig(selectedPage, localConfig);
        setDirty(false);
        toast.success(`${PAGES.find(p => p.id === selectedPage)?.label} config saved`);
    };

    const handleReset = () => {
        resetPageConfig(selectedPage);
        const fresh = getPageConfig(selectedPage);
        setLocalConfig(fresh);
        updatePageConfig(selectedPage, fresh);
        setDirty(false);
        toast.success('Page reset to defaults');
    };

    const handleResetAll = () => {
        resetAllPageConfigs();
        resetAll();
        const fresh = getPageConfig(selectedPage);
        setLocalConfig(fresh);
        setDirty(false);
        toast.success('All pages reset to factory defaults');
    };

    const meta = PAGES.find(p => p.id === selectedPage);

    return (
        <div className="space-y-6">
            {/* === BRAND SETTINGS === */}
            <BrandPanel />

            {/* === PAGE CONFIG SUBHEADER === */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E]/5 flex items-center justify-center">
                        <Settings2 size={20} className="text-[#1A1A2E]" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-[#1A1A2E]">Page Configuration</p>
                        <p className="text-[10px] text-black/30 font-medium uppercase tracking-widest">
                            Customize any page without touching code
                        </p>
                    </div>
                </div>
                <button onClick={handleResetAll}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-rose-600 transition-colors flex items-center gap-1">
                    <RotateCcw size={12} /> Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
                {/* Page Picker */}
                <div className="bg-gray-50/80 rounded-[2rem] p-3 border border-black/5 space-y-1 max-h-[600px] overflow-y-auto scrollbar-hide">
                    {PAGES.map(p => (
                        <button
                            key={p.id}
                            onClick={() => selectPage(p.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedPage === p.id
                                ? 'bg-white shadow-sm border border-black/5'
                                : 'hover:bg-white/60'}`}
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${p.color}15`, color: p.color }}>
                                <p.icon size={15} />
                            </div>
                            <span className={`text-[11px] font-black truncate ${selectedPage === p.id ? 'text-[#1A1A2E]' : 'text-black/40'}`}>
                                {p.label}
                            </span>
                            {selectedPage === p.id && (
                                <ChevronRight size={14} className="ml-auto text-[#E8820C] shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Config Editor */}
                <div className="bg-white rounded-[2rem] border border-black/5 overflow-hidden">
                    {/* Page editor header */}
                    <div className="flex items-center justify-between p-6 border-b border-black/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: `${meta?.color}15`, color: meta?.color }}>
                                {meta && <meta.icon size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#1A1A2E]">{meta?.label}</p>
                                {dirty && (
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#E8820C]">
                                        Unsaved changes
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleReset}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-black/60 hover:bg-gray-100 transition-all border border-black/5">
                                <RotateCcw size={12} /> Reset
                            </button>
                            <button onClick={handleSave}
                                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${dirty
                                    ? 'bg-[#1A1A2E] text-white shadow-lg hover:-translate-y-0.5'
                                    : 'bg-gray-50 text-black/20 border border-black/5 cursor-default'}`}
                                disabled={!dirty}>
                                <Save size={12} /> Save
                            </button>
                        </div>
                    </div>
                    {/* Scrollable form area */}
                    <div className="p-6 max-h-[520px] overflow-y-auto scrollbar-hide">
                        <PageForm
                            pageId={selectedPage}
                            config={localConfig}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
