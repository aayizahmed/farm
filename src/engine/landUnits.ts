export type LandUnit =
  | 'acres'
  | 'hectares'
  | 'sq_meters'
  | 'sq_feet'
  | 'bigha_std'
  | 'bigha_pucca'
  | 'bigha_kucha'
  | 'guntha'
  | 'marla'
  | 'kanal'
  | 'cents';

export interface LandUnitOption {
  id: LandUnit;
  label: string;
  shortLabel: string;
  acresPerUnit: number;
  region: string;
}

export const LAND_UNITS: LandUnitOption[] = [
  { id: 'acres', label: 'Acres (ac)', shortLabel: 'Acres', acresPerUnit: 1.0, region: 'International Standard' },
  { id: 'hectares', label: 'Hectares (ha)', shortLabel: 'ha', acresPerUnit: 2.47105, region: 'Metric System / Europe' },
  { id: 'sq_meters', label: 'Square Meters (m²)', shortLabel: 'm²', acresPerUnit: 0.000247105, region: 'Metric System' },
  { id: 'sq_feet', label: 'Square Feet (ft²)', shortLabel: 'ft²', acresPerUnit: 0.0000229568, region: 'Imperial / US' },
  { id: 'bigha_std', label: 'Standard Bigha', shortLabel: 'Bigha (Std)', acresPerUnit: 0.625, region: 'North/Central India (Rajasthan/MP)' },
  { id: 'bigha_pucca', label: 'Pucca Bigha', shortLabel: 'Bigha (Pucca)', acresPerUnit: 0.6198, region: 'UP / Bihar / Bengal' },
  { id: 'bigha_kucha', label: 'Kucha Bigha', shortLabel: 'Bigha (Kucha)', acresPerUnit: 0.2066, region: 'Northern Plains' },
  { id: 'guntha', label: 'Guntha / Gunta', shortLabel: 'Guntha', acresPerUnit: 0.025, region: 'Maharashtra / Gujarat / KA' },
  { id: 'kanal', label: 'Kanal', shortLabel: 'Kanal', acresPerUnit: 0.125, region: 'Punjab / Haryana / J&K' },
  { id: 'marla', label: 'Marla', shortLabel: 'Marla', acresPerUnit: 0.00625, region: 'Punjab / Haryana / J&K' },
  { id: 'cents', label: 'Cents', shortLabel: 'Cents', acresPerUnit: 0.01, region: 'Kerala / Tamil Nadu / AP' },
];

export interface MultiUnitMatrix {
  acres: number;
  hectares: number;
  sqMeters: number;
  sqFeet: number;
  bighaStandard: number;
  bighaPucca: number;
  bighaKucha: number;
  guntha: number;
  kanal: number;
  marla: number;
  cents: number;
}

export function convertToAcres(value: number, unit: LandUnit): number {
  const targetUnit = LAND_UNITS.find((u) => u.id === unit) || LAND_UNITS[0];
  return value * targetUnit.acresPerUnit;
}

export function getMultiUnitMatrix(acres: number): MultiUnitMatrix {
  const safeAcres = Math.max(0.0001, acres);
  return {
    acres: Number(safeAcres.toFixed(3)),
    hectares: Number((safeAcres * 0.404686).toFixed(3)),
    sqMeters: Number(Math.round(safeAcres * 4046.86)),
    sqFeet: Number(Math.round(safeAcres * 43560)),
    bighaStandard: Number((safeAcres / 0.625).toFixed(2)),
    bighaPucca: Number((safeAcres / 0.6198).toFixed(2)),
    bighaKucha: Number((safeAcres / 0.2066).toFixed(2)),
    guntha: Number((safeAcres / 0.025).toFixed(1)),
    kanal: Number((safeAcres / 0.125).toFixed(2)),
    marla: Number((safeAcres / 0.00625).toFixed(1)),
    cents: Number((safeAcres / 0.01).toFixed(1)),
  };
}
