cd "c:\Users\Utilizador\Desktop\Stamp me\stamp-me"

# Browser
npx ionic serve

# Android (requer Android Studio)
npx cap open android

# iOS (requer macOS + Xcode)
npx cap open ios

# Após alterações → rebuild
npx ionic build && npx cap sync
