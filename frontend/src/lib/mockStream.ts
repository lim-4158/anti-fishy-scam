import type { SSEEvent } from '../types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runMockStream(
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const events: Array<{ event: SSEEvent; delayMs: number }> = [
    {
      delayMs: 800,
      event: {
        type: 'classification',
        scam_type: 'job_scam',
        confidence: 0.92,
        summary:
          'This appears to be a suspicious job posting with several red flags including unusually high salary, vague job description, and request for personal information.',
      },
    },
    {
      delayMs: 500,
      event: {
        type: 'follow_up',
        questions: [
          {
            field: 'channel',
            label: 'What channel was this sent from?',
            input_type: 'select',
            options: ['Email', 'WhatsApp', 'LinkedIn', 'Telegram', 'SMS', 'Other'],
          },
          {
            field: 'contact',
            label: "Sender's contact info (email, phone, profile URL)",
            input_type: 'text',
          },
        ],
      },
    },
  ];

  const checkEvents: Array<{ event: SSEEvent; delayMs: number }> = [
    {
      delayMs: 400,
      event: {
        type: 'check_started',
        check_id: 'company_website',
        name: 'Company Website Verification',
        icon: 'globe',
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'salary_check',
        name: 'Salary Reality Check',
        icon: 'dollar-sign',
      },
    },
    {
      delayMs: 1200,
      event: {
        type: 'check_progress',
        check_id: 'company_website',
        message: 'Navigating to techventure-global.com...',
        browser_url: 'https://stream.tinyfish.ai/abc123',
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'linkedin_presence',
        name: 'LinkedIn Presence',
        icon: 'users',
      },
    },
    {
      delayMs: 800,
      event: {
        type: 'check_progress',
        check_id: 'salary_check',
        message: 'Comparing $180k offer against market data for Junior Developer roles...',
      },
    },
    {
      delayMs: 400,
      event: {
        type: 'check_started',
        check_id: 'domain_trust',
        name: 'Domain Trust Analysis',
        icon: 'shield',
      },
    },
    {
      delayMs: 1500,
      event: {
        type: 'check_complete',
        check_id: 'company_website',
        status: 'red',
        summary: 'Website is a thin template with no real content',
        details: {
          tinyfish_goal: 'Navigate to techventure-global.com and evaluate the website for legitimacy. Check for: about page, team members, real contact info, social media presence, and overall content quality.',
          url_visited: 'https://techventure-global.com',
          evidence: [
            'No team page or about section',
            'Generic stock photos throughout',
            'Domain registered only 12 days ago',
            'No social media links',
          ],
          raw_data: {
            site_exists: true,
            http_status: 200,
            has_about_page: false,
            has_real_team_members: false,
            has_contact_info: false,
            content_quality: 'thin',
            domain_age_days: 12,
            stock_photos_detected: true,
            social_links: [],
            agent_reasoning: 'The website loads but is a thin WordPress template with placeholder content. No real team, no real products, no verifiable business information. Classic scam front.',
          },
        },
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'reviews_reputation',
        name: 'Reviews & Reputation',
        icon: 'star',
      },
    },
    {
      delayMs: 1200,
      event: {
        type: 'check_complete',
        check_id: 'salary_check',
        status: 'red',
        summary: 'Offered salary is 65% above market rate for this role',
        details: {
          tinyfish_goal: 'Look up the average salary for "Junior Developer" roles on Indeed, Glassdoor, and BLS. Compare against the offered $180,000.',
          evidence: [
            'Market rate for Junior Developer: $85k-$110k',
            'Offered: $180,000',
            'Premium of 65-112% over market rate',
            'Unrealistic for stated experience level',
          ],
          raw_data: {
            role: 'Junior Developer',
            offered_salary: 180000,
            market_rates: { indeed_avg: 92000, glassdoor_avg: 97000, bls_median: 89000 },
            premium_pct: 85,
            agent_reasoning: 'Salary is dramatically above market for a junior role. This level of overpayment is a common lure in job scams to attract victims who overlook other red flags.',
          },
        },
      },
    },
    {
      delayMs: 600,
      event: {
        type: 'check_progress',
        check_id: 'linkedin_presence',
        message: 'Searching for TechVenture Global on LinkedIn...',
        browser_url: 'https://stream.tinyfish.ai/def456',
      },
    },
    {
      delayMs: 400,
      event: {
        type: 'check_progress',
        check_id: 'domain_trust',
        message: 'Running WHOIS lookup and SSL analysis...',
      },
    },
    {
      delayMs: 1500,
      event: {
        type: 'check_complete',
        check_id: 'linkedin_presence',
        status: 'red',
        summary: 'No legitimate LinkedIn presence found',
        details: {
          tinyfish_goal: 'Search LinkedIn for "TechVenture Global" company page. Check for employee count, company age, and recruiter profiles.',
          evidence: [
            'No company page on LinkedIn',
            'Recruiter profile created 3 weeks ago',
            'Only 12 connections',
            'No endorsements or recommendations',
          ],
          raw_data: {
            company_page_found: false,
            recruiter_profile_age_days: 21,
            recruiter_connections: 12,
            endorsements: 0,
            agent_reasoning: 'No LinkedIn presence at all. The recruiter profile is freshly created with minimal connections — a classic disposable identity used in job scams.',
          },
        },
      },
    },
    {
      delayMs: 1000,
      event: {
        type: 'check_complete',
        check_id: 'domain_trust',
        status: 'red',
        summary: 'Domain has extremely low trust score',
        details: {
          tinyfish_goal: 'Run WHOIS lookup on techventure-global.com. Check domain age, registrar, SSL certificate type, and historical web presence.',
          url_visited: 'https://techventure-global.com',
          evidence: [
            'Domain age: 12 days',
            'Registered through privacy proxy',
            'Free SSL certificate',
            'No historical web presence',
          ],
          raw_data: {
            domain: 'techventure-global.com',
            domain_age_days: 12,
            registrar: 'NameCheap, Inc.',
            privacy_proxy: true,
            ssl_issuer: "Let's Encrypt",
            wayback_snapshots: 0,
            agent_reasoning: 'Brand-new domain with anonymous registration and free SSL. Zero historical presence. This domain was created specifically for this scam campaign.',
          },
        },
      },
    },
    {
      delayMs: 800,
      event: {
        type: 'check_progress',
        check_id: 'reviews_reputation',
        message: 'Searching Glassdoor, Trustpilot, and BBB...',
      },
    },
    {
      delayMs: 1500,
      event: {
        type: 'check_complete',
        check_id: 'reviews_reputation',
        status: 'yellow',
        summary: 'No reviews or reputation data found',
        details: {
          tinyfish_goal: 'Search Glassdoor, Trustpilot, and BBB for "TechVenture Global". Check for company reviews, ratings, and any complaints.',
          evidence: [
            'Not listed on Glassdoor',
            'No Trustpilot profile',
            'Not registered with BBB',
            'No mentions in news or press',
          ],
          raw_data: {
            glassdoor_listed: false,
            trustpilot_listed: false,
            bbb_registered: false,
            news_mentions: 0,
            agent_reasoning: 'Complete absence from all review and reputation platforms. While not proof of a scam by itself, this combined with other red flags strongly supports the scam hypothesis.',
          },
        },
      },
    },
    {
      delayMs: 1000,
      event: {
        type: 'verdict',
        overall: 'likely_scam',
        score: 0.94,
        summary:
          'This job posting shows multiple critical red flags consistent with a job scam. The company website is a recently created template, the salary is unrealistically high, and there is no verifiable online presence. We strongly recommend not providing any personal information or continuing communication.',
        checks_summary: [
          {
            check_id: 'company_website',
            name: 'Company Website',
            status: 'red',
            one_liner: 'Thin template site, 12-day-old domain',
          },
          {
            check_id: 'salary_check',
            name: 'Salary Reality',
            status: 'red',
            one_liner: 'Offered $180k is 65% above market rate',
          },
          {
            check_id: 'linkedin_presence',
            name: 'LinkedIn Presence',
            status: 'red',
            one_liner: 'No company page, recruiter profile is 3 weeks old',
          },
          {
            check_id: 'domain_trust',
            name: 'Domain Trust',
            status: 'red',
            one_liner: '12-day-old domain with privacy proxy',
          },
          {
            check_id: 'reviews_reputation',
            name: 'Reviews & Reputation',
            status: 'yellow',
            one_liner: 'No reviews or reputation data found anywhere',
          },
        ],
      },
    },
    {
      delayMs: 200,
      event: { type: 'done' },
    },
  ];

  // Send classification
  for (const { event, delayMs } of events) {
    if (signal?.aborted) return;
    await delay(delayMs);
    if (signal?.aborted) return;
    onEvent(event);

    // Pause at follow_up — caller handles resumption
    if (event.type === 'follow_up') {
      return; // Stop here, the hook will re-call for check events
    }
  }

  // Send check events
  for (const { event, delayMs } of checkEvents) {
    if (signal?.aborted) return;
    await delay(delayMs);
    if (signal?.aborted) return;
    onEvent(event);
  }
}

