<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" alt="Logo" width="80" height="80">

  <h1 align="center">AI Stress & Mental Health Monitor</h1>

  <p align="center">
    A comprehensive, real-time stress and mental health tracking mobile app built with Expo and React Native. Inspired by StressWatch.
    <br />
    <a href="#features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/vishallokhande/ai-stress-mental-health-monitor/issues">Report Bug</a>
    ·
    <a href="https://github.com/vishallokhande/ai-stress-mental-health-monitor/issues">Request Feature</a>
  </p>
</div>

<!-- Badges -->
<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<br />

## 📖 About The Project

Mental health and well-being are paramount in today's fast-paced world. This application acts as your personal AI-powered companion, monitoring your stress levels in real-time by utilizing simulated biometric data (such as Heart Rate and Heart Rate Variability) and providing actionable relief mechanisms. 

Whether you need a quick breathing exercise to center yourself, a safe space to journal your thoughts, or AI-driven insights into your weekly stress patterns, this app provides it all within a sleek, modern interface.

### 🎯 Origin Story
This project was developed **from scratch**, leveraging the `8xsocial/template-mobile` repository strictly as an initial boilerplate. The core logic, dynamic stress scoring algorithms, customized UI workflows, state management, and interactive modules (Relief, Journal, Insights) were custom-built to deliver a highly specialized mental health tracking experience.

## ✨ Key Features

* **📊 Real-Time Dashboard:** View your dynamic daily health metrics, including simulated HR and HRV, driving a custom Stress Score (0-100).
* **🧘‍♂️ Interactive Relief Exercises:** Feeling overwhelmed? Dive into step-by-step guided breathing exercises (e.g., 4-7-8 method) and Cognitive Behavioral Therapy (CBT) inspired activities to regain focus.
* **📓 Mindfulness Journal:** A dedicated space to log your mood, triggers, and daily reflections.
* **🧠 AI Weekly Insights:** Analyzes your stress trends over the week and provides personalized summaries and recommendations to improve your well-being.
* **🎨 Modern UI/UX:** Built using Tailwind CSS (NativeWind) for a vibrant, responsive, and intuitive user experience with smooth interactions.

## 🛠 Built With

* **[Expo](https://expo.dev/) & [React Native](https://reactnative.dev/):** For cross-platform mobile application development.
* **[Expo Router](https://docs.expo.dev/router/introduction/):** File-based routing for a seamless navigation experience.
* **[Tailwind CSS (NativeWind)](https://www.nativewind.dev/):** For rapid and consistent UI styling.
* **[Lucide React Native](https://lucide.dev/):** Beautiful, consistent iconography.
* **[React Context API](https://react.dev/reference/react/useContext):** Robust global state management for real-time biometric data flow.

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* Node.js (v20 or newer recommended)
* npm (v10 or newer)
* Expo Go app installed on your iOS or Android device (for physical device testing).

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/vishallokhande/ai-stress-mental-health-monitor.git
   ```
2. Navigate into the project directory
   ```sh
   cd ai-stress-mental-health-monitor
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   # To start the Expo server for mobile
   npx expo start

   # To start the web preview
   npm run web
   ```

## 📱 Application Structure

The application utilizes an intuitive tab-based navigation flow:
- **`Home (Dashboard)`**: Your daily overview and current stress score.
- **`Relief`**: A library of exercises designed to lower immediate stress.
- **`Journal`**: Your personal logging space.
- **`Insights`**: Weekly analytics and AI-driven feedback.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
