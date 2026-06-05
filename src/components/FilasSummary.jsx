import React from 'react'

export default function FilasSummary({ label, valor }) {
    if (!valor) return null;

    return (
        <div className="d-flex align-items-stretch px-1 rounded-1 mb-1 bg-white w-100 p-1 shadow border border-black">
            <div
                className="d-flex align-items-center border-end border-1 border-black bg-info rounded-start px-1 text-uppercase fw-bold"
                style={{ width: '33%', fontSize: '0.75rem' }}
            >
                {label}
            </div>

            <div
                className="d-flex justify-content-center align-items-center bg-gray-suave rounded-end px-1 fw-bold"
                style={{ width: '67%', fontSize: '0.85rem' }}
            >
                {valor}
            </div>
        </div>
    );
}
