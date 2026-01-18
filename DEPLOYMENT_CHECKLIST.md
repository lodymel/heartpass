# 🚀 HeartPass Deployment Checklist

## 📋 Required Environment Variables

Set the following environment variables on your deployment platform:

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optional
```env
# Required if using email sending feature
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_ACCOUNT_EMAIL=your-email@example.com  # For Resend free tier

# Required if using AI chatbot feature
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Contact form email recipient (default: support@heartpass.net)
SUPPORT_EMAIL=support@heartpass.net
```

## 🔒 Security Checklist

### ✅ Completed Items
- [x] Environment variables stored only in `.env.local` (included in `.gitignore`)
- [x] API keys not hardcoded in code
- [x] Korean comments removed

### ⚠️ Pre-Deployment Recommendations

1. **Remove/Minimize Console.log**
   - Remove debug logs in production
   - Especially logs containing personal information like `user.id`, `recipient_email`

2. **Error Message Cleanup**
   - Generalize error messages shown to users
   - Log detailed internal errors only in server logs

## 🏗️ Build Optimization

### Next.js Configuration Check
- Consider adding optimization options to `next.config.ts`
- Image optimization settings
- Bundle size optimization

**Current Status**: `next.config.ts` has only default settings. Consider adding optimization options before deployment:
```typescript
const nextConfig: NextConfig = {
  // Production optimization
  compress: true,
  poweredByHeader: false,
  // Image optimization is automatically applied when using Next.js Image component
};
```

### Build Test
```bash
npm run build
npm run start
```
Verify that production build completes successfully

## 🌐 Recommended Deployment Platforms

### 1. Vercel (Highly Recommended) ⭐
**Advantages:**
- Perfect integration with Next.js
- Automatic HTTPS, CDN
- Easy environment variable management
- Free plan available
- Automatic deployment via Git integration

**Setup:**
1. Push to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deployment complete

### 2. Netlify
**Advantages:**
- Next.js support
- Free plan
- Easy setup

### 3. Railway / Render
**Advantages:**
- Serverless + database integration
- Easy Supabase integration

## 📊 Pre-Deployment Testing

### Required Tests
- [ ] Sign up/Login
- [ ] Card creation (all 5 steps)
- [ ] Message generation (AI template-based)
- [ ] Card save
- [ ] Email sending (when Resend API key is configured)
- [ ] Card accept/use
- [ ] Card deletion
- [ ] Download functionality (PNG)
- [ ] Mobile/tablet/desktop responsive
- [ ] Error handling (network errors, etc.)
- [ ] Chatbot functionality (when OpenAI API key is configured)

### Performance Tests
- [ ] Page loading speed
- [ ] Image optimization
- [ ] API response time

## 🔧 Post-Deployment Monitoring

### Recommended Tools
1. **Vercel Analytics** (when using Vercel)
2. **Sentry** (error tracking)
3. **Google Analytics** (user analytics)

## ⚙️ Supabase Configuration

### Production Checklist
- [ ] RLS (Row Level Security) policies verified
- [ ] Database backup configured
- [ ] API Rate Limiting configured
- [ ] Email authentication settings verified

## 📧 Email Service (Resend)

### Configuration Check
- [ ] Domain verification completed (`heartpass.net`)
- [ ] SPF/DKIM/DMARC records configured
- [ ] API key issued and environment variable set

## 🚨 Emergency Response Plan

### When Issues Occur
1. Check Vercel/deployment platform logs
2. Check query logs in Supabase dashboard
3. Check browser console errors
4. Re-verify environment variables

## 💡 Additional Recommendations

1. **Add Error Boundaries**
   - Handle unexpected errors with React Error Boundary

2. **Improve Loading States**
   - Enhance user experience with Skeleton UI

3. **SEO Optimization**
   - Add meta tags
   - Configure Open Graph

4. **Performance Monitoring**
   - Track Core Web Vitals
   - Check Lighthouse scores
