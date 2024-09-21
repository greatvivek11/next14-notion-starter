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


