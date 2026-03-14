
/**
 * DEV ONLY: Hỗ trợ đăng nhập nhanh cho tài khoản Admin
 * Sẽ được gỡ bỏ khi Go-Live
 */
export const handleAdminQuickLogin = async (
  loginWithEmail: (email: string, name: string) => Promise<boolean>,
  navigate: (path: string) => void,
  setIsAdminLogging?: (val: boolean) => void
) => {
  // Kiểm tra cấu hình Auto Login trong localStorage
  const autoLoginConfig = localStorage.getItem('skyverses_auto_login_admin');
  const isAutoLoginEnabled = autoLoginConfig !== 'false';

  // Nếu người dùng tắt auto login, thoát hàm
  if (!isAutoLoginEnabled) {
    console.log("[ADMIN_AUTH] Auto-login is disabled via system configuration.");
    return;
  }

  if (setIsAdminLogging) setIsAdminLogging(true);
  try {
    const adminEmail = 'duloc2708@gmail.com';
    const success = await loginWithEmail(adminEmail, 'System Admin');
    if (success) {
      localStorage.setItem(`onboarding_complete_${adminEmail}`, 'true');
      navigate('/');
    } else {
      console.warn("Admin Auto-Login failed via API");
    }
  } catch (err) {
    console.error("Admin Login Error:", err);
  } finally {
    if (setIsAdminLogging) setIsAdminLogging(false);
  }
};
