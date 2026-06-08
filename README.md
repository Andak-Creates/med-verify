# MedVerify 💊

A mobile app for verifying medicine authenticity against Nigeria's official **NAFDAC** drug registry, managing a personal medical profile, and keeping a history of every drug you've checked. Built with [Expo](https://expo.dev) (React Native) and [file-based routing](https://docs.expo.dev/router/introduction).

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="Expo Router" src="https://img.shields.io/badge/Expo_Router-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="NativeWind" src="https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Google" src="https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
</p>

---

## Contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Notes on web support](#notes-on-web-support)
- [Learn more](#learn-more)

---

## Overview

MedVerify lets a user sign up (with OTP email verification or Google sign-in), build out a medical profile (avatar, blood group, allergies, chronic conditions), then scan or manually enter a drug's **NAFDAC registration number** to check it against the official registry. Every check is saved to a personal scan history with stats on total scans and authenticity rate. Pharmacists get their own dashboard and consultation flows.

The app talks to the [MedVerify backend](../med-verify-backend) (Express + Supabase) over a small REST client (`src/lib/api.ts`), with auth/session state managed through `AuthContext`.

Implemented so far:

1. **Onboarding & auth** — role selection, signup with OTP verification, email/password login, Google sign-in, "forgot password", and real sign-out (revokes the session on the backend)
2. **User dashboard** — home, profile/account management with avatar upload, blood group selector
3. **Drug verification** — manual NAFDAC-number entry with real backend lookups and result screens
4. **Scan history** — list of past verifications with authenticity stats, backed by real data
5. **Pharmacy & consultations** — pharmacy browsing and consultation booking screens
6. **AI chat** — in-app assistant screen

## Tech stack

| Layer | Technology |
|---|---|
| Framework | ![Expo](https://img.shields.io/badge/-Expo-000020?logo=expo&logoColor=white&style=flat-square) Expo SDK 56 / ![React Native](https://img.shields.io/badge/-React_Native-20232A?logo=react&logoColor=61DAFB&style=flat-square) React Native 0.85 |
| Language | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) TypeScript |
| Routing | ![Expo Router](https://img.shields.io/badge/-Expo_Router-000020?logo=expo&logoColor=white&style=flat-square) Expo Router (file-based routing, route groups for `(auth)`, `(onboarding)`, `(user)`, `(pharmacist)`) |
| Styling | ![NativeWind](https://img.shields.io/badge/-NativeWind-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) NativeWind / ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) Tailwind CSS + React Native `StyleSheet` |
| Auth | ![Google](https://img.shields.io/badge/-Google_OAuth-4285F4?logo=google&logoColor=white&style=flat-square) `expo-auth-session` (Google Sign-In), `expo-secure-store` (token storage on native, `localStorage` on web) |
| Networking | ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=flat-square) Axios REST client against the MedVerify backend |
| Media | `expo-camera`, `expo-image-picker`, `expo-image` (avatar capture/selection & display) |
| Animation/UI | `react-native-reanimated`, `react-native-gesture-handler`, `expo-blur`, `expo-glass-effect`, `@expo/vector-icons` |

## Project structure

```
med-verify/
├── src/
│   ├── app/                       # Expo Router file-based routes
│   │   ├── (auth)/                # Login, forgot-password
│   │   ├── (onboarding)/          # Role select, splash, user/pharmacist signup + OTP
│   │   ├── (user)/                # Home, account, history, pharmacy, AI chat
│   │   ├── (pharmacist)/          # Pharmacist dashboard & consultations
│   │   └── _layout.tsx            # Root layout (providers, OAuth session bootstrap)
│   ├── context/
│   │   └── AuthContext.tsx        # Session state, login/signup/logout, profile & avatar updates
│   ├── hooks/
│   │   └── useGoogleSignIn.ts     # Google ID-token sign-in via expo-auth-session
│   ├── lib/
│   │   ├── api.ts                 # Axios instance, platform-aware base URL
│   │   └── tokenStorage.ts        # Cross-platform token persistence (SecureStore / localStorage)
│   └── global.css                 # Tailwind/NativeWind entry
├── assets/                        # Images, fonts, icons
├── app.json                       # Expo app config
└── package.json
```

## Getting started

### Prerequisites

- ![Node.js](https://img.shields.io/badge/-Node.js_18+-339933?logo=nodedotjs&logoColor=white&style=flat-square) Node.js 18 or later
- The [MedVerify backend](../med-verify-backend) running locally (or a deployed instance) — this app expects a reachable REST API
- [Expo Go](https://expo.dev/go) on your phone for quick device testing, or an Android/iOS simulator
- A Google OAuth **Web application** client ID if you want to test "Sign in with Google"

### Installation

```bash
cd med-verify
npm install
```

### Configure environment

Create a `.env` file in the project root (see [Environment variables](#environment-variables)):

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

### Start the app

```bash
npx expo start
```

In the output you'll find options to open the app in:

- [Expo Go](https://expo.dev/go) — scan the QR code with your phone
- An [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) or [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- The web (`w` in the terminal, or `npm run web`)
- A [development build](https://docs.expo.dev/develop/development-builds/introduction/)

## Environment variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID used by `useGoogleSignIn` to request an ID token for "Sign in with Google" |

> The backend's base URL is configured directly in `src/lib/api.ts` (it's platform-aware: `localhost` on web to avoid browser Local Network Access restrictions, your machine's LAN IP on native so a physical device can reach it).

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Start the dev server and open on a connected Android device/emulator |
| `npm run ios` | Start the dev server and open on an iOS simulator (macOS only) |
| `npm run web` | Start the dev server in the browser |
| `npm run lint` | Run ESLint via `expo lint` |
| `npm run reset-project` | Move the starter code to `app-example/` and create a blank `app/` directory |

## Notes on web support

This project runs on web via `react-native-web`, but a few native APIs behave differently there — worth knowing if you're debugging:

- **`expo-secure-store`** has no web implementation, so `tokenStorage.ts` falls back to `localStorage` when `Platform.OS === 'web'`
- **`Alert.alert`** is a no-op on `react-native-web` — anywhere a confirmation dialog is needed (e.g. sign-out), the web path uses `window.confirm` instead
- **`FormData` file uploads** (e.g. avatar upload) need a real `Blob` in the browser — native `{ uri, name, type }` objects are converted via `fetch(uri).then(r => r.blob())` on web before being appended
- **Google Sign-In** uses a popup flow on web; `WebBrowser.maybeCompleteAuthSession()` is called at the very top of `_layout.tsx` so the redirect is recognized immediately and the popup closes itself instead of rendering a second copy of the app

## Learn more

- [Expo documentation](https://docs.expo.dev/) — fundamentals and [guides](https://docs.expo.dev/guides)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/) — file-based routing used throughout `src/app`
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/) — step-by-step intro to building universal apps
