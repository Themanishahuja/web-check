export type TechCategory =
  | 'CMS'
  | 'E-commerce'
  | 'Framework'
  | 'JavaScript library'
  | 'CSS framework'
  | 'Analytics'
  | 'Tag manager'
  | 'CDN'
  | 'Hosting'
  | 'Web server'
  | 'Programming language'
  | 'Marketing'
  | 'Payments'
  | 'Fonts'
  | 'Chat & support'
  | 'Security';

export interface Signature {
  name: string;
  category: TechCategory;
  /** Header name → pattern on its value (omit pattern for presence only). */
  headers?: Record<string, RegExp>;
  /** Patterns tested against the raw HTML. */
  html?: RegExp[];
  /** Patterns tested against every <script src> and <link href>. */
  assets?: RegExp[];
  /** <meta name="generator"> content. */
  generator?: RegExp;
  /** Cookie name patterns. */
  cookies?: RegExp[];
}

const any = /./;

/** Table-driven detection rules. Add a row to teach the scanner a new technology. */
export const signatures: Signature[] = [
  // --- CMS ---------------------------------------------------------------
  {
    name: 'WordPress',
    category: 'CMS',
    html: [/wp-content\//i, /wp-includes\//i],
    generator: /wordpress/i,
    headers: { link: /wp-json/i },
  },
  {
    name: 'Shopify',
    category: 'E-commerce',
    html: [/cdn\.shopify\.com/i, /Shopify\.theme/],
    headers: { 'x-shopid': any, 'x-shopify-stage': any },
  },
  {
    name: 'Wix',
    category: 'CMS',
    html: [/static\.parastorage\.com/i, /wixstatic\.com/i],
    generator: /wix/i,
    headers: { 'x-wix-request-id': any },
  },
  {
    name: 'Squarespace',
    category: 'CMS',
    html: [/static1\.squarespace\.com/i, /squarespace-cdn/i],
    generator: /squarespace/i,
  },
  {
    name: 'Webflow',
    category: 'CMS',
    html: [/assets\.website-files\.com/i, /data-wf-(page|site)/i],
    generator: /webflow/i,
  },
  { name: 'Ghost', category: 'CMS', generator: /ghost/i, html: [/ghost-(url|portal)/i] },
  {
    name: 'Drupal',
    category: 'CMS',
    generator: /drupal/i,
    html: [/\/sites\/default\/files\//i],
    headers: { 'x-drupal-cache': any, 'x-generator': /drupal/i },
  },
  { name: 'Joomla', category: 'CMS', generator: /joomla/i, html: [/\/media\/jui\//i] },
  {
    name: 'Framer',
    category: 'CMS',
    generator: /framer/i,
    html: [/framerusercontent\.com/i],
  },
  {
    name: 'Magento',
    category: 'E-commerce',
    html: [/\/static\/frontend\/Magento/i, /Mage\.Cookies/],
    cookies: [/^mage-cache/i],
  },
  { name: 'WooCommerce', category: 'E-commerce', html: [/woocommerce/i] },
  { name: 'BigCommerce', category: 'E-commerce', html: [/cdn\d*\.bigcommerce\.com/i] },
  { name: 'PrestaShop', category: 'E-commerce', generator: /prestashop/i },

  // --- Frameworks --------------------------------------------------------
  {
    name: 'Next.js',
    category: 'Framework',
    html: [/\/_next\/static\//i, /id="__NEXT_DATA__"/i],
    headers: { 'x-powered-by': /next\.js/i },
  },
  { name: 'Nuxt', category: 'Framework', html: [/\/_nuxt\//i, /window\.__NUXT__/i] },
  {
    name: 'Gatsby',
    category: 'Framework',
    generator: /gatsby/i,
    html: [/id="___gatsby"/i],
  },
  {
    name: 'Astro',
    category: 'Framework',
    generator: /astro/i,
    html: [/astro-island/i, /\/_astro\//i],
  },
  { name: 'Remix', category: 'Framework', html: [/__remixContext/i] },
  {
    name: 'SvelteKit',
    category: 'Framework',
    html: [/\/_app\/immutable\//i, /data-sveltekit/i],
  },
  { name: 'Angular', category: 'Framework', html: [/ng-version=/i, /<app-root/i] },
  {
    name: 'Vue.js',
    category: 'JavaScript library',
    html: [/data-v-[0-9a-f]{6,}/i, /id="app"[^>]*data-server-rendered/i],
    assets: [/vue(\.runtime)?(\.min)?\.js/i],
  },
  {
    name: 'React',
    category: 'JavaScript library',
    html: [/data-reactroot/i, /__reactContainer/i],
    assets: [/react(-dom)?(\.production)?(\.min)?\.js/i],
  },
  {
    name: 'jQuery',
    category: 'JavaScript library',
    assets: [/jquery([.-]\d[\w.]*)?(\.min)?\.js/i],
  },
  {
    name: 'Alpine.js',
    category: 'JavaScript library',
    html: [/\sx-data=/i],
    assets: [/alpinejs/i],
  },
  {
    name: 'htmx',
    category: 'JavaScript library',
    html: [/\shx-(get|post|trigger)=/i],
    assets: [/htmx(\.min)?\.js/i],
  },
  {
    name: 'Bootstrap',
    category: 'CSS framework',
    assets: [/bootstrap([.-]\d[\w.]*)?(\.min)?\.(css|js)/i],
    html: [/class="[^"]*\bcontainer-fluid\b/i],
  },
  { name: 'Tailwind CSS', category: 'CSS framework', assets: [/tailwind/i] },
  {
    name: 'Font Awesome',
    category: 'CSS framework',
    assets: [/font-?awesome|fontawesome/i],
  },

  // --- Analytics / tags / marketing -------------------------------------
  {
    name: 'Google Analytics',
    category: 'Analytics',
    assets: [
      /google-analytics\.com\/(analytics|ga)\.js/i,
      /googletagmanager\.com\/gtag\/js/i,
    ],
    html: [/gtag\(\s*['"]config['"]/i],
  },
  {
    name: 'Google Tag Manager',
    category: 'Tag manager',
    assets: [/googletagmanager\.com\/gtm\.js/i],
    html: [/GTM-[A-Z0-9]{4,}/],
  },
  { name: 'Plausible', category: 'Analytics', assets: [/plausible\.io\/js/i] },
  { name: 'Fathom', category: 'Analytics', assets: [/cdn\.usefathom\.com/i] },
  { name: 'Matomo', category: 'Analytics', assets: [/matomo\.js|piwik\.js/i] },
  { name: 'Hotjar', category: 'Analytics', assets: [/static\.hotjar\.com/i] },
  { name: 'Microsoft Clarity', category: 'Analytics', assets: [/clarity\.ms\/tag/i] },
  {
    name: 'Meta Pixel',
    category: 'Marketing',
    assets: [/connect\.facebook\.net\/.*fbevents\.js/i],
    html: [/fbq\(\s*['"]init['"]/i],
  },
  { name: 'LinkedIn Insight', category: 'Marketing', assets: [/snap\.licdn\.com/i] },
  {
    name: 'HubSpot',
    category: 'Marketing',
    assets: [/js\.hs-scripts\.com|js\.hsforms\.net|hs-analytics/i],
  },
  {
    name: 'Mailchimp',
    category: 'Marketing',
    assets: [/chimpstatic\.com|list-manage\.com/i],
  },

  // --- Chat / payments / fonts / security --------------------------------
  { name: 'Intercom', category: 'Chat & support', assets: [/widget\.intercom\.io/i] },
  { name: 'Crisp', category: 'Chat & support', assets: [/client\.crisp\.chat/i] },
  { name: 'Zendesk', category: 'Chat & support', assets: [/static\.zdassets\.com/i] },
  { name: 'Tawk.to', category: 'Chat & support', assets: [/embed\.tawk\.to/i] },
  { name: 'Stripe', category: 'Payments', assets: [/js\.stripe\.com/i] },
  { name: 'PayPal', category: 'Payments', assets: [/paypal(objects)?\.com\/(sdk|js)/i] },
  {
    name: 'Google Fonts',
    category: 'Fonts',
    assets: [/fonts\.googleapis\.com|fonts\.gstatic\.com/i],
  },
  { name: 'Adobe Fonts', category: 'Fonts', assets: [/use\.typekit\.net/i] },
  {
    name: 'reCAPTCHA',
    category: 'Security',
    assets: [/google\.com\/recaptcha|gstatic\.com\/recaptcha/i],
  },
  { name: 'hCaptcha', category: 'Security', assets: [/hcaptcha\.com/i] },
  {
    name: 'Cloudflare Turnstile',
    category: 'Security',
    assets: [/challenges\.cloudflare\.com\/turnstile/i],
  },

  // --- CDN / hosting / servers -------------------------------------------
  {
    name: 'Cloudflare',
    category: 'CDN',
    headers: { 'cf-ray': any, server: /cloudflare/i },
  },
  {
    name: 'Amazon CloudFront',
    category: 'CDN',
    headers: { 'x-amz-cf-id': any, via: /cloudfront/i },
  },
  {
    name: 'Fastly',
    category: 'CDN',
    headers: { 'x-served-by': /cache-/i, 'x-fastly-request-id': any },
  },
  {
    name: 'Akamai',
    category: 'CDN',
    headers: { 'x-akamai-transformed': any, server: /akamai/i },
  },
  {
    name: 'Vercel',
    category: 'Hosting',
    headers: { 'x-vercel-id': any, server: /vercel/i },
  },
  {
    name: 'Netlify',
    category: 'Hosting',
    headers: { 'x-nf-request-id': any, server: /netlify/i },
  },
  { name: 'GitHub Pages', category: 'Hosting', headers: { 'x-github-request-id': any } },
  { name: 'Fly.io', category: 'Hosting', headers: { 'fly-request-id': any } },
  { name: 'Render', category: 'Hosting', headers: { 'x-render-origin-server': any } },
  {
    name: 'Azure',
    category: 'Hosting',
    headers: { 'x-azure-ref': any, 'x-ms-request-id': any },
  },
  {
    name: 'Google Cloud',
    category: 'Hosting',
    headers: { 'x-cloud-trace-context': any, server: /google frontend/i },
  },
  { name: 'Nginx', category: 'Web server', headers: { server: /nginx/i } },
  { name: 'Apache', category: 'Web server', headers: { server: /apache/i } },
  { name: 'LiteSpeed', category: 'Web server', headers: { server: /litespeed/i } },
  {
    name: 'Microsoft IIS',
    category: 'Web server',
    headers: { server: /microsoft-iis/i },
  },
  { name: 'Caddy', category: 'Web server', headers: { server: /caddy/i } },
  {
    name: 'PHP',
    category: 'Programming language',
    headers: { 'x-powered-by': /php/i },
    cookies: [/^phpsessid$/i],
  },
  {
    name: 'ASP.NET',
    category: 'Programming language',
    headers: { 'x-powered-by': /asp\.net/i, 'x-aspnet-version': any },
    cookies: [/^asp\.net_sessionid$/i],
  },
  { name: 'Express', category: 'Framework', headers: { 'x-powered-by': /express/i } },
  {
    name: 'Ruby on Rails',
    category: 'Framework',
    headers: { 'x-powered-by': /phusion passenger/i },
    html: [/csrf-param.*authenticity_token/i],
  },
  {
    name: 'Laravel',
    category: 'Framework',
    cookies: [/^laravel_session$/i, /^xsrf-token$/i],
  },
  { name: 'Django', category: 'Framework', cookies: [/^csrftoken$/i, /^django/i] },
];
