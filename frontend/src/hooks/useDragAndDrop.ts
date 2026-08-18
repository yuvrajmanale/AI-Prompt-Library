import { useState, useCallback } from 'react';

export const useDragAndDrop = (onReorder: (draggedId: string, targetId: string) => void) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    if (sourceId && sourceId !== targetId) {
      onReorder(sourceId, targetId);
    }
    setDraggedId(null);
  }, [draggedId, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  return {
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
