# 💝 HeartPass

*A personalized coupon card with your heart*

HeartPass is a free web app for creating **action-based digital coupon cards** for soulmates, family, partners, and friends. Each HeartPass is designed as a boarding pass, transforming gifts into lovely experiences.

## ✨ Key Features

- 🎨 **12 Action-Based Coupons(Pass)**: Variety of coupon types including full body massage, coffee & dessert day, movie night, romantic dinner, and more
- 💌 **Personalized Message Generation**: AI-generated messages based on pass type and mood
- 🎟 **Boarding Pass Design**: Unique but intuitive ticket-style design that makes receiving a pass feel special
- 💾 **Download & Share**: Download as PNG image or share via email
- 🎁 **Flexible Validity**: Lifetime or custom expiry date options
- 📱 **Responsive Design**: Works on both mobile, tablet and desktop devices
- 👤 **User Accounts**: Sign up to save and manage your passes
- 📧 **Email Sending**: Send passes directly to recipients via email
- 📊 **Pass Management**: Track sent and received passes with status management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication and database)
- Resend account (optional, for email sending)

### Installation

1. Clone or download the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend (Optional, for email sending)
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (Not currently used - message templates are used instead)
# OPENAI_API_KEY=your_openai_api_key_here
```

> **Note**: The app uses message templates for personalized messages. OpenAI API key is not required.

4. Set up Supabase database:

   - Create a Supabase project
   - Run the schema from `supabase/schema.sql` in your Supabase SQL editor

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

1. **Create an Account**: Sign up or log in to save your passes
2. **Start Creating**: Click "BOARDING NOW" from the home page
3. **Create Your Pass** (5 steps):
   - Choose recipient type (Friend/Partner/Family)
   - Select a coupon type from available options
   - Choose mood (Cute/Fun/Heartfelt/Event)
   - Enter names (sender and recipient)
   - Set validity (Lifetime or custom date)
4. **Generate Message**: Click "Generate with AI" to create a personalized message (editable)
5. **Save or Send**: Save to "My Pass" or send directly via email
6. **Manage Passes**: View all sent and received passes in "My Pass" page with status tracking

## 🛠 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **Resend** - Email delivery service
- **html2canvas** - Image download functionality
- **date-fns** - Date formatting and parsing
- **React DatePicker** - Date selection component

## 📁 Project Structure

```
heartpass/
├── app/
│   ├── api/
│   │   ├── ai-message/     # Message generation API
│   │   ├── chat/           # Chatbot API
│   │   ├── contact/        # Contact form API
│   │   └── send-email/     # Email sending API
│   ├── auth/
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── card/              # Card view page
│   ├── create/            # Card creation page
│   ├── my-cards/          # Pass management page
│   ├── received/          # Received passes page
│   ├── sent/              # Sent passes page
│   ├── profile/           # User profile page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── Card.tsx           # Card wrapper component
│   ├── CSSTicket.tsx      # Ticket UI component
│   ├── Navigation.tsx     # Global navigation
│   ├── Footer.tsx         # Footer component
│   └── ...               # Other components
├── data/
│   ├── coupons.ts         # Coupon definitions
│   └── message-templates.ts # Message templates
├── lib/
│   └── supabase/          # Supabase client setup
├── types/
│   └── index.ts           # TypeScript type definitions
├── hooks/
│   └── useIsMobile.ts     # Mobile detection hook
└── public/                # Static files
```

## 🎨 Design

- **Color Palette**: Cream background (#FFFEEF) with red accent (#f20e0e)
- **Style**: Clean, minimal design inspired by boarding pass aesthetics
- **Typography**: Custom font (Jenny) for headings, Inter for body text
- **Layout**: Responsive design optimized for both mobile and desktop

## 📝 License

MIT License

## 🤝 Feedback

We welcome feedback and suggestions to improve HeartPass! If you have ideas or encounter any issues, please feel free to reach out.

---

Made with 💝 for special moments
