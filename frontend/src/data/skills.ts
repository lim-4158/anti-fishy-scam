export interface SkillCheck {
  id: string;
  name: string;
  icon: string;
  description: string;
  greenCriteria: string;
  yellowCriteria: string;
  redCriteria: string;
  dataSources: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  checks: SkillCheck[];
  criticalRedFlags: string[];
  scoringRules: {
    likelySafe: string;
    suspicious: string;
    likelyScam: string;
  };
}

export const skills: Skill[] = [
  {
    id: "job_scam",
    name: "Job Scam Verifier",
    description:
      "Detects fake job postings, fraudulent recruiter messages, and employment scams. Verifies company legitimacy, job listing authenticity, domain trust, salary benchmarks, and recruiter identity across multiple sources.",
    icon: "briefcase",
    color: "#3b82f6",
    checks: [
      {
        id: "company_website",
        name: "Company Website Verification",
        icon: "globe",
        description:
          "Navigates to the company's claimed website and evaluates whether it has real, substantive content — About page, team members, products/services, careers page, contact info.",
        greenCriteria:
          "Site exists with substantive content: real team, products, careers page, contact info. Content quality is 'substantive' with 4+ indicators present.",
        yellowCriteria:
          "Site exists but thin: few pages, no team info, generic template. Content quality 'moderate' or fewer than 4 indicators.",
        redCriteria:
          "Site does not exist (DNS failure, HTTP error), or is extremely thin — 1-2 pages, stock photos, no contact info.",
        dataSources: ["Company domain (direct navigation)"],
      },
      {
        id: "job_listing_match",
        name: "Job Listing Cross-Match",
        icon: "briefcase",
        description:
          "Checks whether the specific role exists on the company's own careers page and on major job boards like Indeed.",
        greenCriteria:
          "Job found on the company's own careers page AND on at least one major job board with consistent details.",
        yellowCriteria:
          "Job found on one source but not the other, or only similar roles found.",
        redCriteria:
          "Job not found on the company's careers page AND not on any job board. The role likely doesn't exist.",
        dataSources: ["Company careers page", "Indeed"],
      },
      {
        id: "domain_trust",
        name: "Domain Trust Analysis",
        icon: "shield",
        description:
          "Performs WHOIS lookup to determine domain age, registrar, and registration details. New domains are a strong scam indicator.",
        greenCriteria:
          "Domain older than 2 years (730+ days), registrant info visible and matches claimed company.",
        yellowCriteria:
          "Domain is 90 days to 2 years old, or WHOIS privacy is enabled.",
        redCriteria:
          "Domain less than 90 days old — critical scam indicator. Less than 30 days is extreme red flag.",
        dataSources: ["WHOIS (whois.com)"],
      },
      {
        id: "salary_check",
        name: "Salary Reality Check",
        icon: "dollar-sign",
        description:
          "Compares the offered salary against market benchmarks for the role and location using salary databases.",
        greenCriteria: "Offered salary within ±25% of market median.",
        yellowCriteria:
          "Salary 25-50% above market median, or no salary mentioned in posting.",
        redCriteria:
          "Salary more than 50% above market median — classic 'too good to be true' scam tactic.",
        dataSources: ["Glassdoor Salaries", "Levels.fyi"],
      },
      {
        id: "linkedin_presence",
        name: "LinkedIn Presence",
        icon: "users",
        description:
          "Verifies the company and recruiter have legitimate LinkedIn profiles with real activity.",
        greenCriteria:
          "Company has LinkedIn page with 50+ employees, active posting. Recruiter has a complete profile at the company.",
        yellowCriteria:
          "Company found but small (<50 employees) or limited activity. Recruiter profile exists but sparse.",
        redCriteria:
          "Company has NO LinkedIn page, or recruiter's profile doesn't list the claimed company, or profile appears fake.",
        dataSources: ["LinkedIn (stealth mode)"],
      },
      {
        id: "reviews_reputation",
        name: "Review & Reputation",
        icon: "star",
        description:
          "Checks Glassdoor reviews, ScamAdviser trust scores, and Google search results for scam reports.",
        greenCriteria:
          "4+ star Glassdoor rating with 20+ reviews, ScamAdviser trust score >80, no scam reports.",
        yellowCriteria:
          "Limited reviews (<20), ScamAdviser score 50-80, or a few scam mentions.",
        redCriteria:
          "Glassdoor below 2.0 with scam mentions, ScamAdviser <50, multiple Google results flagging scam, or ZERO presence on any review platform.",
        dataSources: ["Glassdoor", "ScamAdviser", "Google Search"],
      },
    ],
    criticalRedFlags: [
      "New domain (<90 days) + no careers page + above-market salary",
      "WhatsApp/Telegram contact + generic email domain (gmail, yahoo)",
      "Any upfront payment request (training fees, equipment deposits, background check fees)",
      "Job offer with no interview process",
      "Pressure tactics: 'Respond within 24 hours', 'Limited spots'",
      "Payment via cryptocurrency, gift cards, or wire transfers",
    ],
    scoringRules: {
      likelySafe: "0-1 red checks, majority green, no critical combinations",
      suspicious:
        "2 red checks, or 1 red + 2 yellow, or any critical red flag combination",
      likelyScam:
        "3+ red checks, or 2+ critical combinations, or upfront payment detected",
    },
  },
  {
    id: "phishing",
    name: "Phishing Detector",
    description:
      "Identifies phishing URLs, brand impersonation, and credential theft attempts. Analyzes URL structure, domain trust, SSL certificates, page content, and brand matching.",
    icon: "link",
    color: "#ef4444",
    checks: [
      {
        id: "url_analysis",
        name: "URL Structure Analysis",
        icon: "link",
        description:
          "Examines URL for typosquatting, homoglyphs (e.g., rn → m), suspicious TLDs, excessive subdomains, and brand-in-path tricks.",
        greenCriteria:
          "URL matches official domain exactly, clean structure, well-known TLD.",
        yellowCriteria:
          "URL uses uncommon TLD or has long path, but domain itself is legitimate.",
        redCriteria:
          "URL contains brand misspelling, homoglyph substitution, suspicious TLD, or brand name in subdomain of unrelated domain.",
        dataSources: ["URL pattern analysis", "DNSTwister (lookalike detection)"],
      },
      {
        id: "domain_trust",
        name: "Domain Trust Analysis",
        icon: "shield",
        description:
          "WHOIS lookup for domain age, registrar, and registration details. Phishing domains are typically days to weeks old.",
        greenCriteria: "Domain older than 2 years with visible registrant info.",
        yellowCriteria: "Domain 90 days to 2 years, or WHOIS privacy enabled.",
        redCriteria:
          "Domain less than 30 days old — near-certain phishing indicator for brand-impersonating sites.",
        dataSources: ["WHOIS (whois.com)"],
      },
      {
        id: "ssl_check",
        name: "SSL Certificate Check",
        icon: "lock",
        description:
          "Checks SSL certificate validity. Note: 80%+ of phishing sites now use HTTPS, so presence alone does NOT prove legitimacy.",
        greenCriteria:
          "Valid EV or OV certificate issued to the correct organization.",
        yellowCriteria:
          "Valid DV certificate (Let's Encrypt) — common but doesn't verify identity.",
        redCriteria:
          "No SSL, expired certificate, or certificate organization doesn't match the claimed brand.",
        dataSources: ["Direct site navigation"],
      },
      {
        id: "page_content",
        name: "Page Content Analysis",
        icon: "file-text",
        description:
          "Navigates to the page and checks for the phishing trifecta: login form + urgency language + brand impersonation.",
        greenCriteria:
          "No login forms, no urgency tactics, content matches a legitimate site.",
        yellowCriteria:
          "Has login form but no urgency language, or urgency without credential requests.",
        redCriteria:
          "Login/credential form combined with urgency language ('verify now', 'account suspended') and brand logos/styling.",
        dataSources: ["Direct page navigation"],
      },
      {
        id: "known_brand_match",
        name: "Known Brand Match",
        icon: "tag",
        description:
          "If the page impersonates a known brand, compares the URL against the brand's official domain.",
        greenCriteria: "URL matches the brand's official domain exactly.",
        yellowCriteria:
          "URL is a known legitimate subdomain or partner domain of the brand.",
        redCriteria:
          "URL is NOT the brand's official domain but uses brand logos, styling, or name. Classic impersonation.",
        dataSources: [
          "Brand domain database",
          "Direct comparison with official site",
        ],
      },
    ],
    criticalRedFlags: [
      "Brand name in URL but wrong domain (paypa1.com, amaz0n-verify.com)",
      "Login form + urgency language + brand impersonation (the phishing trifecta)",
      "Domain registered less than 7 days ago impersonating a known brand",
      "Form submission redirects to a different domain",
      "Page asks for credentials + SSN/financial info on same page",
      "URL received via unsolicited SMS/email claiming account action required",
    ],
    scoringRules: {
      likelySafe: "URL matches official brand domain, no suspicious indicators",
      suspicious:
        "1-2 yellow indicators, or new domain without clear brand impersonation",
      likelyScam:
        "Brand impersonation + login form + urgency, or 2+ critical red flags",
    },
  },
  {
    id: "dropship",
    name: "Dropship Markup Detector",
    description:
      "Identifies overpriced dropshipped products sold at extreme markups from AliExpress/Alibaba sources. Compares prices, evaluates seller reputation, and detects fake store patterns.",
    icon: "shopping-cart",
    color: "#f59e0b",
    checks: [
      {
        id: "source_price_check",
        name: "Source Price Check",
        icon: "shopping-cart",
        description:
          "Searches AliExpress/Alibaba for the same or similar product to find the wholesale/source price.",
        greenCriteria:
          "No matching product found on wholesale sites — product appears to be original.",
        yellowCriteria:
          "Similar product found at 50-70% lower price. Could be legitimate branding markup.",
        redCriteria:
          "Exact or near-identical product found at 80%+ lower price on AliExpress/Alibaba.",
        dataSources: ["AliExpress", "Alibaba", "DHgate"],
      },
      {
        id: "seller_price_check",
        name: "Seller Price & Claims Check",
        icon: "dollar-sign",
        description:
          "Navigates to the seller's product page and extracts price, claims about origin/quality, shipping times, and return policy.",
        greenCriteria:
          "Reasonable markup (<200%), honest product descriptions, clear return policy, domestic shipping.",
        yellowCriteria:
          "Markup 200-500%, vague origin claims, 2-4 week shipping (suggests dropship).",
        redCriteria:
          "Markup >500%, false origin claims ('handcrafted in Italy' for a Chinese product), no returns, Zelle/crypto only.",
        dataSources: ["Seller's product page (direct navigation)"],
      },
      {
        id: "seller_reputation",
        name: "Seller Reputation",
        icon: "store",
        description:
          "Evaluates the seller's website for fake store patterns: template design, fake reviews, no real contact info, random product assortment.",
        greenCriteria:
          "Established brand with real About page, verified reviews, physical address, consistent product line.",
        yellowCriteria:
          "Shopify store with some original content but limited reviews or history.",
        redCriteria:
          "Default Shopify template, stock photos, fake/templated reviews, no real contact info, random unrelated products.",
        dataSources: ["Seller website", "ScamAdviser", "Trustpilot"],
      },
      {
        id: "domain_trust",
        name: "Domain Trust Analysis",
        icon: "shield",
        description:
          "WHOIS lookup on the seller's domain. New domains combined with high markups are a strong scam signal.",
        greenCriteria: "Domain older than 2 years, legitimate registrant info.",
        yellowCriteria: "Domain 6 months to 2 years old.",
        redCriteria:
          "Domain less than 6 months old — typical for fly-by-night dropship scam stores.",
        dataSources: ["WHOIS (whois.com)"],
      },
    ],
    criticalRedFlags: [
      "Extreme markup (>500%) + fake store template + new domain",
      "Misrepresented origin ('Made in Italy' for AliExpress product)",
      "Only accepts Zelle, crypto, wire transfer, or gift cards",
      "Fake urgency ('Only 3 left!', countdown timers) with no-return policy",
      "Product photos are identical to AliExpress listings including watermarks",
      "Shipping time is 2-4 weeks (classic China dropship indicator)",
    ],
    scoringRules: {
      likelySafe:
        "No matching wholesale product, or reasonable markup with honest descriptions",
      suspicious:
        "Moderate markup (200-500%) with some questionable claims",
      likelyScam:
        "Extreme markup + false origin claims + fake store pattern, or crypto-only payment",
    },
  },
  {
    id: "generic",
    name: "Generic Scam Analyzer",
    description:
      "Catches scams that don't fit other categories: romance scams, investment/crypto fraud, lottery scams, tech support scams, rental fraud, charity scams, government impersonation, advance-fee fraud, and more.",
    icon: "search",
    color: "#8b5cf6",
    checks: [
      {
        id: "domain_trust",
        name: "Domain & Entity Trust",
        icon: "shield",
        description:
          "WHOIS lookup combined with ScamAdviser trust score and direct site evaluation for any URLs or entities mentioned.",
        greenCriteria:
          "All domains are established (2+ years), ScamAdviser score >80, site has real content.",
        yellowCriteria:
          "Mixed signals — some domains new, ScamAdviser 50-80, or limited presence.",
        redCriteria:
          "Domains less than 90 days old, ScamAdviser <50, or no web presence for claimed entities.",
        dataSources: ["WHOIS", "ScamAdviser", "Direct site navigation"],
      },
      {
        id: "contact_verification",
        name: "Contact Verification",
        icon: "phone",
        description:
          "Verifies phone numbers, emails, company names, and addresses mentioned in the suspicious content against public records and business registries.",
        greenCriteria:
          "Contact info verified — matches a real registered business, phone connects to claimed entity.",
        yellowCriteria:
          "Contact info partially verifiable, or VoIP number that could be legitimate.",
        redCriteria:
          "Contact info untraceable, uses disposable email/phone, company not found in any registry, or address is fake/residential.",
        dataSources: [
          "Google Search",
          "Business registries",
          "BBB Scam Tracker",
        ],
      },
      {
        id: "content_analysis",
        name: "Content & Pattern Analysis",
        icon: "search",
        description:
          "Analyzes the message or page for known scam language patterns, social engineering tactics, and searches for exact phrase matches against scam databases.",
        greenCriteria:
          "No scam language patterns detected, content is consistent with legitimate communication.",
        yellowCriteria:
          "Some urgency language or too-good-to-be-true elements, but could be aggressive marketing.",
        redCriteria:
          "Classic scam patterns: urgency + unsolicited offer + unusual payment method, or exact message matches known scam templates.",
        dataSources: [
          "Google (exact phrase search)",
          "BBB Scam Tracker",
          "FTC scam database",
        ],
      },
    ],
    criticalRedFlags: [
      "Request for gift card, cryptocurrency, or wire transfer payment",
      "Advance fee required before receiving a prize, inheritance, or payout",
      "Unsolicited contact claiming you won something you didn't enter",
      "Pressure to keep the opportunity secret from family/friends",
      "Request to receive and forward money (money mule recruitment)",
      "Impersonation of government agency (IRS, SSA) demanding immediate payment",
    ],
    scoringRules: {
      likelySafe:
        "All contacts verifiable, no scam patterns, established entities",
      suspicious:
        "1-2 concerning signals but no definitive scam indicators",
      likelyScam:
        "Multiple classic scam patterns, unverifiable contacts, or automatic RED triggers (gift card payment, advance fee)",
    },
  },
];
