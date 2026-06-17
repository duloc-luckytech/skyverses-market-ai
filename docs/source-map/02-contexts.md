# Contexts — `context/`

| File | Hook | Exposes |
|------|------|---------|
| `AuthContext.tsx` | `useAuth()` | `user`, `isAuthenticated`, `credits`, `skyTokenBalance`, `tier ('free'\|'pro'\|'enterprise')`, `isPro`, `freeImageRemaining`, `login()`, `logout()`, `register()`, `claimWelcomeCredits()`, `refreshCredits()`, `refreshSkyTokenBalance()` |
| `LanguageContext.tsx` | `useLanguage()` | `lang ∈ {en,vi,ko,ja}`, `setLang(lang)`, `t(key)` |
| `SearchContext.tsx` | `useSearch()` | `query`, `setQuery`, `primary`, `setPrimary`, `secondary`, `setSecondary`, `open()`, `toggle()` (⌘K palette) |
| `ThemeContext.tsx` | `useTheme()` | `theme ∈ {light,dark}`, `toggleTheme()` (set `dark` class trên `<html>`) |
| `ToastContext.tsx` | `useToast()` | `show({message, type, duration})`. Types: `success\|error\|info\|warning`. Dùng framer-motion + lucide icons. |

## Notes

- `AuthContext` map `user.avatar → user.picture` cho legacy UI.
- `tier` được derive từ `user.plan` field từ backend.
- `LanguageContext` lưu `lang` vào localStorage.
- `LanguageContext` chứa i18n cho homepage hero/enterprise AI product messaging (`landing.hero.*`).
- `ThemeContext` watch `prefers-color-scheme` lần đầu mount.
- `useAuth` re-fetch credits khi `refreshCredits()` được gọi (sau khi gen job xong).
- `refreshSkyTokenBalance()` fetch SKT balance riêng qua `skytokenApi.getBalance()`. Gọi sau khi mua/rút SKT.

## Constants liên quan

- `constants/brand.ts` — `BRAND_LOGO`, `BRAND_LOGO_EXTERNAL`
- Avatar fallback: framerusercontent CDN (xem `DEFAULT_AVATAR` trong Header)
