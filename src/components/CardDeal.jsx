
import React, { useState } from "react";
import FilasSummary from "./FilasSummary";
import { ajustarFechaUtcModify, formatUsd } from "../config/utils";
import Swal from "sweetalert2";
import { deleteDeal } from "../config/funciones";
import { Delay } from "./Delay/Delay";


export default function CardDeals({ handleItem, onDelete, item }) {

  const [show, setShow] = useState(false);
  const [addDelay, setAddDelay] = useState(false);

  const showData = (item) => {
    console.log(item)
    setShow(!show);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar Deal?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      backdrop: "rgba(0,0,0,0.4)",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        actions: "custom-swal-actions",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteDeal(item.id);
        onDelete(item.id); // ✅ Notificas al padre que se eliminó
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Renderizado condicional (solo muestra el contenedor si hay item)
  return (
    <>
      {item && (
        <div
          className="col-12 card small p-1 mb-1"
        >
          <div className="d-flex justify-content-between align-items-center border-bottom border-2 border-black">
            <div className="d-flex justify-content-center align-items-center" >
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between">
                  <b className="text-primary">
                    {item?.name || "EMPTY"}

                  </b>
                  <b className="text-success fw-bold">
                    {formatUsd(item?.price) || ""}
                  </b>
                </div>
                <b className="">
                  {item?.stageName || "EMPTY"} in <b className="text-primary">{item?.pipelineName || "EMPTY"}</b>
                </b>
              </div>

            </div>
            <div className="d-flex justify-content-center flex-wrap align-items-center gap-1 x-small mb-1">
              <i
                className="bi bi-pencil-fill itemBtn bg-primary rounded-1 px-1"
                onClick={() => handleItem(item)}
              ></i>
              <i
                className="bi bi-eye-fill itemBtn bg-success rounded-1 px-1"
                onClick={() => showData(item)}
              ></i>
              <i
                className="bi bi-trash-fill itemBtn bg-danger rounded-1 px-1"
                onClick={() => handleDelete()}
              ></i>
              <i
                className="bi bi-hourglass-split itemBtn bg-warning rounded-1 px-1"
                onClick={() => setAddDelay(!addDelay)}
              ></i>
            </div>
          </div>
          {show && (
            <>
              {item?.pipelineName.toLowerCase().includes('buyer') ? (
                <div className="mt-1 bg-success-subtle p-1 rounded-1 fade-in shadow-sm">
                  <FilasSummary label={"Close Date"} valor={ajustarFechaUtcModify(item?.projectedCloseDate)} />
                  <FilasSummary label={"Price"} valor={formatUsd(item?.price)} />
                  <FilasSummary label={"BUYER MAX HOME PRICE CASH OR APPROVED (TC)"} valor={formatUsd(item?.customBUYERMAXHOMEPRICECASHORAPPROVEDTC)} />
                  <FilasSummary label={"Buyer Loan Approval Type (TC)"} valor={item?.customBuyerLoanApprovalTypeTC} />
                  <FilasSummary label={"Buyer Approval or Cash Proof of Funds Date (TC)"} valor={item?.customBuyerApprovalOrCashProofOfFundsDateTC} />
                  <FilasSummary label={"Buyer Lender Name with Letter Approval (TC)"} valor={item?.customBuyerLenderNameWithLetterAppovalTC} />
                  <FilasSummary label={"(Buyer) Agent Collaborator Name"} valor={item?.customBuyerAgentCollaboratorName} />
                  <FilasSummary label={"Buyer or Seller Contract Date or Residential Purchase Agrmt (TC)"} valor={item?.customBuyerOrSellerContractDateOrResidentialPurchaseAgrmtTC} />
                </div>
              ) : (
                <>
                  <FilasSummary label={"Close Date"} valor={ajustarFechaUtcModify(item?.projectedCloseDate)} />
                  <FilasSummary label={"Price"} valor={formatUsd(item?.price)} />
                  <FilasSummary label={"SELLER LISTING SALE PRICE AMOUNT (TC)"} valor={item?.customSELLERLISTINGSALEPRICEAMOUNTTC} />
                  <FilasSummary label={"Seller Listing Active Date RRHH (TC)"} valor={item?.customSellerListingActiveDateRRHHTC} />
                  <FilasSummary label={"(Seller) Agent Collaborator Name "} valor={item?.customSellerAgentCollaboratorName} />
                  <FilasSummary label={"Buyer or Seller Contract Date or Residential Purchase Agrmt (TC)"} valor={item?.customBuyerOrSellerContractDateOrResidentialPurchaseAgrmtTC} />
                </>
              )}
            </>
          )}

          {/* SECCION PARA LOS DELAY */}
          {addDelay && (
            <div>
              <Delay deal={item} />
            </div>
          )}
        </div >
      )
      }
    </>
  );
}


