import * as MD from 'react-icons/md';
import * as FA from 'react-icons/fa';
import * as BS from 'react-icons/bs';
import * as HI from 'react-icons/hi';
import * as RI from 'react-icons/ri';
import * as IO from 'react-icons/io5';
import { AvailableIcons } from '../enums/available-icons.enum';

const iconCollections = {
  MD,
  FA,
  BS,
  HI,
  RI,
  IO,
};

export function getIconComponent(iconName: AvailableIcons): string {
  // Extract the collection prefix (e.g., 'MD', 'FA', etc.)
  const prefix = iconName.split('_')[0];
  const collection = iconCollections[prefix];

  if (!collection) {
    throw new Error(`Icon collection ${prefix} not found`);
  }

  // Get the actual icon name from the enum value
  const icon = collection[iconName];
  if (!icon) {
    throw new Error(`Icon ${iconName} not found in collection ${prefix}`);
  }

  return iconName;
} 