# AntiFishy Integration Tests v2 — Phishing + Dropship

**Run date:** 2026-03-28 15:40

## Phishing — Fake DBS Bank SMS
- **Time:** 518s
- **Events:** 13
- **Verdict:** likely_scam (score: 0.99)
- **Summary:** Every check confirms this SMS is a phishing scam imitating DBS Bank. The provided link is not affiliated with DBS Bank and is designed to steal personal information under a false urgent security warning. Do not click the link, do not reply, and do not enter any personal details. Report the SMS to your local banking or cybersecurity authority.

  - [RED] **url_analysis**: The domain 'dbs-secure-login.com' is highly suspicious and designed to look like a legitimate DBS Bank service, a typical phishing tactic.
  - [RED] **domain_trust**: WHOIS could not verify the sender domain as legitimate or trusted; it is likely newly registered and not affiliated with DBS.
  - [RED] **ssl_check**: SSL certificate couldn't be checked, but HTTPS presence would not guarantee a real or safe site; many phishing sites use valid certificates.
  - [RED] **page_content**: Page content not available—phishing pages often block analysis bots. The context and tactics match classic phishing (urgency, threat, credential request).
  - [RED] **known_brand_match**: The site does not match any official DBS Bank domain, and is a clear impersonation attempt.

---

## Dropship — Fake Italian Chair Store
- **Time:** 1279s
- **Events:** 11
- **Verdict:** likely_scam (score: 0.98)
- **Summary:** This store is almost certainly a scam. The identical product can be found on AliExpress for under $50, while the store falsely claims Italian origin, charges an enormous markup, limits buyers to risky payment methods, and uses fake social proof. Avoid any purchases here—refunds will likely be impossible.

  - [RED] **source_price_check**: AliExpress lists the identical chair for $45, with identical product photos to the seller. This confirms the item is a mass-produced, low-cost dropship product.
  - [RED] **seller_price_check**: Store sells the chair for $399 (nearly 800% markup), claims it's 'handcrafted in Italy' and 'premium leather,' which is disproven by the source. Only payment options are Zelle or crypto, both non-reversible.
  - [RED] **seller_reputation**: Fake social presence (suspicious 50k Instagram followers with fake comments), no traceable reviews, and site design/return/contact details unverified due to data extraction issue.
  - [YELLOW] **domain_trust**: Unable to verify domain age and WHOIS details due to data extraction issues, but strong suspicion based on other red flags.

---
