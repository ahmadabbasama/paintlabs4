import { Painting } from '../types';

export interface ColorFamilyOption {
  name: string;
  hex: string;
  badgeBg: string;
  border?: string;
}

export const COLOR_FAMILY_OPTIONS: ColorFamilyOption[] = [
  { name: 'Red', hex: '#DC2626', badgeBg: 'bg-[#DC2626]' },
  { name: 'Yellow', hex: '#EAB308', badgeBg: 'bg-[#EAB308]' },
  { name: 'Orange', hex: '#EA580C', badgeBg: 'bg-[#EA580C]' },
  { name: 'Blue', hex: '#2563EB', badgeBg: 'bg-[#2563EB]' },
  { name: 'White', hex: '#FFFFFF', badgeBg: 'bg-[#FFFFFF]', border: 'border border-stone-300' },
  { name: 'Navy Blue', hex: '#1E3A8A', badgeBg: 'bg-[#1E3A8A]' },
  { name: 'Green', hex: '#16A34A', badgeBg: 'bg-[#16A34A]' },
];

/**
 * 8 specified products eligible for Color Family:
 * 1. buggati bolide / bugatti bolide
 * 2. dodge challenger
 * 3. kosesegg jesko / koenigsegg jesko
 * 4. Bmw m5
 * 5. cozy house
 * 6. kawasaki ninja h2r
 * 7. toyota corrolla gli / toyota corolla gli
 * 8. jaecoo j5
 */
const ELIGIBLE_KEYWORDS: string[] = [
  'bolide', // buggati bolide / bugatti bolide
  'dodge challenger',
  'challenger',
  'jesko', // kosesegg jesko / koenigsegg jesko
  'koenigsegg',
  'kosesegg',
  'bmw m5',
  'm5',
  'cozy house',
  'kawasaki',
  'ninja h2r',
  'h2r',
  'corrolla', // toyota corrolla gli
  'corolla', // toyota corolla gli
  'jaecoo', // jaecoo j5
  'j5',
];

export function hasColorFamilyFeature(painting?: Painting | { name?: string; colorFamily?: string[] } | null): boolean {
  if (!painting) return false;
  if (Array.isArray(painting.colorFamily) && painting.colorFamily.length > 0) {
    return true;
  }
  const name = (painting.name || '').toLowerCase().trim();
  if (!name) return false;

  return ELIGIBLE_KEYWORDS.some((kw) => name.includes(kw));
}

export function getColorOptionsForPainting(painting?: Painting | null): ColorFamilyOption[] {
  if (!painting) return COLOR_FAMILY_OPTIONS;
  if (Array.isArray(painting.colorFamily) && painting.colorFamily.length > 0) {
    // If specific custom color family array was given, map them
    return painting.colorFamily.map((cName) => {
      const found = COLOR_FAMILY_OPTIONS.find((c) => c.name.toLowerCase() === cName.toLowerCase());
      return found || { name: cName, hex: '#4B5563', badgeBg: 'bg-stone-600' };
    });
  }
  return COLOR_FAMILY_OPTIONS;
}

export function getColorFamilyOptionByName(name?: string): ColorFamilyOption | undefined {
  if (!name) return undefined;
  return COLOR_FAMILY_OPTIONS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
