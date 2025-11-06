## README.md: Full Stack Task Manager

This project implements a lightweight task management application with a **Flask RESTful API** backend, a **Vanilla JavaScript/HTML/CSS** frontend, and a fully **Dockerized** environment.

### Architecture Overview

  * **Backend:** Python 3, Flask (RESTful API), and Flask-CORS.
      * **Data Validation:** Uses **Pydantic** (`TaskIn`, `Task`) for robust data validation on all incoming tasks, including the `title`, optional `due_date`, and server-managed `created_at` timestamp.
      * **Storage:** In-memory dictionary. Data is **not persisted** across container restarts.
  * **Frontend:** HTML, CSS, and Vanilla JavaScript for clarity and functionality. It interacts with the backend using the `fetch` API.
  * **Containerization:** Managed by **Docker Compose**, with separate `Dockerfile`

-----

### How to Build and Run the App

#### Prerequisites

You must have **Docker** and **Docker Compose** installed on your system.

#### Running the Application

1.  Navigate to the root directory containing the `docker-compose.yml` file.

2.  Run the following command to build the images and start the services:

    ```bash
    docker-compose up --build
    ```

#### Access

| Service | Address | Host Port | Container Port |
| :--- | :--- | :--- |:---------------|
| **Frontend UI** | `http://localhost:3000` | 3000 | 8000           |
| **Backend API** | `http://localhost:8080` | **8080** | 5000           |


#### Sample API Usage

To create a task with a due date (optional):

```bash
curl -X POST http://localhost:8080/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Submit final report", "due_date": "2025-12-31T17:00:00"}'
```

-----

### 1\. How did you handle API errors?

I implemented structured JSON error responses and used **Flask's `abort()`** mechanism to return the appropriate HTTP status codes:

  * **Pydantic Validation:** Any invalid task creation data (e.g., missing title) is caught by the Pydantic `TaskIn` model, triggering a custom JSON **`400 Bad Request`** with detailed validation error messages.
  * **Resource Not Found:** Attempting to manipulate a task with a non-existent ID results in a custom JSON **`404 Not Found`** response.

### 2\. What tests would you write if given more time?

My testing priority would focus on reliability and data integrity using Python's `unittest` with Flask's `test_client`:

1.  **Unit Tests (Backend):** Test the full CRUD cycle, specifically focusing on **Pydantic validation** (ensuring 400 errors are correctly returned) and **error handling** (checking for 404s on missing resources).

### 3\. What would you improve with 1 extra hour?

The biggest enhancement would be to implement **data persistence**.

  * **Database Integration:** Replace the in-memory dictionary with a simple database like **SQLite** using an ORM (e.g., SQLAlchemy). This would allow tasks to persist across container restarts.
  * Investigate port issue.
