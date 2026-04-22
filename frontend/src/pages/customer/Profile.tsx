import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService, type UserProfile } from '../../api/auth';

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

type TabKey = 'profile' | 'security';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setError(null);

      try {
        const data = await authService.getProfile();
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setProfilePictureUrl(data.profilePictureUrl || '');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedPhone = phone.trim();
    if (normalizedPhone && !PHONE_REGEX.test(normalizedPhone)) {
      setError('Phone number must be in international format (for example: +14155552671).');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile({
        fullName,
        phone: normalizedPhone || undefined,
        profilePictureUrl,
      });
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match new password.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(response.message || 'Password changed successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-8">
        <h1 className="mb-2 font-display text-4xl font-bold">My Profile</h1>
        <p className="font-sans text-[var(--color-on-surface-variant)]">Manage your personal information and account security.</p>
      </header>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{success}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="space-y-2 md:col-span-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full rounded-2xl px-4 py-3 text-left font-bold transition ${
              activeTab === 'profile'
                ? 'bg-[var(--color-primary-container)] text-white shadow-ambient'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]'
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full rounded-2xl px-4 py-3 text-left font-bold transition ${
              activeTab === 'security'
                ? 'bg-[var(--color-primary-container)] text-white shadow-ambient'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]'
            }`}
          >
            Security
          </button>
        </div>

        <div className="md:col-span-3">
          <Card>
            {loadingProfile ? (
              <p className="text-[var(--color-on-surface-variant)]">Loading profile...</p>
            ) : activeTab === 'profile' ? (
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-surface-variant)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">Account Email</p>
                    <p className="font-semibold text-[var(--color-on-surface)]">{profile?.email || '-'}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                    {profile?.role || 'CUSTOMER'}
                  </span>
                </div>

                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Jane Doe"
                  required
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  placeholder="+14155552671"
                />
                <Input
                  label="Profile Picture URL"
                  value={profilePictureUrl}
                  onChange={(event) => setProfilePictureUrl(event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />

                <div className="flex justify-end pt-2">
                  <Button variant="primary" type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleChangePassword}>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button variant="primary" type="submit" disabled={changingPassword}>
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}