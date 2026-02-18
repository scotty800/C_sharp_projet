import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchMore, hasMore) => {
    const [loading, setLoading] = useState(false);
    const observerRef = useRef();
    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setLoading(true);
                    fetchMore().finally(() => setLoading(false));
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [loading, hasMore, fetchMore]
    );
    
    return { lastElementRef, loading };
};