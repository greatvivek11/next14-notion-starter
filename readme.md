# NextJS 14 (Notion-as-CMS) Blog 

- This repo is based on [Travis Fischer's](https://transitivebullsh.it) - [NextJs-Notion-Starter-Kit]('https://github.com/transitive-bullshit/nextjs-notion-starter-kit'). All credit belongs to him. 😇

## Setup
1. `npm i`
2. `npm run dev`
3. `npm run build`
4. `npm start`
5. `npm deploy` (requires Vercel login in cli)

## Key Features
- 🤯 Notion-as-CMS
- ⚡️ Next 14 Page router
- 📖 SSG at build-time.
- ⚙️ Dynamic Pages rendering (create/update) using ISR at runtime.
- 

## Key Differences
- Upgraded to Next 14.
- Removed yarn. Using npm.
- Removed Travis's personal info.
- Fixed Search issue.
- Fixed ISR support which somehow wasn't working! (Added runtime config for dynamic pages).
- Removed twitter integration.

## Caveats
- Requires Node server as ISR cannot work with static exports. [Static Export Unsupported Features ]('https://nextjs.org/docs/pages/building-your-application/deploying/static-exports#unsupported-features)
- Social Links on side don't appear on full width pages.
- Unsupported Notion features - Buttons, Database views, Link's color

## Roadmap
- To migrate to App router.
- Cleanup code.
- Webpack Module Federation to export components so that this site can be natively integrated at runtime with another site.