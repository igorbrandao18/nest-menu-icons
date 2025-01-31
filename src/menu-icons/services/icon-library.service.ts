import { Injectable, OnModuleInit } from '@nestjs/common';
import * as MD from 'react-icons/md';
import * as FA from 'react-icons/fa';
import * as BS from 'react-icons/bs';

export interface IconInfo {
  name: string;
  collection: string;
  component: string;
  category?: string;
  importPath: string;
}

interface CollectionInfo {
  name: string;
  icons: any;
  priority: number;
  importPath: string;
}

@Injectable()
export class IconLibraryService implements OnModuleInit {
  private readonly collections: { [key: string]: CollectionInfo } = {
    MD: { 
      name: 'Material Design Icons', 
      icons: MD,
      priority: 1,
      importPath: 'react-icons/md'
    },
    FA: { 
      name: 'Font Awesome', 
      icons: FA,
      priority: 1,
      importPath: 'react-icons/fa'
    },
    BS: { 
      name: 'Bootstrap Icons', 
      icons: BS,
      priority: 2,
      importPath: 'react-icons/bs'
    }
  };

  // Caches e índices
  private searchCache = new Map<string, IconInfo[]>();
  private categoryIndex: { [category: string]: Set<string> } = {};
  private searchIndex: { [term: string]: Set<string> } = {};
  private allIconsCache: IconInfo[] = [];

  async onModuleInit() {
    console.log('[IconLibrary] Initializing service...');
    
    // Log available collections
    console.log('[IconLibrary] Available collections:', Object.keys(this.collections));
    
    // Pré-carrega todas as coleções
    const allIcons = Object.keys(this.collections).map(prefix => {
      console.log(`[IconLibrary] Loading collection ${prefix}...`);
      const icons = this.loadIconsFromCollection(prefix);
      console.log(`[IconLibrary] Loaded ${icons.length} icons from ${prefix}`);
      return icons;
    });
    
    this.allIconsCache = allIcons.flat();
    console.log(`[IconLibrary] Loaded ${this.allIconsCache.length} icons total`);
    
    // Log some sample icons
    if (this.allIconsCache.length > 0) {
      console.log('[IconLibrary] Sample icons:', this.allIconsCache.slice(0, 3));
    }
    
    this.buildIndices(this.allIconsCache);
  }

  private buildIndices(icons: IconInfo[]) {
    console.log('[IconLibrary] Building indices...');
    // Constrói índice de categorias
    icons.forEach(icon => {
      if (icon.category) {
        if (!this.categoryIndex[icon.category]) {
          this.categoryIndex[icon.category] = new Set();
        }
        this.categoryIndex[icon.category].add(icon.name);
      }
    });

    // Constrói índice de busca
    icons.forEach(icon => {
      const terms = [
        icon.name.toLowerCase(),
        icon.category?.toLowerCase() || '',
        ...icon.name.toLowerCase().split(/(?=[A-Z])/) // Divide camelCase
      ];
      
      terms.forEach(term => {
        if (term) {  // Só adiciona termos não vazios
          if (!this.searchIndex[term]) {
            this.searchIndex[term] = new Set();
          }
          this.searchIndex[term].add(icon.name);
        }
      });
    });
    console.log('[IconLibrary] Indices built successfully');
  }

  async searchIcons(searchTerm?: string, collection?: string): Promise<IconInfo[]> {
    console.log(`[IconLibrary] Searching icons with term: ${searchTerm}, collection: ${collection}`);
    const cacheKey = `${searchTerm || ''}-${collection || ''}`;
    
    // Verifica cache de resultados
    if (this.searchCache.has(cacheKey)) {
      console.log('[IconLibrary] Returning cached results');
      return this.searchCache.get(cacheKey)!;
    }

    let results: IconInfo[] = [];

    try {
      if (collection) {
        // Busca em uma coleção específica
        const collectionIcons = this.loadIconsFromCollection(collection);
        results = searchTerm ? this.filterIcons(collectionIcons, searchTerm) : collectionIcons;
      } else {
        results = searchTerm ? 
          this.filterIcons(this.allIconsCache, searchTerm) : 
          this.allIconsCache;
      }

      // Guarda no cache
      this.searchCache.set(cacheKey, results);
      console.log(`[IconLibrary] Found ${results.length} icons`);
      
      // Limpa cache se ficar muito grande
      if (this.searchCache.size > 100) {
        const oldestKey = this.searchCache.keys().next().value;
        this.searchCache.delete(oldestKey);
      }

      return results;
    } catch (error) {
      console.error('[IconLibrary] Error searching icons:', error);
      return [];
    }
  }

