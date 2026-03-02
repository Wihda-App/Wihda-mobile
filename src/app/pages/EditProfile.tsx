import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiUpload } from '../lib/supabase';
import {
  ArrowLeft,
  Camera,
  User,
  MapPin,
  FileText,
  Save,
  Loader2,
} from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [photoPreview, setPhotoPreview] = useState(profile?.photoUrl || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);

    try {
      // Upload photo if changed
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoResult = await apiUpload('/profile/photo', formData);
        if (photoResult.photoUrl) {
          setPhotoPreview(photoResult.photoUrl);
        }
      }

      // Update profile fields
      const result = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        await refreshProfile();
        toast.success('Profile updated!');
        navigate('/profile');
      }
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileContainer>
      <PageTransition>
        <div className="flex flex-col size-full bg-white">
          {/* Header */}
          <div className="px-5 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between h-14">
              <button onClick={() => navigate('/profile')} className="text-gray-800">
                <ArrowLeft className="size-6" />
              </button>
              <h1 className="text-[18px] font-semibold text-gray-900 font-[Poppins,sans-serif]">Edit Profile</h1>
              <div className="size-6" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            {/* Avatar */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                {photoPreview ? (
                  <ImageWithFallback
                    src={photoPreview}
                    alt="Profile"
                    className="size-24 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                    <User className="size-10 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#14ae5c] text-white rounded-full p-2 shadow-lg active:scale-90 transition-transform"
                >
                  <Camera className="size-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
              <p className="text-[12px] text-gray-400 mt-2">Tap camera to change photo</p>
            </div>

            {/* Fields */}
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <User className="size-4 text-gray-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <MapPin className="size-4 text-gray-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your neighborhood"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <FileText className="size-4 text-gray-400" /> Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your neighbors about yourself..."
                  rows={4}
                  maxLength={200}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] placeholder:text-gray-400 focus:border-[#14ae5c] focus:outline-none transition-colors resize-none"
                />
                <p className="text-[11px] text-gray-400 text-right mt-1">{bio.length}/200</p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 bg-[#14ae5c] text-white py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Save className="size-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </PageTransition>
    </MobileContainer>
  );
}
