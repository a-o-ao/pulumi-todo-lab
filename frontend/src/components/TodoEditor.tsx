import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '../services/trpcClient';
import { Todo } from '../types';

interface TodoEditorProps {
  todoId?: string;
  onSave: () => void;
}

const TodoEditor: React.FC<TodoEditorProps> = ({ todoId, onSave }) => {
  const { register, handleSubmit, setValue } = useForm<Todo>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (todoId) {
      setLoading(true);
      trpc.todo.getById.query({ id: todoId })
        .then(todo => {
          setValue('title', todo.title);
          setValue('description', todo.description);
          setValue('dueDate', todo.dueDate);
        })
        .finally(() => setLoading(false));
    }
  }, [todoId, setValue]);

  const onSubmit = async (data: Todo) => {
    setLoading(true);
    try {
      if (todoId) {
        await trpc.todo.update.mutate({ id: todoId, ...data });
      } else {
        await trpc.todo.create.mutate(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving todo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <input {...register('title', { required: true })} />
      </div>
      <div>
        <label>Description</label>
        <textarea {...register('description')} />
      </div>
      <div>
        <label>Due Date</label>
        <input type="date" {...register('dueDate')} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default TodoEditor;