import { TopicKnowledge } from '../lesson-builder';
import { defaultKnowledge } from './python-knowledge';

type KnowledgeMap = Record<string, TopicKnowledge>;
const wm = (reason: string, detail: string) => ({ reason, detail });
const k = (p: TopicKnowledge) => p;

export const AI_KNOWLEDGE: KnowledgeMap = {
  transformers: k({
    definition: '**Transformers** (Vaswani et al., 2017) use **self-attention** to process sequences in parallel — foundation of GPT, Qwen, Claude, and modern LLMs.',
    memoryTrick: 'Attention = each token looks at all others to decide what matters.',
    whyMatters: [wm('Industry', 'Default architecture for NLP and multimodal AI.'), wm('Engineering', 'You integrate models, not train from scratch.'), wm('Interviews', 'Explain attention at high level.')],
    sections: [{ heading: 'Key Components', content: '- **Tokenization** — text → subword tokens\n- **Embeddings** — tokens → vectors\n- **Multi-head attention** — parallel relevance scores\n- **Feed-forward layers** — per-token transform\n- **Stacked blocks** — depth = capacity' }],
    codeExamples: [{ lang: 'python', code: '# You typically use transformers via API:\nfrom openai import OpenAI\nclient = OpenAI()\nresp = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Explain attention in one paragraph."}]\n)\nprint(resp.choices[0].message.content)' }],
    pitfalls: ['Trying to train LLM from scratch as beginner.', 'Ignoring context window limits.'],
    practice: [{ question: 'Self-attention in one sentence?', answer: 'Each token computes weighted sum over all tokens based on query-key similarity.' }],
    cheatSheet: ['attention = core innovation', 'pretrained models via API', 'context window limit'],
  }),

  embeddings: k({
    definition: '**Embeddings** are dense vector representations of text/images where semantic similarity ≈ geometric closeness (cosine distance).',
    memoryTrick: 'Similar meaning → vectors point same direction.',
    whyMatters: [wm('RAG', 'Retrieve docs by semantic search.'), wm('Search', 'Better than keyword match.'), wm('Clustering', 'Group support tickets, resumes.')],
    sections: [{ heading: 'Properties', content: 'Fixed dimension (768, 1536). Normalize for cosine similarity. Same model for index and query.' }],
    codeExamples: [{ lang: 'python', code: '# Pseudocode — embedding API\n# vec = embed("Python debugging tips")\n# similarity = cosine(vec_a, vec_b)\n\nimport math\ndef cosine(a, b):\n    dot = sum(x*y for x,y in zip(a,b))\n    na = math.sqrt(sum(x*x for x in a))\n    nb = math.sqrt(sum(x*x for x in b))\n    return dot / (na * nb)' }],
    pitfalls: ['Different embedding models for index vs query.', 'Not chunking long documents before embed.'],
    practice: [{ question: 'Why embeddings for search?', answer: 'Capture semantic similarity — "automobile" matches "car".' }],
    cheatSheet: ['text → vector', 'cosine similarity', 'same model index+query'],
  }),

  tokenization: k({
    definition: '**Tokenization** splits text into subword **tokens** — the unit LLMs process. Token count drives cost and context limits.',
    memoryTrick: '1 token ≈ 4 chars English — not equal to words.',
    whyMatters: [wm('Cost', 'APIs bill per token.'), wm('Limits', 'Context window in tokens.'), wm('Multilingual', 'Some languages need more tokens.')],
    sections: [{ heading: 'Algorithms', content: 'BPE, SentencePiece — learn frequent subwords from corpus. Special tokens: <|endoftext|>, padding.' }],
    codeExamples: [{ lang: 'python', code: '# tiktoken example\nimport tiktoken\nenc = tiktoken.encoding_for_model("gpt-4o-mini")\ntokens = enc.encode("Hello, Constel Nexus!")\nprint(len(tokens), tokens)' }],
    pitfalls: ['Underestimating tokens in long prompts.', 'Not counting system + history in budget.'],
    practice: [{ question: 'Why subwords?', answer: 'Handle rare words without huge vocab — "unhappiness" → un + happiness.' }],
    cheatSheet: ['count tokens before call', 'BPE common', 'cost ∝ tokens'],
  }),

  'prompt engineering': k({
    definition: '**Prompt engineering** crafts instructions, examples, and structure so LLMs produce reliable, useful outputs — system prompts, few-shot, chain-of-thought.',
    memoryTrick: 'Clear role + task + format + constraints = better output.',
    whyMatters: [wm('Product', 'AI features quality depends on prompts.'), wm('Cost', 'Shorter prompts = fewer tokens.'), wm('Safety', 'Guardrails in system message.')],
    sections: [{ heading: 'Prompt Template', content: '1. Role ("You are a Python tutor")\n2. Context (user level, constraints)\n3. Task (specific question)\n4. Output format (JSON, bullets)\n5. Examples (few-shot)' }],
    codeExamples: [{ lang: 'python', code: 'SYSTEM = """You are Constel AI tutor. Rules:\n- Explain simply for engineering students\n- Include one code example\n- Max 200 words"""\n\nmessages = [\n  {"role": "system", "content": SYSTEM},\n  {"role": "user", "content": "Explain Python list vs tuple."}\n]' }],
    pitfalls: ['Vague prompts → vague answers.', 'No output schema for structured data.', 'Prompt injection from user input.'],
    practice: [{ question: 'Few-shot prompting?', answer: 'Include input-output examples in prompt to teach pattern.' }],
    cheatSheet: ['role + task + format', 'few-shot examples', 'sanitize user input'],
  }),

  'llm architecture': k({
    definition: '**LLM architecture** stacks transformer decoder blocks — autoregressive next-token prediction trained on massive text, aligned with RLHF/DPO for chat.',
    memoryTrick: 'Decoder-only (GPT) predicts next token left-to-right.',
    whyMatters: [wm('Selection', 'Choose model by size, cost, latency.'), wm('Limits', 'Context, knowledge cutoff, hallucination.'), wm('Integration', 'Chat Completions vs raw completion.')],
    sections: [{ heading: 'Inference Pipeline', content: 'Prompt tokens → forward pass → logits → sample token → append → repeat until stop' }],
    codeExamples: [{ lang: 'text', code: 'Input: "The capital of France is"\nModel predicts: " Paris" (highest prob token)\nOutput accumulates token by token' }],
    pitfalls: ['Treating LLM as database of facts.', 'No temperature/top_p tuning for creativity vs accuracy.'],
    practice: [{ question: 'Hallucination?', answer: 'Model generates plausible but false text — verify facts, use RAG.' }],
    cheatSheet: ['autoregressive', 'temperature controls randomness', 'not a database'],
  }),

  'openai apis': k({
    definition: '**OpenAI APIs** provide HTTP access to chat, embeddings, images, and audio models — authenticate with API key, send JSON messages, handle streaming.',
    memoryTrick: 'API key in env var — never client-side.',
    whyMatters: [wm('Products', 'Fastest path to AI features.'), wm('Patterns', 'Industry standard API shape.'), wm('Billing', 'Monitor usage dashboard.')],
    sections: [{ heading: 'Chat Completions', content: 'POST /v1/chat/completions with messages[], model, temperature, max_tokens, stream optional' }],
    codeExamples: [{ lang: 'python', code: 'from openai import OpenAI\nimport os\n\nclient = OpenAI(api_key=os.environ["OPENAI_API_KEY"])\nresp = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Hello!"}],\n    max_tokens=100,\n)\nprint(resp.choices[0].message.content)' }],
    pitfalls: ['Key in frontend.', 'No retry on 429 rate limit.', 'Unbounded max_tokens cost.'],
    practice: [{ question: 'Where store API key?', answer: 'Server environment variable — never commit to Git.' }],
    cheatSheet: ['env var key', 'server-side only', 'set max_tokens', 'handle 429'],
  }),

  'qwen integration': k({
    definition: '**Qwen** (Alibaba Cloud) is an open-weight LLM family — integrate via compatible OpenAI API endpoints or DashScope SDK for cost-effective inference.',
    memoryTrick: 'Many Qwen endpoints are OpenAI-compatible — swap base_url + model name.',
    whyMatters: [wm('Cost', 'Often cheaper than GPT-4 class.'), wm('Open weights', 'Self-host option for data privacy.'), wm('Multilingual', 'Strong on Asian languages.')],
    sections: [{ heading: 'Integration Pattern', content: 'Use OpenAI client with custom base_url pointing to Qwen/DashScope compatible endpoint.' }],
    codeExamples: [{ lang: 'python', code: 'from openai import OpenAI\n\nclient = OpenAI(\n    api_key=os.environ["DASHSCOPE_API_KEY"],\n    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",\n)\nresp = client.chat.completions.create(\n    model="qwen-plus",\n    messages=[{"role": "user", "content": "Explain RAG briefly."}],\n)' }],
    pitfalls: ['Wrong model name for region.', 'Assuming identical behavior to GPT — test prompts.'],
    practice: [{ question: 'Why OpenAI-compatible API?', answer: 'Reuse same client code — swap base_url and model.' }],
    cheatSheet: ['OpenAI client + base_url', 'test prompt behavior', 'monitor DashScope billing'],
  }),

  'streaming ai responses': k({
    definition: '**Streaming** sends model tokens as generated (SSE/chunked HTTP) — lower perceived latency for chat UIs.',
    memoryTrick: 'stream=True → iterate chunks → append to UI incrementally.',
    whyMatters: [wm('UX', 'Users see progress immediately.'), wm('Cancel', 'Stop generation mid-stream.'), wm('TTFB', 'First token time matters.')],
    sections: [{ heading: 'Server-Sent Events', content: 'Client EventSource or fetch reader loop. Backend proxies upstream stream to client.' }],
    codeExamples: [{ lang: 'python', code: 'stream = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Count to 5"}],\n    stream=True,\n)\nfor chunk in stream:\n    delta = chunk.choices[0].delta.content\n    if delta:\n        print(delta, end="", flush=True)' }],
    pitfalls: ['Buffering breaks stream — disable nginx proxy_buffering.', 'Not handling stream errors mid-flight.'],
    practice: [{ question: 'Why stream?', answer: 'Better UX — show partial response while model still generating.' }],
    cheatSheet: ['stream=True', 'flush each chunk', 'disable proxy buffering'],
  }),

  'token optimization': k({
    definition: '**Token optimization** reduces prompt/completion tokens without losing quality — trim context, summarize history, cache prompts, choose smaller models.',
    memoryTrick: 'Every token costs money and context space.',
    whyMatters: [wm('Margin', 'AI product unit economics.'), wm('Latency', 'Fewer tokens = faster.'), wm('Scale', '1M users × saved tokens = huge.')],
    sections: [{ heading: 'Techniques', content: '- Summarize old chat turns\n- Retrieve only relevant RAG chunks\n- Structured outputs vs verbose prose\n- Smaller model for routing/classification' }],
    codeExamples: [{ lang: 'python', code: '# Trim history — keep system + last N turns\nMAX_TURNS = 6\nmessages = [system_msg] + history[-MAX_TURNS:]\n\n# Cache static system prompt (provider prompt caching where available)' }],
    pitfalls: ['Dumping entire codebase in prompt.', 'Repeating instructions every turn without need.'],
    practice: [{ question: 'When smaller model?', answer: 'Classification, routing, simple extraction — reserve large model for complex reasoning.' }],
    cheatSheet: ['trim history', 'RAG not full docs', 'model routing', 'prompt caching'],
  }),

  'vector databases': k({
    definition: '**Vector databases** store embeddings with approximate nearest neighbor search — Pinecone, Weaviate, pgvector, Qdrant, Chroma.',
    memoryTrick: 'Vector DB = semantic index for RAG chunks.',
    whyMatters: [wm('RAG', 'Core retrieval layer.'), wm('Scale', 'Millions of vectors with HNSW indexes.'), wm('Hybrid', 'Combine vector + keyword search.')],
    sections: [{ heading: 'Operations', content: 'Upsert vectors with metadata → query by embedding → filter by metadata (source, date)' }],
    codeExamples: [{ lang: 'python', code: '# pgvector conceptual\n# INSERT INTO docs (content, embedding) VALUES ($1, $2)\n# SELECT content FROM docs ORDER BY embedding <=> $query_vec LIMIT 5' }],
    pitfalls: ['No metadata filters — wrong docs retrieved.', 'Wrong distance metric (cosine vs L2).'],
    practice: [{ question: 'pgvector vs dedicated DB?', answer: 'pgvector fine for MVP; dedicated DB at large scale and low latency needs.' }],
    cheatSheet: ['store embedding + metadata', 'ANN search', 'filter after semantic search'],
  }),

  'semantic search': k({
    definition: '**Semantic search** finds content by meaning not exact keywords — embed query and documents, rank by vector similarity.',
    memoryTrick: 'User question → embedding → nearest doc chunks.',
    whyMatters: [wm('RAG quality', 'Bad search = wrong AI answers.'), wm('UX', 'Users ask naturally.'), wm('Eval', 'Measure recall@k on test queries.')],
    sections: [{ heading: 'Pipeline', content: 'Chunk docs → embed → index → embed query → top-k retrieve → optional rerank → pass to LLM' }],
    codeExamples: [{ lang: 'python', code: 'def search(query: str, k: int = 5):\n    q_vec = embed(query)\n    hits = vector_db.query(q_vec, top_k=k, filter={"course": "python"})\n    return [h.text for h in hits]' }],
    pitfalls: ['Chunks too large — noise in retrieval.', 'No reranking for precision.'],
    practice: [{ question: 'Recall@5?', answer: 'Fraction of queries where relevant doc appears in top 5 results.' }],
    cheatSheet: ['embed query + docs', 'top-k retrieve', 'evaluate recall', 'rerank optional'],
  }),

  'retrieval pipelines': k({
    definition: '**Retrieval pipelines** orchestrate ingest, chunk, embed, index, query, rerank, and context assembly for RAG systems.',
    memoryTrick: 'Garbage in → garbage out. Pipeline quality = answer quality.',
    whyMatters: [wm('Production RAG', 'Not just embed+search once.'), wm('Updates', 'Re-index on doc changes.'), wm('Debug', 'Log retrieved chunks.')],
    sections: [{ heading: 'Stages', content: '1. Ingest (PDF, web, DB)\n2. Clean/normalize\n3. Chunk with overlap\n4. Embed + metadata\n5. Query + filter + rerank\n6. Build prompt context' }],
    codeExamples: [{ lang: 'python', code: 'def rag_answer(question: str) -> str:\n    chunks = retrieve(question, k=5)\n    context = "\\n\\n".join(c.text for c in chunks)\n    prompt = f"Context:\\n{context}\\n\\nQuestion: {question}"\n    return llm.chat(prompt)' }],
    pitfalls: ['No citation of sources.', 'Context exceeds window — truncate badly.'],
    practice: [{ question: 'Why chunk overlap?', answer: 'Sentences split across chunks still retrievable — overlap preserves context.' }],
    cheatSheet: ['ingest→chunk→embed→retrieve→generate', 'log chunks', 'cite sources'],
  }),

  'chunking strategies': k({
    definition: '**Chunking** splits documents into retrieval-sized pieces — fixed size, sentence-aware, semantic, or structure-based (headings, code blocks).',
    memoryTrick: 'Chunk = one idea — 256–512 tokens common starting point.',
    whyMatters: [wm('RAG accuracy', 'Wrong chunk size hurts retrieval.'), wm('Cost', 'More chunks = more embed cost.'), wm('Context', 'Fit top-k in LLM window.')],
    sections: [{ heading: 'Strategies', content: '| Method | Pros |\n|--------|------|\n| Fixed tokens | Simple |\n| Recursive split | Respects paragraphs |\n| Semantic | Coherent topics |\n| Markdown headers | Preserves structure |' }],
    codeExamples: [{ lang: 'python', code: 'def chunk_text(text: str, size: int = 500, overlap: int = 50):\n    chunks = []\n    start = 0\n    while start < len(text):\n        end = start + size\n        chunks.append(text[start:end])\n        start = end - overlap\n    return chunks' }],
    pitfalls: ['Tiny chunks lose context.', 'Huge chunks dilute embedding signal.'],
    practice: [{ question: 'Code doc chunking?', answer: 'Split by function/class boundaries — keep signatures with bodies.' }],
    cheatSheet: ['256-512 tokens start', 'overlap 10-20%', 'structure-aware for markdown'],
  }),

  'tool calling': k({
    definition: '**Tool calling** (function calling) lets LLMs request structured actions — search DB, call API, run code — you execute and return results.',
    memoryTrick: 'Model picks tool + JSON args → your code runs → result back to model.',
    whyMatters: [wm('Agents', 'LLM + tools = useful automation.'), wm('Accuracy', 'Math/search via tools not hallucination.'), wm('Products', 'Copilots use tool loops.')],
    sections: [{ heading: 'Loop', content: '1. Send tools schema\n2. Model returns tool_calls\n3. Execute locally\n4. Append tool result message\n5. Model produces final answer' }],
    codeExamples: [{ lang: 'python', code: 'tools = [{\n  "type": "function",\n  "function": {\n    "name": "get_weather",\n    "parameters": {"type": "object", "properties": {"city": {"type": "string"}}}\n  }\n}]\n# Model may return tool_call → fetch weather API → continue chat' }],
    pitfalls: ['Executing untrusted code from model.', 'No timeout on tool execution.'],
    practice: [{ question: 'Why tools vs prompt only?', answer: 'Ground answers in live data — reduce hallucination for facts and actions.' }],
    cheatSheet: ['define JSON schema', 'execute server-side', 'return result to model'],
  }),

  'memory systems': k({
    definition: '**Memory systems** persist context across sessions — short-term (chat history), long-term (vector store of user facts), episodic summaries.',
    memoryTrick: 'Summarize + embed important facts — do not send full history forever.',
    whyMatters: [wm('UX', 'Personalized assistants remember preferences.'), wm('Tokens', 'Unbounded history exceeds window.'), wm('Privacy', 'Store only what user consents.')],
    sections: [{ heading: 'Layers', content: 'Working memory (last N turns) + episodic (session summaries) + semantic (user profile vectors)' }],
    codeExamples: [{ lang: 'python', code: 'def update_memory(user_id: str, fact: str):\n    vec = embed(fact)\n    db.upsert(user_id=user_id, text=fact, embedding=vec)\n\ndef recall(user_id: str, query: str, k=3):\n    return vector_search(user_id, embed(query), k)' }],
    pitfalls: ['Storing PII without consent.', 'Never forgetting outdated facts.'],
    practice: [{ question: 'Compress chat history how?', answer: 'Periodic LLM summary of older turns — keep recent messages verbatim.' }],
    cheatSheet: ['summarize old turns', 'vector long-term memory', 'user consent for PII'],
  }),

  'autonomous workflows': k({
    definition: '**Autonomous workflows** chain LLM planning, tool use, and validation loops to complete multi-step tasks with minimal human input.',
    memoryTrick: 'Plan → act → observe → replan until done or max steps.',
    whyMatters: [wm('Automation', 'Support triage, research agents.'), wm('Product', 'Differentiator for AI apps.'), wm('Safety', 'Human approval gates for risky actions.')],
    sections: [{ heading: 'Control Patterns', content: 'ReAct (reason+act), Plan-and-Execute, supervisor multi-agent. Always set max_iterations and budgets.' }],
    codeExamples: [{ lang: 'python', code: 'for step in range(MAX_STEPS):\n    action = agent.decide(state)\n    if action.type == "finish":\n        return action.result\n    observation = run_tool(action)\n    state = state.append(action, observation)' }],
    pitfalls: ['Infinite loops without max steps.', 'No human approval for destructive tools.'],
    practice: [{ question: 'ReAct pattern?', answer: 'Alternate reasoning traces with tool actions based on observations.' }],
    cheatSheet: ['max steps limit', 'human-in-loop for risk', 'log every action'],
  }),

  'multi-agent orchestration': k({
    definition: '**Multi-agent systems** delegate subtasks to specialized agents (researcher, coder, reviewer) coordinated by supervisor or message bus.',
    memoryTrick: 'Supervisor assigns tasks — agents report back — supervisor synthesizes.',
    whyMatters: [wm('Complex tasks', 'Single prompt insufficient.'), wm('Quality', 'Reviewer agent catches errors.'), wm('Research', 'Active area in AI engineering.')],
    sections: [{ heading: 'Patterns', content: 'Supervisor-worker, peer debate, pipeline (A→B→C). Shared state or blackboard architecture.' }],
    codeExamples: [{ lang: 'python', code: '# Supervisor loop\nplan = supervisor.plan(task)\nfor subtask in plan:\n    agent = router.pick(subtask)\n    result = agent.run(subtask)\n    state.add(result)\nanswer = supervisor.synthesize(state)' }],
    pitfalls: ['Agent chatter explosion — cost.', 'Unclear responsibilities → duplicated work.'],
    practice: [{ question: 'When multi-agent vs single?', answer: 'Distinct expertise needed and task decomposable — else single agent simpler.' }],
    cheatSheet: ['supervisor coordinates', 'specialized agents', 'cap cost/iterations'],
  }),

  fastapi: k({
    definition: '**FastAPI** is modern Python async web framework — automatic OpenAPI docs, Pydantic validation, high performance with Starlette/uvicorn.',
    memoryTrick: 'Type hints → validation + docs for free.',
    whyMatters: [wm('AI backends', 'Standard for LLM services.'), wm('Speed', 'Async I/O for concurrent API calls.'), wm('DX', '/docs Swagger UI built-in.')],
    sections: [{ heading: 'Structure', content: 'main.py → routers → services → external APIs/DB. Dependency injection via Depends().' }],
    codeExamples: [{ lang: 'python', code: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass ChatRequest(BaseModel):\n    message: str\n\n@app.post("/chat")\nasync def chat(req: ChatRequest):\n    reply = await llm_service.complete(req.message)\n    return {"reply": reply}' }],
    pitfalls: ['Blocking sync calls in async routes.', 'No timeout on external LLM calls.'],
    practice: [{ question: 'Pydantic role?', answer: 'Validate request/response bodies — auto 422 on invalid data.' }],
    cheatSheet: ['async routes', 'Pydantic models', 'Depends DI', 'uvicorn run'],
  }),

  'async ai systems': k({
    definition: '**Async AI systems** use non-blocking I/O to handle many concurrent LLM/streaming requests without thread-per-connection overhead.',
    memoryTrick: 'await external API — never block event loop on 30s LLM call without async.',
    whyMatters: [wm('Throughput', 'Serve many chat users.'), wm('Streaming', 'Natural fit for async iterators.'), wm('Cost', 'Efficient resource use on single worker.')],
    sections: [{ heading: 'Patterns', content: 'async httpx client, asyncio.gather for parallel embeds, background tasks for long jobs, queues for heavy inference.' }],
    codeExamples: [{ lang: 'python', code: 'import httpx\n\nasync def embed_batch(texts: list[str]):\n    async with httpx.AsyncClient(timeout=30) as client:\n        tasks = [client.post(EMBED_URL, json={"text": t}) for t in texts]\n        responses = await asyncio.gather(*tasks)\n    return [r.json()["vector"] for r in responses]' }],
    pitfalls: ['Sync requests in async def.', 'No concurrency limits — rate limit API.'],
    practice: [{ question: 'Why async for AI API?', answer: 'Wait on network I/O concurrently — serve more users per worker.' }],
    cheatSheet: ['async def routes', 'httpx AsyncClient', 'limit concurrency', 'queue heavy jobs'],
  }),

  caching: k({
    definition: '**Caching** stores LLM responses or embeddings keyed by prompt hash — Redis/in-memory — cut latency and cost for repeated queries.',
    memoryTrick: 'Same question twice → second answer from cache.',
    whyMatters: [wm('Cost', 'LLM calls expensive at scale.'), wm('Latency', 'Cache hit = milliseconds.'), wm('Reliability', 'Fallback when provider down.')],
    sections: [{ heading: 'Cache Keys', content: 'Hash(normalized_prompt + model + temperature). TTL based on content freshness needs.' }],
    codeExamples: [{ lang: 'python', code: 'import hashlib, json\n\ndef cache_key(prompt: str, model: str) -> str:\n    raw = json.dumps({"p": prompt, "m": model}, sort_keys=True)\n    return "llm:" + hashlib.sha256(raw.encode()).hexdigest()\n\n# cached = redis.get(key) or call_llm and redis.setex(key, ttl, result)' }],
    pitfalls: ['Caching personalized responses incorrectly.', 'Stale cache after prompt template change — version key.'],
    practice: [{ question: 'Semantic cache?', answer: 'Cache hit on similar not identical prompts via embedding similarity — advanced pattern.' }],
    cheatSheet: ['hash prompt+model', 'TTL appropriately', 'version prompt template'],
  }),

  'scaling ai apis': k({
    definition: '**Scaling AI APIs** uses load balancers, horizontal workers, queues for batch inference, caching, and rate limiting across tenants.',
    memoryTrick: 'Stateless API workers + queue for spikes + cache for repeats.',
    whyMatters: [wm('Launch', 'Viral feature needs scale plan.'), wm('SLO', 'p99 latency targets.'), wm('Cost', 'Autoscale vs fixed GPU pools.')],
    sections: [{ heading: 'Architecture', content: 'API gateway → rate limit → workers → LLM provider / self-hosted GPU → observability' }],
    codeExamples: [{ lang: 'text', code: '[Clients] → [LB] → [FastAPI x N] → [Redis cache]\n                              ↓\n                         [Job queue] → [GPU workers]' }],
    pitfalls: ['No queue — LLM timeout blocks workers.', 'Single provider no fallback.'],
    practice: [{ question: 'Horizontal scale requirement?', answer: 'Stateless servers — session in Redis/DB not local memory.' }],
    cheatSheet: ['stateless workers', 'queue bursts', 'cache + rate limit', 'monitor p99'],
  }),

  'streaming ui': k({
    definition: '**Streaming UI** renders LLM tokens incrementally — React state append, markdown partial render, loading indicators, stop button.',
    memoryTrick: 'Append delta to message state on each SSE chunk.',
    whyMatters: [wm('UX', 'ChatGPT-like experience expected.'), wm('Perceived speed', 'First token < 1s feels fast.'), wm('Cancel', 'AbortController stops fetch.')],
    sections: [{ heading: 'React Pattern', content: 'fetch stream → ReadableStream reader → decode → setMessages append → markdown render last message' }],
    codeExamples: [{ lang: 'tsx', code: 'const [text, setText] = useState("");\nconst res = await fetch("/api/chat/stream", { method: "POST", body });\nconst reader = res.body!.getReader();\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  setText(prev => prev + decoder.decode(value));\n}' }],
    pitfalls: ['Re-render entire markdown tree every token — throttle.', 'XSS from unsanitized markdown.'],
    practice: [{ question: 'Abort streaming?', answer: 'AbortController.signal passed to fetch — user clicks Stop.' }],
    cheatSheet: ['append chunks', 'throttle render', 'AbortController', 'sanitize markdown'],
  }),

  'ai chat ux': k({
    definition: '**AI chat UX** covers conversation layout, message roles, typing indicators, error recovery, suggested prompts, and accessibility.',
    memoryTrick: 'User messages right, assistant left — clear role distinction.',
    whyMatters: [wm('Adoption', 'Bad UX kills AI features.'), wm('Trust', 'Show sources and confidence.'), wm('Accessibility', 'Keyboard nav and screen readers.')],
    sections: [{ heading: 'Best Practices', content: '- Suggested starter prompts\n- Copy/regenerate buttons\n- Show errors inline with retry\n- Disable input while streaming\n- Mobile-friendly input area' }],
    codeExamples: [{ lang: 'tsx', code: '<div className="flex flex-col gap-4">\n  {messages.map(m => (\n    <div key={m.id} className={m.role === "user" ? "ml-auto" : "mr-auto"}>\n      <ReactMarkdown>{m.content}</ReactMarkdown>\n    </div>\n  ))}\n</div>' }],
    pitfalls: ['No loading state — feels broken.', 'Losing message history on refresh.'],
    practice: [{ question: 'Why suggested prompts?', answer: 'Reduce blank-page anxiety — show what AI can do.' }],
    cheatSheet: ['clear roles', 'streaming indicator', 'retry errors', 'persist history'],
  }),

  'markdown rendering': k({
    definition: '**Markdown rendering** displays LLM output with code blocks, lists, tables — use react-markdown + remark-gfm + syntax highlighting + sanitization.',
    memoryTrick: 'LLM outputs markdown — render safely not dangerouslySetInnerHTML raw.',
    whyMatters: [wm('Readability', 'Code blocks need highlighting.'), wm('Security', 'XSS via malicious HTML in output.'), wm('UX', 'Tables and lists for structured answers.')],
    sections: [{ heading: 'Stack', content: 'react-markdown + remark-gfm + rehype-sanitize + shiki/prism for code fences' }],
    codeExamples: [{ lang: 'tsx', code: 'import ReactMarkdown from "react-markdown";\nimport remarkGfm from "remark-gfm";\n\n<ReactMarkdown remarkPlugins={[remarkGfm]}>{assistantText}</ReactMarkdown>' }],
    pitfalls: ['Raw HTML injection.', 'Broken partial markdown during stream — acceptable or defer render.'],
    practice: [{ question: 'remark-gfm adds?', answer: 'GitHub Flavored Markdown — tables, task lists, strikethrough.' }],
    cheatSheet: ['react-markdown', 'remark-gfm', 'sanitize HTML', 'highlight code blocks'],
  }),

  'ai copilots': k({
    definition: '**AI copilots** embed context-aware assistance in products — IDE, docs, dashboards — using RAG on domain data and scoped tools.',
    memoryTrick: 'Copilot = LLM + your app context + allowed actions.',
    whyMatters: [wm('Product', 'Differentiated features.'), wm('Productivity', 'Assist not replace user.'), wm('Safety', 'Scope tools to user permissions.')],
    sections: [{ heading: 'Architecture', content: 'User action → gather context (file, selection, DB) → RAG → prompt → stream → optional tool (edit file)' }],
    codeExamples: [{ lang: 'text', code: 'User selects code → send selection + file path + repo context → LLM suggests fix → user accepts diff' }],
    pitfalls: ['Copilot with full admin access.', 'No audit log of AI actions.'],
    practice: [{ question: 'Copilot vs chatbot?', answer: 'Copilot is embedded with app context and actions; chatbot is general conversation.' }],
    cheatSheet: ['inject app context', 'scope permissions', 'user confirms actions'],
  }),

  'inference optimization': k({
    definition: '**Inference optimization** reduces latency and cost — quantization, batching, KV-cache, speculative decoding, smaller distilled models.',
    memoryTrick: 'Measure tokens/sec and cost per 1M tokens before optimizing.',
    whyMatters: [wm('Margin', 'Self-hosted model economics.'), wm('Latency', 'Real-time chat needs fast inference.'), wm('Scale', 'GPU utilization drives cost.')],
    sections: [{ heading: 'Techniques', content: '| Technique | Benefit |\n|-----------|--------|\n| Quantization INT8/4 | Smaller, faster |\n| Batching | GPU throughput |\n| KV cache | Faster autoregressive |\n| Distillation | Cheaper smaller model |' }],
    codeExamples: [{ lang: 'text', code: 'Profile: p50/p99 latency, tokens/sec, GPU memory, cost per request' }],
    pitfalls: ['Optimizing before measuring baseline.', 'Quantization quality loss on critical tasks untested.'],
    practice: [{ question: 'KV cache?', answer: 'Stores attention keys/values from prior tokens — avoid recomputing each step.' }],
    cheatSheet: ['profile first', 'quantize for speed', 'batch requests', 'consider distilled model'],
  }),

  'prompt caching': k({
    definition: '**Prompt caching** (provider feature) reuses computed prefix states for repeated system prompts — lower latency and cost on long static prefixes.',
    memoryTrick: 'Static system prompt + docs prefix = cacheable block.',
    whyMatters: [wm('Cost', 'Anthropic/OpenAI cache discounts on prefix.'), wm('Latency', 'Skip reprocessing long system prompt.'), wm('RAG', 'Cache stable document prefixes.')],
    sections: [{ heading: 'Design for Cache Hits', content: 'Put static content first (system, docs). Variable user message last. Keep prefix stable across requests.' }],
    codeExamples: [{ lang: 'python', code: '# Structure messages for cache-friendly prefix\nmessages = [\n  {"role": "system", "content": LONG_STATIC_SYSTEM + CACHED_DOCS},\n  {"role": "user", "content": user_query},  # variable suffix\n]' }],
    pitfalls: ['Changing system prompt every request — no cache hit.'],
    practice: [{ question: 'What to cache in RAG?', answer: 'Stable retrieved doc set or system instructions — not unique user query.' }],
    cheatSheet: ['static prefix first', 'variable suffix last', 'check provider cache API'],
  }),

  monitoring: k({
    definition: '**AI monitoring** tracks latency, token usage, error rates, hallucination feedback, retrieval quality, and cost per feature/user.',
    memoryTrick: 'Log prompt hash, model, tokens, latency, user rating — not full PII prompts in prod.',
    whyMatters: [wm('Cost control', 'Alert on spend spikes.'), wm('Quality', 'Track thumbs down rate.'), wm('Debug', 'Replay failed conversations.')],
    sections: [{ heading: 'Metrics', content: 'requests/min, p99 latency, tokens in/out, $/day, error rate, cache hit rate, RAG recall proxy' }],
    codeExamples: [{ lang: 'python', code: 'logger.info({\n    "event": "llm_complete",\n    "model": model,\n    "latency_ms": ms,\n    "tokens_in": usage.prompt_tokens,\n    "tokens_out": usage.completion_tokens,\n})' }],
    pitfalls: ['Logging full prompts with secrets/PII.', 'No alerting on error rate.'],
    practice: [{ question: 'Key AI cost metric?', answer: 'Cost per successful task or per daily active user.' }],
    cheatSheet: ['log tokens+latency', 'redact PII', 'alert on errors/cost', 'user feedback loop'],
  }),

  'ai cost optimization': k({
    definition: '**AI cost optimization** balances model choice, caching, prompt size, batching, and usage limits to hit unit economics targets.',
    memoryTrick: 'Route easy queries to cheap model — hard queries to expensive model.',
    whyMatters: [wm('Startup survival', 'Uncapped API spend kills margins.'), wm('Pricing', 'SaaS pricing must cover AI COGS.'), wm('Abuse', 'Prevent bot draining credits.')],
    sections: [{ heading: 'Levers', content: 'Model routing, prompt compression, cache, batch embeds, per-user quotas, off-peak batch jobs' }],
    codeExamples: [{ lang: 'python', code: 'def route_model(task: str) -> str:\n    if task in ("classify", "extract"): return "gpt-4o-mini"\n    if task == "reason": return "gpt-4o"\n    return "gpt-4o-mini"' }],
    pitfalls: ['GPT-4 for everything.', 'No per-user rate limits.'],
    practice: [{ question: 'Model routing example?', answer: 'Mini for summarization/classification; full model for multi-step reasoning only.' }],
    cheatSheet: ['route by task', 'quota per user', 'cache prompts', 'monitor $/DAU'],
  }),

  'gpu deployment basics': k({
    definition: '**GPU deployment** runs self-hosted models on CUDA hardware — vLLM, TGI, Ollama for local dev; cloud GPU instances for production inference.',
    memoryTrick: 'GPU memory limits model size — 7B vs 70B needs different hardware.',
    whyMatters: [wm('Privacy', 'Data stays on your infra.'), wm('Cost', 'High volume may beat API pricing.'), wm('Latency', 'Colocate with app region.')],
    sections: [{ heading: 'Stack Options', content: 'Ollama (local dev), vLLM (production throughput), HuggingFace TGI, cloud A10/A100 instances' }],
    codeExamples: [{ lang: 'bash', code: '# Ollama local\nollama pull qwen2.5:7b\nollama run qwen2.5:7b\n\n# vLLM server (conceptual)\n# python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-7B' }],
    pitfalls: ['Undersized GPU OOM.', 'No autoscaling on GPU pool.'],
    practice: [{ question: 'When self-host vs API?', answer: 'Self-host at high volume, strict data residency, or customization; API for speed to market.' }],
    cheatSheet: ['check VRAM vs model size', 'vLLM for prod', 'Ollama for dev', 'region latency'],
  }),

  'ai system architecture': k({
    definition: '**AI system architecture** connects ingestion, vector DB, LLM API, cache, queue, auth, frontend streaming, and observability into cohesive product.',
    memoryTrick: 'Draw data flow: docs in → RAG → LLM → stream out → log metrics.',
    whyMatters: [wm('Capstone', 'Architecture diagram graded.'), wm('Interviews', 'Design AI tutor / RAG app.'), wm('Reliability', 'Fallbacks when LLM down.')],
    sections: [{ heading: 'Reference Architecture', content: 'Next.js UI → FastAPI → Redis cache → Vector DB + Postgres → LLM provider → Langfuse monitoring' }],
    codeExamples: [{ lang: 'text', code: '[User] → [Web UI stream] → [API] → [Cache?] → [RAG retrieve] → [LLM] → [Stream back]\n                              ↓\n                         [Postgres users] [Vector docs] [Metrics]' }],
    pitfalls: ['Monolith LLM logic in frontend.', 'No fallback message on provider outage.'],
    practice: [{ question: 'Capstone AI components?', answer: 'Ingest, embed, retrieve, generate, stream UI, auth, monitoring — minimum viable each.' }],
    cheatSheet: ['RAG pipeline diagram', 'server-side LLM keys', 'cache+queue', 'monitor tokens'],
  }),

  'vector db integration': k({
    definition: '**Vector DB integration** wires embed pipeline, metadata schema, hybrid search, and re-index jobs into your application lifecycle.',
    memoryTrick: 'Schema: id, content, embedding, source, updated_at — index on updated_at for refresh.',
    whyMatters: [wm('RAG prod', 'Integration not one-off script.'), wm('Updates', 'Docs change — re-embed pipeline.'), wm('Multi-tenant', 'Filter by user_id/org_id.')],
    sections: [{ heading: 'Integration Checklist', content: '- Embed on upload webhook\n- Background reindex job\n- Query with tenant filter\n- Migration path for embedding model change' }],
    codeExamples: [{ lang: 'python', code: 'async def index_document(doc_id: str, text: str, org_id: str):\n    chunks = chunk(text)\n    vectors = await embed_batch(chunks)\n    await vector_db.upsert([\n        {"id": f"{doc_id}:{i}", "vector": v, "metadata": {"org_id": org_id, "text": c}}\n        for i, (c, v) in enumerate(zip(chunks, vectors))\n    ])' }],
    pitfalls: ['No tenant isolation in search.', 'Embedding model change without reindex plan.'],
    practice: [{ question: 'Multi-tenant filter?', answer: 'Always filter vector query by org_id/user_id — never leak cross-tenant docs.' }],
    cheatSheet: ['embed on ingest', 'metadata filters', 'reindex job', 'version embeddings'],
  }),

  'production deployment': k({
    definition: '**AI production deployment** ships model integration with secrets management, autoscaling, health checks, cost alerts, and graceful degradation.',
    memoryTrick: 'Feature flag AI off — app still works if provider down.',
    whyMatters: [wm('Users', 'Downtime loses trust.'), wm('Cost', 'Runaway loops drain budget.'), wm('Compliance', 'Data residency requirements.')],
    sections: [{ heading: 'Checklist', content: 'API keys in vault, rate limits, timeout 60s, circuit breaker on LLM, queue long tasks, monitor spend' }],
    codeExamples: [{ lang: 'python', code: 'async def llm_with_fallback(prompt: str) -> str:\n    try:\n        return await primary_llm(prompt)\n    except ProviderError:\n        logger.exception("LLM down")\n        return "Assistant temporarily unavailable. Try again shortly."' }],
    pitfalls: ['Sync LLM in request thread without timeout.', 'No spend cap alerts.'],
    practice: [{ question: 'Circuit breaker?', answer: 'Stop calling failing provider after N errors — fail fast with fallback.' }],
    cheatSheet: ['timeouts everywhere', 'fallback UX', 'cost alerts', 'secrets in vault'],
  }),
};

export function getAiKnowledge(topic: string): TopicKnowledge | null {
  return AI_KNOWLEDGE[topic.toLowerCase().trim()] ?? null;
}

export function aiDefault(topic: string): TopicKnowledge {
  return defaultKnowledge(topic, 'AI Engineering & Intelligent Systems', 'python');
}
