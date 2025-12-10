

# **myPocket — Smart Budget & FIRE Calculator**

myPocket is a clean, simple personal finance assistant built to track income, expenses, savings, and long-term financial independence goals.
Most finance tools online are paid or overcomplicated — so I built my own version that is **free**, **minimal**, and **practical**, while also using it as a way to learn real development through task-based learning.

---

## ⭐ **Why I Built This**

I wanted a finance tool that:

* Shows income, expenses, savings clearly
* Gives a meaningful financial score
* Helps understand spending patterns
* Calculates FIRE (Financial Independence, Retire Early) — without ads or premium walls

This project also became my gateway to learning:

* JavaScript deeply (DOM, events, state handling)
* Clean UI/UX design
* And later → Spring Boot backend

---

## 🚀 **Features**

### 💰 **Budgeting**

* Slider-based income input
* Expense input with category
* Quick preset buttons (₹100, ₹500, ₹1K…)
* Auto-calculates:

  * Total income
  * Total expenses
  * Savings

### 📊 **Financial Health Score**

* Score from **0–100**
* Color meter bar
* Smart insights & recommendations

### 🌓 **Theme**

* Light / Dark mode
* Saves preference in localStorage

### 🗂️ **Expense Management**

* Undo last expense
* Delete individual expenses
* Timestamp for every entry
* Persistent storage

---

## 🔥 **NEW: FIRE (Financial Independence) Calculator**

I added a complete FIRE Calculator that helps estimate long-term wealth goals.

### ✔ Dual-Input System (Slider + Pill Input)

For each FIRE field:

* Monthly expenses
* Current age
* Retirement age
* Life expectancy
* Inflation

Each uses a **slider** + **click-to-edit pill** that stay perfectly in sync.

### ✔ FIRE Outputs

* Main FIRE number
* Annual expense today
* Future expense at retirement (inflation-adjusted)
* Lean FIRE (25× rule)
* Fat FIRE (30× rule)
* Years until retirement

### ✔ Clean, integrated UI

Not a separate page — fits smoothly inside the myPocket layout.

---

## 🧱 **Tech Stack**

### **Frontend**

* HTML
* CSS (Custom UI, light/dark themes, responsive layout)
* JavaScript

  * DOM manipulation
  * LocalStorage state
  * Dynamic UI rendering
  * Custom slider + pill component
  * Financial calculations

### **Backend (Coming Soon)**

* Spring Boot
* MySQL
* REST APIs
* User authentication
* Storing income/expenses/FIRE data

---

## 🧠 **What I Learned Building This**

* DOM-based component architecture
* Handling UI state cleanly
* Syncing multiple inputs
* Designing responsive layouts
* Structuring code for readability
* Using LocalStorage like a mini-database
* Breaking a large feature (FIRE) into tasks
* Preparing the project for full backend integration later

This project significantly improved my JavaScript confidence.

---

## 📂 **Project Structure**

```
myPocket/
│── index.html
│── style.css
│── app.js
│── README.md
└── icon.jpg
```

---

## 📈 **Upcoming Updates**

* Spring Boot backend for saving all data
* User login / authentication
* Monthly trend charts
* Export / Import data
* Better recommendations using analytics
* Notification system (instead of alert boxes)

---

## 🤝 **Contributions**

This is a self-learning project, but suggestions are always welcome.

---

