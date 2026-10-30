# Computing Revision Studio — Final Codiv AI package

This package contains the revision website and an optional Cloudflare Pages Function for AI marking. The website's lessons, practice questions, local answer checking and mock exam remain usable without AI.

## What the AI button does

- Students click **Mark with AI** or **Mark paper with AI**; the marking prompt is already built into the website.
- The backend is locked to Codiv's documented text-generation model ID: `diffusiongemma-26b`.
- The browser cannot choose or override the model. The backend never silently switches to another model.
- The API key stays in a Cloudflare secret, not in the HTML or Git repository.
- If the Codiv free text-generation quota is exhausted or the service is unavailable, the website shows an error and the built-in revision features remain available.

## Free quota and limits

Codiv's current documentation lists a free allowance of **10 million text-generation tokens per account** (input and output tokens combined) and says the service is a free public experiment. This is a total allowance shown in the account dashboard, not a guaranteed daily reset. Codiv may change quotas, models and availability; the service has no uptime commitment. Check your dashboard and current docs before relying on it:

- https://codiv.ai/docs/guides/rate-limits
- https://codiv.ai/docs/api-reference/chat-completions

## Deployment

### 1. Upload files to GitHub

Upload `index.html`, `README.md`, and the `functions` folder to the root of a GitHub repository. Keep this path exactly: `functions/api/mark.js`.

### 2. Connect to Cloudflare Pages

1. Open Cloudflare **Workers & Pages** and create a Pages project connected to the GitHub repository.
2. Framework preset: **None**.
3. Build command: leave blank.
4. Build output directory: `.` (repository root).
5. Deploy and open the assigned `*.pages.dev` URL.

### 3. Add the secret and site-origin variable

In Cloudflare Pages project settings, add a secret named:

`CODIV_API_KEY`

Paste your Codiv API key into the secret value field. Never put the key in the HTML, JavaScript, GitHub, or a chat message. Add a regular environment variable named `ALLOWED_ORIGIN` with your exact deployed URL, e.g. `https://your-project.pages.dev` (no trailing slash). Redeploy if Cloudflare asks you to.

AI marking remains **disabled by default**. Set `ALLOWED_ORIGIN` to the exact deployed site origin, e.g. `https://your-project.pages.dev` (no trailing slash). Update it if you add a custom domain. The backend rejects requests whose browser origin does not match. This is only a basic browser-origin check, not authentication or complete abuse protection.

### 4. Test

- Open a written practice question, enter an answer, and choose **Mark with AI**.
- Enter some answers in the mock exam and choose **Mark paper with AI**.
- If the API is not configured or the free quota is exhausted, AI feedback will show an error; regular revision features remain available.

## Important: Codiv terms and public sharing

Codiv's current Terms of Service say users must be at least 16 and old enough to agree to the terms where they live. They also prohibit reselling or sublicensing access to the hosted service without written permission. A public site that forwards your personal API key so other people can use Codiv may raise this issue. **Before enabling AI marking for a class or the public, ask Codiv for written permission for this exact setup.** The backend therefore refuses AI requests by default. **Do not enable shared AI marking unless Codiv confirms in writing that this exact setup is allowed.** If you receive permission, add a Cloudflare Pages environment variable named `ALLOW_SHARED_MARKING` with value `true`, then redeploy. Until then, leave this variable unset; the static revision website can still be shared without AI marking. Before sharing widely, also configure a Cloudflare rate-limiting rule for `/api/mark`.

Codiv's terms also say not to send personal data of others without a lawful basis. Students should not enter names or identifying details into answers.

Terms: https://codiv.ai/terms
Privacy: https://codiv.ai/privacy

## Marking notes

AI marks are practice feedback, not official grades. The prompt tells the model to award partial marks, accept equivalent wording, identify missing criteria, and suggest an improvement. AI outputs can be wrong; test the feedback against your own model answers before relying on it.
