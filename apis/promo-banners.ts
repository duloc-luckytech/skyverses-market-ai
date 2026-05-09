
import { API_BASE_URL } from './config';

export interface PromoBanner {
  _id: string;
  tag: string;
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  title: string;
  desc: string;
  cta: string;
  link: string;
  imageUrl: string;
}

export const promoBannersPublicApi = {
  getActive: async (): Promise<PromoBanner[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners`);
      const json = await response.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },
};
