# 🎟️ **Tickease** – Next-Gen Mobile-First Event Management & Analytics Platform

### 👨‍💻 By **Team Innovisonaries**  
*Submission for HackFest 2025*

**Team Members:**
- Suman Jana – Full-Stack Developer, System Architect  
- Arnab Mondal – Full-Stack Developer, Data Engineer  
- Anirban Majumdar – Full-Stack Developer, DevOps & Infra  
- Sutanuka Chakraborty – Frontend Engineer, UX Specialist  
- Debajit Pal - Frontend Engineer 
---

## 🧩 The Problem

Event organizers today often rely on outdated, siloed tools. Here's what we observed:

- 🖥️ Desktop-bound platforms limit mobility  
- 📉 Delayed or fragmented analytics slow down decision-making  
- 🔗 Disconnected systems for ticketing, registration, and engagement  
- ⛓️ Lack of real-time control during live events  

**In a high-pressure, time-sensitive environment like event management, these gaps are dealbreakers.**

---

## ✨ Our Solution: **Tickease**

Tickease is a **mobile-first, real-time event management platform** that empowers organizers to control every aspect of their event—on the go.

Whether it's selling tickets, tracking attendees, or analyzing event performance—**Tickease does it all from a single app**.  
Built using **React Native + Supabase + Firebase**, it’s designed to be fast, intuitive, and accessible on any device.

---

## 📲 What You Can Do with Tickease

### 👨‍💼 Organizer Dashboard
- Create & customize events with ease  
- Set up ticket tiers and pricing with dynamic control  
- Add-ons for premium experiences and upsells  
- View revenue breakdown and capacity in real-time  
- Instantly track how many people are present using **Firebase-powered live attendee tracking**

### 📊 Real-Time Analytics at Your Fingertips
- 🔥 Live ticket sales & conversion data  
- 📈 Revenue reports and growth projections  
- 🎯 Insights on where users came from (referrals, direct, etc.)  
- 🌍 Demographics, preferred languages, and device usage  

### 🔐 Secure & Reliable Architecture
- Supabase Auth for secure login and session handling  
- Payment processing with detailed transaction logs  
- Dual-database architecture for speed + resilience  

---

## 🛠️ Technical Deep Dive

### 📡 Dual-Database Architecture
| Feature                        | Firebase Realtime DB     | Supabase + PostgreSQL      |
|-------------------------------|--------------------------|----------------------------|
| Live attendee tracking        | ✅                        | ❌                         |
| Persistent event data         | ❌                        | ✅                         |
| Authentication                | ❌                        | ✅ Supabase Auth            |
| Complex queries & analytics   | ❌                        | ✅ SQL queries              |

This hybrid model ensures **speed where it matters**, and **reliability where it counts**.

---

### 🔄 Real-Time Attendee Monitoring

Powered by Firebase Realtime Database, the system detects attendee check-ins via the app, updating live dashboards without a single page reload.

```ts
const eventAttendeesRef = ref(database, `events/${eventId}/attendees`);
onValue(eventAttendeesRef, (snapshot) => {
  let count = 0;
  snapshot.forEach((child) => {
    if (child.val().active) count++;
  });
  setUserCount(count);
});
```

---

### 💳 Multi-Tier Ticketing System

- 🎟️ Ticket tiers (e.g. General, VIP, Early Bird)  
- 🔄 Capacity and pricing updates in real-time  
- 💼 Add-ons like merchandise, parking, food passes  
- 📉 Sales visualization via interactive charts  

---

## 🧠 Intelligent Additions

- **Smart Pricing Tips**: Recommends ideal price adjustments based on performance  
- **Trend Predictions**: Forecasts ticket sales over time  
- **User Behavior Insights**: See what users engage with most  

---

## 🧭 User Organization Flow

### Organizations
Organizations using the Tickease app can:
- Fill in basic event details such as title, description, event date, venue, and social links.
- Upload event banners for better visibility.
- Set up ticket pricing with full customization, including labels, price, and maximum quantity.
- Choose from pre-set templates for user information collection to prepare analytics.
- Generate unique URLs for events, enabling users to buy tickets and interact with chatbots.

### Users / Ticket Buyers
Users or ticket buyers can:
- Scan QR codes or click on shared links to access event pages.
- Fill out forms with questions selected by the admin.
- Purchase tickets and receive instant confirmation.
- Interact with chatbots for event-related queries, with full event context and optional PDF attachments.
- Provide additional data such as location, interests, and how they discovered the event.

### Analytics and Reporting
- The system collects data such as IP, browser, device, language, timezone, and time spent on the site for analytics.
- Admins can access manager reporting for insights and ticket availability checks.

---

## 🧭 Future Roadmap

- 🔐 QR-based check-ins & attendance logging  
- 🤝 Attendee networking & smart matchmaking  
- 🧠 AI-powered marketing automation  
- 🌐 Offline mode with sync-on-connect capability  
- 🎟️ NFT ticketing for premium, verifiable experiences  
- 🌍 Multi-language support for global scalability  

---

## 💻 Tech Stack Overview

| Layer       | Tech Used                                  |
|-------------|---------------------------------------------|
| **Frontend** | React Native (Expo), Next.js (Tailwind CSS) |
| **Backend**  | Supabase (PostgreSQL, Auth), Firebase       |
| **Storage**  | Supabase Storage                            |
| **Analytics**| Custom PostgreSQL + Client-Side Charting    |
| **CI/CD**    | GitHub Actions, Vercel (Web), EAS (Mobile)  |

---

## 📈 Measurable Impact

- 🚀 Cut down setup time by **60%** for event organizers  
- 💸 Boosted ticket revenue via **smart add-ons** and pricing  
- 📱 Empowered on-the-go management with mobile-first design  
- 📊 Enabled **instant insights**, reducing decision delays  

---

## 🎥 Demo & Links

- [📱 Mobile App (Expo Download)](https://expo.dev/your-app-link)  
- [📽️ Demo Video](https://youtube.com/your-demo)  
- [📂 GitHub Repo](https://github.com/codewarnab/hack-fest-2025)  

---

🛠️ **Built with passion in 36 hours** at **HackFest 2025**  
❤️ From Team innovisonaries
