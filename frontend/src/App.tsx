import React from 'react';
import TodoList from './pages/TodoList';
import TodoForm from './pages/TodoForm';
import { CssBaseline, Container } from '@mui/material';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" style={{ paddingTop: '20px' }}>
        <h1>TODO アプリ</h1>
        <TodoForm onSuccess={() => window.location.reload()} />
        <TodoList />
      </Container>
    </>
  );
};

export default App;