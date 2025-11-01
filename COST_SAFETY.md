# Firebase Cost Safety Guide

Firebase billing, expected costs, and protection against unexpected charges.

## TL;DR

**Expected monthly cost: $0.00**

Your usage is well under Firebase's free tier. You'd need extreme viral traffic to approach $1/month in costs.

## Why Firebase Requires a Credit Card

Cloud Functions require the Blaze (pay-as-you-go) plan, but it includes a **very generous free tier** that covers small to medium projects completely.

## Firebase Blaze Free Tier Limits

| Service               | Free Tier (Monthly)   | Your Usage    | % Used |
| --------------------- | --------------------- | ------------- | ------ |
| **Cloud Functions**   | 2,000,000 invocations | ~16,000       | 0.8%   |
| **Cloud Functions**   | 400,000 GB-seconds    | ~1,600 GB-sec | 0.4%   |
| **Firestore Reads**   | 50,000 reads/day      | ~500/day      | 1%     |
| **Firestore Writes**  | 20,000 writes/day     | ~20/day       | 0.1%   |
| **Firestore Storage** | 1 GB                  | <1 MB         | <0.1%  |
| **Hosting**           | 10 GB storage         | <1 MB         | <0.1%  |
| **Hosting**           | 360 MB/day transfer   | ~10 MB/day    | 2.7%   |
| **Authentication**    | Unlimited             | Unlimited     | N/A    |

**Your project uses <1% of the free tier for most services.**

## Cost Estimation by Scenario

| Scenario                | Function Calls/Month | Monthly Cost |
| ----------------------- | -------------------- | ------------ |
| Normal Usage (current)  | ~16,000              | **$0.00**    |
| Featured on Hacker News | ~50,000              | **$0.00**    |
| Moderate Growth         | ~100,000             | **$0.00**    |
| Going Viral             | 1,000,000            | **$0.40**    |
| Extreme Traffic         | 5,000,000            | **~$1.60**   |

To exceed the **2,000,000 free invocations/month**, you would need **66,667 gallery views per day** sustained for a month.

## Cost Beyond Free Tier

| Service                       | Cost                     |
| ----------------------------- | ------------------------ |
| Cloud Functions (invocations) | $0.40 per 1M calls       |
| Cloud Functions (compute)     | $0.0000025 per GB-second |
| Firestore Reads               | $0.06 per 100K reads     |
| Firestore Writes              | $0.18 per 100K writes    |
| Firestore Storage             | $0.18 per GB/month       |
| Hosting Transfer              | $0.15 per GB             |

**Example:** Even at 10M function calls/month (625x your current usage), you'd pay ~$3.60/month.

## Budget Protection Setup

### Step 1: Set Up Budget Alerts

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **Billing** → **Budgets & alerts**
4. Click **Create Budget**
5. Set up alerts at $1, $5, $10

### Step 2: Set Up Email Notifications

1. In Firebase Console → **Usage and billing**
2. Click **Details** next to Cloud Functions
3. Enable **Email notifications** at 50%, 90%, 100% of free tier

### Step 3: Monitor Usage Dashboard

Check monthly (takes 2 minutes):

1. ✅ Check Firebase Usage dashboard
2. ✅ Verify function calls are <100K/month
3. ✅ Verify Firestore reads are <50K/day
4. ✅ Check Google Cloud billing report shows $0

## Red Flags to Watch For

🚩 **Function calls spike** (>100K in a day)

- Possible cause: Bot scraping
- Action: Check function logs, add rate limiting

🚩 **Firestore reads spike** (>10K in a day)

- Possible cause: Infinite loop in client code
- Action: Check browser console for errors

🚩 **Hosting bandwidth spike** (>1GB in a day)

- Possible cause: Large file being served repeatedly
- Action: Check what's being downloaded

## Emergency Shutdown

If you need to immediately stop all charges:

### Option 1: Disable Cloud Functions

```bash
firebase functions:delete submitAnimation
firebase functions:delete approveSubmission
firebase functions:delete rejectSubmission
```

### Option 2: Disable Entire Project

1. Go to Firebase Console
2. Project Settings → General
3. Scroll to bottom → **Delete project**

## FAQ

**Q: What if I forget to monitor and get charged?**
A: Budget alerts will email you. Even in worst case, you'd need millions of requests to exceed $10/month.

**Q: Can I set a hard budget cap to automatically stop billing?**
A: No, Google Cloud doesn't have "disable on cap". You must manually disable services when alerts trigger.

**Q: Is there a way to use Firebase without a credit card?**
A: No, Cloud Functions require Blaze plan. Alternatives: Cloudflare, Supabase.

## Free Alternatives to Firebase

### Cloudflare (Recommended)

- **Pages** - Static hosting (unlimited free)
- **Workers** - Serverless functions (100K requests/day free)
- **D1** - SQL database (100K reads/day free)
- **Auth** - Coming soon

### Supabase

- **Database** - PostgreSQL (500MB free)
- **Edge Functions** - 500K invocations/month free
- **Auth** - Unlimited free
- **Storage** - 1GB free

Both alternatives require NO credit card for their free tiers.

## Summary

✅ **Expected cost: $0/month**
✅ **Free tier covers: 2M function calls/month**
✅ **Your usage: 16K function calls/month (0.8%)**
✅ **Protection: Budget alerts + monitoring**
✅ **Monitoring: 2 minutes/month**

**You're safe.** The Firebase free tier is extremely generous, and your project is well within limits.
