import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { object, string, optional, minLength, InferOutput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { trpc } from '../services/trpcClient';
import { Button, TextField } from '@mui/material';

const todoSchema = object({
  title: string([minLength(1, 'タイトルは必須です')]),
  description: optional(string()),
  dueDate: optional(string()),
});

type TodoFormInputs = InferOutput<typeof todoSchema>;

const TodoForm: React.FC<{ existingTodo?: any; onSuccess: () => void }> = ({ existingTodo, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TodoFormInputs>({
    resolver: valibotResolver(todoSchema),
    defaultValues: existingTodo ? {
      title: existingTodo.title,
      description: existingTodo.description,
      dueDate: existingTodo.dueDate,
    } : {},
  });

  const createTodo = trpc.todo.create.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateTodo = trpc.todo.update.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: TodoFormInputs) => {
    if (existingTodo) {
      updateTodo.mutate({ id: existingTodo.id, ...data });
    } else {
      createTodo.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="タイトル"
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
        fullWidth
        margin="normal"
      />
      <TextField
        label="詳細"
        {...register('description')}
        fullWidth
        margin="normal"
      />
      <TextField
        label="期限"
        type="date"
        {...register('dueDate')}
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" color="primary">
        {existingTodo ? '更新' : '作成'}
      </Button>
    </form>
  );
};

export default TodoForm;