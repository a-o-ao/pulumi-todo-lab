import React from 'react';
import { useQuery } from 'react-query';
import { trpc } from '../services/trpcClient';
import { Todo } from '../types';

const TodoTable: React.FC = () => {
    const { data: todos, isLoading, error } = useQuery('todos', trpc.todo.getAll);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading todos</div>;
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                </tr>
            </thead>
            <tbody>
                {todos?.map((todo: Todo) => (
                    <tr key={todo.id}>
                        <td>{todo.id}</td>
                        <td>{todo.title}</td>
                        <td>{todo.description}</td>
                        <td>{todo.status}</td>
                        <td>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{new Date(todo.createdAt).toLocaleString()}</td>
                        <td>{new Date(todo.updatedAt).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TodoTable;