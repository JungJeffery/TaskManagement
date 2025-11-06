from flask import Flask, jsonify, request, abort
from flask_cors import CORS

from pydantic import ValidationError

from task import TaskIn, Task

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

tasks = {}
next_id = 1

# Helper function to get stats
def get_task_stats():
    total = len(tasks)
    completed = sum(1 for task in tasks.values() if task['completed'])
    pending = total - completed
    return {"total": total, "completed": completed, "pending": pending}

# --- API Endpoints ---

# GET /tasks: List all tasks
@app.route('/tasks', methods=['GET'])
def list_tasks():
    return jsonify(list(tasks.values()))

# POST /tasks: Create a task
@app.route('/tasks', methods=['POST'])
def create_task():
    global next_id

    try:
        # Validate input
        task_data = TaskIn(**request.json)
    except (ValidationError, ValueError) as e:
        if isinstance(e, ValidationError):
            # Error handler for structured Pydantic errors (e.g., missing title)
            error_response = {'error': 'Validation Error', 'details': e.errors()}
        else:
            # Error handler for custom ValueError (e.g., due_date in the past)
            error_response = {'error': 'Validation Error', 'message': "Due date must be in the future."}

            # Return 400 Bad Request for all validation issues
        return jsonify(error_response), 400

    new_task_object = Task(
        id=next_id,
        title=task_data.title,
        completed=False,
        due_date=task_data.due_date,
    )

    task_dict = new_task_object.model_dump()

    tasks[next_id] = task_dict
    next_id += 1
    return jsonify(task_dict), 201

# PUT /tasks/<id>/complete: Mark a task as completed
@app.route('/tasks/<int:id>/complete', methods=['PUT'])
def complete_task(id):
    if id not in tasks:
        abort(404, description=f"Task with ID {id} not found.")

    tasks[id]['completed'] = True
    return jsonify(tasks[id])

# DELETE /tasks/<id>: Delete a task
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    if id not in tasks:
        abort(404, description=f"Task with ID {id} not found.")

    del tasks[id]
    return jsonify({}), 204

# GET /tasks/stats: Return stats
@app.route('/tasks/stats', methods=['GET'])
def get_stats():
    return jsonify(get_task_stats())

# Custom 404 handler
@app.errorhandler(404)
def not_found_error(error):
    # Flask error handlers receive the error object, which has a description
    return jsonify({'error': 'Not Found', 'message': error.description}), 404

# Custom 400 handler
@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({'error': 'Bad Request', 'message': error.description}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)