import { Crown, Trash2, UserPlus } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ProjectMembersTab({
  project,
  isOwner,
  onOpenAddMember,
  onRemoveMember,
}) {
  const counts = project.memberTaskCounts || {};
  const allMembers = [
    ...(project.owner ? [{ ...project.owner, isOwner: true }] : []),
    ...(project.members || []).map((m) => ({ ...m, isOwner: false })),
  ];

  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Team Members</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {allMembers.length} collaborator{allMembers.length === 1 ? '' : 's'} with project access
          </p>
        </div>

        {isOwner && (
          <Button onClick={onOpenAddMember} size="sm">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-800/80">
        {allMembers.map((member) => {
          const taskCount = counts[member._id] || 0;
          return (
            <div
              key={member._id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar user={member} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    {member.isOwner ? (
                      <Badge variantClass="bg-amber-500/15 text-amber-300 border-amber-500/30">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    ) : (
                      <Badge variantClass="bg-slate-700/40 text-slate-300 border-slate-600/50">
                        Member
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-xs text-slate-300 bg-[#0B0F19] border border-slate-800 px-3 py-1 rounded-full">
                  {taskCount} assigned task{taskCount === 1 ? '' : 's'}
                </span>

                {isOwner && !member.isOwner && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(member)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
