

Here is a detailed ReadMe.md file content:

**Face Attendance System**
==========================

**Table of Contents**
-----------------

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
	* [Frontend](#frontend)
	* [Backend](#backend)
	* [Database](#database)
	* [Machine Learning](#machine-learning)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [API Documentation](#api-documentation)

**Introduction**
---------------

Face Attendance System is a web-based application that utilizes facial recognition technology to mark attendance. The system consists of a frontend built with React and Next.js, a backend built with FastAPI and Python, and a database managed by MySQL. The facial recognition feature is powered by PyTorch.

**Tech Stack**
--------------

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **Next.js**: A React-based framework for building server-rendered and statically generated websites.
* **Material-UI**: A popular React UI framework for building responsive and customizable interfaces.
* **Ant Design**: A popular React UI framework for building responsive and customizable interfaces.
* **Zustand**: A state management library for React applications.

### Backend

* **Next.js**: A React-based framework for building server-rendered and statically generated websites. Uses port 3000.
* **FastAPI**: A modern, fast (high-performance), web framework for building APIs with Python 3.7+. Uses port 8000.
* **Python**: A high-level, interpreted programming language for building the backend logic.

### Database

* **MySQL**: A popular open-source relational database management system.

### Machine Learning

* **PyTorch**: An open-source machine learning library for building and training neural networks.

**Project Structure**
---------------------

The project is structured into the following directories:

* `face_attendance`: The root directory of the project.
* `src`: The directory containing the frontend code.
* `python_scripts`: The directory containing the backend code.
* `app`: The directory containing the Next.js application code.
* `components`: The directory containing reusable React components.
* `lib`: The directory containing utility functions and libraries.
* `stores`: The directory containing Zustand stores for state management.

**Getting Started**
-------------------

To get started with the project, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/face-attendance-system.git`
2. Install the dependencies: `npm install`
3. Setup the .env file and the MySQL database using the sql file `database_init.sql`
4. Setup the python environment using
    ```bash
    python -m venv .venv
    .venv/Scripts/activate
    pip install facenet-pytorch
    pip3 install torch torchvision tensorboard opencv-python pandas pillow
    python.exe -m pip install --upgrade pip
    pip install fastapi uvicorn opencv-python
    ```
5. Build the development server: `npm run build`
6. Run the development server: `npm run dev-all`
7. Open the application in your web browser: `http://localhost:3000`