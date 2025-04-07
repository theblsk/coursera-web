# Firebase Deployment Setup Guide

This guide provides detailed instructions for setting up Firebase deployment for the CourseHub project, including GitHub Actions for CI/CD.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup steps
3. Name your project (e.g., "coursehub-production")
4. Enable Google Analytics if desired, then click "Create project"
5. Wait for the project to be set up, then click "Continue"

## 2. Register a Web App in Firebase

1. From the Firebase project dashboard, click the web icon (</>) to add a web app
2. Enter a nickname for your app (e.g., "coursehub-web")
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object that appears on the screen, which contains:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## 3. Update Local Configuration Files

1. Update the `.firebaserc` file with your Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

2. Update the `.env` file with your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## 4. Set Up Local Firebase CLI

1. Log in to Firebase CLI:
   ```bash
   bun firebase:login
   ```

2. Initialize Firebase (if not already done):
   ```bash
   bun firebase:init
   ```
   - Select "Hosting" when prompted
   - Choose your Firebase project
   - Specify "dist" as your public directory
   - Configure as a single-page app: "Yes"
   - Set up automatic builds and deploys: "No" (we'll use GitHub Actions instead)

3. Test local setup:
   ```bash
   bun run build
   bun firebase:emulators
   ```

## 5. Set Up GitHub Actions

1. Generate a Firebase service account:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. Add secrets to your GitHub repository:
   - Go to your GitHub repo > Settings > Secrets and variables > Actions
   - Add a new repository secret `FIREBASE_SERVICE_ACCOUNT` with the entire content of the service account JSON file
   - Add all environment variables from your `.env` file as separate secrets:
     - `VITE_API_BASE_URL`
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

3. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Firebase deployment configuration"
   git push
   ```

4. Check GitHub Actions:
   - Go to your GitHub repo > Actions tab
   - You should see the workflow running after you push to the main branch

## 6. Verify Deployment

1. After the GitHub Action completes, go to your Firebase Hosting URL:
   - `https://your-project-id.web.app`

2. Verify that your app is working correctly

## Troubleshooting

- **Error: Authorization failed**: Run `bun firebase:login` again
- **Failed deployment**: Check GitHub Actions logs for specific errors
- **Missing environment variables**: Ensure all required secrets are set in GitHub
- **Routing issues**: Check the `firebase.json` rewrites configuration 