'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chapter } from '@/components/ui/chapter-sidebar';

interface UseChaptersReturn {
    chapters: Chapter[];
    loading: boolean;
    error: string | null;
    selectedChapter: Chapter | null;
    fetchChapters: () => Promise<void>;
    createChapter: (title: string) => Promise<void>;
    updateChapter: (id: number, updates: Partial<Chapter>) => Promise<void>;
    selectChapter: (chapter: Chapter | null) => void;
}

export function useChapters(stripeProductId: string): UseChaptersReturn {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

    const fetchChapters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/chapters?stripeProductId=${stripeProductId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch chapters');
            }
            
            const data = await response.json();
            setChapters(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
        } finally {
            setLoading(false);
        }
    }, [stripeProductId]);

    const createChapter = useCallback(async (title: string) => {
        try {
            setError(null);
            
            // Calculate next chapter number
            const nextNumero = Math.max(0, ...chapters.map(c => c.numero)) + 1;
            
            const response = await fetch('/api/chapters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stripeProductId,
                    numero: nextNumero,
                    title,
                    content: '',
                    published: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create chapter');
            }

            const newChapter = await response.json();
            setChapters(prev => [...prev, newChapter]);
            setSelectedChapter(newChapter);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create chapter');
        }
    }, [stripeProductId, chapters]);

    const updateChapter = useCallback(async (id: number, updates: Partial<Chapter>) => {
        try {
            setError(null);
            
            const response = await fetch('/api/chapters', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...updates,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update chapter');
            }

            const updatedChapter = await response.json();
            
            setChapters(prev => 
                prev.map(chapter => 
                    chapter.id === id ? updatedChapter : chapter
                )
            );
            
            // Update selected chapter if it's the one being updated
            if (selectedChapter?.id === id) {
                setSelectedChapter(updatedChapter);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update chapter');
        }
    }, [selectedChapter]);

    const selectChapter = useCallback((chapter: Chapter | null) => {
        setSelectedChapter(chapter);
    }, []);

    // Fetch chapters on mount
    useEffect(() => {
        fetchChapters();
    }, [fetchChapters]);

    return {
        chapters,
        loading,
        error,
        selectedChapter,
        fetchChapters,
        createChapter,
        updateChapter,
        selectChapter,
    };
}