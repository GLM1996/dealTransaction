import React, { useEffect, useState } from 'react'
import { getDealTransaction } from '../config/funciones';
import { useAppContext } from '../context/AppContext';
import CardDeals from './CardDeal';
import Principal from './Principal';

export default function ListarDeal() {
    const { person, context, isLoading, error } = useAppContext();
    const [loading, setLoading] = useState(false)
    const [deals, setDeals] = useState([])
    const [edit, setEdit] = useState(false)
    const [item, setItem] = useState(null)

    useEffect(() => {
        const fetchDeal = async () => {
            setLoading(true)
            const deal = await getDealTransaction(person.id);
            console.log(deal)
            if (deal.success) {
                const first = deal.data.filter((item) => item.pipelineName.includes('TRANSACTION'));
                console.log(first)
                setDeals(first);
            }
            setLoading(false)
        };

        if (person?.id) {
            console.log(person?.id)
            fetchDeal();
        }
    }, [person?.id]);

    const handleItem = (item) => {
        setEdit(true)
        setItem(item)
    }

    const handleDeleteDeal = (id) => {
        setDeals(deals => deals.filter(deal => deal.id !== id));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                <span>Loading Deals...</span>
            </div>
        );
    }

    if (deals.length === 0) {
        return (
            <div className='m-2 p-4 bg-warning d-flex justify-content-center'>
                <b>No hay deals</b>
            </div>
        )
    }

    return (
        <>
            {!edit ? (
                <div className="border border-5 border-black rounded-1 mb-2 p-1">
                    <h6 className="text-center bg-primary p-1 rounded-1 w-100 text-white fw-bold">
                        DEALS DETAILS
                    </h6>
                    {deals.map((item, index) => (
                        <div key={index}>
                            <CardDeals handleItem={handleItem} onDelete={handleDeleteDeal} item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <Principal item={item} />
            )}
        </>
    );

}
