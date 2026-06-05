import React, { useState } from 'react'
import Formulario from './Formulario'
import MoreOption from './MoreOption';
import { crearDeal, updateDeal } from '../config/funciones';
import { useAppContext } from '../context/AppContext';
import ListarCustomfield from './ListarCustomfield';
import { toast } from 'react-toastify';

export default function Principal({ item }) {

    const { person, context, isLoading, error } = useAppContext();
    const [customFields, setCustomFields] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        pipeline: '',
        stageId: '',
        price: '',
        projectedCloseDate: '',
    })

    const handleCustom = (custom) => {
        setCustomFields(custom)
    }

    const handleFormData = (form, data) => {
        switch (form) {
            case 1:
                setFormData(prev => ({
                    ...prev,
                    ...data, // merge new fields (e.g. commission, agentSplit, teamSplit)
                }));
                break;
            default:
                break;
        }
    };

    const handleSave = () => {
        console.log(formData)
        if (formData?.name && formData?.stageId) {
            console.log(item)
            if (!item) {
                crearDeal(formData, person.id, context.user.id)
            } else {
                updateDeal(formData, person.id, context.user.id, item.id, item)
            }

        } else {
            toast.warning("Name o Stage incompletos", {
                position: "top-right",
                autoClose: 2000,
            });
        }

    }

    return (
        <div>
            <Formulario handleFormData={handleFormData} item={item} />
            <MoreOption handleFormData={handleFormData} price={formData?.price} item={item} custom={customFields} />
            <ListarCustomfield handleFormData={handleFormData} pipeline={formData?.pipeline} item={item} handleCustom={handleCustom} />

            <div className='d-flex justify-content-center my-1'>
                <button className='btn btn-success' onClick={handleSave}><i className='bi bi-save mx-1'></i>Save</button>
            </div>
        </div>
    )
}
