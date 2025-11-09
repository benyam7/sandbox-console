### Decision and thoughts:

This project(sandbox console) uses a modern React setup that focuses on being easy to work with and maintain. For state management, it uses React's Context API instead of external Redux or Zustand. This keeps things simpler since the shared state implementation is simple and can easily be handled by react's context management. Routing is done using react-router-dom which builds up on react-router.

The data layer uses different services (like auth-service, api-key-service, usage-service and docs-service) and stores data in localStorage and access static analytics data from json file. It also uses Zod to check data types at runtime. This setup is great for quick development without needing a backend, though it's limited to client side storage.

For forms, it uses React Hook Form with Zod for validation, keeping code short and type safe. Testing is handled with Playwright for end to end tests on major browsers, focusing more on real user flows than small unit tests.

I picked Vite because it starts very fast and has quick hot module replacement. Vite serves source code over native ES modules i.e the browser can directly load source files as modules without needing to bundle everything into one big js script. This makes development much faster compared to older bundlers like Webpack which bundles everything first when changes happen. However with vite, if change in a file happens, vite only reprocesses that file and sends it to the browser — not the whole app.

I chose to encrypt API keys before storing them in localStorage. API keys are sensitive credentials that belong to each user and should not be accessed by anyone else, even on database/storage level. encrypting them adds a layer of protection for user specific data.

The UI is built using shadcn/ui and Tailwind CSS, offering flexibility. I chose shadcn/ui because it lets me fully control my components while still giving me nice, ready to use designs. Other libraries usually come as closed packages, but with shadcn/ui, I can edit every part of the code and make the components fit my project.

This is great for a developer console or sandbox project where I need flexibility, easy changes, and a consistent look. I can adjust the components to match the product's design without struggling with limits or extra style fixes.

Its open code style and easy to build structure also work well with modern tools and AI workflows, making it simple to improve, add new features, or connect with AI tools.

In short, shadcn/ui is not just a library I use it's a base for creating my own design system with high quality components and full freedom to design.

### Authentication Approach

**I chose Option C: Local mock session with localStorage based token management.**

This approach mimics a real OIDC/OAuth flow by generating mock JWTstyle tokens with expiry timestamps, storing them in localStorage, and implementing proper token validation and refresh mechanisms. I chose this option because it:

1. **Requires no external dependencies** No Auth0 account, API keys, or serverless endpoints needed, making the project immediately runnable for reviewers
2. **Demonstrates real world patterns** The implementation mirrors production authentication flows with token expiry, refresh logic, and protected route guards
3. **Provides easy testing** Includes both credential based login (`user@example.com` / `password123`) and a "Continue as Guest" option for instant demo access
4. **Simplifies the review process** Reviewers can explore the full application without sign-up friction while still seeing proper authentication boundaries

The tradeoff is that this approach is not production ready (tokens are visible in localStorage, no actual backend validation), but it perfectly demonstrates understanding of authentication patterns while keeping the focus on the console UI/UX implementation.

### What I Would Do If I Had More Time

#### Authentication & User Management:

I would integrate a sign-up feature. For now, I kept it simple with "Continue as Guest" and a static test user as indicated in auth-service.ts. A proper sign-up flow with email verification would make the app more realistic.

#### Encryption & Decryption Logic, Secrets:

I would use a proper key derivation function (e.g., PBKDF2, Argon2, etc.) to generate a deterministic encryption key from the user session.

I would use a secure and well maintained cryptography library for handling encryption and decryption.

I would move all encryption related services to the backend. Currently, we're using VITE_ENCRYPTION_SECRET, which makes the key accessible to the client. Given the current setup, this was the most practical option, but ideally, the logic should reside on the backend.

#### UI & User Experience Improvements:

