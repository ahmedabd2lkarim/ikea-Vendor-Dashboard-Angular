import { IVariant } from "./ivariant";

export interface IProduct {
  _id: string;
  name: string;
  color: {
    en: string;
    ar: string;
  };
  price: {
    currency: string;
    currentPrice: number;
    discounted: boolean;
  };
  measurement: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
    length?: number;
  };
  typeName: {
    en: string;
    ar: string;
  };
  contextualImageUrl?: string;
  imageAlt: {
    en: string;
    ar: string;
  };
  images: string[];
  short_description: {
    en: string;
    ar: string;
  };
  product_details: {
    product_details_paragraphs: {
      en: string[];
      ar: string[];
    };
    expandable_sections: {
      materials_and_care: {
        en: string;
        ar: string;
      };
      details_certifications: {
        en: string;
        ar: string;
      };
      good_to_know: {
        en: string;
        ar: string;
      };
      safety_and_compliance: {
        en: string;
        ar: string;
      };
      assembly_and_documents: {
        en: string;
        ar: string;
      };
    };
  };
  vendorId: string;
  categoryId: string;
  vendorName: string;
  categoryName: string;
  variants: IVariant[];
  inStock: boolean;
  stockQuantity: number;
  createdAt?: Date;
  updatedAt?: Date;
  fullUrl?: string;
  weight?: {
    value?: number;
    unit?: string;
  };
}


