import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { actualizarDealEnServidor } from "../../config/funciones";

export const Delay = ({ deal }) => {
    const getInitialForm = () => ({
        delayDate: "",
        newCloseDate: "",
        category: "",
        responsable: "",
        afecto: "",
        nota: "",
        affectDeal: false
    });

    const [form, setForm] = useState(getInitialForm());
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [delays, setDelays] = useState([]);
    const [loading, setLoading] = useState(false)

    const fetchDelayDeal = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                "https://n8n.homelasvegasnevada.com/webhook/12d0fa64-8bd4-4e3a-9c5c-eac518ae8daf",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dealId: deal?.id,
                    }),
                }
            );

            const result = await response.json();
            console.log(result)
            if (result.data?.[0]?._id) {
                setDelays(result.data);
            } else {
                setDelays([]);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (deal?.id) {
            fetchDelayDeal();
        }
    }, [deal?.id]);

    const handleChange = (field, value) => {
        if (field === "delayDate") {
            // const initialDate = getInitialForm().delayDate
            //     ? new Date(getInitialForm().delayDate)
            //     : new Date()

            setForm({
                ...form,
                [field]: value,
                //dayDelay: diffInDays(value, initialDate)
            })

        } else {
            setForm({
                ...form,
                [field]: value,
            })
        }
    }

    const handleNewDelay = () => {
        setForm(getInitialForm());
        setEditingId(null);
        setShowForm(true);
    };

    const diffInDays = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const delayId = editingId || Date.now().toString();

        const dealDateMap = {
            "0": deal.customDUEDILIGENCYDATE,
            "1": deal.customAPPRAISALDATE,
            "2": deal.customLOANCONTINGECYDATE,
        };

        const delayData = {
            id: delayId,
            dealId: deal.id,
            dealDate: dealDateMap[form.delayType] || null,
            delayDate: form.delayDate,
            category: form.category,
            responsable: form.responsable,
            afecto: form.afecto,
            nota: form.nota,
            dayDelay: form.dayDelay,
            delayType: form.delayType,
            affectDeal: form.affectDeal,
            newCloseDate: form.newCloseDate,
        };

        const data = {
            new: !editingId,
            delayId,
            editingId,
            dealId: deal.id,
            dealDate: dealDateMap[form.delayType] || null,
            form: delayData,
        };

        try {
            const response = await fetch("https://n8n.homelasvegasnevada.com/webhook/b484d1b9-b95e-41ee-bdf2-f16d4b3bf0d1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Error al guardar");

            // 1. Actualizar el deal (SOLO SI SE CREA UN DELAY)
            if (!editingId) {
                const dataDeal = {};

                switch (form.delayType) {
                    case "0":
                        dataDeal.customDUEDILIGENCYDATE = form.delayDate;
                        break;

                    case "1":
                        dataDeal.customAPPRAISALDATE = form.delayDate;
                        break;

                    case "2":
                        dataDeal.customLOANCONTINGECYDATE = form.delayDate;
                        break;

                    default:
                        break;
                }
                if (form.affectDeal) {
                    dataDeal.projectedCloseDate = form.newCloseDate
                }

                const updateResult = await actualizarDealEnServidor(deal.id, dataDeal);

                if (updateResult.success) {
                    toast.success("Se actualizo el Deal");
                }
            }

            setDelays(prev =>
                editingId
                    ? prev.map(delay =>
                        delay.id === editingId ? delayData : delay
                    )
                    : [...prev, delayData]
            );

            toast.success(
                editingId
                    ? "Delay actualizado correctamente"
                    : "Delay creado correctamente"
            );

            setForm(getInitialForm());
            setEditingId(null);
            setShowForm(false);

        } catch (error) {
            console.log(error);
            toast.error("No se pudo guardar el delay");
        }
    };

    const handleEdit = (delay) => {
        console.log(delay.id);
        console.log(editingId);

        setForm({
            delayDate: delay.delayDate,
            dayDelay: delay.dayDelay || 0,
            category: delay.category,
            responsable: delay.responsable,
            afecto: delay.afecto,
            nota: delay.nota,
        });

        setEditingId(delay.id);
        setShowForm(true);
    };

    const handleDelete = async (delay) => {

        const id = delay.dealDelayId || delay.id;

        setDelays(prev =>
            prev.filter(item =>
                (item.dealDelayId || item.id) !== id
            )
        );

        try {
            await fetch(
                "https://n8n.homelasvegasnevada.com/webhook/1bb9e575-d603-46fb-b978-5de6491001af",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        delay: id,
                    }),
                }
            );
        } catch (error) {
            console.log(error);
        } finally {
            toast.success("Delay eliminado correctamente");
        }
    };

    const handleCancel = () => {
        setForm(getInitialForm());
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                <span>Loading Delay...</span>
            </div>
        )
    }

    return (
        <div
            className="w-100 p-2 rounded border bg-info"
            style={{
                fontSize: "13px",
                maxWidth: "500px",
            }}
        >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h6 className="m-0 fw-bold">Client Contract Delay</h6>
                    <small className="text-muted">
                        Manage transaction delays
                    </small>
                </div>

                <button
                    type="button"
                    className={`btn btn-sm d-flex align-items-center gap-1 ${!showForm ? "btn-primary" : "btn-danger"
                        }`}
                    onClick={showForm ? handleCancel : handleNewDelay}
                >
                    <span>
                        {!showForm ? "+ Add" : "X"}
                    </span>
                </button>
            </div>

            {/* FORM */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="border rounded p-2 mb-2 bg-secondary-subtle fade-in"
                >

                    <div className="row g-2">
                        {/*Delay Type */}
                        <div className="col-12">
                            <strong className="text-center">Delay Type</strong>
                            <select
                                className="form-select form-select-sm"
                                value={form.delayType}
                                onChange={(e) =>
                                    handleChange(
                                        "delayType",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">--Delay Type--</option>
                                <option value="0">DUE DILIGENCY DATE</option>
                                <option value="1">APPRAISAL DATE</option>
                                <option value="2">LOAN CONTINGECY DATE</option>
                            </select>
                        </div>
                        {/* Delay Date */}
                        <div className="col-12">
                            <strong className="text-center">New Date</strong>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                placeholder="Date Delay"
                                value={form.delayDate}
                                onChange={(e) =>
                                    handleChange(
                                        "delayDate",
                                        e.target.value
                                    )
                                }
                                required
                            />

                            {/* Affect Deal */}
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="affectDeal"
                                    checked={form.affectDeal || false}
                                    onChange={(e) =>
                                        handleChange(
                                            "affectDeal",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="affectDeal"
                                >
                                    This delay affects the deal
                                </label>
                            </div>
                        </div>
                        {form?.affectDeal && (
                            <div className="col-12">
                                <strong className="text-center">New Close Date</strong>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    placeholder="Date Delay"
                                    value={form.newCloseDate || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "newCloseDate",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        )}
                        {/*Category */}
                        <div className="col-12">
                            <select
                                className="form-select form-select-sm"
                                value={form.category}
                                onChange={(e) =>
                                    handleChange(
                                        "category",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">--Category--</option>
                                <option value="Lender">Lender</option>
                                <option value="Inspeccion">Inspeccion</option>
                                <option value="Appraisal">Appraisal</option>
                                <option value="Documentos">Documentos</option>
                                <option value="Buyer's side">Buyer's side</option>
                                <option value="Seller's side">Seller's side</option>
                            </select>
                        </div>
                        {/*Day Delay */}
                        <div className="col-12">
                            <input
                                className="form-control form-control-sm"
                                type="number"
                                min="0"
                                value={form.dayDelay ?? 0}
                                onChange={(e) =>
                                    handleChange("dayDelay", Number(e.target.value))
                                }
                                required
                            />
                        </div>
                        {/*Responsable */}
                        <div className="col-12">
                            <select
                                className="form-select form-select-sm"
                                value={form.responsable}
                                onChange={(e) =>
                                    handleChange(
                                        "responsable",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">--Responsable--</option>
                                <option value="Laura Juarez">Laura Juarez</option>
                                <option value="Eddie Morales">Eddie Morales</option>
                                <option value="Luis Galindo">Luis Galindo</option>
                                <option value="Laura Juarez">Amelia Hurtado</option>
                                <option value="Eddie Morales">Outside lender</option>
                                <option value="Luis Galindo">Johnnie Perea</option>
                                <option value="New American Funding">New American Funding</option>
                                <option value="Alterra Homeloans">Alterra Homeloans</option>
                                <option value="EMortgage Capital">EMortgage Capital</option>
                                <option value="Outside lending company">Outside lending company</option>
                                <option value="Barret Financial Group">Barret Financial Group</option>
                                <option value="702 Lending Group, LLC">702 Lending Group, LLC</option>
                            </select>
                        </div>
                        {/*Afecto */}
                        <div className="col-12">
                            <select
                                className="form-select form-select-sm"
                                value={form.afecto}
                                onChange={(e) =>
                                    handleChange(
                                        "afecto",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">--Afecto--</option>
                                <option value="Cierre">Cierre</option>
                                <option value="Contingencia">Contingencia</option>
                            </select>
                        </div>
                        {/*Nota */}
                        <div className="col-12">
                            <textarea
                                className="form-control form-control-sm"
                                value={form.nota}
                                onChange={(e) => handleChange("nota", e.target.value)}
                                placeholder="--Note--"
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-1 mt-2">
                        <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success btn-sm"
                        >
                            {editingId ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            )}

            {/* LIST */}
            <div className="row g-2 fade-in">
                {delays.length > 0 ? (
                    delays.map((delay) => (
                        <div className="col-12" key={delay._id}>
                            <div
                                className="border rounded p-2 d-flex justify-content-between align-items-center"
                                style={{
                                    fontSize: "11px",
                                    background: "#fff",
                                }}
                            >
                                {/* INFO */}
                                <div
                                    className="d-flex flex-column"
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    <span
                                        className="fw-bold text-truncate"
                                        style={{
                                            maxWidth: "240px",
                                        }}
                                    >
                                        {delay.nota}
                                    </span>

                                    <span className="text-muted">
                                        <b>Deal Date: </b> {delay.dealDate}
                                    </span>

                                    <span className="text-muted">
                                        <b>Delay Date: </b> {delay.delayDate}
                                    </span>
                                </div>

                                {/* ACTIONS */}
                                <div className="d-flex gap-1">
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-sm py-0 px-2"
                                        onClick={() =>
                                            handleEdit(delay)
                                        }
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm py-0 px-2"
                                        onClick={() =>
                                            handleDelete(delay)
                                        }
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center text-muted small">
                        No delays registered.
                    </div>
                )}
            </div>
        </div>
    );
};