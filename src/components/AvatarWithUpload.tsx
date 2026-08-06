import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, X } from 'lucide-react'
import { uploadAvatar, removeAvatar } from '../lib/api'
import { getInitials } from '../lib/utils'

export default function AvatarWithUpload({ user, profile, updateProfile }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setUploading(true)
    try {
      const url = await uploadAvatar(user?.id, file)
      await updateProfile({ avatar: url })
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo. Make sure the "avatars" bucket exists.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await removeAvatar(user?.id)
      await updateProfile({ avatar: null })
      toast.success('Profile photo removed')
    } catch (err) {
      toast.error(err?.message || 'Failed to remove photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative w-20 h-20 shrink-0">
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
        {profile?.avatar ? (
          <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          getInitials(profile?.name || 'U')
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload photo"
        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-indigo-600 shadow-sm transition-colors disabled:opacity-60"
      >
        {uploading ? (
          <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        ) : (
          <Camera size={13} />
        )}
      </button>

      {profile?.avatar && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          title="Remove photo"
          className="absolute -bottom-1 -left-1 w-7 h-7 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm transition-colors disabled:opacity-60"
        >
          <X size={13} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
