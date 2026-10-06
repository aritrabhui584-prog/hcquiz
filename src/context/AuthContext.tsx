import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut, SUPER_ADMIN_EMAIL, isAuthorizedAdminEmail } from '../lib/firebase';
import { UserProfile } from '../types/quiz';

interface ParticipantRegistrationData {
  name: string;
  phone: string;
  stream: string;
  year: string;
  rollNo: string;
  membershipId?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  getIdToken: () => Promise<string | null>;
  login: () => Promise<void>;
  loginWithCredentials: (data: ParticipantRegistrationData & { email: string }) => Promise<void>;
  logout: () => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  updateProfileData: (data: ParticipantRegistrationData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (user: FirebaseUser) => {
    try {
      const email = user.email?.toLowerCase() || '';
      const isSuper = email === SUPER_ADMIN_EMAIL.toLowerCase();
      const adminStatus = isAuthorizedAdminEmail(email);

      setIsSuperAdmin(isSuper);
      setIsAdmin(adminStatus);

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile({
          ...data,
          isAdmin: adminStatus,
        });
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || (adminStatus ? 'AEC Administrator' : 'Hardware Engineer'),
          email: user.email || '',
          phone: '',
          stream: '',
          year: '',
          rollNo: '',
          membershipId: '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isAdmin: adminStatus,
        };
        try {
          await setDoc(userRef, newProfile);
        } catch {}
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile notice:', err);
      const adminStatus = isAuthorizedAdminEmail(user.email);
      setUserProfile({
        uid: user.uid,
        name: user.displayName || (adminStatus ? 'AEC Administrator' : 'Participant'),
        email: user.email || '',
        isAdmin: adminStatus,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchProfile(user);
      } else {
        // Check if there is a local session credential
        const localSaved = localStorage.getItem('sh_circuit_user');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setCurrentUser(parsed as unknown as FirebaseUser);
            setUserProfile(parsed.profile);
            const isSuper = parsed.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
            setIsSuperAdmin(isSuper);
            setIsAdmin(parsed.profile?.isAdmin || isSuper);
          } catch {
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      if (typeof currentUser.getIdToken === 'function') {
        const token = await currentUser.getIdToken();
        if (token && !token.startsWith('cred-') && !token.startsWith('mock-')) {
          return token;
        }
      }
      // Generate standard credential token format
      const tokenPayload = {
        uid: currentUser.uid,
        email: currentUser.email || userProfile?.email || '',
        name: currentUser.displayName || userProfile?.name || '',
      };
      return `cred_${btoa(encodeURIComponent(JSON.stringify(tokenPayload)))}`;
    } catch {
      const tokenPayload = {
        uid: currentUser.uid,
        email: currentUser.email || userProfile?.email || '',
        name: currentUser.displayName || userProfile?.name || '',
      };
      return `cred_${btoa(encodeURIComponent(JSON.stringify(tokenPayload)))}`;
    }
  }, [currentUser, userProfile]);

  const loginWithCredentials = async (data: ParticipantRegistrationData & { email: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim() || cleanEmail.split('@')[0];
    const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
    const uid = 'user_' + btoa(cleanEmail).replace(/=/g, '').substring(0, 16);

    const tokenPayload = {
      uid,
      email: cleanEmail,
      name: cleanName,
    };
    const credToken = `cred_${btoa(encodeURIComponent(JSON.stringify(tokenPayload)))}`;

    const mockUser = {
      uid,
      displayName: cleanName,
      email: cleanEmail,
      photoURL: '',
      getIdToken: async () => credToken,
    };

    const mockProfile: UserProfile = {
      uid,
      name: cleanName,
      email: cleanEmail,
      phone: data.phone?.replace(/\D/g, '') || '',
      stream: data.stream || '',
      year: data.year || '',
      rollNo: data.rollNo || '',
      membershipId: data.membershipId || '',
      isAdmin: isSuper,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, mockProfile, { merge: true });
    } catch {}

    localStorage.setItem(
      'sh_circuit_user',
      JSON.stringify({ ...mockUser, profile: mockProfile })
    );
    setCurrentUser(mockUser as unknown as FirebaseUser);
    setUserProfile(mockProfile);
    setIsAdmin(isSuper);
    setIsSuperAdmin(isSuper);
  };

  const login = async () => {
    try {
      const user = await signInWithGoogle();
      await fetchProfile(user);
    } catch (err: any) {
      console.warn('Firebase Google Auth notice:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch {}
    localStorage.removeItem('sh_circuit_user');
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const updatePhone = async (phone: string) => {
    if (!currentUser) return;
    const cleanPhone = phone.replace(/\D/g, '');
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { phone: cleanPhone, lastLoginAt: new Date().toISOString() });
    } catch {
      // Local fallback
    }
    setUserProfile((prev) => (prev ? { ...prev, phone: cleanPhone } : null));
    const local = localStorage.getItem('sh_circuit_user');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.profile) parsed.profile.phone = cleanPhone;
        localStorage.setItem('sh_circuit_user', JSON.stringify(parsed));
      } catch {}
    }
  };

  const updateProfileData = async (data: ParticipantRegistrationData) => {
    const cleanName = data.name.trim();
    const cleanPhone = data.phone.replace(/\D/g, '');
    const cleanStream = data.stream.trim();
    const cleanYear = data.year.trim();
    const cleanRollNo = data.rollNo.trim();
    const cleanMembershipId = data.membershipId?.trim() || '';
    const cleanPhotoURL = data.photoURL || userProfile?.photoURL || currentUser?.photoURL || '';

    if (!currentUser) {
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        name: cleanName,
        phone: cleanPhone,
        stream: cleanStream,
        year: cleanYear,
        rollNo: cleanRollNo,
        membershipId: cleanMembershipId,
        photoURL: cleanPhotoURL,
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}

    const updated: UserProfile = {
      ...(userProfile || {}),
      uid: currentUser.uid,
      name: cleanName,
      email: currentUser.email || userProfile?.email || '',
      phone: cleanPhone,
      stream: cleanStream,
      year: cleanYear,
      rollNo: cleanRollNo,
      membershipId: cleanMembershipId,
      photoURL: cleanPhotoURL,
      isAdmin,
    };
    setUserProfile(updated);
    const local = localStorage.getItem('sh_circuit_user');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        parsed.displayName = cleanName;
        parsed.profile = updated;
        localStorage.setItem('sh_circuit_user', JSON.stringify(parsed));
      } catch {}
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isSuperAdmin,
        isLoading,
        getIdToken,
        login,
        loginWithCredentials,
        logout,
        updatePhone,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
