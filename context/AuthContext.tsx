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
                      hostname.includes('github.io');
    
    setIsSandboxEnv(isPreview);

    // Capture referral code from URL ?ref=xxx
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('invite');
    if (refCode) {
      localStorage.setItem('skyverses_ref_code', refCode);
    }

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
      // Get stored referral code from URL capture
      const storedRefCode = localStorage.getItem('skyverses_ref_code') || undefined;
      loginWithEmail(payload.email, payload.name, storedRefCode, payload.picture).then(() => {
        // Clear ref code after successful registration
        localStorage.removeItem('skyverses_ref_code');
      });
    }
  };

  const login = () => {
    const g = (window as any).google;
    if (isSandboxEnv) {
      mockLogin();
      return;
    }

    if (g && g.accounts) {
      setAuthError(null);
      try {
        // Strategy 1: Try One Tap prompt first with safe notification handling
        g.accounts.id.prompt((notification: any) => {
          // Safe-check: notification object may not have all methods when FedCM is blocked
          const isNotDisplayed = typeof notification?.isNotDisplayed === 'function' && notification.isNotDisplayed();
          const isSkipped = typeof notification?.isSkipped === 'function' && notification.isSkipped();

          if (isNotDisplayed || isSkipped) {
            const reason = isNotDisplayed 
              ? (typeof notification.getNotDisplayedReason === 'function' ? notification.getNotDisplayedReason() : 'unknown')
              : (typeof notification.getSkippedReason === 'function' ? notification.getSkippedReason() : 'unknown');
            console.warn("[AUTH] One Tap failed/skipped, falling back to popup. Reason:", reason);
            
            // Strategy 2: Fallback to hidden renderButton click
            loginWithPopupFallback(g);
          }
        });
      } catch (err) {
        console.error("[AUTH] Google prompt error, falling back to popup:", err);
        // Strategy 2: Fallback to hidden renderButton click
        loginWithPopupFallback(g);
      }
    } else {
      console.warn("[AUTH] Google SDK not loaded");
      setAuthError("GOOGLE_NOT_LOADED");
    }
  };

  const loginWithPopupFallback = (g: any) => {
    try {
      // Create a temporary hidden container for the Google button
      let container = document.getElementById('g_id_signin_fallback');
      if (!container) {
        container = document.createElement('div');
        container.id = 'g_id_signin_fallback';
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
      }

      g.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 300,
      });

      // Click the rendered button to trigger popup
      setTimeout(() => {
        const btn = container?.querySelector('[role="button"]') as HTMLElement
          || container?.querySelector('div[style]') as HTMLElement
          || container?.querySelector('iframe')?.contentDocument?.querySelector('[role="button"]') as HTMLElement;
        if (btn) {
          // Re-enable pointer events briefly for the click
          container!.style.pointerEvents = 'auto';
          btn.click();
          setTimeout(() => { if (container) container.style.pointerEvents = 'none'; }, 100);
        } else {
          console.error("[AUTH] Could not find Google button to click");
          setAuthError("GOOGLE_PROMPT_FAILED");
        }
      }, 500);
    } catch (err) {
      console.error("[AUTH] Popup fallback failed:", err);
      setAuthError("GOOGLE_PROMPT_FAILED");
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