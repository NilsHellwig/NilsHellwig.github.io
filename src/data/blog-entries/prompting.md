![Illustration](/blog-imgs/acl2025/prompting-1.png)

Over the past three years, my research has also involved extensive exploration of the effective use of large language models (LLMs). We probably all heard of standard techniques like prompt design, hyperparameters, and model selection. However, there are many other techniques that, whether in academic studies or industrial applications, deliver large performance/efficiency gains, yet have received far less attention than they deserve.

## 1. Prefix Batching: "How can a multi-billion parameter Large Language Model generate thousands of outputs per second on a consumer GPU?"

In nearly every study I’m involved in, we quickly run into the same challenge: testing dozens of conditions and prompts generates an enormous number of requests to the LLM. And don't forget about the "quick" ablation studies 😅.

Consider this simple example: We want to compare the performance of 5 different LLMs across 4 datasets (each with 1,000 test examples) using 3 distinct prompting techniques. That adds up to **5 × 4 × 1,000 × 3 = 60,000 prompts**.

Using commercial APIs? Prohibitively expensive. Even with open-source models running locally, sequentially processing thousands of requests quickly becomes impractical and painfully slow.

But here’s the observation: When you look closely at the prompts, probably, almost all of them share the exact same prefix, only the actual test examples (the suffixes) change.

**The answer: Prefix Batching!**

**Prefix Batching** is a powerful inference optimization that dramatically improves efficiency in exactly these scenarios.

Instead of processing each request from scratch, the system identifies the common **prefix** (the shared part of the prompt, such as the system instruction, few-shot examples, or task description) and computes its Key-Value (KV) cache **only once**. This pre-computed cache is then reused across all requests that share the same prefix, while the unique suffixes (the varying test examples) are processed efficiently in a batched manner.

The result:

- Massive reduction in redundant computations
- Far higher throughput, often enabling thousands of outputs per second even on consumer-grade GPUs
- Much lower memory usage and latency for large-scale evaluations
- No quality loss compared to standard inference

