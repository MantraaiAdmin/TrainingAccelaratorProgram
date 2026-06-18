import { TopicKnowledge } from '../lesson-builder';
import { getPythonKnowledge, defaultKnowledge } from './python-knowledge';
import { getFullstackKnowledge, fullstackDefault } from './fullstack-knowledge';
import { getAiKnowledge, aiDefault } from './ai-knowledge';
import { enrichTopicKnowledge } from './depth-enricher';
import { resolveTopicAlias } from './topic-aliases';

export function getTopicKnowledge(trackSlug: string, topic: string): TopicKnowledge {
  const key = resolveTopicAlias(topic);

  let base: TopicKnowledge;
  if (trackSlug === 'python-engineering-foundations') {
    base = getPythonKnowledge(key) ?? defaultKnowledge(topic, 'Python Engineering Foundations', 'python');
  } else if (trackSlug === 'full-stack-product-engineering') {
    base = getFullstackKnowledge(key) ?? fullstackDefault(topic);
  } else if (trackSlug === 'ai-engineering-intelligent-systems') {
    base = getAiKnowledge(key) ?? aiDefault(topic);
  } else {
    base = defaultKnowledge(topic, trackSlug, 'python');
  }

  return enrichTopicKnowledge(topic, trackSlug, base);
}