export async function runMockChecks(
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const checkEvents: Array<{ event: SSEEvent; delayMs: number }> = [
    {
      delayMs: 400,
      event: {
        type: 'check_started',
        check_id: 'company_website',
        name: 'Company Website Verification',
        icon: 'globe',
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'salary_check',
        name: 'Salary Reality Check',
        icon: 'dollar-sign',
      },
    },
    {
      delayMs: 1200,
      event: {
        type: 'check_progress',
        check_id: 'company_website',
        message: 'Navigating to techventure-global.com...',
        browser_url: 'https://stream.tinyfish.ai/abc123',
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'linkedin_presence',
        name: 'LinkedIn Presence',
        icon: 'users',
      },
    },
    {
      delayMs: 800,
      event: {
        type: 'check_progress',
        check_id: 'salary_check',
        message: 'Comparing $180k offer against market data...',
      },
    },
    {
      delayMs: 400,
      event: {
        type: 'check_started',
        check_id: 'domain_trust',
        name: 'Domain Trust Analysis',
        icon: 'shield',
      },
    },
    {
      delayMs: 1500,
      event: {
        type: 'check_complete',
        check_id: 'company_website',
        status: 'red',
        summary: 'Website is a thin template with no real content',
        details: {
          tinyfish_goal: 'Navigate to techventure-global.com and evaluate the website for legitimacy. Check for: about page, team members, real contact info, social media presence, and overall content quality.',
          url_visited: 'https://techventure-global.com',
          evidence: [
            'No team page or about section',
            'Generic stock photos throughout',
            'Domain registered only 12 days ago',
            'No social media links',
          ],
          raw_data: {
            site_exists: true,
            http_status: 200,
            has_about_page: false,
            content_quality: 'thin',
            domain_age_days: 12,
            agent_reasoning: 'The website loads but is a thin WordPress template with placeholder content.',
          },
        },
      },
    },
    {
      delayMs: 300,
      event: {
        type: 'check_started',
        check_id: 'reviews_reputation',
        name: 'Reviews & Reputation',
        icon: 'star',
      },
    },
    {
      delayMs: 1200,
      event: {
        type: 'check_complete',
        check_id: 'salary_check',
        status: 'red',
        summary: 'Offered salary is 65% above market rate for this role',
        details: {
          tinyfish_goal: 'Look up the average salary for "Junior Developer" roles on Indeed, Glassdoor, and BLS.',
          evidence: [
            'Market rate for Junior Developer: $85k-$110k',
            'Offered: $180,000',
            'Premium of 65-112% over market rate',
          ],
          raw_data: {
            role: 'Junior Developer',
            offered_salary: 180000,
            market_rates: { indeed_avg: 92000, glassdoor_avg: 97000 },
            agent_reasoning: 'Salary is dramatically above market for a junior role.',
          },
        },
      },
    },
    {
      delayMs: 1800,
      event: {
        type: 'check_complete',
        check_id: 'linkedin_presence',
        status: 'red',
        summary: 'No legitimate LinkedIn presence found',
        details: {
          tinyfish_goal: 'Search LinkedIn for "TechVenture Global" company page and employees.',
          evidence: [
            'No company page on LinkedIn',
            'Recruiter profile created 3 weeks ago',
            'Only 12 connections',
          ],
          raw_data: {
            company_page_found: false,
            recruiter_connections: 12,
            agent_reasoning: 'No LinkedIn presence at all. Freshly created recruiter profile.',
          },
        },
      },
    },
    {
      delayMs: 1000,
      event: {
        type: 'check_complete',
        check_id: 'domain_trust',
        status: 'red',
        summary: 'Domain has extremely low trust score',
        details: {
          tinyfish_goal: 'Run WHOIS lookup on techventure-global.com. Check domain age, registrar, and SSL.',
          url_visited: 'https://techventure-global.com',
          evidence: [
            'Domain age: 12 days',
            'Registered through privacy proxy',
            'Free SSL certificate',
          ],
          raw_data: {
            domain: 'techventure-global.com',
            domain_age_days: 12,
            registrar: 'NameCheap, Inc.',
            privacy_proxy: true,
            agent_reasoning: 'Brand-new domain with anonymous registration. Created for this scam.',
          },
        },
      },
    },
    {
      delayMs: 1500,
      event: {
        type: 'check_complete',
        check_id: 'reviews_reputation',
        status: 'yellow',
        summary: 'No reviews or reputation data found',
        details: {
          tinyfish_goal: 'Search Glassdoor, Trustpilot, and BBB for "TechVenture Global".',
          evidence: [
            'Not listed on Glassdoor',
            'No Trustpilot profile',
            'Not registered with BBB',
          ],
          raw_data: {
            glassdoor_listed: false,
            trustpilot_listed: false,
            bbb_registered: false,
            agent_reasoning: 'Complete absence from all review platforms.',
          },
        },
      },
    },
    {
      delayMs: 1000,
      event: {
        type: 'verdict',
        overall: 'likely_scam',
        score: 0.94,
        summary:
          'This job posting shows multiple critical red flags consistent with a job scam. The company website is a recently created template, the salary is unrealistically high, and there is no verifiable online presence.',
        checks_summary: [
          {
            check_id: 'company_website',
            name: 'Company Website',
            status: 'red',
            one_liner: 'Thin template site, 12-day-old domain',
          },
          {
            check_id: 'salary_check',
            name: 'Salary Reality',
            status: 'red',
            one_liner: 'Offered $180k is 65% above market rate',
          },
          {
            check_id: 'linkedin_presence',
            name: 'LinkedIn Presence',
            status: 'red',
            one_liner: 'No company page, recruiter profile is 3 weeks old',
          },
          {
            check_id: 'domain_trust',
            name: 'Domain Trust',
            status: 'red',
            one_liner: '12-day-old domain with privacy proxy',
          },
          {
            check_id: 'reviews_reputation',
            name: 'Reviews & Reputation',
            status: 'yellow',
            one_liner: 'No reviews or reputation data found anywhere',
          },
        ],
      },
    },
    {
      delayMs: 200,
      event: { type: 'done' },
    },
  ];

  for (const { event, delayMs } of checkEvents) {
    if (signal?.aborted) return;
    await delay(delayMs);
    if (signal?.aborted) return;
    onEvent(event);
  }
}
