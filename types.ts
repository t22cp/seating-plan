export interface Student {
  id: string;
  nameChi: string;
  nameEng: string;
  classNo: string | number;
  gender?: 'M' | 'F';
}

export interface LayoutConfig {
  rows: number;
  columns: number;
}

export enum ParsingStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  OPTIMIZING = 'OPTIMIZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type ConstraintType = 'SEPARATE';

export interface Constraint {
  id: string;
  type: ConstraintType;
  studentIds: string[]; 
}