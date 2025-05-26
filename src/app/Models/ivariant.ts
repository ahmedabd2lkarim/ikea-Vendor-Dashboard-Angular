export interface IVariant {
  _id?: string;
  color: {
    en: string;
    ar: string;
  };
  price: {
    currency: string;
    currentPrice: number;
    discounted: boolean;
  };
  measurement?: {
    unit?: string;
    width?: number;
    height?: number;
    depth?: number;
    length?: number;
  };
  contextualImageUrl?: string;
  images: string[];
}
