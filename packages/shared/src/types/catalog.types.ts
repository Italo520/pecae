export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
}

export interface Version {
  id: string;
  name: string;
  modelId: string;
}

export interface Year {
  id: string;
  yearFab: number;
  yearModel: number;
  versionId: string;
}

export interface PartCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
