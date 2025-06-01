# YouTube Backend Clone

This repository contains the backend implementation of a YouTube-like platform. The project leverages modern web technologies to provide core functionalities such as user authentication, video management, and social interactions.

---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [⚙️ Getting Started](#️-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 🚀 Features

- ✅ User Authentication with JWT (register, login, logout)
- 🎬 Video Upload, Update, Delete using Cloudinary
- 📺 Watch History Tracking
- ❤️ Likes/Dislikes on videos and comments
- 💬 Comment System with threaded replies
- 👥 Channel Subscriptions
- 🙍‍♂️ User Profiles with image support

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Media Storage**: Cloudinary
- **Authentication**: JWT (Access + Refresh Tokens)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas or local MongoDB server
- Cloudinary account for media uploads

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/vermadeepraj/youtube-backend.git
cd youtube-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Rename `.env.sample` to `.env` and add your config values.

4. **Start the development server**

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit:

```bash
git commit -m "Add your feature"
```

4. Push to your branch:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
