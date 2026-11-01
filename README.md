# Healthify_web
Fitness Website
# 🌿 Healthify – Personal Fitness & Nutrition Tracker

**Healthify** is a free, web-based fitness and nutrition tracking application designed to help users build healthier daily habits through personalized workout plans, nutrition tracking, and lifestyle monitoring.

It calculates personalized fitness targets using user profile information and provides a simple dashboard to monitor daily activities and progress.

## ✨ Features

- **Personalized Dashboard** – View daily fitness activities and progress.
- **Workout Planner** – Automatically generated workout routines based on fitness goals and experience.
- **Exercise Library** – Includes 52 exercises covering push, pull, legs, core, and cardio.
- **Nutrition Tracking** – Log meals and monitor daily calorie and protein intake.
- **Water Tracker** – Track daily water consumption.
- **Step Counter** – Record daily steps and monitor walking goals.
- **Sleep Tracking** – Record and monitor sleeping hours.
- **Progress Analytics** – Monitor fitness progress through charts and statistics.
- **Home & Gym Workouts** – Choose workouts according to available equipment.
- **Secure Accounts** – Password-based encryption using AES-GCM and PBKDF2.
- **Dark & Light Themes** – Responsive interface with theme support.
- **Daily Activity Tracking** – Monitor completed tasks and workout streaks.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application functionality |
| Web Crypto API | Data encryption |
| LocalStorage | Local data storage |
| Firestore-compatible database | Optional cloud storage |

## 📂 Project Structure

```text
Healthify/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Healthify.git
```

### 2. Open the project

```bash
cd Healthify
```

### 3. Run the application

Open `Healthify.html` in your web browser.

For the best experience, run the project using a local development server such as the VS Code Live Server extension.

## 🔐 Security & Privacy

Healthify uses browser-based encryption to protect user data.

- AES-GCM encryption with a 256-bit key.
- PBKDF2 key derivation using SHA-256.
- 210,000 PBKDF2 iterations.
- Random encryption salts and initialization vectors.
- Passwords are not stored.
- User profile and daily logs are encrypted before storage.

**Important:** Losing your password means the encrypted account data cannot be recovered. The application also supports browser-based local storage when cloud database storage is not configured.

## 📊 Fitness Tracking

Healthify provides estimates for:

- Basal Metabolic Rate (BMR)
- Daily energy expenditure (TDEE)
- Daily calorie targets
- Protein and nutrition targets
- Water consumption
- Daily step goals
- Workout activity and estimated calories burned

All calculations are estimates and should not replace professional medical advice.

## 🌐 Responsive Design

Healthify is designed to work across:
- Desktop computers
- Laptops
- Tablets
- Mobile devices

## 🔮 Future Improvements

- Google Fit and Apple Health integration.
- Smartwatch synchronization.
- AI-powered fitness recommendations.
- Advanced nutrition database.
- Cloud synchronization improvements.
- More workout and exercise categories.

## ⚠️ Disclaimer

Healthify is a general fitness and lifestyle tracking application. Its calorie, nutrition, and exercise calculations are estimates and are not medical advice.

## 👨‍💻 Developer

**Anshuman Basu**

GitHub: [@YOUR-USERNAME](https://github.com/YOUR-USERNAME)

---

⭐ If you like this project, consider giving the repository a star!

**Made with ❤️ using HTML, CSS & JavaScript.**
