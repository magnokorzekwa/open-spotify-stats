# Open Spotify Stats 🎧

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![Vue.js](https://img.shields.io/badge/vue.js-3.x-green.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-success.svg)

A statistical analysis tool for Spotify data, focused on privacy and local processing. Rediscover your listening habits without sending your data to the cloud.

## 🚀 Features

* **100% Local Processing:** Your JSON files never leave your computer.
* **Web Workers:** Analysis of large datasets without freezing the UI.
* **Smart Timezone Support:** Adjust statistics to your actual location, not just UTC.
* **Advanced Filters:** Ignore accidental "skips" and define minimum stream duration.

## 🛠️ Tech Stack

* Vue.js 3 + TypeScript
* Pinia (State Management)
* Vuetify (UI)
* Vite + Vitest

## 📦 How to run locally

1. Clone the repository:

    git clone https://github.com/magnokorzekwa/open-spotify-stats.git

2. Enter the folder:

    cd open-spotify-stats

3. Install dependencies:

    npm install

4. Run the development server:

    npm run dev

## 🛡️ Privacy and Security

This project follows a **Zero-Upload** architecture. All calculations are performed in the client's browser (Client-Side) using the device's RAM. No information is persisted in external databases.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, study, modify, and distribute this software, provided that redistributions are also Open Source (GPL v3).

> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

Copyright (c) 2026 Magno Korzekwa