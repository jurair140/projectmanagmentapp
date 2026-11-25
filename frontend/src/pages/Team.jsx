import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Search, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import AddMemberModal from '../components/team/AddMemberModal';
import { CardGridSkeleton } from '../components/common/Skeleton';
import { getTeamOverview } from '../services/userService';
import { addProjectMember, getProjects } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/formatters';

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, projRes] = await Promise.all([
        getTeamOverview(),
        getProjects({ limit: 50 }),
      ]);
      setMembers(teamRes.members || []);
      const owned = (projRes.projects || []).filter(
        (p) => String(p.owner?._id) === String(user?._id)
      );
      setOwnedProjects(owned);
      if (owned.length > 0 && !selectedProjectId) {
        setSelectedProjectId(owned[0]._id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load team overview'));
    } finally {
      setLoading(false);
    }
  }, [user, selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.projects.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [members, search]);

  const selectedProject = ownedProjects.find((p) => p._id === selectedProjectId);
  const existingIdsForProject = useMemo(() => {
    if (!selectedProject) return [];
    return [
      selectedProject.owner?._id,
      ...(selectedProject.members || []).map((m) => m._id),
    ].filter(Boolean);
  }, [selectedProject]);

  const handleInviteMember = async (payload) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addProjectMember(selectedProjectId, payload);
      toast.success(res.message || 'Member added to project');
      setInviteOpen(false);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Team"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Team' }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Collaborators across projects you own or participate in.
          </p>

          {ownedProjects.length > 0 && (
            <div className="flex items-center gap-2.5">
              <select
                aria-label="Target project for invite"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#151C2C] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {ownedProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button onClick={() => setInviteOpen(true)} size="sm">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          )}
        </div>

        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teammates by name, email, or project..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Create a project and invite registered collaborators by their email address."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar user={member} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                      <span>{member.assignedTasks} assigned</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400">{member.completedTasks} completed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Shared Projects ({member.projects.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.projects.map((p) => (
                      <Link key={p._id} to={`/projects/${p._id}`}>
                        <Badge
                          variantClass={
                            p.role === 'Owner'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25 hover:bg-indigo-500/20'
                          }
                        >
                          {p.role === 'Owner' && <Crown className="h-3 w-3" />}
                          {p.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onAddMember={handleInviteMember}
        projectName={selectedProject?.name}
        existingIds={existingIdsForProject}
        loading={submitting}
      />
    </DashboardLayout>
  );
}
