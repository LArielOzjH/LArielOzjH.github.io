# Daily paper digest

The digest is a static page at `/blog/papers/`. It is deliberately selective:
an arXiv entry must match one of the seven systems/inference topics and include
at least one institution from `scripts/papers/institutions.json`.

The scheduled GitHub Actions job in `my-portfolio` runs at 02:15 UTC, which is
10:15 China Standard Time. A scheduled job does not depend on the local
computer being online. `workflow_dispatch` is available for an immediate
refresh. Snapshot changes are persisted to the current branch only for
scheduled and manually dispatched runs; push-triggered builds never persist
the generated snapshot.

Each refresh queries one UTC calendar day and paginates through all matching
arXiv results. The daily snapshot is merged into the cumulative library by
versionless arXiv ID, replacing a stored paper only when the incoming `updated`
timestamp is the same or newer. An empty day preserves the existing cumulative
snapshot instead of replacing it with an empty library. The paper page searches
this static snapshot client-side with MiniSearch.

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
