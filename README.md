# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Firebase Deployment

This project is configured for deployment to Firebase Hosting with GitHub Actions.

### Setup Instructions

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Note down your Firebase project ID

2. **Update Configuration Files**
   - Update `.firebaserc` with your Firebase project ID
   - Fill in the Firebase configuration values in `.env` (get these from Firebase Console > Project Settings > Web Apps)

3. **Local Deployment Testing**
   - Install Firebase CLI locally: `bun firebase login`
   - Preview your site: `bun firebase emulators:start`
   - Deploy manually: `bun firebase deploy`

4. **GitHub Actions Setup**
   - Generate a Firebase service account:
     - Go to Firebase Console > Project Settings > Service Accounts
     - Click "Generate new private key"
     - Download the JSON file
   - Add the following secrets to your GitHub repository:
     - `FIREBASE_SERVICE_ACCOUNT`: Content of the service account JSON
     - All environment variables from `.env` should be added as secrets

5. **Deployment**
   - GitHub Actions will automatically deploy to Firebase when you push to main branch
   - You can also deploy manually with `bun run build && bun firebase deploy`

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
