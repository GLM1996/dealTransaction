import { useState } from 'react';

export default function Navbar({ changeMenu }) {
    const [activeButton, setActiveButton] = useState("New Deal");

    const handleButton = (value) => {
        changeMenu(value);
        setActiveButton(value);
    }

    // Función para determinar la clase del botón
    const getButtonClass = (value, baseClass) => {
        return `${baseClass} ${activeButton === value ? 'active-button' : ''}`;
    }

    return (
        <div className="d-flex justify-content-around gap-2 p-1 bg-info border-bottom border-2 border-black flex-wrap">
            <div className='d-flex flex-wrap menu-btn'>
                <button
                    className={getButtonClass('New Deal', 'btn btn-primary')} onClick={() => handleButton('New Deal')}
                >
                    NEW DEAL
                </button>
                <button
                    className={getButtonClass('Edit Deal', 'btn btn-primary')}
                    onClick={() => handleButton('Edit Deal')}
                >
                    EDIT DEAL  <i className="bi bi-pencil"></i>
                </button>

            </div>

        </div>
    )
}