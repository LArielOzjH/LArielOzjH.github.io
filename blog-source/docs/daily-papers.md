# Daily paper digest

The digest is a static page at `/blog/papers/`. It is deliberately selective:
an arXiv entry must match one of the eight systems/inference topics and include
at least one institution from `scripts/papers/institutions.json`.

The scheduled GitHub Actions job in `my-portfolio` runs at 02:15 UTC, which is
10:15 China Standard Time. A scheduled job does not depend on the local
computer being online. `workflow_dispatch` is available for an immediate
refresh.

The first version uses a deterministic abstract-derived TL;DR. It does not
call an LLM API. To adjust selection, edit the two JSON policy files and run:

```bash
npm run papers:fetch
npm run build:blog
```

For a local, network-free build from the deployment repository:

```bash
BLOG_PAPERS_FIXTURE=blog-source/scripts/papers/fixtures/arxiv-sample.xml \
  bash scripts/build-blog.sh
```
