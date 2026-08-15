#!/usr/bin/env bash
set -euo pipefail

portfolio_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
blog_root="$portfolio_root/blog-source"

cd "$blog_root"
if [[ -n "${BLOG_PAPERS_FIXTURE:-}" ]]; then
  python3 scripts/papers/fetch_papers.py --fixture "$BLOG_PAPERS_FIXTURE"
else
  python3 scripts/papers/fetch_papers.py
fi
npm ci
npm run build:blog

rm -rf "$portfolio_root/public/blog"
mkdir -p "$portfolio_root/public/blog"
cp -R out/. "$portfolio_root/public/blog/"

test -f "$portfolio_root/public/blog/papers/index.html"
echo "Blog artifact ready at $portfolio_root/public/blog"
