import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Trash2,
  Shield,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { userManagementService } from '@/lib/user-management-service';
import { notificationService } from '@/lib/notification-service';
import { AdminUser } from '@/types/admin';

const Profile = () => {
  const { auth, authMode } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your profile, security, and user accounts
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          {authMode === 'local' && auth.user?.role === 'admin' && (
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings user={auth.user} authMode={authMode} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings user={auth.user} authMode={authMode} />
        </TabsContent>

        {authMode === 'local' && auth.user?.role === 'admin' && (
          <TabsContent value="users">
            <UserManagement currentUser={auth.user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user, authMode }: { user: AdminUser | null; authMode: string }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      if (authMode === 'local') {
        const result = userManagementService.updateUser(user.id, {
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim() || undefined
        });

        if (!result.success) {
          setSaveStatus('error');
          setErrorMessage(result.error || 'Failed to update profile');
          return;
        }

        notificationService.addNotification(
          'success',
          'Profile Updated',
          'Your profile has been updated successfully',
          '/admin/profile'
        );
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Profile Information</CardTitle>
        </div>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {saveStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-2xl">
              {name.charAt(0) || user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={authMode === 'firebase'}
            />
            <p className="text-xs text-slate-500 mt-1">
              {authMode === 'firebase' 
                ? 'Avatar is managed through your Firebase account'
                : 'Enter a URL to your profile picture'}
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={authMode === 'firebase'}
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={authMode === 'firebase'}
          />
          {authMode === 'firebase' && (
            <p className="text-xs text-slate-500 mt-1">
              Email is managed through your Firebase account
            </p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div>
            <Label>Role</Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account role determines your permissions
            </p>
          </div>
          <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
            <Shield className="h-3 w-3 mr-1" />
            {user?.role}
          </Badge>
        </div>

        {authMode === 'local' && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || !email.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Security Settings Component
const SecuritySettings = ({ user, authMode }: { user: AdminUser | null; authMode: string }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [changeStatus, setChangeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = async () => {
    if (!user) return;

    setChangeStatus('idle');
    setErrorMessage('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangeStatus('error');
      setErrorMessage('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeStatus('error');
      setErrorMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setChangeStatus('error');
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsChanging(true);

    try {
      if (authMode === 'local') {
        const result = userManagementService.updatePassword(
          user.id,
          currentPassword,
          newPassword
        );

        if (!result.success) {
          setChangeStatus('error');
          setErrorMessage(result.error || 'Failed to change password');
          return;
        }

        notificationService.addNotification(
          'success',
          'Password Changed',
          'Your password has been updated successfully',
          '/admin/profile'
        );

        setChangeStatus('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setChangeStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setChangeStatus('error');
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsChanging(false);
    }
  };

  if (authMode === 'firebase') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Password & Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Password management is handled through your Firebase account. Please use Firebase Console to update your password.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {changeStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Password changed successfully!
            </AlertDescription>
          </Alert>
        )}

        {changeStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="currentPassword">Current Password *</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="newPassword">New Password *</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Must be at least 6 characters long
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isChanging ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Changing...</span>
              </div>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// User Management Component
const UserManagement = ({ currentUser }: { currentUser: AdminUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'editor' as 'admin' | 'editor'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = userManagementService.getAllUsers();
    setUsers(allUsers);
  };

  const handleCreateUser = async () => {
    setCreateError('');
    setIsCreating(true);

    try {
      const result = userManagementService.createUser(
        newUser.email,
        newUser.password,
        newUser.name,
        newUser.role
      );

      if (!result.success) {
        setCreateError(result.error || 'Failed to create user');
        return;
      }

      notificationService.addNotification(
        'success',
        'User Created',
        `Successfully created account for ${newUser.name}`,
        '/admin/profile'
      );

      loadUsers();
      setIsAddDialogOpen(false);
      setNewUser({ email: '', password: '', name: '', role: 'editor' });
    } catch (error) {
      console.error('Error creating user:', error);
      setCreateError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    const result = userManagementService.deleteUser(userId);
    
    if (!result.success) {
      alert(result.error || 'Failed to delete user');
      return;
    }

    notificationService.addNotification(
      'info',
      'User Deleted',
      `Account for ${userName} has been deleted`,
      '/admin/profile'
    );

    loadUsers();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>Manage admin and editor accounts</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new admin or editor account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="newName">Full Name *</Label>
                  <Input
                    id="newName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="newEmail">Email Address *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <Label htmlFor="newRole">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: 'admin' | 'editor') =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full Access</SelectItem>
                      <SelectItem value="editor">Editor - Limited Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={
                    isCreating ||
                    !newUser.email ||
                    !newUser.password ||
                    !newUser.name
                  }
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                    {user.id === currentUser.id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.lastLogin).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUser.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Profile;

