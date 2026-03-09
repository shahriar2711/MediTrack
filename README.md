```
███╗   ███╗███████╗██████╗ ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗
████╗ ████║██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
██╔████╔██║█████╗  ██║  ██║██║   ██║   ██████╔╝███████║██║     █████╔╝ 
██║╚██╔╝██║██╔══╝  ██║  ██║██║   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
██║ ╚═╝ ██║███████╗██████╔╝██║   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

### Role-Based Medical Record & E-Prescription Platform






**MediTrack** is a full-stack MERN web application that digitizes medical consultations and prescriptions using a secure **role-based access system**.

Doctors can create consultations and generate **PDF e-prescriptions**, patients can view their medical history, and admins manage doctor onboarding.

---

# ✨ Features

### 👨‍⚕️ Doctor Portal

* Create **consultations** for patients
* Issue **multi-medicine e-prescriptions**
* Generate **PDF prescriptions**
* Search patients by **unique Patient ID**
* View **complete consultation history**

### 🧑 Patient Portal

* Personal dashboard with **Patient ID**
* View **consultation history**
* View **prescription history**

### 🛡 Admin Panel

* Register **verified doctors**
* Manage **role-based access**

### 🔐 Security

* **JWT Authentication**
* **bcrypt password hashing**
* **Role-Based Access Control (RBAC)**
* **IDOR protection**

---

# 🏗 Architecture

```
MediTrack
├── backend/     
│   ├── controllers
│   ├── models
│   ├── routes
│   └── middleware
│
└── frontend/     
    ├── components
    ├── pages
    └── context
```

---

# 🛠 Tech Stack

| Layer             | Technology           |
| ----------------- | -------------------- |
| Frontend          | React + Tailwind CSS |
| Backend           | Express.js           |
| Database          | MongoDB + Mongoose   |
| Auth              | JWT                  |
| Password Security | bcrypt               |
| PDF Generation    | jsPDF                |

---

# 📁 Project Structure

```
MediTrack
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   └── server.js
│
├── frontend
│   ├── src
│   ├── components
│   └── pages
│
└── README.md
```

# 

