import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import { apiFetch, clearTokens, getStoredToken } from '../lib/api';
import {
  LayoutDashboard, Zap, LogOut, Plus, Trash2, Pencil,
  Users, ClipboardList, CheckCircle, XCircle, Coins,
  ChevronRight, X, Loader2, RefreshCw,
} from 'lucide-react';

// ─── Admin guard ──────────────────────────────────────────────────────────────

function useAdminGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getStoredToken();
    if (!token) { navigate('/admin-login', { replace: true }); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin' || payload.exp * 1000 <= Date.now()) {
        clearTokens();
        navigate('/admin-login', { replace: true });
      }
    } catch {
      clearTokens();
      navigate('/admin-login', { replace: true });
    }
  }, []);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3">
      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-[11px] truncate">{label}</p>
        <p className="text-white text-[20px] font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/v1/admin/stats');
      if (data.success) setStats(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerScrape = async () => {
    setScraping(true);
    setScrapeMsg('');
    try {
      await apiFetch('/v1/admin/campaigns/ingest', { method: 'POST' });
      setScrapeMsg('Scrape triggered — new activities will appear shortly.');
    } catch {
      setScrapeMsg('Failed to trigger scrape.');
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="size-8 text-[#14ae5c] animate-spin" />
      </div>
    );
  }

  const approvalRate = stats?.submissions > 0
    ? Math.round((stats.approved / stats.submissions) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Users className="size-5 text-white" />}   label="Total Users"       value={stats?.users ?? 0}          color="bg-blue-600" />
        <StatCard icon={<ClipboardList className="size-5 text-white" />} label="Submissions"  value={stats?.submissions ?? 0}    color="bg-purple-600" />
        <StatCard icon={<CheckCircle className="size-5 text-white" />}   label="Approved"     value={stats?.approved ?? 0}       color="bg-[#14ae5c]" />
        <StatCard icon={<XCircle className="size-5 text-white" />}       label="Rejected"     value={stats?.rejected ?? 0}       color="bg-red-600" />
        <StatCard icon={<Zap className="size-5 text-white" />}          label="Activities"    value={stats?.active_campaigns ?? 0} color="bg-amber-600" />
        <StatCard icon={<Coins className="size-5 text-white" />}        label="Coins Awarded" value={stats?.coins_awarded ?? 0}  color="bg-yellow-600" />
      </div>

      {/* Approval rate */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-400 text-[12px]">Approval Rate</p>
          <p className="text-white text-[13px] font-semibold">{approvalRate}%</p>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#14ae5c] rounded-full transition-all duration-700"
            style={{ width: `${approvalRate}%` }}
          />
        </div>
      </div>

      {/* Scraper */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <p className="text-white text-[13px] font-semibold mb-1">Activity Scraper</p>
        <p className="text-gray-500 text-[12px] mb-3">
          Fetch new activities from civic sources (cra.dz etc.)
        </p>
        {scrapeMsg && (
          <p className="text-[#14ae5c] text-[12px] mb-3">{scrapeMsg}</p>
        )}
        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-medium active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {scraping
            ? <Loader2 className="size-4 animate-spin" />
            : <RefreshCw className="size-4" />}
          {scraping ? 'Triggering…' : 'Trigger Scrape'}
        </button>
      </div>
    </div>
  );
}

// ─── Activities tab ───────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', subtitle: '', description: '', organizer: '',
  organizer_logo: '', location: '',
  start_dt: '', end_dt: '', url: '',
  image1: '', image2: '', image3: '',
  contact_phone: '', contact_email: '', coin_reward: '50',
};

