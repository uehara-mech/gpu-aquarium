import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [state, setState] = useState({
        gpuDetails: null,
        cardContainerData: null
    });

    return (
        <DataContext.Provider value={{ state, setState }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
