# Apex Athletic - Sports Talent Assessment Platform

Apex Athletic is a React + TypeScript platform for AI-powered sports performance analysis. It leverages TensorFlow.js for real-time pose detection, Supabase for authentication and data management, and provides a comprehensive dashboard for athletes to track their performance metrics and improve their form.

---

## Live App

This is a code bundle for Apex Athletic. The live project is available at:

**https://apex-athletic.web.app/**

---

## Tech Stack

- **React + TypeScript** (componentized UI and state management)
- **Vite** (fast dev server and optimized production builds)
- **Supabase** (authentication and backend data storage)
- **TensorFlow.js** (browser-based machine learning for pose detection)
- **Framer Motion** (smooth animations and transitions)
- **Tailwind CSS** (utility-first responsive styling)
- **Recharts** (data visualization and performance metrics)

---

## Features

### Core Functionality

- **Real-Time Pose Detection** – Live video analysis using MoveNet pose detection model for instant form feedback
- **Video Upload & Analysis** – Upload recorded videos for detailed post-performance analysis
- **Multi-Sport Support** – Track various sports and drills (squats, push-ups, and more)
- **Performance Metrics** – Calculate and visualize flexibility, power, stability, and overall performance scores
- **Dashboard Analytics** – Comprehensive dashboard with stats, history, leaderboards, and progress tracking
- **Practice Zone** – Guided practice sessions with real-time feedback
- **User Profiles** – Personal profiles with performance history and achievements
- **Authentication** – Secure login/signup via Supabase Auth with session management

### UI/UX Features

- **Animated Constellation Background** – Dynamic, multi-layered animated background with cosmic theme
- **Responsive Design** – Mobile-first design that works seamlessly across all devices
- **Smooth Animations** – GPU-optimized animations using Framer Motion for polished user experience
- **Modern Typography** – Clean, athletic font styling (Inter/Poppins) for professional appearance

---

## Getting Started

### Prerequisites

- **Node.js LTS** (v18 or higher recommended) and npm installed:

```bash
node -v
npm -v
```

Use an LTS version for best compatibility.

### Installation

1) **Clone the repository** (if applicable) or navigate to the project directory.

2) **Install dependencies:**

```bash
npm install
```

3) **Set up environment variables:**

Create a `.env` (or `.env.local`) file at the project root to configure Supabase:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

**Notes:**
- Vite only exposes variables prefixed with `VITE_` to the client.
- Do not expose service-role keys in client code. Use server-side only where applicable.

4) **Start the development server:**

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser to see the app.

5) **Build for production:**

```bash
npm run build
```

This creates an optimized production bundle in the `dist` folder.

6) **Preview the production build locally:**

```bash
npm run preview
```

This serves the `dist` folder for quick validation before deployment.

---

## Environment Variables

Required environment variables for the application:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key | Yes |

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

**Security Notes:**
- Never commit `.env` files with actual keys to version control.
- The `anon` key is safe to expose in client code, but ensure Row Level Security (RLS) is properly configured in Supabase.
- Service-role keys should never be exposed in client-side code.

---

## Project Structure

```
src/
├── App.tsx                      # Main application entry and routing logic
├── LiveDemo.tsx                 # Live pose detection demo component
├── AuthPage.tsx                 # Authentication (login/signup) page
├── UploadPage.tsx               # Video upload interface
├── main.tsx                     # React entry point
├── Database
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx  # Main dashboard container with navigation
│   │   ├── LiveAnalysis.tsx     # Real-time video analysis interface
│   │   ├── HistoryPage.tsx      # Performance history and past analyses
│   │   ├── ProfilePage.tsx      # User profile and settings
│   │   ├── PracticeZone.tsx     # Guided practice sessions
│   │   ├── UploadVideoPage.tsx  # Video upload within dashboard
│   │   └── SettingsPage.tsx     # Application settings
│   ├── BackgroundAnimation.tsx  # Animated background particles
│   ├── ConstellationAnimation.tsx # Constellation/stars animation
│   └── Footer.tsx               # Footer component
├── utils/
│   └── analysis.ts              # Pose analysis algorithms and metrics calculation
├── lib/
│   └── supabaseClient.ts        # Supabase client initialization
├── assets/                      # Static assets (images, icons)
├── index.css                    # Global styles and Tailwind directives
└── theme.ts                     # Theme configuration
```

---

## Key Features Deep Dive

### Real-Time Pose Detection

Uses TensorFlow.js with MoveNet (SinglePose Lightning) model for fast, accurate pose estimation in real-time. Analyzes:
- Joint angles and body alignment
- Movement range and depth
- Form quality metrics (flexibility, power, stability)
- Real-time visual feedback with skeleton overlay

### Performance Analysis

Post-analysis calculates comprehensive metrics:
- **Flexibility** – Range of motion and joint mobility
- **Power** – Explosive movement strength and velocity
- **Stability** – Balance and control during movement
- **Overall Score** – Weighted combination of all metrics

### Dashboard Features

