import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'
import React from 'react';
import Portada from './pages/portada';
import { AppContextProvider } from './context/AppContext';

function App() {
  return (
    <AppContextProvider>
      <div className="contenedor">
        <Portada />
      </div>
    </AppContextProvider>
  );
}

export default App;
