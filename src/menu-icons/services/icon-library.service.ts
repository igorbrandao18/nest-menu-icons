import { Injectable } from '@nestjs/common';

export interface IconInfo {
  name: string;
  collection: string;
  component: string;
  category?: string;
}

@Injectable()
export class IconLibraryService {
  private readonly collections = {
    MD: { name: 'Material Design Icons', importPath: 'react-icons/md' },
    FA: { name: 'Font Awesome', importPath: 'react-icons/fa' },
    BS: { name: 'Bootstrap Icons', importPath: 'react-icons/bs' }
  };

  async searchIcons(searchTerm?: string, collection?: string): Promise<IconInfo[]> {
    const results: IconInfo[] = [];
    const searchLower = searchTerm?.toLowerCase() || '';
    
    // Se uma coleção específica foi solicitada
    if (collection) {
      const collectionInfo = this.collections[collection];
      if (collectionInfo) {
        const icons = await this.loadIconsFromCollection(collection);
        return this.filterIcons(icons, searchLower);
      }
      return [];
    }

    // Se não especificou coleção, busca em todas
    for (const [prefix, info] of Object.entries(this.collections)) {
      const icons = await this.loadIconsFromCollection(prefix);
      results.push(...this.filterIcons(icons, searchLower));
    }

    return results;
  }

  private async loadIconsFromCollection(prefix: string): Promise<IconInfo[]> {
    try {
      const collection = this.collections[prefix];
      if (!collection) return [];

      // Importa a biblioteca de ícones dinamicamente
      const icons = await import(collection.importPath);
      
      return Object.keys(icons)
        .filter(name => {
          // Filtra apenas os componentes de ícone (objetos)
          const icon = icons[name];
          return typeof icon === 'object' && icon !== null;
        })
        .map(name => ({
          name,
          collection: collection.name,
          component: `${prefix}_${name}`,
          category: this.categorizeIcon(name)
        }));
    } catch (error) {
      console.error(`Erro ao carregar ícones da coleção ${prefix}:`, error);
      return [];
    }
  }

  private filterIcons(icons: IconInfo[], searchTerm: string): IconInfo[] {
    if (!searchTerm) return icons;

    return icons.filter(icon => {
      const nameLower = icon.name.toLowerCase();
      const categoryLower = icon.category?.toLowerCase() || '';
      
      return nameLower.includes(searchTerm) || 
             categoryLower.includes(searchTerm);
    });
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