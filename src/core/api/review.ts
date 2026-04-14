import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Review {
  id?: number;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string;
  created_at: string;
  customer: number;
}

export interface ReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

const REVIEW_URL = '/reviews/';

export const {
  useGetResources: useGetReviews,
  useGetResource: useGetReview,
  useCreateResource: useCreateReview,
  useUpdateResource: useUpdateReview,
  useDeleteResource: useDeleteReview,
} = createResourceApiHooks<Review, ReviewResponse>(REVIEW_URL, 'reviews');
