import React, { useEffect, useState } from 'react'
import { getCustomFields } from '../config/funciones'

export default function ListarCustomfield({ handleFormData, pipeline, item, handleCustom }) {

    const [loading, setLoading] = useState(true)
    const [customFields, setCustomFields] = useState([])
    const [filterCustom, setFilterCustom] = useState([])
    const [formData, setFormData] = useState({});
    const [show, setShow] = useState(false);

    function extraerCustomFieldsDelItem(item) {
        return Object.entries(item || {}).reduce((acc, [key, value]) => {
            if (key.startsWith('custom')) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }

    useEffect(() => {
        if (pipeline && !item && !loading && customFields.length > 0) {
            const result = filtrarCustomField(customFields, pipeline)
            setFilterCustom(result)
        }
    }, [pipeline, loading, customFields, item])

    useEffect(() => {
        if (item && !loading && customFields.length > 0) {
            const result = filtrarCustomField(customFields, String(item.pipelineId))
            setFilterCustom(result)
        }
    }, [item, loading, customFields])

    useEffect(() => {
        if (item && customFields.length > 0) {
            const customValues = extraerCustomFieldsDelItem(item);
            setFormData(customValues); // Setea los valores iniciales de los custom fields
        }
    }, [item, customFields]);


    useEffect(() => {
        try {
            const fetchData = async () => {
                const data = await getCustomFields()
                if (data) {
                    setCustomFields(data)
                    handleCustom(data)
                }

                console.log(data)
            }
            fetchData()
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [])

    function filtrarCustomField(data, filtro) {

        switch (filtro) {
            case '1':
                filtro = 'buyer';
                break;
            case '2':
                filtro = 'seller';
                break;
            case '15':
                filtro = 'refi';
                break;
        }

        const camposExtras = [
            'TITLE COMPANIES',
            'LOAN CONTINGECY DATE',
            'APPRAISAL DATE',
            'DUE DILIGENCY DATE'
        ];

        return data.filter(customField => {
            const label = customField.label.trim().toLowerCase();

            const coincideFiltro =
                label.includes(filtro.toLowerCase()) &&
                !label.includes('tc-offer');

            const esCampoExtra =
                camposExtras.includes(customField.label);

            return coincideFiltro || esCampoExtra;
        });
    }

    useEffect(() => {
        // Notifica al padre cada vez que formData cambie
        handleFormData(1, formData);
    }, [formData]);

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    return (
        <>
            <div className='d-flex justify-content-center'>
                <button className="btn btnCollapse my-1 w-100" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseExample1" aria-expanded="false" aria-controls="collapseExample1"
                    disabled={!pipeline}
                    onClick={() => setShow(!show)}>
                    Custom Fields
                    {!show ? (
                        <i className="bi bi-caret-down-fill"></i>
                    ) : (<i className="bi bi-caret-up-fill"></i>)}
                </button>
            </div>
            {show && (
                <div className='col-12'>
                    <div className="collapse show" id="collapseExample1">
                        <div className="row w-100 m-auto">
                            <div className='col-12 overflow-auto' style={{ maxHeight: '200px' }}>
                                {filterCustom.map(field => (
                                    <div key={field.id} className="col-12 fw-bold text-white bg-primary p-1">
                                        <label className="form-label fw-bold">{field.label}</label>

                                        {field.type === 'text' || field.type === 'date' || field.type === 'number' ? (
                                            <input
                                                type={field.type}
                                                className="form-control form-control-sm"
                                                value={formData[field.name] || ''}
                                                onChange={e => handleChange(field.name, e.target.value)}
                                            />
                                        ) : field.type === 'dropdown' ? (
                                            <select
                                                className="form-select form-select-sm"
                                                value={formData[field.name] || ''}
                                                onChange={e => handleChange(field.name, e.target.value)}
                                            >
                                                <option value="">-- Select --</option>
                                                {field.choices?.map((choice, idx) => (
                                                    <option key={idx} value={choice}>
                                                        {choice}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={formData[field.name] || ''}
                                                onChange={e => handleChange(field.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>

            )}
        </>

    )
}
