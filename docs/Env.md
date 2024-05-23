# Env Variables using Dotenvx

- [Dotenvx](https://dotenvx.com/docs/platforms/vercel)

## Setup
1. Create a .env file using .env.example as a template.
2. Creating .env.local doesn't generate .env.example when using `dotenvx genexample`.
3. **DON'T** forget to add any env vars you add in .env into `next.config.js` in order for it to work.

## Commands 
1. Add .vercelignore file.
    ```
    # vercelignore
    .env.keys
    ```
2. `npm install @dotenvx/dotenvx --save`
3. Modify scripts in `package.json`.
    ```
    "scripts": {
    "dotenvx": "dotenvx",
    "dev": "dotenvx run -- next dev --turbo",
    "build": "dotenvx run -- next build",
    "start": "dotenvx run -- next start"
    }
    ```
4. Create `.env.preview` in the root of your project.
5. Create `.env.production` in the root of your project.
6. Encrypt production - `npm run dotenvx -- set ROOT_NOTION_PAGE_ID <ROOT_NOTION_PAGE_ID> --encrypt -f .env.production`

    > You SHOULD commit .env.production to code. It is now encrypted, safe, and recommended to do so. But DO NOT commit .env.keys to code. Keep them somewhere safe like 1Password.

7. Set decryption key - `npx vercel@latest env add DOTENV_PRIVATE_KEY_PRODUCTION`

