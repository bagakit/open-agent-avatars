GO ?= go
GOLANGCI_LINT ?= golangci-lint
PNPM ?= pnpm
ZIP ?= zip
export CODEX_HOME := $(PWD)/.codex
CODEX_FLAGS ?=
TOKEN ?=
RESUME_FLAGS ?=
SKILL_NAME ?= bagakit-living-docs
DIST_DIR ?= dist

.PHONY: codex-locale codex-locale-resume

codex-locale:
	@echo "CODEX_HOME=$(CODEX_HOME)"
	@echo "Running codex with CODEX_HOME=$(CODEX_HOME)"
	codex --dangerously-bypass-approvals-and-sandbox $(CODEX_FLAGS)

codex-locale-resume:
	@echo "CODEX_HOME=$(CODEX_HOME)"
	@echo "Running codex with CODEX_HOME=$(CODEX_HOME)"
	@# TOKEN is optional: if omitted, `codex resume` will show a picker (or use `--last` in RESUME_FLAGS).
	codex --dangerously-bypass-approvals-and-sandbox $(CODEX_FLAGS) resume $(RESUME_FLAGS) $(TOKEN)
