import React, { useEffect, useState } from 'react';
import { trpc } from '../services/trpcClient';
import { Todo } from '../types';

const TodoList: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const { data, isLoading, error } = trpc.todo.getAll.useQuery();

    useEffect(() => {
        if (data) {
            setTodos(data);
        }
    }, [data]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading todos: {error.message}</div>;
    }

    return (
        <div>
            <h1>TODO List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {todos.map(todo => (
                        <tr key={todo.id}>
                            <td>{todo.title}</td>
                            <td>{todo.description}</td>
                            <td>{todo.status}</td>
                            <td>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TodoList;