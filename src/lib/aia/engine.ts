import knowledgeBase from './knowledge_base.json';

export interface KnowledgeChunk {
  id: string;
  title: string;
  url: string;
  category: string;
  text: string;
  language: string;
  content_type: string;
  last_updated: string;
}

export function retrieveContext(query: string, limit: number = 5, lang: string = 'el'): KnowledgeChunk[] {
  const normalizedQuery = query.toLowerCase();
  const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  const scored = (knowledgeBase as KnowledgeChunk[]).map(chunk => {
    let score = 0;
    
    // Language boost
    if (chunk.language === lang) score += 2;

    // Check keywords or title matches
    if (chunk.title.toLowerCase().includes(normalizedQuery)) score += 10;
    if (chunk.section_heading?.toLowerCase().includes(normalizedQuery)) score += 5;

    // Check text matches
    words.forEach(word => {
      if (chunk.text.toLowerCase().includes(word)) score += 1;
    });

    return { chunk, score };
  });

  // Filter only chunks with some relevance and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}
