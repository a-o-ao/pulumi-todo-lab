// 型定義を含むファイルです。必要な型をここに定義します。

export type TodoStatus = 'todo' | 'doing' | 'done';

export interface Todo {
    id: string; // UUID
    title: string; // タイトル（必須）
    description?: string; // 詳細（任意）
    status: TodoStatus; // ステータス
    dueDate?: Date; // 期限（任意）
    createdAt: Date; // 作成日時
    updatedAt: Date; // 更新日時
}