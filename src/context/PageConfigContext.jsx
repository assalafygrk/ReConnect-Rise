import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getPageConfig, setPageConfig as apiSetPageConfig, resetPageConfig as apiResetPageConfig, resetAllPageConfigs, fetchBackendPageConfigs } from '../api/pageConfig';

const PageConfigContext = createContext(null);

export function PageConfigProvider({ children }) {
    // version bump forces re-renders when any config changes
    const [version, setVersion] = useState(0);
    const bump = useCallback(() => setVersion(v => v + 1), []);

    useEffect(() => {
        fetchBackendPageConfigs().then(() => {
            bump();
        });
    }, [bump]);

    const updatePageConfig = useCallback((pageId, patch) => {
        apiSetPageConfig(pageId, patch);
        bump();
    }, [bump]);

    const resetPage = useCallback((pageId) => {
        apiResetPageConfig(pageId);
        bump();
    }, [bump]);

    const resetAll = useCallback(() => {
        resetAllPageConfigs();
        bump();
    }, [bump]);

    return (
        <PageConfigContext.Provider value={{ version, updatePageConfig, resetPage, resetAll }}>
            {children}
        </PageConfigContext.Provider>
    );
}

/**
 * Hook for pages to read their own config slice.
 * Re-renders whenever any config changes (via version bump).
 *
 * @param {string} pageId  - e.g. 'dashboard', 'loans', 'chat'
 * @returns {{ config: object, setConfig: (patch: object) => void, reset: () => void }}
 */
export function usePageConfig(pageId) {
    const ctx = useContext(PageConfigContext);
    if (!ctx) throw new Error('usePageConfig must be used within PageConfigProvider');

    const config = getPageConfig(pageId); // re-read from store every render (cheap)

    const setConfig = useCallback((patch) => {
        ctx.updatePageConfig(pageId, patch);
    }, [ctx, pageId]);

    const reset = useCallback(() => {
        ctx.resetPage(pageId);
    }, [ctx, pageId]);

    return { config, setConfig, reset };
}

/** Expose context for the admin panel (needs resetAll) */
export function usePageConfigAdmin() {
    return useContext(PageConfigContext);
}
