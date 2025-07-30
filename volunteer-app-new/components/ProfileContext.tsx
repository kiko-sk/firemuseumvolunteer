import React, { createContext, useContext, useState } from 'react';

export interface Profile {
  name: string;
  phone: string;
  serviceHours: number;
  points: number;
  serviceType: string;
  gender: string;
  avatarUrl: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bio?: string;
  address?: string;
}

const defaultProfile: Profile = {
  name: '志愿者小明',
  phone: '138****1234',
  serviceHours: 120,
  points: 85,
  serviceType: '场馆服务',
  gender: '男',
  avatarUrl: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bio: '',
  address: '',
};

interface ProfileContextType {
  profile: Profile;
  setProfile: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: () => {},
  updateProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const updateProfile = (p: Partial<Profile>) => setProfile((prev: Profile) => ({ ...prev, ...p }));
  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}; 