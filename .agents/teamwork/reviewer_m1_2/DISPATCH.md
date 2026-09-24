# Reviewer 2 Dispatch — Milestone 1 (Adversarial Data Pipeline Reviewer)

You are Reviewer 2 for Milestone 1 (Adversarial & Numerical Integrity Reviewer).
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_2

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md
3. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1/handoff.md

Inspect:
- Examine `convectnow/backend/data/` for edge cases, numerical instability, NaN/Inf generation, division by zero, memory leaks in batch loading, coordinate out-of-bounds, and mock/facade integrity issues.
- Run tests:
  `/Users/gauravkumarnayak/Desktop/new sih/venv/bin/python3 -m pytest convectnow/tests/test_data_pipeline.py -v`
- Adversarially stress test: check what happens with corrupted frames, all-zero frames, NaN values, extreme dBZ values (>80 dBZ), out-of-bounds coordinates, and non-existent event indices.
- State your verdict explicitly in your handoff report: `APPROVE` or `REQUEST_CHANGES`.

Write your report to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_2/handoff.md
Send a message to orchestrator with your verdict.
