export type TodoStatus = 'todo' | 'doing' | 'done';

export interface Todo {
    id: string; // UUID
    title: string; // 必須
    description?: string; // 任意
    status: TodoStatus; // todo / doing / done
    dueDate?: Date; // 任意
    createdAt: Date;
    updatedAt: Date;
}