import React, { useEffect, useState } from 'react';
import { getPipelines } from '../config/funciones';
import Loading from './Loading';
import { useAppContext } from '../context/AppContext';

export default function Formulario({ handleFormData, item }) {
    const { person, context, isLoading, error } = useAppContext();
    const [form, setForm] = useState({
        name: '',
        pipeline: '',
        stageId: '',
        price: '',
        projectedCloseDate: '',
    });
    const [loading, setLoading] = useState(true)
    const [pipelines, setPipelines] = useState([])
    const [transaction, setTransaction] = useState([])

    useEffect(() => {
        if (person) {
            const fetchData = async () => {
                try {
                    const pipelines = await getPipelines()
                    
                    if (pipelines?.length > 0)
                        setPipelines(pipelines)
                } catch (error) {
                    console.log(error)
                } finally {
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [person])

    useEffect(() => {
        if (item && pipelines.length > 0) {
            const transaction = pipelines.find((pipeline) => pipeline.id === Number(item?.pipelineId))?.stages

            if (transaction) {
                setTransaction(transaction)
            } else {
                setTransaction([])
            }
            console.log(item)
            const updated = {
                name: item?.name || "",
                pipeline: Number(item?.pipelineId) || '',
                stageId: Number(item?.stageId) || '',
                price: Number(item?.price) || "",
                projectedCloseDate: item?.projectedCloseDate?.split('T')[0] || "",
            }
            setForm(updated)
            handleFormData(1, updated); // notifica al padre con los datos actualizados
        }
    }, [item, pipelines])


    const handleChange = (clave, valor) => {
        const updated = { ...form, [clave]: valor };
        if (clave === 'pipeline') {
            const transaction = pipelines.find((item) => item.id === Number(valor))?.stages
            console.log(valor,transaction)
            if (transaction) { setTransaction(transaction) } else {
                setTransaction([])
            }
        }
        setForm(updated); // actualiza el estado local del hijo
        handleFormData(1, updated); // notifica al padre con los datos actualizados
    };

    if (loading) {
        return (<Loading text={"Loading Pipeline"} />)
    }

    return (
        <div className='row w-100 m-auto'>
            <div className="col-12">
                <b>Deal Address</b>
                <input type="text"
                    className="form-control form-control-sm"
                    placeholder="address"
                    value={form?.name || ""}
                    onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div className="col-6">
                <b>Deal Pipeline</b>
                <select type="select"
                    className="form-select form-select-sm"
                    value={form?.pipeline || ""}
                    onChange={(e) => handleChange('pipeline', e.target.value)} >
                    <option value="">EMPTY</option>
                    <option disabled>----------</option>
                    {pipelines.map((item, index) => (
                        <option key={index} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-6">
                <b>Transaction Type</b>
                <select type="select"
                    className="form-select form-select-sm"
                    value={form?.stageId || ""}
                    onChange={(e) => handleChange('stageId', e.target.value)} >
                    <option value="">EMPTY</option>
                    <option disabled>----------</option>
                    {transaction.map((item, index) => (
                        <option key={index} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-6">
                <b>Final Price</b>
                <input type="number"
                    className={`form-control form-control-sm ${!form?.price ? "border border-2 border-danger" : ""}`}
                    placeholder="price"
                    value={form?.price || ""}
                    onChange={(e) => handleChange('price', e.target.value)} />
            </div>
            <div className="col-6">
                <b>Close Date</b>
                <input type="date"
                    className="form-control form-control-sm"
                    placeholder="projectedCloseDate"
                    value={form?.projectedCloseDate || ""}
                    onChange={(e) => handleChange('projectedCloseDate', e.target.value)} />
            </div>
        </div>
    );
}
