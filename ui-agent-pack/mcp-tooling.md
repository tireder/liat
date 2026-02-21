# mcp-tooling.md — Using MCPs (Context7 + Supabase) to Read Docs & Structure

## Purpose
Agents should **read before writing**:
- project structure
- existing components
- style/tokens
- API/data shape
- auth/permissions

## 1) Context7 MCP (Docs + Knowledge Retrieval)
Use it when:
- you need framework/library specifics
- you must follow an existing design system
- you need exact API usage patterns

Workflow:
1. Query: “project stack”, “routing”, “UI library”, “forms”, “i18n”, “RTL”
2. Pull: installation + canonical usage snippets
3. Summarize into local rules (what to do / avoid)
4. Apply consistently

Output in your response:
- what docs were read
- the resulting constraints (tokens, components, conventions)

## 2) Supabase MCP (DB + Auth + Storage Structures)
Use it when:
- you need table schemas, RLS policies, storage buckets, functions
- you must align UI with real data

Workflow:
1. List tables + relationships relevant to the feature.
2. Identify:
   - required fields
   - nullable fields
   - unique constraints
3. Check RLS implications for UI:
   - what can the current user read/write?
   - what errors to surface?
4. Map UI states:
   - loading
   - permission denied
   - empty datasets
   - validation

## 3) “Read → Plan → Implement” Rule
Never implement UI that depends on data without confirming:
- entity names
- primary keys
- timestamps
- pagination strategy
- error formats

## 4) Minimal Artifacts to Produce
- schema summary (tables, key fields)
- API call list (select/insert/update/delete)
- UI state map (loading/error/empty)
- permissions notes (RLS)

