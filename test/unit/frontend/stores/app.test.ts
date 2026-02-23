import { beforeEach, describe, expect, it } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import { useAppStore } from '../../../../src/frontend/stores/app';

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default state', () => {
    const store = useAppStore();

    expect(store.sidebarVisible).toBe(false);
    expect(store.currentCard).toBeNull();
    expect(store.openWindows).toEqual([]);
    expect(store.searchTerm).toBe('');
    expect(store.selectedCategory).toBe('all');
  });

  it('should toggle sidebar', () => {
    const store = useAppStore();

    expect(store.sidebarVisible).toBe(false);

    store.toggleSidebar();
    expect(store.sidebarVisible).toBe(true);

    store.toggleSidebar();
    expect(store.sidebarVisible).toBe(false);
  });

  it('should open and close sidebar', () => {
    const store = useAppStore();

    store.openSidebar();
    expect(store.sidebarVisible).toBe(true);

    store.closeSidebar();
    expect(store.sidebarVisible).toBe(false);
  });

  it('should set current card', () => {
    const store = useAppStore();
    const card = {
      id: 'test-1',
      title: 'Test Card',
      content: 'Test content',
      category: 'test',
      tags: ['test'],
    };

    store.setCurrentCard(card);
    expect(store.currentCard).toEqual(card);
    expect(store.currentCardTitle).toBe('Test Card');

    store.setCurrentCard(null);
    expect(store.currentCard).toBeNull();
    expect(store.currentCardTitle).toBe('Select a card');
  });

  it('should manage windows', () => {
    const store = useAppStore();
    const window1 = { id: 'win-1', title: 'Window 1', winbox: {} };
    const window2 = { id: 'win-2', title: 'Window 2', winbox: {} };

    store.addWindow(window1);
    store.addWindow(window2);

    expect(store.openWindows).toHaveLength(2);
    expect(store.hasOpenWindows).toBe(true);

    store.removeWindow('win-1');
    expect(store.openWindows).toHaveLength(1);
    expect(store.openWindows[0].id).toBe('win-2');

    store.clearWindows();
    expect(store.openWindows).toEqual([]);
    expect(store.hasOpenWindows).toBe(false);
  });

  it('should set search term', () => {
    const store = useAppStore();

    store.setSearchTerm('test query');
    expect(store.searchTerm).toBe('test query');
  });

  it('should set selected category', () => {
    const store = useAppStore();

    store.setSelectedCategory('security');
    expect(store.selectedCategory).toBe('security');
  });

  it('should reset filters', () => {
    const store = useAppStore();

    store.setSearchTerm('test');
    store.setSelectedCategory('test-category');

    store.resetFilters();

    expect(store.searchTerm).toBe('');
    expect(store.selectedCategory).toBe('all');
  });
});