- **Home Dashboard** – Overview stats, recent activity, quick actions
- **Live Analysis** – Real-time video feed with pose detection overlay
- **History** – Chronological list of past analyses with detailed results
- **Practice Zone** – Guided practice with countdown and instructions
- **Leaderboard** – Compare performance with other athletes (if enabled)
- **Profile** – Personal information, achievements, and preferences
- **Settings** – Application preferences and account management

---

## Deployment

### Firebase Hosting

Recommended for deployment matching the live URL.

1) **Install Firebase CLI and login:**

```bash
npm install -g firebase-tools
firebase login
```

2) **Initialize Firebase Hosting** (if not already done):

```bash
firebase init hosting
```

**Configuration:**
- Public directory: `dist`
- Configure as single-page app (rewrite all URLs to `/index.html`)
- Set up automatic builds (optional)

3) **Build and deploy:**

```bash
npm run build
firebase deploy --only hosting
```

Detailed steps available in [Firebase Hosting documentation](https://firebase.google.com/docs/hosting/quickstart).

### Netlify

1) **Via Netlify Dashboard:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Drag and drop the `dist` folder, or connect your Git repository for continuous deployment

2) **Via Netlify CLI:**

```bash
npm install -g netlify-cli
netlify init
npm run build
netlify deploy --prod
```

See [Netlify Vite documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) for more details.

### Vercel

1) **Import your Git repository** into Vercel dashboard

2) **Configure build settings:**
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

3) **Add environment variables** in Vercel dashboard (same as `.env` file)

See [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite) for framework-specific details.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR (Hot Module Replacement) |
| `npm run build` | Create optimized production bundle in `dist/` |
| `npm run preview` | Serve the production build locally for testing |
| `npm run lint` | Run ESLint to check code quality |
| `npm run tailwind-init` | Initialize Tailwind CSS configuration (if needed) |

---

## Supabase Setup

### Database Schema

The application expects a `profiles` table in Supabase with the following structure:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Authentication

Supabase Auth is used for user authentication. The app supports:
- Email/password signup and login
- Session persistence
- Automatic session refresh

Ensure Supabase Authentication is enabled in your Supabase project dashboard.

---

## Performance Considerations

- **Pose Detection Model**: Uses MoveNet SinglePose Lightning for optimal performance/accuracy balance
- **Canvas Rendering**: Optimized canvas operations for smooth real-time visualization
- **Animation Performance**: GPU-accelerated animations using CSS transforms and Framer Motion
- **Bundle Size**: Code splitting and lazy loading where applicable
- **Image Optimization**: Compressed assets and lazy loading for faster initial load

---

## Browser Compatibility

- **Chrome/Edge** (recommended) – Full support for all features
- **Firefox** – Full support
- **Safari** – Full support (may require camera permissions)
- **Mobile Browsers** – Responsive design, camera access may vary

**Note:** Real-time video analysis requires:
- Webcam access permissions
- Modern browser with WebRTC support
- Hardware-accelerated graphics recommended

---

## Contributing

We welcome contributions! Here are some guidelines:

1. **Open issues** with clear reproduction steps and environment information
2. **Submit PRs** following the existing code style and structure
3. **Test thoroughly** before submitting, especially for video analysis features
4. **Update documentation** if adding new features or changing behavior

Consider adding a `CONTRIBUTING.md` for more detailed setup and review guidelines.

---

## Troubleshooting

### Common Issues

**Camera not working:**
- Ensure HTTPS is enabled (required for camera access in browsers)
- Check browser permissions for camera/microphone
- Try a different browser or device

**Supabase connection errors:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project status and API limits
- Ensure RLS policies are correctly configured

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is LTS (v18+)
- Check for TypeScript errors: `npm run build`

---

## License

This project is proprietary software. All rights reserved.

For licensing inquiries, please contact the project maintainer.

---

## Acknowledgments

- **TensorFlow.js** – For making ML accessible in the browser
- **Supabase** – For providing an excellent backend-as-a-service platform
- **Framer Motion** – For smooth, performant animations
- **Tailwind CSS** – For rapid, maintainable styling

---

## Contact & Support

- **Live App**: https://apex-athletic.web.app/
- **Email**: run40081@gmail.com
- **Location**: Bengaluru, India
- **Phone**: +91 9731783858

---

## References

- [Vite Documentation](https://vite.dev/guide/) – Getting Started with Vite
- [React Documentation](https://react.dev/) – Learn React
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth) – Authentication with Supabase
- [TensorFlow.js Pose Detection](https://www.tensorflow.org/js/models) – Pose Detection Models
- [Firebase Hosting Quickstart](https://firebase.google.com/docs/hosting/quickstart) – Deploy to Firebase
- [Netlify Vite Setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) – Deploy to Netlify
- [Vercel Vite Framework](https://vercel.com/docs/frameworks/frontend/vite) – Deploy to Vercel

---

**Built by [THARUN P](https://www.linkedin.com/in/tharun-p-4146b4318/) from [AlgoNomad](https://github.com/tharun242005)**

© 2025 Apex Athletic. All rights reserved.
