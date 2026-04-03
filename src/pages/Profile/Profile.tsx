import { useUserContext } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, MessageSquare, Package, LogOut, Camera } from 'lucide-react'
import './Profile.css'

export default function Profile() {
  const { user, signOut } = useUserContext()
  const navigate = useNavigate()

  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [presetCount, setPresetCount] = useState(0)
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingBio, setIsEditingBio] = useState(false)

  const fetchProfileData = async () => {
    if (!user) return
    setIsLoading(true)

    const { data: authData } = await supabase.auth.getUser()
    setEmail(authData.user?.email || '')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('created_at, bio, avatar_url')
      .eq('id', user.id)
      .single<{ created_at: string; bio: string | null; avatar_url: string | null }>()

    if (profileData) {
      setCreatedAt(profileData.created_at)
      setBio(profileData.bio || '')
      setAvatarUrl(profileData.avatar_url || '')
    }

    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setCommentCount(commentCount || 0)

    const { count: presetCount } = await supabase
      .from('presets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setPresetCount(presetCount || 0)

    setIsLoading(false)
  }

  const handleSaveBio = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', user!.id)

    if (!error) setIsEditingBio(false)
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('image is too large! max size is 2MB')
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url

    img.onload = async () => {
      URL.revokeObjectURL(url)

      if (img.width < 100 || img.height < 100) {
        toast.error('image is too small! minimum size is 100x100px')
        return
      }

      try {
        const avatarPath = `${user.id}/avatar`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(avatarPath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarPath)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError

        toast.success('avatar updated!')
        fetchProfileData()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="profile-wrapper">
        <div className="profile-header">
          <Skeleton className="profile-avatar" />
          <div className="profile-header-info">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="profile-stats">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="profile-info-section">
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className={`profile-wrapper${isEditingBio ? ' profile-wrapper-editing' : ''}`}>
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-letter">{user?.username[0].toUpperCase()}</span>
            )}
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="profile-avatar-input"
            onChange={handleAvatarUpload}
          />
          <label className="profile-avatar-upload" htmlFor="avatar-input">
            <Camera size={14} />
            <span>change avatar</span>
          </label>
        </div>
        <div className="profile-header-info">
          <h1 className="profile-username">{user?.username}</h1>
          <p className="profile-email">{email}</p>
          <p className="profile-joined">
            <Calendar size={12} className="inline mr-1" />
            joined {createdAt ? formatDate(createdAt) : '...'}
          </p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="profile-signout profile-action-button profile-signout-button"
        >
          <LogOut size={16} className="mr-2" />
          sign out
        </Button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-card">
          <Package size={20} className="profile-stat-icon" />
          <span className="profile-stat-value">{presetCount}</span>
          <span className="profile-stat-label">presets</span>
        </div>
        <div className="profile-stat-card">
          <MessageSquare size={20} className="profile-stat-icon" />
          <span className="profile-stat-value">{commentCount}</span>
          <span className="profile-stat-label">comments</span>
        </div>
      </div>

      <div className="profile-info-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">bio</h2>
          {!isEditingBio ? (
            <Button
              variant="outline"
              size="sm"
              className="profile-action-button profile-edit-button"
              onClick={() => setIsEditingBio(true)}
            >
              edit
            </Button>
          ) : (
            <div className="profile-bio-actions">
              <Button
                variant="ghost"
                size="sm"
                className="profile-action-button profile-cancel-button"
                onClick={() => setIsEditingBio(false)}
              >
                cancel
              </Button>
              <Button
                size="sm"
                className="profile-action-button profile-save-button"
                onClick={handleSaveBio}
              >
                save
              </Button>
            </div>
          )}
        </div>
        <div className="profile-bio-content">
          {isEditingBio ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="tell the community about yourself..."
              className="profile-bio-textarea"
            />
          ) : bio ? (
            <p className="profile-bio-text">{bio}</p>
          ) : (
            <p className="profile-bio-empty">no bio yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
