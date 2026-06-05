import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { ToastContainer } from "react-toastify";
import Loading from '../components/Loading';
import Principal from '../components/principal';
import ListarDeal from '../components/ListarDeal';

export default function Portada() {

    const [show, setShow] = useState('New Deal');
    const { person, context, isLoading, error } = useAppContext();

    const changeShow = (value) => {
        setShow(value)
    }

    const renderView = () => {
        switch (show) {
            case 'New Deal':
                return <Principal />;// En tu componente principal:       
            case 'Edit Deal':
                return <ListarDeal data="Data" />;            
            default:
                return <div>Default View</div>;
        }
    };
    return (
        <>
            <div>
                {/* Resto de tu aplicación */}
                <ToastContainer position="top-right" autoClose={2000} newestOnTop className="toast-small" />
            </div>
            <Navbar changeMenu={changeShow} />
            {isLoading ? (
                <div className='d-flex justify-align-content-center align-items-center w-100'>
                    <Loading text="Loading Context" />
                </div>
            ) : (renderView())}
        </>
    )
}
