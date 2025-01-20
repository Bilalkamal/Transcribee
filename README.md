<div align="center">

# 🐝 Transcrib.ee

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[![Redis](https://img.shields.io/badge/Redis-D82C20?style=for-the-badge&logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **Effortless, accurate YouTube video transcriptions powered by cutting-edge AI technology.**

[Visit Transcrib.ee](https://transcrib.ee)

</div>

## 🎯 Overview

**Transcrib.ee** is your ultimate YouTube transcription solution, combining a sleek user interface, advanced backend architecture, and a convenient Chrome extension to deliver high-quality, AI-driven video transcriptions. 

| Component            | Description                                                  |
|----------------------|--------------------------------------------------------------|
| 🌐 **Frontend**       | Built with Next.js and Tailwind CSS for an intuitive UI      |
| 🖥️ **Backend**         | Powered by FastAPI, Flask, and Redis for scalability         |
| 🔌 **Chrome Extension**| Integrates seamlessly with YouTube for easy transcription   |

Whether you’re a student, professional, or content creator, Transcrib.ee makes it effortless to generate, view, and manage transcriptions from any YouTube video.

---

## ✨ Features

### 🔧 Core Features
- **AI-Powered Transcriptions**: Convert YouTube audio into accurate, readable text
- **One-Click Accessibility**: Paste a URL or use the Chrome extension for instant transcriptions
- **Dark Mode Support**: Optimized for day and night use
- **Mobile-Responsive**: Fully functional on all devices

### 🚀 Advanced Capabilities
- **Backend**: Distributed microservices with intelligent job queuing, caching, and error recovery
- **Frontend**: Smart polling, local caching, and dynamic progress visualization
- **Chrome Extension**:
  - Video overlay button for direct transcription
  - Configurable keyboard shortcuts for convenience
  - Options page for user preferences

---

## 📁 Project Architecture

```bash
.
├── Backend/            # API and processing services
│   ├── FastAPI/        # Main API gateway
│   ├── Flask/          # Dedicated transcription service
│   ├── Redis/          # Background job queue
│
├── Frontend/           # User interface
│   ├── Next.js/        # Modern React-based web application
│   ├── TailwindCSS/    # Styling for a sleek design
│
├── Chrome Extension/   # Browser integration
│   ├── Background.js   # Extension logic
│   ├── Content.js      # YouTube integration
│   └── Options.html    # Settings page
```

---

## 🚀 Getting Started

### Prerequisites and Installation

Refer to the detailed setup guides in each respective folder:

- **Backend**: [Backend/README.md](Backend/README.md)
- **Frontend**: [Frontend/README.md](Frontend/README.md)
- **Chrome Extension**: [ChromeExtension/README.md](Chrome%20Extension/README.md)

These guides provide instructions for setting up dependencies, configuration, and running each component of the project.

---

## 🤝 Contributing

We welcome contributions from the community! Feel free to:
- Report bugs or suggest new features [here](https://github.com/Bilalkamal/Transcribee/issues)
- Fork the repository and submit pull requests

---

## 📬 Connect With Us

<div align="center">

[![Email](https://img.shields.io/badge/Email-hello@transcrib.ee-red?style=for-the-badge)](mailto:hello@transcrib.ee)
[![GitHub](https://img.shields.io/badge/GitHub-@Bilalkamal-black?style=for-the-badge&logo=github)](https://github.com/Bilalkamal/Transcribee)
[![Website](https://img.shields.io/badge/Website-Transcrib.ee-blue?style=for-the-badge)](https://transcrib.ee)

</div>

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
