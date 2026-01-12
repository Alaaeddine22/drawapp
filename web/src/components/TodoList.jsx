import { useState } from 'react';
import './TodoList.css';

function TodoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) {
    const [newTodo, setNewTodo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTodo.trim()) {
            onAddTodo(newTodo.trim());
            setNewTodo('');
        }
    };

    const completedCount = todos.filter(t => t.completed).length;

    return (
        <div className="todo-list">
            <div className="todo-header">
                <h3>📋 To-Do List</h3>
                <span className="todo-count">{completedCount}/{todos.length} done</span>
            </div>

            <form onSubmit={handleSubmit} className="todo-form">
                <input
                    type="text"
                    className="todo-input"
                    placeholder="Add a new task..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
                <button type="submit" className="todo-add-btn">+</button>
            </form>

            <div className="todo-items">
                {todos.length === 0 ? (
                    <p className="todo-empty">No tasks yet. Add one above!</p>
                ) : (
                    todos.map(todo => (
                        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            <label className="todo-checkbox">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => onToggleTodo(todo.id)}
                                />
                                <span className="checkmark">✓</span>
                            </label>
                            <span className="todo-text">{todo.text}</span>
                            <button className="todo-delete" onClick={() => onDeleteTodo(todo.id)}>
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TodoList;
