import { useUserContext } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, MessageSquare, Package, LogOut, Camera, Download } from 'lucide-react'
import './Profile.css'
import { formatDate } from '@/lib/utils'
import { type Preset } from '@/lib/api'

export default function Profile() {
  const { user, signOut } = useUserContext()
  const navigate = useNavigate()
  const { id } = useParams()

  // if no id in url, we're viewing our own profile
  const isOwnProfile = !id || id === user?.username
  const profileId = isOwnProfile ? user?.id : null

  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [presetCount, setPresetCount] = useState(0)
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [profilePresets, setProfilePresets] = useState<Preset[]>([])
  const [profileComments, setProfileComments] = useState<any[]>([])
  const [profileUserId, setProfileUserId] = useState('')

  useEffect(() => {
    fetchProfileData()
  }, [profileId])

  const fetchProfileData = async () => {
    console.log('fetchProfileData called')
    if (!id && !user) return
    setIsLoading(true)

    if (isOwnProfile) {
      const { data: authData } = await supabase.auth.getUser()
      setEmail(authData.user?.email || '')
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, created_at, bio, avatar_url')
      .eq(isOwnProfile ? 'id' : 'username', isOwnProfile ? user!.id : id)
      .single<{ id: string; username: string; created_at: string; bio: string | null; avatar_url: string | null }>()

    if (profileData) {
      setUsername(profileData.username)
      setCreatedAt(profileData.created_at)
      setBio(profileData.bio || '')
      setAvatarUrl(profileData.avatar_url || '')
      setProfileUserId(profileData.id)

      const { count: cc } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
      setCommentCount(cc || 0)

      const { count: pc } = await supabase
        .from('presets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
      setPresetCount(pc || 0)
    }

    setIsLoading(false)
  }

  const handleSaveBio = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', user!.id)
    if (!error) setIsEditingBio(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
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

  const fetchProfilePresets = async () => {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('user_id', profileUserId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('error fetching profile presets:', error)
      return
    }
    if (data) setProfilePresets(data)
  }

  const fetchProfileComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, presets(name)')
      .eq('user_id', profileUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('error fetching profile comments:', error)
      return
    }
    if (data) setProfileComments(data)
  }

  if (isLoading) {
    return (
      <div className="profile-wrapper" style={{ scrollbarGutter: 'stable' }}>
        <div className="profile-header">
          <Skeleton className="profile-avatar" />
          <div className="profile-header-info">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="profile-info-section">
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="profile-stats">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`profile-wrapper${isEditingBio ? ' profile-wrapper-editing' : ''}`}
      style={{ scrollbarGutter: 'stable' }}
    >
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-letter">{username[0]?.toUpperCase()}</span>
            )}
          </div>
          {/* only show avatar upload on own profile */}
          {isOwnProfile && (
            <>
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
            </>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-username">{username}</h1>
          {/* only show email on own profile */}
          {isOwnProfile && <p className="profile-email">{email}</p>}
          <p className="profile-joined">
            <Calendar size={12} className="inline mr-1" />
            joined {createdAt ? formatDate(createdAt) : '...'}
          </p>
        </div>

        {/* only show sign out on own profile */}
        {isOwnProfile && (
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="profile-signout profile-action-button profile-signout-button"
          >
            <LogOut size={16} className="mr-2" />
            sign out
          </Button>
        )}
      </div>

      <div className="profile-info-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">bio</h2>
          {/* only show edit button on own profile */}
          {isOwnProfile && !isEditingBio && (
            <Button
              variant="outline"
              size="sm"
              className="profile-action-button profile-edit-button"
              onClick={() => setIsEditingBio(true)}
            >
              edit
            </Button>
          )}
          {isOwnProfile && isEditingBio && (
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
          {isOwnProfile && isEditingBio ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="tell the community about yourself..."
              className="profile-bio-textarea"
            />
          ) : bio ? (
            <p className="profile-bio-text">{bio}</p>
          ) : (
            <p className="profile-bio-empty">
              {isOwnProfile ? 'no bio yet.' : 'this user has no bio yet.'}
            </p>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <Card 
          className={`profile-stat-card clickable-stat border-border/50 bg-card/50 backdrop-blur-sm transition-all ${showPresets ? 'ring-2 ring-primary border-primary/50' : ''}`}
          onClick={() => {
            if (!showPresets) {
              fetchProfilePresets()
            }
            setShowPresets(!showPresets)
            setShowComments(false)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-1">
            <Package size={24} className={`profile-stat-icon transition-colors ${showPresets ? 'text-primary' : 'text-primary/80'}`} />
            <span className="profile-stat-value text-2xl font-bold">{presetCount}</span>
            <span className="profile-stat-label text-xs uppercase tracking-wider text-muted-foreground font-medium">presets</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`profile-stat-card clickable-stat border-border/50 bg-card/50 backdrop-blur-sm transition-all ${showComments ? 'ring-2 ring-primary border-primary/50' : ''}`}
          onClick={() => {
            if (!showComments) {
              fetchProfileComments()
            }
            setShowComments(!showComments)
            setShowPresets(false)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-1">
            <MessageSquare size={24} className={`profile-stat-icon transition-colors ${showComments ? 'text-primary' : 'text-primary/80'}`} />
            <span className="profile-stat-value text-2xl font-bold">{commentCount}</span>
            <span className="profile-stat-label text-xs uppercase tracking-wider text-muted-foreground font-medium">comments</span>
          </CardContent>
        </Card>
      </div>

      {showPresets && (
        <div className="profile-presets-section">
          <h2 className="profile-section-title mb-4">presets</h2>
          {profilePresets.length === 0 ? (
            <p className="profile-bio-empty text-center py-8">no presets yet.</p>
          ) : (
            <div className="profile-presets-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profilePresets.map(preset => (
                <Card
                  key={preset.id}
                  className="preset-card cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-card/40"
                  onClick={() => navigate(`/preset/${preset.id}`)}
                >
                  <div className="aspect-video relative bg-muted overflow-hidden">
                    <img 
                      src={preset.preview_gif_url} 
                      alt={preset.name} 
                      className="object-cover w-full h-full"
                      loading="lazy" 
                    />
                    <div className="preset-download-badge">
                      <Download size={12} />
                      <span>{preset.download_count}</span>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base font-semibold truncate">{preset.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{preset.description}</CardDescription>
                      <p className="preset-date mt-2">{formatDate(preset.created_at)}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showComments && (
        <div className="profile-presets-section">
          <h2 className="profile-section-title mb-4">comments</h2>
          {profileComments.length === 0 ? (
            <p className="profile-bio-empty text-center py-8">no comments yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {profileComments.map(comment => (
                <Card key={comment.id} className="bg-card/40 border-border/40 cursor-pointer hover:bg-card/60 transition-colors" onClick={() => navigate(`/preset/${comment.preset_id}`)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-primary">{comment.presets?.name || 'unknown preset'}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}