import moment from "moment-timezone";

//context=eyJjb250ZXh0IjoicGVyc29uIiwiYWNjb3VudCI6eyJpZCI6MjExNDI1NTIwMywiZG9tYWluIjoiaG9tZWxhc3ZlZ2FzbmV2YWRhIiwib3duZXIiOnsibmFtZSI6Ikp1YW4gQ2FybG9zIENhcnJlcmEiLCJlbWFpbCI6ImhvbWVsYXN2ZWdhc25ldmFkYUBnbWFpbC5jb20ifX0sInVzZXIiOnsiaWQiOjEwMCwibmFtZSI6Ikd1c3Rhdm8gTGVvbiIsImVtYWlsIjoiZXN0cmVsbGFnbG05NkBnbWFpbC5jb20ifSwicGVyc29uIjp7ImlkIjo1MjYyMywiZmlyc3ROYW1lIjoiQ2xpZW50ZSBEZSBQcnVlYmEiLCJsYXN0TmFtZSI6IiIsInBob25lcyI6W3sidmFsdWUiOiI3MDI3MDc1OTA1IiwidHlwZSI6IkdITCIsInN0YXR1cyI6IlZhbGlkIiwiaXNQcmltYXJ5IjoxLCJub3JtYWxpemVkIjoiNzAyNzA3NTkwNSIsInJlbGF0aW9uc2hpcElkIjowLCJpc0xhbmRsaW5lIjpmYWxzZX1dLCJlbWFpbHMiOltdLCJzdGFnZSI6eyJpZCI6NDUwLCJuYW1lIjoiMy0gQVBQVCBDcmVhdGVkIFwvIFdhaXRpbmcgQXBwdCBEYXkgKiJ9fX0

export const servidor = "https://servernode.homelasvegasnevada.com";
export const servidorNew = "https://servidor.homelasvegasnevada.com"
// export const servidorNew = "http://localhost:3001"
// export const servidor = "http://localhost:5500";

export const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, "");

export const ajustarFechaUtcModify = (selectedDate) => {
  if (!selectedDate) return null;

  // 1. Convertir a Pacific Time (PST/PDT automático)
  const fechaPT = moment.utc(selectedDate).tz("America/Los_Angeles");

  // 2. Usar tu función formatearFecha (ajustada para compatibilidad)
  const fechaFormateada = formatearFecha(fechaPT.toDate()); // -> "December 25, 2023"

  // 3. Formatear hora en 12h con AM/PM
  const horaFormateada = fechaPT.format("hh:mm A"); // -> "11:00 AM"

  return `${fechaFormateada} ${horaFormateada}`;
};

export const formatearFecha = (date) => {
  //moment(date).format("MMMM D, YYYY HH:mm"); // Ej: "December 25, 2023"
  return moment.tz(date, "America/Los_Angeles").format("MMMM D, YYYY");
};
export const formatUsd = (amount) => {
  if (amount) {
    const formattedUSD = amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formattedUSD;
  }
  return "$ 0";
};
