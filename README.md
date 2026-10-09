# strale-studio

Website cloning workspace built on [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) (MIT, see `LICENSE`).

Give the agent one or more URLs and it rebuilds them as editable Next.js 16 + Tailwind v4 + shadcn/ui pages, using the site's real text, fonts, images, SVGs and video, with matching responsive layout and interactions.

## Usage

```bash
npm install
npm run dev      # http://localhost:3000
```

In Claude Code:

```text
/clone-website https://example.com [https://example.com/other-page ...]
```

The workflow lives in `.agents/skills/clone-website/` (also linked as a Claude Code skill at `.claude/skills/clone-website`, so asking to "clone https://…" triggers it too). Clones are written to:

- `src/app/` — routes
- `src/components/sites/<site>/` — components and extracted SVGs
- `public/sites/<site>/` — downloaded assets
- `docs/research/<site>/` — page brief, asset map, screenshots

`npm run check` runs lint, typecheck and production build.
