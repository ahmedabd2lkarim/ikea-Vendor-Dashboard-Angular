export interface IVariant {
  _id?: string;
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
  contextualImageUrl?: string;
  measurement?: {
    unit?: string;
    width?: number;
    height?: number;
    depth?: number;
    length?: number;
  };
  typeName: {
    en: string;
    ar: string;
  };
  imageAlt: {
    en: string;
    ar: string;
  };
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
  images: string[];
  fullUrl?: string;
}