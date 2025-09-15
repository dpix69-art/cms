import React from 'react';
import { Toaster } from 'react-hot-toast';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorPage />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;