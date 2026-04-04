import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  freeImageRemaining: number;
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

const GOOGLE_CLIENT_ID = "942039901611-v51aehr4s94ajbk6rc6lbsiqkq2qto3l.apps.googleusercontent.com";
const GOOGLE_OAUTH_SCOPES = "openid email profile";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSandboxEnv, setIsSandboxEnv] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [freeImageRemaining, setFreeImageRemaining] = useState<number>(0);

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
      // Check for pending OAuth token (redirect fallback when popup was blocked)
      const pendingToken = sessionStorage.getItem('pending_google_token');
      if (pendingToken) {
        sessionStorage.removeItem('pending_google_token');
        const payload = decodeJwt(pendingToken);
        if (payload) {
          const storedRefCode = localStorage.getItem('skyverses_ref_code') || undefined;
          loginWithEmail(payload.email, payload.name, storedRefCode, payload.picture).then(() => {
            localStorage.removeItem('skyverses_ref_code');
          });
        }
      } else {
        const savedUser = localStorage.getItem('skyverses_auth');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setCredits(parsed.creditBalance || 0);
        }
      }
    }

    // Optional: Try to initialize GSI for auto-select (non-critical)
    const initGoogle = () => {
      const g = (window as any).google;
      if (g && g.accounts) {
        try {
          g.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: false, 
          });
        } catch (err) {
          // Non-critical: OAuth popup fallback will handle login
          console.warn("[AUTH] GSI init failed (non-critical):", err);
        }
      }
    };

    // Listen for OAuth popup callback message
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_OAUTH_CALLBACK' && event.data?.credential) {
        const payload = decodeJwt(event.data.credential);
        if (payload) {
          const storedRefCode = localStorage.getItem('skyverses_ref_code') || undefined;
          loginWithEmail(payload.email, payload.name, storedRefCode, payload.picture).then(() => {
            localStorage.removeItem('skyverses_ref_code');
          });
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    initGoogle();

    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
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
      setFreeImageRemaining(res.user.freeImageRemaining || 0);
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
    if (isSandboxEnv) {
      mockLogin();
      return;
    }

    setAuthError(null);
    const g = (window as any).google;

    if (g && g.accounts) {
      // Use renderButton popup approach - does NOT require FedCM
      try {
        // Ensure GSI is initialized
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          use_fedcm_for_prompt: false,
        });

        // Create/reuse hidden container for Google button
        let container = document.getElementById('g_id_signin_hidden');
        if (container) container.remove();
        
        container = document.createElement('div');
        container.id = 'g_id_signin_hidden';
        container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;z-index:-1;';
        document.body.appendChild(container);

        // Render the official Google Sign-In button (uses popup, NOT FedCM)
        g.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 300,
          click_listener: () => {
            console.log("[AUTH] Google button clicked, popup opening...");
          },
        });

        // Wait for iframe to render, then click the button
        setTimeout(() => {
          // Google renders the button inside an iframe or a div
          const iframe = container?.querySelector('iframe');
          if (iframe) {
            // For iframe-based button: simulate click on the iframe container
            const wrapper = iframe.parentElement;
            if (wrapper) {
              wrapper.style.pointerEvents = 'auto';
              wrapper.click();
            }
          }
          
          // Also try direct button click
          const allClickable = container?.querySelectorAll('[role="button"], [tabindex="0"]');
          if (allClickable && allClickable.length > 0) {
            (allClickable[0] as HTMLElement).click();
          }
          
          // Final fallback: find and click any div that looks like a button  
          if (!iframe && (!allClickable || allClickable.length === 0)) {
            const firstChild = container?.firstElementChild as HTMLElement;
            if (firstChild) {
              firstChild.style.pointerEvents = 'auto';
              firstChild.click();
            }
          }

          // Cleanup after a delay
          setTimeout(() => container?.remove(), 5000);
        }, 300);

      } catch (err) {
        console.error("[AUTH] Google renderButton failed:", err);
        setAuthError("GOOGLE_PROMPT_FAILED");
      }
    } else {
      console.warn("[AUTH] Google SDK not loaded");
      setAuthError("GOOGLE_NOT_LOADED");
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
      isSandboxEnv, credits, freeImageRemaining, addCredits, useCredits 
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