  private loadIconsFromCollection(prefix: string): IconInfo[] {
    const collection = this.collections[prefix];
    if (!collection) {
      console.error(`[IconLibrary] Collection ${prefix} not found`);
      return [];
    }

    try {
      console.log(`[IconLibrary] Loading icons from ${prefix} collection`);
      const icons = collection.icons;
      const iconKeys = Object.keys(icons);
      console.log(`[IconLibrary] Available icon keys:`, iconKeys.slice(0, 5));

      // Filtra e processa os ícones válidos
      const validIcons = iconKeys
        .filter(name => typeof icons[name] === 'function')
        .map(name => ({
          name,
          collection: collection.name,
          component: name,
          category: this.categorizeIcon(name),
          importPath: collection.importPath
        }));

      console.log(`[IconLibrary] Found ${validIcons.length} valid icons in ${prefix} collection`);
      console.log(`[IconLibrary] Sample icon names:`, validIcons.slice(0, 3).map(icon => icon.name));
      console.log(`[IconLibrary] Processed ${validIcons.length} icons for ${prefix}`);
      console.log(`[IconLibrary] Sample processed icons:`, validIcons.slice(0, 3));

      return validIcons;
    } catch (error) {
      console.error(`[IconLibrary] Error loading icons from collection ${prefix}:`, error);
      return [];
    }
  }

  private filterIcons(icons: IconInfo[], searchTerm: string): IconInfo[] {
    const termLower = searchTerm.toLowerCase();
    const matchingNames = new Set<string>();
    
    // Busca direta no nome e categoria
    icons.forEach(icon => {
      const nameLower = icon.name.toLowerCase();
      const categoryLower = icon.category?.toLowerCase() || '';
      
      if (nameLower.includes(termLower) ||
          categoryLower.includes(termLower) ||
          // Remove o prefixo para busca
          nameLower.substring(2).includes(termLower)) {
        matchingNames.add(icon.name);
      }
    });

    // Busca nos índices
    Object.keys(this.searchIndex)
      .filter(indexTerm => indexTerm.includes(termLower))
      .forEach(indexTerm => {
        this.searchIndex[indexTerm].forEach(name => matchingNames.add(name));
      });
      
    const results = icons.filter(icon => matchingNames.has(icon.name));
    console.log(`[IconLibrary] Filtered ${results.length} icons matching "${searchTerm}"`);
    return results;
  }

  private categorizeIcon(iconName: string): string {
    const lowerName = iconName.toLowerCase();
    
    if (lowerName.includes('home') || lowerName.includes('dashboard') || lowerName.includes('menu')) {
      return 'Navigation';
    }
    if (lowerName.includes('user') || lowerName.includes('person')) {
      return 'Users & People';
    }
    if (lowerName.includes('setting') || lowerName.includes('cog') || lowerName.includes('gear')) {
      return 'Settings';
    }
    if (lowerName.includes('grid') || lowerName.includes('list')) {
      return 'Layout';
    }
    if (lowerName.includes('arrow') || lowerName.includes('chevron')) {
      return 'Arrows';
    }
    if (lowerName.includes('file') || lowerName.includes('document')) {
      return 'Files';
    }
    if (lowerName.includes('chart') || lowerName.includes('graph')) {
      return 'Charts';
    }
    
    return 'Other';
  }

  async getCollections(): Promise<{ prefix: string; name: string }[]> {
    return Object.entries(this.collections).map(([prefix, info]) => ({
      prefix,
      name: info.name
    }));
  }
}