function ActivitiesTab() {
  const [campaigns, setCampaigns]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/v1/admin/campaigns');
      if (data.success) setCampaigns(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (c: any) => {
    let images: string[] = [];
    try { images = c.images_json ? JSON.parse(c.images_json) : []; } catch { /* ignore */ }
    setEditId(c.id);
    setForm({
      title:          c.title          || '',
      subtitle:       c.subtitle       || '',
      description:    c.description    || '',
      organizer:      c.organizer      || '',
      organizer_logo: c.organizer_logo || '',
      location:       c.location       || '',
      start_dt:       c.start_dt       ? c.start_dt.slice(0, 16) : '',
      end_dt:         c.end_dt         ? c.end_dt.slice(0, 16)   : '',
      url:            c.url            || '',
      image1:         images[0]        || '',
      image2:         images[1]        || '',
      image3:         images[2]        || '',
      contact_phone:  c.contact_phone  || '',
      contact_email:  c.contact_email  || '',
      coin_reward:    String(c.coin_reward ?? 50),
    });
    setShowForm(true);
  };

  const buildBody = () => {
    const images = [form.image1, form.image2, form.image3].filter(Boolean);
    return {
      title:          form.title,
      subtitle:       form.subtitle       || null,
      description:    form.description    || null,
      organizer:      form.organizer       || null,
      organizer_logo: form.organizer_logo  || null,
      location:       form.location        || null,
      start_dt:       form.start_dt,
      end_dt:         form.end_dt          || null,
      url:            form.url             || null,
      images:         images.length > 0 ? images : undefined,
      contact_phone:  form.contact_phone   || null,
      contact_email:  form.contact_email   || null,
      coin_reward:    parseInt(form.coin_reward) || 50,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_dt) return;
    setSubmitting(true);
    try {
      if (editId) {
        await apiFetch(`/v1/admin/campaigns/${editId}`, { method: 'PUT', body: JSON.stringify(buildBody()) });
        setCampaigns(prev => prev.map(c => c.id === editId ? { ...c, ...buildBody(), id: editId } : c));
      } else {
        await apiFetch('/v1/admin/campaigns', { method: 'POST', body: JSON.stringify(buildBody()) });
        load();
      }
      setShowForm(false);
      setEditId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/v1/admin/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', required = false) => (
    <div>
      <label className="text-gray-400 text-[11px] uppercase tracking-wider mb-1 block">{label}{required && ' *'}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-[14px] placeholder:text-gray-600 focus:border-[#14ae5c] focus:outline-none transition-colors"
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-gray-400 text-[13px]">{campaigns.length} activities</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#14ae5c] text-white px-4 py-2 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-all"
        >
          <Plus className="size-4" /> Add Activity
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-12">
          <Loader2 className="size-7 text-[#14ae5c] animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center pt-16 text-gray-600 text-[14px]">No activities yet</div>
      ) : (
        <div className="px-4 space-y-3 pb-6">
          {campaigns.map(c => (
            <div key={c.id} className="bg-gray-900 rounded-2xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-[14px] font-semibold truncate">{c.title}</p>
                <p className="text-gray-500 text-[12px] mt-0.5 truncate">{c.organizer || c.source || '—'}</p>
                <p className="text-gray-600 text-[11px] mt-1">
                  {c.start_dt ? new Date(c.start_dt).toLocaleDateString() : '—'} · {c.participant_count ?? 0} joined
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="size-8 flex items-center justify-center rounded-xl bg-gray-800 text-blue-400 active:scale-95 transition-all"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="size-8 flex items-center justify-center rounded-xl bg-gray-800 text-red-400 active:scale-95 transition-all"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create form overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
          <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] h-14 mt-2">
            <h2 className="text-white text-[17px] font-bold">{editId ? 'Edit Activity' : 'New Activity'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 active:text-white">
              <X className="size-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 space-y-4 pb-6 pt-2">
            {field('title', 'Title', 'text', true)}
            {field('subtitle', 'Subtitle')}
            <div>
              <label className="text-gray-400 text-[11px] uppercase tracking-wider mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-[14px] placeholder:text-gray-600 focus:border-[#14ae5c] focus:outline-none transition-colors resize-none"
              />
            </div>
            {field('organizer', 'Organizer')}
            {field('organizer_logo', 'Organizer Logo URL')}
            {field('location', 'Location')}
            {field('start_dt', 'Start Date & Time', 'datetime-local', true)}
            {field('end_dt', 'End Date & Time', 'datetime-local')}
            <div className="space-y-2">
              <label className="text-gray-400 text-[11px] uppercase tracking-wider block">Images (up to 3)</label>
              {field('image1', 'Image 1 URL')}
              {field('image2', 'Image 2 URL')}
              {field('image3', 'Image 3 URL')}
            </div>
            {field('url', 'Event URL')}
            {field('contact_phone', 'Contact Phone')}
            {field('contact_email', 'Contact Email', 'email')}
            {field('coin_reward', 'Coin Reward', 'number')}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#14ae5c] text-white py-4 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all mt-2"
            >
              {submitting ? <Loader2 className="size-5 animate-spin" /> : editId ? 'Save Changes' : 'Create Activity'}
            </button>
          </form>
        </div>
      )}

      {/* Delete confirm sheet */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full bg-gray-900 rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white text-[16px] font-bold text-center">Delete Activity?</p>
            <p className="text-gray-500 text-[13px] text-center">This cannot be undone.</p>
            <button
              onClick={() => handleDelete(deleteId)}
              className="w-full bg-red-500 text-white py-3.5 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="w-full bg-gray-800 text-gray-300 py-3.5 rounded-2xl text-[15px] font-medium active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'activities';

export default function AdminPanel() {
  useAdminGuard();
  const navigate  = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');

  const handleLogout = () => {
    clearTokens();
    navigate('/login', { replace: true });
  };

  return (
    <MobileContainer>
      <div className="flex flex-col size-full bg-gray-950">

        {/* Top bar */}
        <div className="pt-[env(safe-area-inset-top)] px-5 bg-gray-950">
          <div className="flex items-center justify-between h-14">
            <div>
              <p className="text-white text-[17px] font-bold leading-tight">Admin Panel</p>
              <p className="text-gray-600 text-[11px]">Wihda Control System</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 text-[12px]"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex bg-gray-900 mx-4 rounded-2xl p-1 mt-1 mb-3">
          {([
            { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
            { key: 'activities', label: 'Activities', icon: <Zap className="size-4" /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                tab === t.key
                  ? 'bg-[#14ae5c] text-white shadow'
                  : 'text-gray-500'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'dashboard'   && <DashboardTab />}
        {tab === 'activities'  && <ActivitiesTab />}

        {/* Bottom safe area */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </MobileContainer>
  );
}
