import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { fetchDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import SuperAdminDash from '../components/dashboard/SuperAdminDash';
import TreasurerDash from '../components/dashboard/TreasurerDash';
import GroupLeaderDash from '../components/dashboard/GroupLeaderDash';
import WelfareDash from '../components/dashboard/WelfareDash';
import AdvisorDash from '../components/dashboard/AdvisorDash';
import MemberDash from '../components/dashboard/MemberDash';

export default function DashboardPage() {
  const { user, activeRole, userProfile } = useAuth();
  const { config } = usePageConfig('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = activeRole || user?.role || 'member';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setData(await fetchDashboard()); }
      catch { setData({}); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Zap className="animate-pulse text-[#E8820C]" size={40} />
      <p className="text-sm font-bold text-black/40 dark:text-white/40 uppercase tracking-widest px-4 text-center">Intelligence Engine Synchronizing...</p>
    </div>
  );

  const props = { data: data || {}, user, userProfile, config, role };

  if (role === 'super_admin' || role === 'admin') return <SuperAdminDash {...props} />;
  if (role === 'treasurer') return <TreasurerDash {...props} />;
  if (role === 'group_leader') return <GroupLeaderDash {...props} />;
  if (role === 'welfare') return <WelfareDash {...props} />;
  if (role === 'special_advicer') return <AdvisorDash {...props} />;
  return <MemberDash {...props} />;
}
