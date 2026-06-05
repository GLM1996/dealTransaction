import React, { useState, useEffect, useCallback } from 'react';
import OptionComponent from './OptionComponent';
import { getCustomFieldsPeople } from '../config/funciones';

export default function MoreOption({ price, handleFormData, item, custom }) {

    const [show, setShow] = useState(false);
    const [selectSplit, setSelectSplit] = useState("")
    const [options, setOptions] = useState({
        commission: { isPercent: false, value: '' },
        agentSplit: { isPercent: false, value: '' },
        teamSplit: { isPercent: false, value: '' },
        description: "",
        customRealtorNameCloserR: ""

    });
    const [customSplitPeople, setCustomSplitPeople] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataAppt = await getCustomFieldsPeople([341, 343]);
                // const dataCollaborators = await getCollaborators(person?.id);

                // const [dataAppt, dataCollaborators] = await Promise.all([
                //   getCustomFields(CustomSplits),
                //   getCollaborators(person?.id),
                // ]);

                if (dataAppt) setCustomSplitPeople(dataAppt);
                //if (dataCollaborators) setListCollaborators(dataCollaborators);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        handleFormData(1, options);
    }, [options]);

    useEffect(() => {
        if (item) {
            const updated = {
                commission: { isPercent: false, value: item?.commissionValue || 0 },
                agentSplit: { isPercent: false, value: item?.agentCommission || 0 },
                teamSplit: { isPercent: false, value: item?.teamCommission || 0 },
                description: item?.description || ""
            }
            setOptions(updated)
            handleFormData(1, updated)
        }
    }, [item])

    const handleRealtor = (valor) => {
        setOptions((prev) => ({
            ...prev,
            customRealtorNameCloserR: valor,
        }));
    };
    const handleSelect = (valor) => {
        setSelectSplit(valor)

        // Busca patrón tipo 25/75
        const match = valor.match(/(\d+)\/(\d+)/)

        if (match) {
            const agent = Number(match[1])
            const team = Number(match[2])

            setOptions(prev => ({
                ...prev,
                split: valor,
                agentSplit: {
                    isPercent: true,
                    value: agent
                },
                teamSplit: {
                    isPercent: true,
                    value: team
                }
            }))
        }
    }

    const byId = useCallback(
        (id) => customSplitPeople.find((f) => f.id === id)?.choices ?? [],
        [customSplitPeople]
    );

    return (
        <>
            <div className='d-flex justify-content-center'>
                <button className="btn btnCollapse my-1 w-100" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample"
                    onClick={() => setShow(!show)}>
                    More Options
                    {!show ? (
                        <i className="bi bi-caret-down-fill"></i>
                    ) : (<i className="bi bi-caret-up-fill"></i>)}
                </button>
            </div>
            {show && (
                <div className="col-12">
                    {
                        !price && (
                            <div className='bg-warning text-center'>
                                <b className='fw-bold'>Please fill the price box above in order to use this section</b>
                            </div>
                        )
                    }
                    <div className="collapse show" id="collapseExample">
                        <div className="card card-body">
                            <OptionComponent
                                title="Transaction Commission"
                                price={price}
                                data={options.commission}
                                onChange={(data) => setOptions(prev => ({ ...prev, commission: data }))}
                            />
                            <b>Select the Realtor</b>
                            <select
                                className="form-select form-select-sm my-1"
                                aria-label="Default select example"
                                value={options?.customRealtorNameCloserR}
                                onChange={(e) => handleRealtor(e.target.value)}
                            >
                                <option value="">Select the Realtor...</option>
                                {byId(343)?.map((option, index) => {

                                    return (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    );
                                })}
                            </select>
                            <b>Select the Split</b>
                            <select
                                className="form-select form-select-sm my-1"
                                aria-label="Default select example"
                                value={selectSplit}
                                onChange={(e) => handleSelect(e.target.value)}
                            >
                                <option value="">Select the Split...</option>
                                {byId(341)?.map((option, index) => {

                                    if (!option.includes("(SOI)") && !option.includes("(CL)")) return null;

                                    return (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    );
                                })}
                            </select>
                            <OptionComponent
                                title="Agent Split"
                                price={options.commission.isPercent ? options.commission.value * price / 100 : options.commission.value || 0}
                                data={options.agentSplit}
                                onChange={(data) => setOptions(prev => ({ ...prev, agentSplit: data }))}
                            />
                            <OptionComponent
                                title="Team Split"
                                price={options.commission.isPercent ? options.commission.value * price / 100 : options.commission.value || 0}
                                data={options.teamSplit}
                                onChange={(data) => setOptions(prev => ({ ...prev, teamSplit: data }))}
                            />
                            <div className="col-12">
                                <b>Description</b>
                                <textarea
                                    className="form-control form-control-sm"
                                    placeholder="description"
                                    value={options.description}
                                    onChange={(e) => setOptions(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </>
    );
}
