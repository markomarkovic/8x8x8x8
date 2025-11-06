# Firebase Setup Guide

Step-by-step instructions to set up Firebase hosting, authentication, and cloud functions for the 8x8x8x8 gallery feature.

## Prerequisites

- Node.js 20+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google account
- **A credit card** (required for Blaze plan - see [COST_SAFETY.md](COST_SAFETY.md) for details)

## Step 0: Upgrade to Blaze Plan with Budget Protection

**Do this BEFORE deploying Cloud Functions.**

### A. Upgrade to Blaze Plan

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Upgrade** in the left sidebar
4. Select **Blaze** plan and add your credit card details

### B. Set Up Budget Alerts (CRITICAL)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from the dropdown
3. Navigate to **Billing** → **Budgets & alerts**
4. Click **Create Budget**
5. Configure budget:
   - **Name**: "Firebase Monthly Budget"
   - **Amount**: $10
   - Add alerts at: 50%, 90%, 100%, 150%
   - Email notifications: Check your email
6. Click **Finish**

### C. Enable Usage Alerts in Firebase

1. Go to Firebase Console → **Usage and billing**
2. Click **Details** next to **Cloud Functions**
3. Enable email notifications at 50%, 90%, 100% of free tier

**Note:** See [COST_SAFETY.md](COST_SAFETY.md) for expected costs ($0/month) and detailed monitoring guide.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "8x8x8x8-animations")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** → Enable → Save

### Enable Firestore

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select your preferred location
4. Click **Enable**

### Enable Functions

1. Go to **Functions** in the Firebase Console
2. Click **Get started**

## Step 3: Configure Firebase Project

1. Navigate to the project directory:

   ```bash
   cd /home/fl/Work/personal/8x8x8x8
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Link your Firebase project:

   ```bash
   firebase use --add
   ```

   - Select your project from the list
   - Enter alias: `default`

4. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id-here"
     }
   }
   ```

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app with nickname "8x8x8x8"
5. Copy the `firebaseConfig` object values

## Step 5: Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc123
   ```

## Step 6: Configure Admin Access

Admins are managed in the Firestore `admins` collection (single source of truth). To add yourself as an admin:

1. Start the development server:

   ```bash
   pnpm install
   pnpm dev
   ```

2. Open the app in your browser (usually `http://localhost:5173`)
3. Click "Sign in with Google" and sign in
4. Open browser console and copy your UID from:

   ```
   Your Firebase UID: <your-uid-here>
   ```

5. Deploy Firestore rules first (see Step 7 below)

6. Add yourself as an admin in Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/) → Firestore Database
   - Click **Start collection**
   - Collection ID: `admins`
   - Document ID: **Your UID** (paste it here)
   - Add a field (optional): `email` (string) = your email
   - Click **Save**

**That's it!** Refresh the app and you'll have admin access. The console will show `Is Admin: true`.

## Step 7: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Wait for indexes to build (check Firebase Console → Firestore → Indexes).

## Step 8: Deploy Cloud Functions

```bash
pnpm functions:deploy
```

This deploys three functions:

- `submitAnimation` - Users submit animations
- `approveSubmission` - Admin approves submissions
- `rejectSubmission` - Admin rejects submissions

## Step 9: Build and Deploy Hosting

```bash
pnpm deploy
```

Your app will be live at: `https://your-project-id.web.app`

Alternatively, to deploy only hosting:

```bash
pnpm build
firebase deploy --only hosting
```

## Step 10: Set Up Automated GitHub Actions Deployment (Optional)

Automate deployments on every push to the `main` branch using GitHub Actions.

### A. GitHub Action Workflow

The workflow is already configured in `.github/workflows/deploy-firebase.yml` and will:

- Run on every push to `main` branch
- Build your project (hosting + functions)
- Deploy to Firebase automatically
- Can also be triggered manually from GitHub Actions UI

### B. Add Required Secrets to GitHub

You need to add **7 secrets** total: 6 Firebase config variables and 1 service account.

1. **Add Firebase Configuration Secrets:**

   - Go to your GitHub repository: `https://github.com/YOUR_USERNAME/8x8x8x8`
   - Click **Settings** (top menu)
   - In the left sidebar, click **Secrets and variables** → **Actions**
   - Click **New repository secret** for each of the following:

   | Secret Name | Value Source |
   |-------------|--------------|
   | `VITE_FIREBASE_API_KEY` | From Firebase Console → Project Settings → General → Your apps → SDK setup and configuration |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Same as above |
   | `VITE_FIREBASE_PROJECT_ID` | Same as above |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Same as above |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
   | `VITE_FIREBASE_APP_ID` | Same as above |

   These values should match what you put in your `.env.local` file (Step 5).

2. **Add Firebase Service Account Secret:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **eightxeightxeightxeight**
   - Click the gear icon ⚙️ → **Project settings**
   - Go to the **Service accounts** tab
   - Click **Generate new private key**
   - Click **Generate key** to download the JSON file
   - Open the downloaded JSON file and copy its **entire contents**
   - Back in GitHub: Click **New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON content
   - Click **Add secret**

3. **Commit and Push the Workflow:**

   ```bash
   git add .github/workflows/deploy-firebase.yml
   git commit -m "feat: add GitHub Actions deployment workflow"
   git push origin main
   ```

4. **Verify Deployment:**
   - Go to your repository on GitHub
   - Click the **Actions** tab
   - You should see the deployment workflow running
   - Once complete, your app will be deployed to Firebase

**Note:** The `GITHUB_TOKEN` is automatically provided by GitHub Actions, so you don't need to add it manually.

### Alternative: Using Firebase Token (Legacy Method)

If you prefer using a Firebase token instead of a service account:

```bash
firebase login:ci
```

Copy the token, then:

- Add it as a GitHub secret named `FIREBASE_TOKEN`
- Update the workflow to use `firebase deploy` with the token instead

---

## Testing the Gallery Feature

### As a Regular User

1. Sign in with Google
2. Create an animation in the editor
3. Click the "Submit" button
4. Your submission appears in your queue with a yellow outline
5. Wait for admin approval

### As an Admin

1. Sign in with the admin Google account
2. You'll see a "Pending Review (Admin)" section with red-outlined animations
3. Click any pending animation to see the approval modal
4. Click "Approve" or "Reject"
5. Approved animations appear in the Public Gallery immediately

## Troubleshooting

### "Permission denied" errors

- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify you're signed in with the correct account
- Check that your UID exists in Firestore: **Console** → **Firestore** → **admins** collection

### Functions not working

- Check Functions are deployed: `firebase functions:list`
- View logs: `pnpm functions:logs`
- Verify your UID exists in the `admins` collection in Firestore

### Build errors

- Install dependencies: `pnpm install`
- Clear cache: `rm -rf node_modules dist functions/lib functions/node_modules && pnpm install`

### Firestore indexes not ready

- Go to Firebase Console → Firestore → Indexes
- Wait for all indexes to show "Enabled" status (takes 5-10 minutes)

## Security Notes

- Never commit `.env.local` (it's in `.gitignore`)
- Admin UID should be kept private
- Firestore security rules prevent unauthorized access
- Cloud Functions validate admin permissions server-side
