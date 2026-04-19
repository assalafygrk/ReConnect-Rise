import { createContext, useContext, useState, useCallback } from 'react';

const BRAND_KEY = 'rr_brand_config';

function loadBrand() {
    try {
        return JSON.parse(localStorage.getItem(BRAND_KEY)) || {};
    } catch {
        return {};
    }
}

const DEFAULTS = {
    orgName: 'ReConnect & Rise',
    orgSlogan: 'Empowering Communities',
    logoUrl: '/logo.jpg',   // shipped SVG in /public
};

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
    const [brand, setBrand] = useState(() => ({ ...DEFAULTS, ...loadBrand() }));

    const updateBrand = useCallback((patch) => {
        setBrand(prev => {
            const next = { ...prev, ...patch };
            localStorage.setItem(BRAND_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const resetBrand = useCallback(() => {
        localStorage.removeItem(BRAND_KEY);
        setBrand({ ...DEFAULTS });
    }, []);

    return (
        <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const ctx = useContext(BrandContext);
    if (!ctx) throw new Error('useBrand must be used within BrandProvider');
    return ctx;
}
