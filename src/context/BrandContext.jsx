import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchSettings, updateSettings as apiUpdateSettings } from '../api/settings';

const DEFAULTS = {
    orgName: 'ReConnect & Rise',
    orgSlogan: 'Empowering Communities',
    logoUrl: '/logo.jpg',   // shipped SVG in /public
};

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
    const [brand, setBrand] = useState(() => {
        try {
            const saved = localStorage.getItem('rr_brand_config');
            return saved ? JSON.parse(saved) : DEFAULTS;
        } catch {
            return DEFAULTS;
        }
    });

    useEffect(() => {
        fetchSettings().then((data) => {
            if (data) {
                const next = {
                    orgName: data.systemName || DEFAULTS.orgName,
                    orgSlogan: data.orgSlogan || DEFAULTS.orgSlogan,
                    logoUrl: data.logoUrl || DEFAULTS.logoUrl
                };
                setBrand(next);
                localStorage.setItem('rr_brand_config', JSON.stringify(next));
            }
        }).catch(err => console.error('Failed to load brand settings:', err));
    }, []);

    const updateBrand = useCallback((patch) => {
        setBrand(prev => {
            const next = { ...prev, ...patch };
            localStorage.setItem('rr_brand_config', JSON.stringify(next));
            
            // Sync to backend asynchronously
            apiUpdateSettings({
                systemName: next.orgName,
                orgSlogan: next.orgSlogan,
                logoUrl: next.logoUrl
            }).catch(err => console.error('Failed to sync brand config to backend', err));
            
            return next;
        });
    }, []);

    const resetBrand = useCallback(() => {
        localStorage.removeItem('rr_brand_config');
        setBrand({ ...DEFAULTS });
        apiUpdateSettings({
            systemName: DEFAULTS.orgName,
            orgSlogan: DEFAULTS.orgSlogan,
            logoUrl: DEFAULTS.logoUrl
        }).catch(err => console.error('Failed to reset brand config on backend', err));
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
