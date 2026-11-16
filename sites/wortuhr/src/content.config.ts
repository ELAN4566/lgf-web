import { newsCollection } from '@lgf/shared/lib/news.ts';

// News liegen gemeinsam für alle Sites unter /content/news (Repo-Stamm)
export const collections = {
  news: newsCollection(),
};
