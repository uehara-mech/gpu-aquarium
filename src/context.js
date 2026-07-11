import React, { createContext, useContext, useMemo, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [state, setState] = useState({
        gpuDetails: null,
        cardContainerData: null
    });
    const value = useMemo(() => ({ state, setState }), [state]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
