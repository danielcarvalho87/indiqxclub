#!/usr/bin/env bash
#
# Deploy da API para o Heroku.
#
# O Heroku so hospeda a pasta api/, mas o git fica na raiz do monorepo.
# Como o buildpack olha apenas a raiz do que e enviado, este script isola
# api/ como raiz via `git subtree split` e envia so isso.
#
set -euo pipefail

APP=api-indiqx
PREFIX=api

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if ! git diff --quiet -- "$PREFIX" || ! git diff --cached --quiet -- "$PREFIX"; then
  echo "erro: ha alteracoes nao commitadas em $PREFIX/ - o deploy envia apenas o que esta commitado." >&2
  git status --short -- "$PREFIX" >&2
  exit 1
fi

echo "==> enviando $PREFIX/ (branch $BRANCH) para $APP"
SPLIT="$(git subtree split --prefix "$PREFIX" "$BRANCH")"
git push heroku "$SPLIT:refs/heads/main" --force

echo "==> release publicada; acompanhe com: heroku logs -a $APP --tail"
