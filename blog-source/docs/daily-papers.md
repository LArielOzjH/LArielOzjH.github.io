# Daily paper digest

The digest is a static page at `/blog/papers/`. It is deliberately selective:
an arXiv entry must match one of the six systems/inference topics. Affiliation
is metadata only and is not a hard selection filter.

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

Author affiliations are enriched per selected paper from arXiv's generated
HTML page (`arxiv.org/html/<id>`): explicit `ltx_role_affiliation` blocks are
preferred, institution-like lines inside `ltx_personname` are the fallback,
and deterministic cleaning drops emails, addresses, LaTeXML remnants, and
footnote junk. Papers without an HTML version (non-LaTeX submissions) fall
back to explicit organization mentions in the title/abstract, else show no
organization line. Fixture builds skip the network entirely.

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