Several modern LLM inference engines offer excellent support for prefix batching / prefix caching, including: [vLLM](https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/), [Hugging Face Text Generation Inference (TGI)](https://huggingface.co/docs/text-generation-inference/en/conceptual/chunking), [SGLang](https://lmsys.org/blog/2024-01-17-sglang/), [TensorRT-LLM (NVIDIA)](https://nvidia.github.io/TensorRT-LLM/advanced/kv-cache-reuse.html), and [LMDeploy](https://lmdeploy.readthedocs.io/en/latest/inference/turbomind_config.html). Sadly, Ollama/llama.cpp do not yet support it.

## 2. Guided Decoding: "I added a huge list of constraints to my prompt, but the model still generates outputs that violate them. What can I do?"

Especially in tasks with strict output requirements (e.g., structured data generation), it’s common to add long constraint lists to the prompt. Yet even detailed instructions often fail, the LLM still produces invalid JSON, broken schemas, or violated rules.

So the idea is simple: we want the LLM to strictly follow a **rule** or **grammar** during generation, for example, “output must be valid JSON according to this schema” or “match this regex pattern”.

**The answer: Guided Decoding!**

We can define such rules using Pushdown Automata (PDA). At every token generation step, the system checks the current state and masks out any tokens that would violate the rule.

For LLMs with a vocabulary of more than 128,000 tokens, however, the following applies: naively checking every possible token to see if it violates the rule at the current step creates heavy computational overhead. **xGrammar** solves this elegantly by transforming the complex problem of grammar-constrained decoding into a high-performance operations task.

### How xGrammar achieves this:

**Static Masking:** Most tokens are pre-classified as "always valid" or "always invalid" for specific states. E.g., imagine generating a JSON object. After generating the opening curly brace `{`, the next token must be a `"` to start a key. So all tokens except those starting with `"` can be statically masked out for that state. Of course, if the key must be a certain literal (e.g., `"name"`, `"age"`, etc.), xGrammar can further ensure correctness by only allowing tokens that match those since tokens like `"name` could potentially exist in the vocabulary (some LLM tokenizers have really weird vocabularies!). This reduces the "logic" of the grammar to a simple lookup table: "If I am in State A and see Token X, move to State B."

xGrammar reduces the CPU overhead of structured generation by up to **10x to 100x**, making the latency cost of following a complex schema virtually indistinguishable from unconstrained text generation!

Thanks to this approach, you can reliably enforce many complex output formats. vLLM and Ollama/llama.cpp, for example, support:

- **JSON** via JSON Schema, meaning you can build your schema in Python with Pydantic, convert it to JSON Schema, and let xGrammar handle the rest.
- **Regex** patterns, which are especially useful since many structured formats can be expressed as regular languages (e.g., CSV, TSV, simple XML, etc.).

The outcome? At least guaranteed structural correctness, no retries, no post-processing, no more invalid outputs. But be aware: Even with guided decoding, the LLM itself is still “wandering in the dark”. Meaning, it has no inherent knowledge of your grammar or constraints. At each generation step, it doesn’t automatically know which tokens are allowed or forbidden. That’s why it’s still important to **include the grammar or schema in the prompt** (for example, by providing the JSON schema or a clear description of the expected structure). This helps the model stay semantically on track, while the guided decoding engine component ensures structural correctness.

## 3. Making the model itself more efficient

I won’t spend much time on **Mixture-of-Experts (MoE)** models; you’ve probably heard about them already. In many cases, they’re an excellent choice, so try them 😉! However, the last few months have brought some truly exciting developments that can deliver impressive speed and efficiency gains on top. Here are a few I find particularly promising:

### Speculative Decoding

Instead of generating one token at a time, a small, fast **draft model** quickly proposes a sequence of future tokens (a "draft"). The large target model then verifies all these draft tokens **in parallel** using a single forward pass. Correct tokens are accepted, while any incorrect prefix is rejected and regenerated by the target model. If most guesses are correct, this yields 1.5–3× faster inference while producing a mathematically identical output distribution to the large model.

**[DFlash](https://github.com/z-lab/dflash)** (from **Z Lab**) takes this idea further by using a lightweight **block diffusion** model as the drafter. Instead of autoregressively generating the draft token-by-token, DFlash predicts an entire block of tokens in **one parallel forward pass**, conditioned on hidden states from the target model. This enables even higher acceptance rates and speedups, some report **4–6×** lossless acceleration.

However, this approach works especially well for long outputs, as the fixed overhead of drafting and verification can be amortized over a large number of generated tokens. For very short outputs, the relative speedup is typically smaller because the per-step verification cost represents a larger fraction of the total generation time.

### TurboQuant (from Google Research)

One of the biggest recent advances: **[TurboQuant](https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/)** compresses the Key-Value (KV) cache, the "memory" of the model that remembers previous tokens. So now we compress both the model weights (weight quantization) and the KV cache, which is crucial for long-context inference! It works with **most modern LLMs**.

TurboQuant quantizes the KV cache down to **2.5–4 bits per value** (compared to the usual 16-bit FP16/BF16). The sweet spot is **4-bit** (near-zero accuracy loss) or **3.5-bit** (still statistically indistinguishable from full precision in most long-context benchmarks I have seen).

**Concrete example on consumer hardware**

Take the popular **Llama-3.1-8B-Instruct** model on a single **NVIDIA RTX 4090 (24 GB VRAM)**:

- Without TurboQuant (FP16 KV cache) → at 128k context, the KV cache alone eats ~16 GB.
- With **4-bit TurboQuant** → the same 128k context drops to just **~2.7 GB** for the KV cache (6× smaller).

That means you can comfortably employ prompts with 128k–200k+ context lengths while still having plenty of headroom for the model weights and maybe (prefix) batching 😉. Notably, TurboQuant is not yet widely available in production engines, e.g., teams of vLLM and Ollama/llama.cpp are still working on integrating it.
