import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Esto es vital para que carguen tus estilos

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
