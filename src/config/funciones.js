import { servidor, servidorNew } from "./utils";
import { toast } from "react-toastify";

export const cargarContexto = async () => {
  // Obtener los parámetros de la URL
  const urlParams = new URLSearchParams(location.search);
  const contextParam = urlParams.get("context");

  if (contextParam) {
    try {
      // Decodificar el contexto de Base64
      const decodedContext = atob(contextParam); // atob() decodifica Base64 a texto

      // Parsear el contenido decodificado como JSON
      const context = JSON.parse(decodedContext);
      // Acceder a la información dentro del contexto
      const account = context.account || {};
      const user = context.user || {};
      const person = context.person || {};

      console.log(context)
      if (user?.id) {
        const userData = await getUser(user.id);

        return {
          account: account,
          user: userData,
          person: person,
        };
      }
      return {
        account: "",
        user: "",
        person: "",
      };
    } catch (error) {
      console.error("Error al decodificar o parsear el contexto:", error);
      return [];
    }
  } else {
    console.log("No se encontró el parámetro context en la URL.");
    return {
      account: "",
      user: "",
      person: "",
    };
  }
};

//obtener el role del usuario
async function getUser(id) {
  try {
    // Petición POST al servidor
    const url = `${servidorNew}/api/users/${id}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, options);

    if (!response.ok)
      console.log(`Error: ${response.status} Error: ${response.statusText}`, 1);

    const result = await response.json();

    return result.data;
  } catch (error) {
    alert("Error al enviar los datos: " + error.message);
  }
}

export const searchPersonById = async (id) => {
  //const url = `${servidorNew}/api/people/${id}`; // Changed to GET
  const url = `${servidorNew}/api/people/${id}?${new URLSearchParams({
    fields: [
      'id',
      'name',
      'stage',
      'customClientLanguage',
      'customNEWLeadType',
      'customNEWPIPELINE',
      'addresses',
      'customNEWClientOpenToNewContactInTheFuture',
      'customNEWClientSQualifyAs',
      'customVAAMPMTimeToCall',
      'customVAAMPM2ndTimeToCall',
      'customBestDaysToCall'
    ].join(',')
  })}`;
  
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add authorization if needed: "Authorization": `Bearer ${token}`
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `HTTP error! status: ${response.status}`;
      console.log(errorMessage);
      return [];
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

//cargar pipelines desde servidor
export const getPipelines = async () => {
  const url = `${servidorNew}/api/pipelines`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
};

export const getDealTransaction = async (id) => {
  const url = `${servidorNew}/api/deals?personId=${id}`; // Changed to GET

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add authorization if needed: "Authorization": `Bearer ${token}`
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `HTTP error! status: ${response.status}`;
      return [];
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

function cleanData(data, id, userId, item) {
  const copia = { ...data };

  const parts = copia?.projectedCloseDate?.split("-"); // ["2025", "06", "24"]
  const fechaAjustada = parts
    ? new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
      8,
      0,
      0,
      0
    )
    : "";
  // Filtrar claves que comienzan con "custom"
  const customFields = Object.entries(data)
    .filter(([key, _]) => key.startsWith("custom"))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  const dataSaved = {
    name: copia?.name,
    stageId: copia?.stageId,
    description: copia?.description || "",
    peopleIds: item?.peopleIds || [id],
    userIds: item?.userIds || [userId],
    price: copia?.price || "",
    projectedCloseDate: fechaAjustada || "",
    commissionValue: copia?.commission?.amount || "",
    agentCommission: copia?.agentSplit?.amount || "",
    teamCommission: copia?.teamSplit?.amount || "",
    ...customFields,
  };

  return dataSaved;
}

//funcion para crear nuevo deal
export const crearDeal = async (data, id, userId) => {
  try {
    const dataSaved = cleanData(data, id, userId);
    delete dataSaved.split
    console.log(data)
    // // 1. Crear el deal
    const dealResult = await crearDealEnServidor(dataSaved);

    if (dealResult.success) {
      mostrarToastExito("Se creó el Deal");
      delete dataSaved.customRealtorNameCloserR
      //Buyer Transaction
      if (data.pipeline === "1") {
        dataSaved.customRRealtorAssignedForSplitCommissionBuyer = data.customRealtorNameCloserR || ""
        dataSaved.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }
      //Seller Transaction
      if (data.pipeline === "2") {
        dataSaved.customRRealtorAssignedForSplitCommissionSeller = data.customRealtorNameCloserR || ""
        //dataSaved.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }

      // 2. Preparar y actualizar la persona si es necesario
      const dataPerson = prepararDatosPersona(dataSaved);

      if (Object.keys(dataPerson).length > 0) {
        await actualizarPersonaEnServidor(id, dataPerson);
      }
    }

  } catch (error) {
    manejarError(error);
  }
};

// Funciones auxiliares para modularizar
const crearDealEnServidor = async (data) => {
  const url = `${servidorNew}/api/deals`;
  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error en la creación del deal:", errorText);
    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

const prepararDatosPersona = (dataSaved) => {
  const propiedadesAEliminar = [
    "deal_existente",
    "pipeline",
    "transaction_type",
    "name",
    "price",
    "projectedCloseDate",
    "userIds",
    "peopleIds",
    "agentCommission",
    "commissionValue",
    "description",
    "stageId",
    "teamCommission",
    "customAPPRAISALDATE",
    "customDUEDILIGENCYDATE",
    "customLOANCONTINGECYDATE",
    "customTITLECOMPANIES"
  ];

  const dataPerson = { ...dataSaved };

  propiedadesAEliminar.forEach(propiedad => {
    delete dataPerson[propiedad];
  });

  return dataPerson;
};

const actualizarPersonaEnServidor = async (id, dataPerson) => {
  const url = `${servidorNew}/api/people/${id}`;
  const options = {
    method: 'PUT',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataPerson),
  };
  console.log(id, dataPerson)
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error en la actualización de persona:", errorText);
    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (result.success) {
    mostrarToastExito("Se actualizó Person");
  }

  return result;
};

const mostrarToastExito = (mensaje) => {
  toast.success(mensaje, {
    position: "top-right",
    autoClose: 2000,
  });
};

const manejarError = (error) => {
  if (error.message.includes('Failed to fetch')) {
    console.error("No pudo conectar con el servidor:", error);
    toast.error("Error de conexión con el servidor", {
      position: "top-right",
      autoClose: 3000,
    });
  } else {
    console.error("Error en la operación:", error);
    toast.error(error.message || "Error en la operación", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};
//funcion para update deal
export const updateDeal = async (data, id, userId, dealId, item) => {
  try {
    const dataSaved = cleanData(data, id, userId, item);
    delete dataSaved.split
    // 1. Actualizar el deal
    const updateResult = await actualizarDealEnServidor(item.id, dataSaved);

    if (updateResult.success) {
      mostrarToastExito("Se actualizo el deal el Deal");
      delete dataSaved.customRealtorNameCloserR

      //Buyer Transaction
      if (data.pipeline === "1") {
        dataSaved.customRRealtorAssignedForSplitCommissionBuyer = data.customRealtorNameCloserR || ""
        dataSaved.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }
      //Seller Transaction
      if (data.pipeline === "2") {
        dataSaved.customRRealtorAssignedForSplitCommissionSeller = data.customRealtorNameCloserR || ""
        //dataSaved.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }
      // 2. Preparar y actualizar la persona si es necesario
      // const dataPerson = prepararDatosPersona(dataSaved);
      let dataTest = {}
      //Buyer Transaction
      if (data.pipeline === 1) {
        dataTest.customRRealtorAssignedForSplitCommissionBuyer = data.customRealtorNameCloserR || ""
        dataTest.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }
      //Seller Transaction
      if (data.pipeline === 2) {
        dataTest.customRRealtorAssignedForSplitCommissionSeller = data.customRealtorNameCloserR || ""
        //dataSaved.customRLeadOwnerSplitTypeBuyer = data.split || ""
      }
      // console.log(dataPerson)
      if (Object.keys(dataTest).length > 0) {
        await actualizarPersonaEnServidor(id, dataTest);
      }
    }
    return updateResult;

  } catch (error) {
    manejarErrorActualizacion(error);
  }
};

// Funciones auxiliares
export const actualizarDealEnServidor = async (dealId, data) => {
  const url = `${servidorNew}/api/deals/${dealId}`;
  const options = {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = `Error ${response.status} al actualizar el deal: ${errorText}`;
    console.error("Error en la respuesta:", errorText);
    throw new Error(errorMessage);
  }

  return await response.json();
};


const manejarErrorActualizacion = (error) => {
  if (error.message.includes('Failed to fetch')) {
    console.error("Error de conexión:", error);
    toast.error("Error de conexión con el servidor", {
      position: "top-right",
      autoClose: 3000,
    });
  } else if (error.message.includes('Error 4') || error.message.includes('Error 5')) {
    // Errores 4xx o 5xx específicos
    console.error("Error del servidor:", error);
    toast.error("Error en la solicitud: " + error.message.split(':')[0], {
      position: "top-right",
      autoClose: 3000,
    });
  } else {
    console.error("Error inesperado:", error);
    toast.error("Error al procesar la solicitud", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

//funcion para eliminar deal
export const deleteDeal = async (dealId) => {
  const url = `${servidorNew}/api/deals/${dealId}`;
  const options = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.success) {
      toast.success("Se Elimino el Deal", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      toast.warning("No se Elimino el Deal", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  } catch (error) {
    console.error("No pudo conectar con el servidor:", error);
  } finally {
    // Mostrar toast durante 3 segundos, luego esperar 300 ms para la animación antes de recargar
    // setTimeout(() => {
    //   // Aquí podrías iniciar animación de desvanecimiento
    //   setTimeout(() => {
    //     window.location.reload();
    //   }, 300); // Tiempo para que se complete la animación
    // }, 3000);
  }
};

//cargar custom fields desde servidor
export const getCustomFields = async () => {

  const url = `${servidorNew}/api/dealCustomFields`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
};
//OBTENER CUSTOM FIELDS
export const getCustomFieldsPeople = async (ids) => {
  try {
    const resp = await fetch(`${servidorNew}/api/custom-Fields?ids=${ids}`);
    if (!resp.ok) throw new Error("Error cargando customFields");
    const result = await resp.json()

    return result;
  } catch (error) {
    console.log(error)
    return []
  }
}
