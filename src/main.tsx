import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'antd/dist/reset.css';


const originalError = console.error;
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Warning: [antd:') || args[0]?.includes?.('compatible')) {
    return;
  }
  originalError(...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)