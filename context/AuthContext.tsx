import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, RegisterRequest, AuthUser } from '../apis/auth';
import { creditsApi } from '../apis/credits';

interface User extends AuthUser {
  picture: string; // Mapping avatar -> picture for legacy UI compatibility
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  mockLogin: () => void;
  loginWithEmail: (email: string, name: string, inviteCode?: string) => Promise<boolean>;
  refreshUserInfo: () => Promise<void>;
  claimWelcomeCredits: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  authError: string | null;
  isSandboxEnv: boolean;
  credits: number;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const DEFAULT_AVATAR_URL = "https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSandboxEnv, setIsSandboxEnv] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  // Hydrate user info on mount (F5)
  useEffect(() => {
    const hostname = window.location.hostname;
    const isPreview = hostname.includes('stackblitz') || 
                      hostname.includes('web-platform') || 
                      hostname.includes('github.io') ||
                      hostname === 'localhost' ||
                      hostname === '127.0.0.1';
    
    setIsSandboxEnv(isPreview);

    const token = localStorage.getItem('skyverses_auth_token');
    if (token) {
      refreshUserInfo();
    } else {
      const savedUser = localStorage.getItem('skyverses_auth');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCredits(parsed.creditBalance || 0);
      }
    }

    const initGoogle = () => {
      const g = (window as any).google;
      if (g && g.accounts) {
        try {
          g.accounts.id.initialize({
            client_id: "942039901611-v51aehr4s94ajbk6rc6lbsiqkq2qto3l.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: false, 
          });
        } catch (err) {
          setAuthError("ORIGIN_NOT_ALLOWED");
        }
      } else {
        setTimeout(initGoogle, 300);
      }
    };

    initGoogle();
  }, []);

  const refreshUserInfo = async () => {
    const res = await authApi.getUserInfo();
    if (res.success && res.user) {
      const userData: User = {
        ...res.user,
        picture: res.user.avatar || DEFAULT_AVATAR_URL
      };
      setUser(userData);
      setCredits(res.user.creditBalance || 0);
      localStorage.setItem('skyverses_auth', JSON.stringify(userData));
    } else if (res.message === 'Unauthorized' || !res.success) {
      logout();
    }
  };

  const claimWelcomeCredits = async (): Promise<boolean> => {
    const res = await creditsApi.claimWelcome();
    if (res.success) {
      if (user) {
        const updatedUser = { ...user, claimWelcomeCredit: true, creditBalance: res.creditBalance || credits };
        setUser(updatedUser);
        setCredits(res.creditBalance || credits);
        localStorage.setItem('skyverses_auth', JSON.stringify(updatedUser));
      }
      return true;
    }
    return false;
  };

  const handleCredentialResponse = (response: any) => {
    const payload = decodeJwt(response.credential);
    if (payload) {
      loginWithEmail(payload.email, payload.name, undefined, payload.picture);
    }
  };

  const login = () => {
    const g = (window as any).google;
    if (isSandboxEnv || authError === "ORIGIN_NOT_ALLOWED") {
      mockLogin();
      return;
    }

    if (g && g.accounts) {
      setAuthError(null);
      let promptTriggered = false;
      try {
        g.accounts.id.prompt((notification: any) => {
          promptTriggered = true;
          if (notification.isNotDisplayed() || notification.isSkipped()) {
            mockLogin();
          }
        });
        setTimeout(() => {
          if (!promptTriggered) mockLogin();
        }, 1200);
      } catch (err) {
        mockLogin();
      }
    } else {
      mockLogin();
    }
  };

  const loginWithEmail = async (email: string, name: string, inviteCode?: string, avatar?: string): Promise<boolean> => {
    const payload: RegisterRequest = { email, name, inviteCode, picture: avatar };
    const data = await authApi.googleRegister(payload);
    
    if (data.success && data.token) {
      localStorage.setItem('skyverses_auth_token', data.token);
      await refreshUserInfo();
      return true;
    }
    return false;
  };

  const mockLogin = () => {
    const mockUserData: User = {
      _id: "mock-id",
      name: "Skyverses Architect",
      email: "architect@skyverses.io",
      avatar: DEFAULT_AVATAR_URL,
      picture: DEFAULT_AVATAR_URL,
      inviteCode: "MOCK123",
      role: 'user',
      creditBalance: 1000,
      claimWelcomeCredit: true
    };
    setUser(mockUserData);
    setCredits(1000);
    localStorage.setItem('skyverses_auth', JSON.stringify(mockUserData));
  };

  const logout = () => {
    setUser(null);
    setCredits(0);
    localStorage.removeItem('skyverses_auth');
    localStorage.removeItem('skyverses_auth_token');
    const g = (window as any).google;
    if (g && g.accounts) {
      try {
        g.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const useCredits = (amount: number) => {
    if (credits >= amount) {
      setCredits(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, mockLogin, loginWithEmail, refreshUserInfo, claimWelcomeCredits, logout, isAuthenticated: !!user, authError, 
      isSandboxEnv, credits, addCredits, useCredits 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};