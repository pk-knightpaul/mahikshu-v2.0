import { Storage } from '../services/storage.js';

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    authHeader: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' })
  },
  google: {
    name: 'Google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    authHeader: (key) => ({ 'x-goog-api-key': key })
  },
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  huggingface: {
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models/{model}',
    models: ['mistralai/Mistral-7B-Instruct-v0.2', 'meta-llama/Llama-2-70b-chat-hf'],
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct'],
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}`, 'HTTP-Referer': window.location.href })
  }
};

const PROMPT_TEMPLATES = {
  blog: 'Write a 500-word blog post about this crypto opportunity. Include key facts, potential impact, and a balanced perspective.',
  thread: 'Create a Twitter/X thread (5-7 tweets) about this opportunity. Make it engaging and informative.',
  seo: 'Suggest 5 SEO-optimized titles and meta descriptions for content about this opportunity.',
  analysis: 'Provide a brief risk/reward analysis of this opportunity for retail investors.',
  news: 'Write a professional news summary (150 words) suitable for a crypto publication.'
};

export const LLM = {
  config: null,

  init() {
    this.config = Storage.session.get('mahikshu_llm_config');
    this.setupUI();
  },

  setupUI() {
    const modal = document.getElementById('llm-modal');
    const providerSelect = document.getElementById('llm-provider');
    const modelSelect = document.getElementById('llm-model');
    const apiKeyInput = document.getElementById('llm-api-key');

    if (providerSelect) {
      providerSelect.innerHTML = Object.entries(PROVIDERS).map(([key, p]) =>
        `<option value="${key}">${p.name}</option>`
      ).join('');
      providerSelect.addEventListener('change', () => {
        const provider = PROVIDERS[providerSelect.value];
        modelSelect.innerHTML = provider.models.map(m =>
          `<option value="${m}">${m}</option>`
        ).join('');
      });
      providerSelect.dispatchEvent(new Event('change'));
    }

    if (this.config && apiKeyInput) {
      providerSelect.value = this.config.provider;
      providerSelect.dispatchEvent(new Event('change'));
      setTimeout(() => {
        modelSelect.value = this.config.model;
        apiKeyInput.value = this.config.key || '';
      }, 0);
    }

    document.getElementById('llm-save-btn')?.addEventListener('click', () => {
      this.config = {
        provider: providerSelect.value,
        model: modelSelect.value,
        key: apiKeyInput.value.trim()
      };
      Storage.session.set('mahikshu_llm_config', this.config);
      modal.classList.remove('active');
    });

    document.querySelectorAll('.llm-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        const customPrompt = document.getElementById('llm-custom-prompt');
        if (customPrompt && template) customPrompt.value = PROMPT_TEMPLATES[template] || '';
      });
    });

    document.getElementById('llm-generate-btn')?.addEventListener('click', () => this.generate());
  },

  async generate() {
    if (!this.config?.key) { alert('Please configure your API key first'); return; }
    const prompt = document.getElementById('llm-custom-prompt')?.value;
    const opportunity = window.selectedOpportunity;
    if (!prompt || !opportunity) return;
    const provider = PROVIDERS[this.config.provider];
    const fullPrompt = `Context: ${opportunity.title}\n${opportunity.summary}\n\n${prompt}`;
    const output = document.getElementById('llm-output');
    output.textContent = 'Generating...';

    try {
      let response;
      if (['openai', 'groq', 'openrouter'].includes(this.config.provider)) {
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...provider.authHeader(this.config.key) },
          body: JSON.stringify({ model: this.config.model, messages: [{ role: 'user', content: fullPrompt }], max_tokens: 1000, temperature: 0.7 })
        });
        const data = await response.json();
        output.textContent = data.choices[0].message.content;
      } else if (this.config.provider === 'anthropic') {
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...provider.authHeader(this.config.key) },
          body: JSON.stringify({ model: this.config.model, max_tokens: 1000, messages: [{ role: 'user', content: fullPrompt }] })
        });
        const data = await response.json();
        output.textContent = data.content[0].text;
      } else if (this.config.provider === 'google') {
        const endpoint = provider.endpoint.replace('{model}', this.config.model);
        response = await fetch(`${endpoint}?key=${this.config.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
        });
        const data = await response.json();
        output.textContent = data.candidates[0].content.parts[0].text;
      } else if (this.config.provider === 'huggingface') {
        const endpoint = provider.endpoint.replace('{model}', encodeURIComponent(this.config.model));
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...provider.authHeader(this.config.key) },
          body: JSON.stringify({ inputs: fullPrompt, parameters: { max_new_tokens: 1000, temperature: 0.7 } })
        });
        const data = await response.json();
        output.textContent = Array.isArray(data) ? data[0].generated_text : data.generated_text;
      }
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  }
};
