# AntiFishy Integration Test Findings

**Run date:** 2026-03-28
**Tests run:** 3
**Passed:** 1/3

---

## Test 1: TinyFish Direct — Grab.com [FAIL]

- **Time:** 76.6s
- **Progress steps:** 0

---

## Test 2: TinyFish Direct — WHOIS grab.com [FAIL]

- **Time:** 95.7s
- **Progress steps:** 0

---

## Test 3: Full Orchestrator — Suspicious job posting [PASS]

- **Time:** 779.0s
- **Progress steps:** N/A

### Events (15 total)

- **Classification:** job_scam (confidence: 0.95)
  - WhatsApp message offers a high-paying, no-experience remote job with urgency and a generic email, suggesting a likely job scam.
- **Check started:** `company_website` — Company Website Verification
- **Check [RED]** `company_website`: No evidence of a substantive company website for 'GlobalTech Dynamics' could be found. Site may not exist or is entirely non-functional.
  - The domain does not return any content or evidential data.
  - No About, Products/Services, Careers, or Contact information available.
- **Check started:** `job_listing_match` — Job Listing Cross-Match
- **Check [RED]** `job_listing_match`: No Senior Data Analyst job for this company found on Indeed or (presumed) company site. No public career presence found.
  - No matching job listings found for 'GlobalTech Dynamics' on Indeed.
  - No careers page confirmed.
- **Check started:** `domain_trust` — Domain Trust Analysis
- **Check [RED]** `domain_trust`: WHOIS information unavailable; possible new or inactive domain. High risk of this being an untrustworthy or fake company domain.
  - No WHOIS or registration info retrievable for this domain.
- **Check started:** `salary_check` — Salary Reality Check
- **Check [RED]** `salary_check`: $185,000/year for Senior Data Analyst, fully remote, no experience required, is 50%+ above typical market and highly unrealistic.
  - No credible salary data found for this company; typical US Senior Data Analyst salaries are $85,000-$125,000/year.
  - Salary offered is extremely above-market and suspicious for a no-experience job.
- **Check started:** `linkedin_presence` — LinkedIn Presence
- **Check [RED]** `linkedin_presence`: 'GlobalTech Dynamics' has no LinkedIn company page presence. No evidence recruiter or company exists on LinkedIn.
  - No LinkedIn company page found for this company.
  - No way to verify recruiter identity or employee base for this company.
- **Check started:** `reviews_reputation` — Review & Reputation
- **Check [RED]** `reviews_reputation`: No reviews or mentions on Glassdoor, ScamAdviser, or Google. No evidence of company reputation; likely to be a fabricated entity.
  - No Glassdoor reviews/found.
  - No results or trust reputation from ScamAdviser.
  - No meaningful Google mentions—no legitimate presence.
- **VERDICT: LIKELY_SCAM** (score: 0.99)
  - This job offer fits multiple classic job scam red flags: the company does not have a credible web or LinkedIn presence, no legitimate jobs or reviews can be found, the salary is far above market, and the recruiting method is highly suspicious. You should not respond or provide any information to this contact, as it is almost certainly a scam attempting to collect personal data for malicious purposes.

### Verdict Summary
- **Overall:** likely_scam
- **Score:** 0.99
- **Summary:** This job offer fits multiple classic job scam red flags: the company does not have a credible web or LinkedIn presence, no legitimate jobs or reviews can be found, the salary is far above market, and the recruiting method is highly suspicious. You should not respond or provide any information to this contact, as it is almost certainly a scam attempting to collect personal data for malicious purposes.

| Check | Status | Finding |
|-------|--------|---------|
| Company Website Verification | red | Company website not found or non-functional. |
| Job Listing Cross-Match | red | No legitimate job listing for this role or company exists. |
| Domain Trust Analysis | red | Company domain is untrusted or entirely absent. |
| Salary Reality Check | red | Salary is extremely above-market, a classic scam sign. |
| LinkedIn Presence | red | No LinkedIn presence for company or recruiter. |
| Review & Reputation | red | No reviews or reputation found anywhere online. |

---

## Key Observations

*(To be filled after reviewing results)*
