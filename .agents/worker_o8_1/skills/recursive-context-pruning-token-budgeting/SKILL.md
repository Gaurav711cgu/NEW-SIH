---
name: recursive-context-pruning-token-budgeting
description: "Optimizes AI agent performance by pruning redundant context, managing token usage, and enforcing ultra-concise, direct-to-value responses."
category: prompt-engineering
risk: safe
source: self
source_repo: Kench001/antigravity-awesome-skills
source_type: self
date_added: "2026-05-03"
author: Kench001
tags: [efficiency, token-optimization, brevity, context-management]
tools: [claude, cursor, gemini]
---

# Recursive Context Pruning & Token Budgeting

## Overview
Gatekeeper logic preventing context bloat and token expenditure. Delivers functional answers with zero conversational filler.

## Key Rules
1. Strip all Bridge Phrases ("Here is the code", "Sure", etc.).
2. Direct Start: Begin responses immediately with solution/code.
3. Abstractive Compression: Summarize turn states concisely.
4. Pin primary objective to prevent memory drift.
