const API_BASE_URL = 'http://localhost:8080';

// --- DOM Element References ---
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const statsTotal = document.getElementById('stats-total');
const statsCompleted = document.getElementById('stats-completed');
const statsPending = document.getElementById('stats-pending');


// --- API Interaction Functions ---

// 1. Fetch all tasks
const fetchTasks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Could not connect to the backend API.');
        return [];
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Example format: 11/6/2025, 2:10 PM
        return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Invalid Date';
    }
};

// 2. Create a new task
const createTask = async (title, dueDate) => {
    // Prepare the body object
    const body = {
        title: title
    };

    // Only include due_date if it was provided
    if (dueDate) {
        body.due_date = dueDate;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // Send the updated body
        });
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'Failed to create task.';

            if (response.status === 400) {
                // Priority 1: Check Pydantic structured errors (from 'details')
                if (errorData.details && Array.isArray(errorData.details)) {
                    // Find the first error message available
                    const firstError = errorData.details[0];
                    errorMessage = `Validation Error on ${firstError.loc[0]}: ${firstError.msg}`;
                }
                // Priority 2: Check for a simple 'message' key (from general 400/404 handlers)
                else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    // Fallback for simple error responses
                    errorMessage = errorData.error;
                }
            } else if (errorData.message) {
                // Non-400 error with a message
                errorMessage = errorData.message;
            } else {
                // Final fallback
                errorMessage = `API Error: Status ${response.status}`;
            }

            throw new Error(errorMessage);
        }
        // If response.ok, do nothing (success)
    } catch (error) {
        // Display the specific error message to the user
        console.error('Error creating task:', error);
        alert(`Error creating task: ${error.message}`);
    }
};

// 3. Complete a task
const completeTask = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
            method: 'PUT',
        });
        if (!response.ok) {
            // Handle 404 error if task is missing
            throw new Error('Failed to complete task. Task may not exist.');
        }
    } catch (error) {
        console.error('Error completing task:', error);
        alert(`Error completing task: ${error.message}`);
    }
};

// 4. Delete a task
const deleteTask = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete task. Task may not exist.');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert(`Error deleting task: ${error.message}`);
    }
};

// 5. Fetch stats
const fetchStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { total: 0, completed: 0, pending: 0 };
    }
};


// --- UI Rendering and Handlers ---

// Renders a single task list item
const createTaskElement = (task) => {
    const listItem = document.createElement('li');
    // ... (class names and ID attribute remain the same)

    // Task Title and Status
    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleSpan.className = 'task-title';
    listItem.appendChild(titleSpan);

    // NEW: Container for dates
    const dateDiv = document.createElement('div');
    dateDiv.className = 'task-dates';

    // Display Due Date
    const dueDateText = document.createElement('small');
    dueDateText.innerHTML = `**Due:** ${formatDate(task.due_date)}`;
    dateDiv.appendChild(dueDateText);

    // Display Created Date (assuming you added created_at to the backend model)
    const createdDateText = document.createElement('small');
    createdDateText.innerHTML = `**Created:** ${formatDate(task.created_at)}`;
    dateDiv.appendChild(createdDateText);

    listItem.appendChild(dateDiv); // Add the date info

    return listItem;
};

// Renders the entire task list and updates stats
const renderApp = async () => {
    const tasks = await fetchTasks();
    const stats = await fetchStats();

    // 1. Render Tasks
    taskList.innerHTML = ''; // Clear existing list
    tasks.sort((a, b) => a.completed - b.completed || a.id - b.id); // Sort: pending first
    tasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });

    // 2. Render Stats
    statsTotal.textContent = stats.total;
    statsCompleted.textContent = stats.completed;
    statsPending.textContent = stats.pending;
};

// Handler for the Add Task form submission
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('new-task-title');
    const dateInput = document.getElementById('new-task-due-date'); // NEW ELEMENT

    const title = titleInput.value.trim();
    // Get the value; it will be an empty string if not set, or an ISO 8601 string
    const dueDate = dateInput.value.trim();

    if (title) {
        // Pass both title and dueDate to createTask
        await createTask(title, dueDate);

        titleInput.value = ''; // Clear title
        dateInput.value = ''; // Clear date input
        renderApp();
    } else {
        alert('Task title cannot be empty.');
    }
});

// --- Initial Load ---
// Start the application by rendering the current state
document.addEventListener('DOMContentLoaded', renderApp);