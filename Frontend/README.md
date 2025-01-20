<div align="center">

# 🐝 Transcrib.ee - Frontend

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)


[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![ShadCN](https://img.shields.io/badge/ShadCN-%23A78BFA?style=for-the-badge&logo=shadcn)](https://shadcn.dev/)


> **Effortless, accurate YouTube video transcriptions with a sleek and modern interface.**

[Visit us at Transcrib.ee](https://transcrib.ee)

</div>

## 🎯 Overview

Transcrib.ee's frontend delivers a seamless transcription experience with a responsive, feature-rich web interface. Built using cutting-edge technologies like Next.js and TypeScript, it ensures fast performance, a polished user experience, and high reliability.

| Feature                       | Description                                            |
|-------------------------------|--------------------------------------------------------|
| 🚀 **One-Click Transcription**| Paste a YouTube URL and get instant transcriptions    |
| 🌙 **Dark Mode**              | System-aware theme switching for user convenience     |
| 📱 **Responsive Design**      | Fully mobile-optimized for on-the-go usage            |
| 🔄 **Real-Time Updates**      | Smooth transcription progress tracking                |
| 🛠️ **Error Handling**         | Intuitive error messages and graceful recovery        |

## ✨ Key Features

### User Interface Highlights
- **Modern Design**: A sleek, minimalist interface with an emphasis on usability
- **Dark Mode**: Automatically adapts to system theme preferences
- **Mobile-Responsive**: Fully optimized for devices of all sizes
- **Real-Time Progress Tracking**: Visual feedback on transcription status

### Technical Strengths
- **Smart Polling System**: Efficiently tracks transcription progress with minimal server load
- **LocalStorage Caching**: Caches transcription history for instant access
- **Progress Visualization**: Animated progress indicators with color-coded states
- **Error-Resilient Design**: Friendly error messages and robust error handling

## 📁 Code Architecture

```bash
.
├── Pages/                  # Next.js pages for routing and views
│   ├── index.tsx           # Home page with transcription input
│   ├── history.tsx         # View previous transcriptions
├── Components/             # Reusable UI components
│   ├── TranscriptionCard/  # Displays transcription details
│   ├── ProgressBar/        # Custom progress indicator
│   └── Layout.tsx          # Common layout wrapper
├── Hooks/                  # Custom React hooks
│   ├── useTranscriptionProgress.ts
│   └── useTranscriptionHistory.ts
├── Lib/                    # Utility functions and API handlers
│   ├── api.ts              # API call logic
│   ├── storage.ts          # LocalStorage helpers
├── Styles/                 # Global and component-specific styles
│   └── dark-mode.css       # Dark mode styles
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependency manager
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js 22+
- Yarn or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bilalkamal/Transcribee.git
   cd Transcribee/Frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open the app in your browser at `http://localhost:3000`.

### Deployment

This project is deployed on [Vercel](https://vercel.com/). For a seamless deployment experience:

1. Link your GitHub repository to Vercel.
2. Set environment variables in Vercel's dashboard.
3. Trigger deployments automatically on pushes to the main branch.

Visit the live app at [transcrib.ee](https://transcrib.ee).

## 📜 Usage

1. **Visit the Website**: Go to [transcrib.ee](https://transcrib.ee).
2. **Paste YouTube URL**: Enter the YouTube video link into the input field.
3. **Track Progress**: Watch as the transcription completes in real-time.
4. **View Results**: Access the transcript directly or save it for later.



## 🤝 Contributing

We welcome contributions from the community! Feel free to:
- Report bugs or suggest new features [here](https://github.com/Bilalkamal/Transcribee/issues)
- Fork the repository and submit pull requests

## 📬 Connect With Us

<div align="center">

[![Email](https://img.shields.io/badge/Email-hello@transcrib.ee-red?style=for-the-badge)](mailto:hello@transcrib.ee)
[![GitHub](https://img.shields.io/badge/GitHub-@Bilalkamal-black?style=for-the-badge&logo=github)](https://github.com/Bilalkamal/Transcribee)
[![Website](https://img.shields.io/badge/Website-Transcrib.ee-blue?style=for-the-badge)](https://transcrib.ee)

</div>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
