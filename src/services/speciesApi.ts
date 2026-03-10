import { AIFeaturesService } from './aiFeatures';

export interface SpeciesSighting {
  id: string;
  speciesName: string;
  scientificName: string;
  commonName: string;
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'insect' | 'plant' | 'fish';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  timestamp: Date;
  observer: string;
  imageUrl?: string;
  healthStatus: 'healthy' | 'stressed' | 'sick' | 'critical' | 'unknown';
  populationCount: number;
  behavior?: string;
  habitat?: string;
  conservationStatus: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX';
  notes?: string;
  verified: boolean;
  tags: string[];
}

export interface SpeciesHealthDiagnosis {
  speciesId: string;
  overallHealth: number; // 0-100
  symptoms: string[];
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedIndividuals: number;
  timestamp: Date;
}

export interface SpeciesStatistics {
  totalSightings: number;
  uniqueSpecies: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  trend