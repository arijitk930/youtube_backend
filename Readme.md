# 🎥 YouTube Backend Project  

A backend API for a YouTube style application. This project demonstrates how to build RESTful backend functionality using Node.js, Express, MongoDB and token based authentication with JWT.

---

## 🧠 Overview

This project powers a video sharing platform backend similar to YouTube. It handles user accounts, authentication, video management, comments, likes, and tweets style posts for users within the platform.

---

## ✨ Features

### 👤 User Module
- Create account and login
- Passwords hashed using bcrypt
- Issue and rotate tokens with JWT

### 🎬 Video Module
- Upload video metadata
- Fetch individual videos or all videos
- Like and dislike functionality

### 💬 Interaction Module
- Comment on videos
- Like comments
- Subscribe to channels (optional based on implementation stage)

### 🐦 Tweet Module
- Users can create short text posts known as "tweets"
- Fetch tweets by user
- Delete tweets
- Ideal for status updates or notifications inside the platform

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| 🟢 Node.js | Server runtime |
| 🚏 Express.js | API and routing |
| 🍃 MongoDB | Database management |
| 🧱 Mongoose | ORM for MongoDB |
| 🔐 JWT | Authentication and access control |
| 🧂 bcrypt | Password hashing |
