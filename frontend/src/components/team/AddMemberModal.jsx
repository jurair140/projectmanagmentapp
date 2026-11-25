import { useEffect, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { searchUsersByEmail } from '../../services/userService';

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
  projectName = '',
  existingIds = [],
  loading = false,
}) {
  const [email, setEmail] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setSuggestions([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = email.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchUsersByEmail(trimmed);
        setSuggestions(
          (data.users || []).filter((u) => !existingIds.includes(u._id))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [email, existingIds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onAddMember({ email: email.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      subtitle={projectName ? `Add a registered user to ${projectName}` : 'Add a registered user by email'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="member-email" className="block text-sm font-medium text-slate-200 mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="member-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Users must already have a registered Jurair Project Management account.
          </p>
        </div>

        {searching && (
          <p className="text-xs text-slate-400">Searching registered users...</p>
        )}

        {suggestions.length > 0 && (
          <div className="bg-[#0B0F19] border border-slate-800 rounded-lg divide-y divide-slate-800 max-h-44 overflow-y-auto">
            {suggestions.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => onAddMember({ userId: user._id, email: user.email })}
                disabled={loading}
                className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#192132] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar user={user} size="xs" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <UserPlus className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!email.trim()}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