I would make the UI fully mobile responsive. Specially, "usage" page looks broken.
I would add pagination for the usage table and charts. Currently, both load all usage data at once; instead, I would implement lazy loading to fetch data on demand as the user scrolls or paginates. Also, currently all components are imported once in App.tsx, the issue with this is even if user visits sign-in page user will downloaded code for 'dashboard', 'api-keys', 'usage', and 'docs' which they havent visited yet. This will increase initial js bundle size, hence I would implement route-based code splitting. I would also consider implementing lazy loading heavy components like charts which uses recharts library under the hood which is kinda big.  
I would also implement a pagination UI for user listings and add a “Download CSV” button to allow users to export usage event data. I would also consider verifying color contrast meets WCAG AA standards this would help devs with color blindness not t

#### API keys:

-   I would consider rate-limiting for api key generation, and in long run for api key usage. Also, if BE was to be set, I would implement proper CORS config.

#### Metadata & Branding:

-   I would improve the app to have proper app icon, comprehensive meta tags for SEO, open graph tags for social media sharing (this would specifically improve "docs" page when sharing with link previews etc)

#### Payments & API Integration:

I would integrate a payment gateway so devs can be billed based on usage.
I would associate usage data with the actual API keys generated by users. Currently, the usage data is static. Although we can filter by API key, these keys are mock values With more time, I would connect the usage data to the API keys created by users. The current “empty state” on the usage page simply checks whether the user has created an API key. If not, it displays an empty state; once the user creates an API key, it displays mock data.

#### Testing & Validation:

I would include more thorough E2E tests, particularly for the usage page and the overall application flow.

Additional Improvements:

I would record a walkthrough video to demonstrate the app's flow and features.

### What worked and didn't work well with AI.

Generating E2E tests worked well. It was easy to make adjustments once the structure was in place, and I didn't have to write repetitive code manually.
Generating UI structures also worked well. AI was effective at setting up the initial layout and placing placeholders correctly, allowing me to finetune and make detailed UI adjustments efficiently.
However, asking AI to make specific, targeted UI changes didn't work as well. I often had to provide very detailed context or step by step instructions for accurate results.

### Feature Flags

This project implements a scalable feature flag system using environment variables. Feature flags allow you to enable or disable features without redeploying code, making it easy to test features, perform gradual roll outs, or A/B test changes.

#### Current Feature Flags

**Theme Toggle** (`VITE_FEATURE_THEME_TOGGLE`)

Controls whether the theme switcher (dark/light mode) appears in the header
Default: `true` (enabled)
Set to `false` to disable the theme toggle UI

#### How to Use Feature Flags

1. **Copy the example environment file:**

    ```bash
    cp .env.example .env
    ```

2. **Edit `.env` to enable/disable features:**

    ```bash
    # Enable theme toggle (default)
    VITE_FEATURE_THEME_TOGGLE=true

    # Disable theme toggle
    VITE_FEATURE_THEME_TOGGLE=false
    ```

3. **Restart the dev server** for changes to take effect:
    ```bash
    pnpm dev
    ```

### Component and Charting Libraries

I chose shadcn/ui as the component library. It provides a modern, accessible, and composable set of React components built on Radix UI and styled with Tailwind CSS. It offers excellent developer ergonomics, consistent design tokens, and easy customization ideal for building a clean, production like dashboard quickly.

For charting, I used shadcn/ui's builtin chart components, which internally leverage Recharts. This integration allows me to use a consistent design language across the entire app while benefiting from Recharts' robust and declarative charting capabilities.

This choice keeps the stack cohesive a single design system for both UI and data visualization while still providing flexibility and performance. It also mirrors how real world teams build unified design systems with integrated visualization components.

### How to run locally:

1. Clone repo
2. `pnpm install`
3. Update your `.env` file based on `.env.example`
4. `pnpm dev`

### How run playwright tests:

1. Clone repo
2. `pnpm install`
3. `pnpm run playwright:test`

### Estimate of time spent

I spent 3 days but from the 3 days, I spent about 4 hours to 6 hours per day. Hence 10 ~ 18 hours.

### Deployed

Live version on the app can be found at: https://sandbox-console-flame.vercel.app/
