import { createContext, useContext, useState, useEffect } from "react";
import { cargarContexto,searchPersonById } from "../config/funciones";

export const AppContext = createContext({
  person: null,
  context: null,
  isLoading: true,
  error: null,
});

export const useAppContext = () => useContext(AppContext);

// Proveedor mejorado que carga los datos automáticamente
export const AppContextProvider = ({ children }) => {
  const [person, setPerson] = useState(null);
  const [context, setContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {    
      try {
        const context = await cargarContexto();
        if (context?.person) {
          setContext(context);
          const personFub =  await searchPersonById(context.person.id);         
          if (personFub?.success) setPerson(personFub.data);          
          if(!personFub?.success){
            throw new Error("Problem with the API the FUB");   
          }
        }else{
          if(context.person === ""){
            throw new Error("No hay Contexto en la URL");            
          }
        }
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // El array vacío hace que se ejecute solo al montar el componente
  
  return (
    <AppContext.Provider value={{ person, context, isLoading, error }}>
      {children}
    </AppContext.Provider>
  );
};
