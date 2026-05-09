
import { SlideLayout } from '../../hooks/useSlideStudio';

// Larger, presenter-quality text sizes (vs editor which is smaller)
export const LAYOUT_CLASSES_PRESENTER: Record<SlideLayout, {
  wrapper: string; title: string; body: string;
}> = {
  'title-center': {
    wrapper: 'flex flex-col items-center justify-center text-center px-16',
    title: 'text-5xl font-bold mb-5 w-full leading-tight',
    body: 'text-xl leading-relaxed w-full max-w-2xl opacity-90',
  },
  'title-left': {
    wrapper: 'flex flex-col justify-center px-20',
    title: 'text-5xl font-bold mb-5 max-w-3xl leading-tight',
    body: 'text-xl leading-relaxed max-w-2xl opacity-90',
  },
  'full-bg': {
    wrapper: 'flex flex-col items-center justify-end text-center pb-20 px-16',
    title: 'text-6xl font-bold mb-3 w-full leading-tight',
    body: 'text-lg leading-relaxed w-full max-w-2xl opacity-80',
  },
  'two-col': {
    wrapper: 'grid grid-cols-2 gap-10 px-16 items-center h-full',
    title: 'text-4xl font-bold leading-tight',
    body: 'text-lg leading-relaxed opacity-90',
  },
  'title-image': {
    wrapper: 'grid grid-cols-2 gap-10 px-16 items-center h-full',
    title: 'text-4xl font-bold mb-4 leading-tight',
    body: 'text-lg leading-relaxed opacity-90',
  },
};
