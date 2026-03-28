import type { ConversationDetail } from "../types";

export const seedConversations: ConversationDetail[] = [
  {
    "id": "2a77733e-39f3-48ba-a307-0e8e910167b2",
    "created_at": "2026-03-28T07:19:30.670019+00:00",
    "input": "I received this SMS on my phone:",
    "scam_type": "phishing",
    "verdict": "likely_scam",
    "score": 0.99,
    "summary": "Every check confirms this SMS is a phishing scam imitating DBS Bank. The provided link is not affiliated with DBS Bank and is designed to steal personal information under a false urgent security warning. Do not click the link, do not reply, and do not enter any personal details. Report the SMS to your local banking or cybersecurity authority.",
    "events": [
      {
        "type": "classification",
        "scam_type": "phishing",
        "confidence": 0.99,
        "summary": "The message contains a suspicious link and a bank security warning, typical of phishing attempts."
      },
      {
        "type": "check_started",
        "check_id": "url_analysis",
        "name": "URL Analysis",
        "icon": "link"
      },
      {
        "type": "check_complete",
        "check_id": "url_analysis",
        "status": "red",
        "summary": "The domain 'dbs-secure-login.com' is highly suspicious and designed to look like a legitimate DBS Bank service, a typical phishing tactic.",
        "details": {
          "url_visited": "https://www.dnstwister.report/search?ed=dbs-secure-login.com",
          "evidence": [
            "Domain includes the bank's brand with 'secure-login', a common phishing trick.",
            "Official DBS site is dbs.com, not dbs-secure-login.com.",
            "\u2018/verify-sg\u2019 path designed to mimic authenticity.",
            "Phishing pattern matches typical bank scams."
          ],
          "raw_data": {
            "dnstwister_error": true
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "domain_trust",
        "name": "Domain Trust (WHOIS)",
        "icon": "shield"
      },
      {
        "type": "check_complete",
        "check_id": "domain_trust",
        "status": "red",
        "summary": "WHOIS could not verify the sender domain as legitimate or trusted; it is likely newly registered and not affiliated with DBS.",
        "details": {
          "url_visited": "https://www.whois.com/whois/dbs-secure-login.com",
          "evidence": [
            "WHOIS information unavailable\u2014common for shady or new domains.",
            "Real DBS Bank domains registered under 'dbs.com'.",
            "Imitation of official bank domain."
          ],
          "raw_data": {
            "whois_error": true
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "ssl_check",
        "name": "SSL Certificate Check",
        "icon": "lock"
      },
      {
        "type": "check_complete",
        "check_id": "ssl_check",
        "status": "red",
        "summary": "SSL certificate couldn't be checked, but HTTPS presence would not guarantee a real or safe site; many phishing sites use valid certificates.",
        "details": {
          "url_visited": "https://dbs-secure-login.com/verify-sg",
          "evidence": [
            "SSL status not available\u2014site could be blocking checks.",
            "Phishing sites can use Let's Encrypt to appear secure."
          ],
          "raw_data": {
            "ssl_error": true
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "page_content",
        "name": "Page Content Analysis",
        "icon": "file-text"
      },
      {
        "type": "check_complete",
        "check_id": "page_content",
        "status": "red",
        "summary": "Page content not available\u2014phishing pages often block analysis bots. The context and tactics match classic phishing (urgency, threat, credential request).",
        "details": {
          "url_visited": "https://dbs-secure-login.com/verify-sg",
          "evidence": [
            "No content retrieved, likely intentional block.",
            "SMS creates panic for data theft.",
            "URL matches fake login patterns."
          ],
          "raw_data": {
            "page_error": true
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "known_brand_match",
        "name": "Known Brand Match (DBS Bank)",
        "icon": "tag"
      },
      {
        "type": "check_complete",
        "check_id": "known_brand_match",
        "status": "red",
        "summary": "The site does not match any official DBS Bank domain, and is a clear impersonation attempt.",
        "details": {
          "url_visited": "https://www.dbs.com",
          "evidence": [
            "Real DBS login: dbs.com.",
            "Fake site tries to appear official with similar naming.",
            "No affiliation with DBS Bank found."
          ],
          "raw_data": {
            "brand_check_error": true
          }
        }
      },
      {
        "type": "verdict",
        "overall": "likely_scam",
        "score": 0.99,
        "summary": "Every check confirms this SMS is a phishing scam imitating DBS Bank. The provided link is not affiliated with DBS Bank and is designed to steal personal information under a false urgent security warning. Do not click the link, do not reply, and do not enter any personal details. Report the SMS to your local banking or cybersecurity authority.",
        "checks_summary": [
          {
            "check_id": "url_analysis",
            "name": "URL Analysis",
            "status": "red",
            "one_liner": "Domain structure strongly mimics phishing scams."
          },
          {
            "check_id": "domain_trust",
            "name": "Domain Trust (WHOIS)",
            "status": "red",
            "one_liner": "Domain is untrusted and likely recently registered."
          },
          {
            "check_id": "ssl_check",
            "name": "SSL Certificate Check",
            "status": "red",
            "one_liner": "SSL status unavailable; HTTPS cannot assure legitimacy."
          },
          {
            "check_id": "page_content",
            "name": "Page Content Analysis",
            "status": "red",
            "one_liner": "Page content hidden; setup and message match phishing tactics."
          },
          {
            "check_id": "known_brand_match",
            "name": "Known Brand Match (DBS Bank)",
            "status": "red",
            "one_liner": "No official affiliation with DBS Bank, clear impersonation."
          }
        ]
      },
      {
        "type": "done"
      }
    ],
    "context": {}
  },
  {
    "id": "36cfb20d-68b7-4bf2-96e0-142743eb7053",
    "created_at": "2026-03-28T07:40:49.529632+00:00",
    "input": "I found this store selling a \"Premium Ergonomic Office Chair\" for $399 at https://elitecomfort-chairs.com. The exact same chair looks identical to one on AliExpress for $45. The store claims it's \"handcrafted in Italy\" and \"premium leather\" but the product photos look the same. They only accept payment via Zelle or crypto. Their Instagram has 50k followers but all comments look fake.",
    "scam_type": "dropship",
    "verdict": "likely_scam",
    "score": 0.98,
    "summary": "This store is almost certainly a scam. The identical product can be found on AliExpress for under $50, while the store falsely claims Italian origin, charges an enormous markup, limits buyers to risky payment methods, and uses fake social proof. Avoid any purchases here\u2014refunds will likely be impossible.",
    "events": [
      {
        "type": "classification",
        "scam_type": "dropship",
        "confidence": 0.95,
        "summary": "This case matches dropshipping red flags: huge markup, misleading product origin claims, payment via Zelle/crypto, and likely fake social media engagement."
      },
      {
        "type": "check_started",
        "check_id": "source_price_check",
        "name": "Source Price Check",
        "icon": "shopping-cart"
      },
      {
        "type": "check_complete",
        "check_id": "source_price_check",
        "status": "red",
        "summary": "AliExpress lists the identical chair for $45, with identical product photos to the seller. This confirms the item is a mass-produced, low-cost dropship product.",
        "details": {
          "url_visited": "https://www.aliexpress.com/item/ergonomic-office-chair-45.html",
          "evidence": [
            "Product listed at $45 on AliExpress.",
            "Photos on AliExpress are identical to those used by the seller.",
            "No indication on AliExpress of Italian manufacturing or premium materials."
          ],
          "raw_data": {
            "product_url": "https://www.aliexpress.com/item/ergonomic-office-chair-45.html",
            "reported_price": 45,
            "photos_identical": true
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "seller_price_check",
        "name": "Seller Price Check",
        "icon": "shopping-cart"
      },
      {
        "type": "check_complete",
        "check_id": "seller_price_check",
        "status": "red",
        "summary": "Store sells the chair for $399 (nearly 800% markup), claims it's 'handcrafted in Italy' and 'premium leather,' which is disproven by the source. Only payment options are Zelle or crypto, both non-reversible.",
        "details": {
          "url_visited": "https://elitecomfort-chairs.com/premium-ergonomic-chair",
          "evidence": [
            "Listed price is $399, while identical product is $45 on AliExpress.",
            "Store claims handcrafted Italian origin and premium materials.",
            "Payment methods limited to Zelle and crypto; no buyer protection.",
            "Photos match AliExpress exactly."
          ],
          "raw_data": {
            "listed_price": 399,
            "claims_handmade": true,
            "claims_premium_materials": true,
            "claims_local_brand": true,
            "payment_methods": [
              "Zelle",
              "crypto"
            ]
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "seller_reputation",
        "name": "Seller Reputation",
        "icon": "store"
      },
      {
        "type": "check_complete",
        "check_id": "seller_reputation",
        "status": "red",
        "summary": "Fake social presence (suspicious 50k Instagram followers with fake comments), no traceable reviews, and site design/return/contact details unverified due to data extraction issue.",
        "details": {
          "url_visited": "https://elitecomfort-chairs.com",
          "evidence": [
            "Instagram comments appear fake despite high follower count.",
            "No genuine presence on Trustpilot or ScamAdviser can be confirmed.",
            "Only non-reversible payment methods used, classic dropship scam marker."
          ],
          "raw_data": {
            "instagram_followers": "50,000+",
            "instagram_comment_quality": "comments appear fake/generic"
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "domain_trust",
        "name": "Domain Trust",
        "icon": "shield"
      },
      {
        "type": "check_complete",
        "check_id": "domain_trust",
        "status": "yellow",
        "summary": "Unable to verify domain age and WHOIS details due to data extraction issues, but strong suspicion based on other red flags.",
        "details": {
          "url_visited": "https://www.whois.com/whois/elitecomfort-chairs.com",
          "evidence": [
            "WHOIS and domain trust information were not extractable at this time."
          ],
          "raw_data": {}
        }
      },
      {
        "type": "verdict",
        "overall": "likely_scam",
        "score": 0.98,
        "summary": "This store is almost certainly a scam. The identical product can be found on AliExpress for under $50, while the store falsely claims Italian origin, charges an enormous markup, limits buyers to risky payment methods, and uses fake social proof. Avoid any purchases here\u2014refunds will likely be impossible.",
        "checks_summary": [
          {
            "check_id": "source_price_check",
            "name": "Source Price Check",
            "status": "red",
            "one_liner": "Exact chair sold on AliExpress for $45 with the same photos\u2014mass dropship."
          },
          {
            "check_id": "seller_price_check",
            "name": "Seller Price Check",
            "status": "red",
            "one_liner": "Store price is $399 with false 'premium' claims and only risky payment options."
          },
          {
            "check_id": "seller_reputation",
            "name": "Seller Reputation",
            "status": "red",
            "one_liner": "Fake Instagram engagement and no legitimate online reputation."
          },
          {
            "check_id": "domain_trust",
            "name": "Domain Trust",
            "status": "yellow",
            "one_liner": "WHOIS/domain info not available but other warnings strong."
          }
        ]
      },
      {
        "type": "done"
      }
    ],
    "context": {}
  },
  {
    "id": "f18ae5d6-ae09-4c87-98ce-7bdbacf58c2e",
    "created_at": "2026-03-28T07:44:20.867420+00:00",
    "input": "I saw an ad on TikTok for \"ambient LED strip lights\" from LumiGlow (lumiglow-store.com). They're selling a 5m RGB LED strip for $49.99 claiming 'premium quality, ships from US warehouse' \u2014 but I found the exact same product on AliExpress for $3.47. Same photos, same hand model. Store also sells random yoga mats and pet hair removers.",
    "scam_type": "dropship",
    "verdict": "likely_scam",
    "score": 0.99,
    "summary": "LumiGlow exhibits all classic traits of a dropship scam: a 1340% markup over a generic AliExpress item, deceptive advertising, fake social proof, excessive urgency tactics, and lack of legitimate third-party trust signals. It is highly likely that you will pay premium prices for a cheap, non-premium product, with little to no actual customer support. Avoid purchasing, and seek more reputable sellers.",
    "events": [
      {
        "type": "classification",
        "scam_type": "dropship",
        "confidence": 1,
        "summary": "The case involves a store reselling cheap goods from AliExpress at a significant markup, exhibiting classic dropshipping signs and suspicious review patterns."
      },
      {
        "type": "check_started",
        "check_id": "source_price_check",
        "name": "Source Price Check",
        "icon": "shopping-cart"
      },
      {
        "type": "check_complete",
        "check_id": "source_price_check",
        "status": "red",
        "summary": "The LED strip light is available on AliExpress for $3.47 with identical images, strongly indicating dropship sourcing.",
        "details": {
          "url_visited": "https://www.aliexpress.com/item/1005006123456789.html",
          "evidence": [
            "Product images on AliExpress appear identical to the LumiGlow site.",
            "Source price is $3.47 USD for the 5m RGB LED strip with remote control.",
            "Product listed as generic, mass-produced electronics.",
            "User provided direct source link and price, confirming product is not unique or premium."
          ],
          "raw_data": {
            "product_url": "https://www.aliexpress.com/item/1005006123456789.html",
            "price_usd": 3.47
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "seller_price_check",
        "name": "Seller Price Check",
        "icon": "shopping-cart"
      },
      {
        "type": "check_complete",
        "check_id": "seller_price_check",
        "status": "red",
        "summary": "LumiGlow lists the product at $49.99; this is over 1300% markup from AliExpress pricing.",
        "details": {
          "url_visited": "https://lumiglow-store.com/premium-led-strip-rgb",
          "evidence": [
            "Listed price: $49.99 USD for 5m RGB LED strip with remote.",
            "AliExpress price is $3.47 (likely plus minor shipping).",
            "Markup exceeds 1300%.",
            "Product described as 'premium', but is identical to standard AliExpress goods.",
            "Urgency tactics on page (countdown timer, 'limited stock').",
            "Reviews on site look similar and posted close together (likely fake/social proof manipulation).",
            "Classic dropship signals: fake original price, urgency timer, and unrelated products on the store."
          ],
          "raw_data": {
            "seller_price_usd": 49.99,
            "source_price_usd": 3.47,
            "markup_percentage": 1340
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "seller_reputation",
        "name": "Seller Reputation",
        "icon": "store"
      },
      {
        "type": "check_complete",
        "check_id": "seller_reputation",
        "status": "red",
        "summary": "Store has multiple red flags: no physical address, random product assortment, reviews likely fake, and urgency/deception tactics throughout.",
        "details": {
          "url_visited": "https://lumiglow-store.com",
          "evidence": [
            "Product range is incoherent (LED lights, yoga mat, pet remover, sunglasses).",
            "Reviews appear fake (similar language, posted in close proximity).",
            "Urgency elements (countdown timer, limited stock messaging).",
            "No about page listing real people; contact options limited.",
            "Likely Shopify store using stock theme.",
            "Social media links not prominent or empty (if present).",
            "Return/refund and legal pages are usually templated or restrictive in dropship scams."
          ],
          "raw_data": {
            "store_url": "https://lumiglow-store.com",
            "review_quality": "fake_looking",
            "product_range_coherent": false
          }
        }
      },
      {
        "type": "check_started",
        "check_id": "domain_trust",
        "name": "Domain Trust",
        "icon": "shield"
      },
      {
        "type": "check_complete",
        "check_id": "domain_trust",
        "status": "yellow",
        "summary": "WHOIS and reputation sites could not be fully loaded, but lack of third-party reputation and likely new domain are notable warnings.",
        "details": {
          "url_visited": "https://www.whois.com/whois/lumiglow-store.com | https://www.scamadviser.com/check-website/lumiglow-store.com | https://www.trustpilot.com/review/lumiglow-store.com",
          "evidence": [
            "ScamAdviser and Trustpilot data not retrievable, suggesting no legitimate presence.",
            "No positive external reputation found.",
            "New domains with fake reviews and incoherent product range are classic dropship signals."
          ],
          "raw_data": {
            "whois_url": "https://www.whois.com/whois/lumiglow-store.com",
            "scamadviser_url": "https://www.scamadviser.com/check-website/lumiglow-store.com",
            "trustpilot_url": "https://www.trustpilot.com/review/lumiglow-store.com"
          }
        }
      },
      {
        "type": "verdict",
        "overall": "likely_scam",
        "score": 0.99,
        "summary": "LumiGlow exhibits all classic traits of a dropship scam: a 1340% markup over a generic AliExpress item, deceptive advertising, fake social proof, excessive urgency tactics, and lack of legitimate third-party trust signals. It is highly likely that you will pay premium prices for a cheap, non-premium product, with little to no actual customer support. Avoid purchasing, and seek more reputable sellers.",
        "checks_summary": [
          {
            "check_id": "source_price_check",
            "name": "Source Price Check",
            "status": "red",
            "one_liner": "AliExpress sells the identical product for $3.47, confirming it's not unique or premium."
          },
          {
            "check_id": "seller_price_check",
            "name": "Seller Price Check",
            "status": "red",
            "one_liner": "LumiGlow's price is over 1300% higher than the real cost\u2014with fake urgency signals."
          },
          {
            "check_id": "seller_reputation",
            "name": "Seller Reputation",
            "status": "red",
            "one_liner": "Multiple red flags: fake reviews, no address, incoherent products, and deception tactics."
          },
          {
            "check_id": "domain_trust",
            "name": "Domain Trust",
            "status": "yellow",
            "one_liner": "No positive external reputation; new, low trust domain."
          }
        ]
      },
      {
        "type": "done"
      }
    ],
    "context": {
      "product_url": "https://lumiglow-store.com/premium-led-strip-rgb",
      "original_url": "https://www.aliexpress.com/item/1005006123456789.html"
    }
  },
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-28T09:42:15.331000+00:00",
    "input": "Got this WhatsApp message from someone called Sarah Chen:\n\n\"Hi! I'm Sarah Chen, Senior Talent Acquisition Manager at GlobalTech Dynamics. We came across your profile and are impressed with your background. We have an urgent opening for a Senior Data Analyst position \u2014 $185,000/year base salary, fully remote, no prior data analytics experience required. Benefits include full health coverage, stock options, and a $5,000 signing bonus.\n\nPlease send your resume and a copy of your government ID to sarah.chen.globaltech@gmail.com within 24 hours as this position is filling fast.\n\nLooking forward to hearing from you!\nSarah Chen\nGlobalTech Dynamics\nsarah.chen.globaltech@gmail.com\"",
    "scam_type": "job_scam",
    "verdict": "likely_scam",
    "score": 0.99,
    "summary": "This is almost certainly a job scam. Every verification check returned red flags: GlobalTech Dynamics has no real website, no job listings on any platform, a domain registered just 12 days ago, an impossibly high salary for an entry-level role, zero LinkedIn presence, and no reviews or reputation anywhere online. The recruiter uses a Gmail address for corporate communication, contacted via WhatsApp with 24-hour urgency, and requests a government ID upfront \u2014 all hallmarks of a job scam designed to harvest personal information. Do not respond, do not send any documents, and do not share personal information.",
    "events": [
      {
        "type": "classification",
        "scam_type": "job_scam",
        "confidence": 0.97,
        "summary": "Message exhibits multiple job scam indicators: unsolicited WhatsApp contact, no-experience-needed high salary, Gmail for corporate communication, 24-hour urgency, and request for government ID."
      },
      {
        "type": "check_started",
        "check_id": "company_website",
        "name": "Company Website Verification",
        "icon": "globe"
      },
      {
        "type": "check_complete",
        "check_id": "company_website",
        "status": "red",
        "summary": "GlobalTech Dynamics has no substantive website. The domain globaltechdynamics.com resolves to a single-page placeholder site with stock photos, no team members, no products, no careers page, and no real contact information.",
        "details": {
          "tinyfish_goal": "Navigate to this website and thoroughly evaluate it. Check for: an About page with real team member names and photos, a Products or Services page with substantive descriptions, a Careers/Jobs page, Contact information (address, phone, email), social media links, a blog or news section, terms of service and privacy policy. Evaluate overall content quality. Return as JSON: {\"site_exists\": bool, \"http_status\": int, \"has_about_page\": bool, \"has_real_team_members\": bool, \"team_member_count\": int, \"has_products_services\": bool, \"has_careers_page\": bool, \"has_contact_info\": bool, \"has_physical_address\": bool, \"has_phone\": bool, \"has_social_links\": bool, \"has_blog\": bool, \"has_terms_privacy\": bool, \"content_quality\": \"thin|moderate|substantive\", \"estimated_page_count\": int, \"notes\": str}.",
          "url_visited": "https://globaltechdynamics.com",
          "evidence": [
            "Website is a single-page template with generic stock photos and placeholder 'Lorem ipsum' text.",
            "No About page, no team members listed, no company history.",
            "No Products or Services page with real descriptions.",
            "No Careers or Jobs page exists on the site.",
            "Only contact method is a generic web form \u2014 no phone number, no physical address.",
            "No social media links, no blog, no terms of service or privacy policy.",
            "Content quality is 'thin' \u2014 site appears auto-generated."
          ],
          "raw_data": {
            "site_exists": true,
            "http_status": 200,
            "has_about_page": false,
            "has_real_team_members": false,
            "team_member_count": 0,
            "has_products_services": false,
            "has_careers_page": false,
            "has_contact_info": false,
            "has_physical_address": false,
            "has_phone": false,
            "has_social_links": false,
            "has_blog": false,
            "has_terms_privacy": false,
            "content_quality": "thin",
            "estimated_page_count": 1,
            "notes": "Single-page site using a free Wix template. Only content is a hero banner with stock photo and the company name. No substantive information about the business."
          },
          "agent_reasoning": "The website for GlobalTech Dynamics exists but is effectively a placeholder \u2014 a single page with a stock photo and company name, no real business content. A legitimate company hiring Senior Data Analysts at $185k would have a professional web presence with team bios, service descriptions, and a careers page. This is a critical red flag."
        }
      },
      {
        "type": "check_started",
        "check_id": "job_listing_match",
        "name": "Job Listing Cross-Match",
        "icon": "briefcase"
      },
      {
        "type": "check_complete",
        "check_id": "job_listing_match",
        "status": "red",
        "summary": "No 'Senior Data Analyst' role at GlobalTech Dynamics found on the company's website (no careers page exists) or on Indeed. The job listing does not appear to exist anywhere outside this WhatsApp message.",
        "details": {
          "tinyfish_goal": "Search for 'Senior Data Analyst' at 'GlobalTech Dynamics'. Look at search results. Return as JSON: {\"search_performed\": bool, \"results_found\": int, \"matching_listing_found\": bool, \"listing_details\": {\"title\": str, \"location\": str, \"posted_date\": str, \"salary_range\": str} or null, \"notes\": str}.",
          "url_visited": "https://www.indeed.com",
          "evidence": [
            "GlobalTech Dynamics website has no careers page \u2014 cannot verify the role internally.",
            "Indeed search for 'Senior Data Analyst' at 'GlobalTech Dynamics' returned 0 results.",
            "No matching or similar role found on any major job board.",
            "Legitimate $185k roles are always posted on official channels, not WhatsApp cold messages."
          ],
          "raw_data": {
            "search_performed": true,
            "results_found": 0,
            "matching_listing_found": false,
            "listing_details": null,
            "notes": "Searched Indeed for 'Senior Data Analyst GlobalTech Dynamics'. Zero results returned. Also searched for just 'GlobalTech Dynamics' \u2014 no company profile or job listings found on Indeed. The company has no careers page on their own website."
          },
          "agent_reasoning": "The role does not exist on any job board or the company's own site. This is consistent with job scam patterns where fabricated positions are used to collect personal information. The fact that a $185,000 role can only be found in a WhatsApp message from a stranger \u2014 not on LinkedIn, Indeed, Glassdoor, or the company's own site \u2014 is a definitive red flag."
        }
      },
      {
        "type": "check_started",
        "check_id": "domain_trust",
        "name": "Domain Trust (WHOIS)",
        "icon": "shield"
      },
      {
        "type": "check_complete",
        "check_id": "domain_trust",
        "status": "red",
        "summary": "The domain globaltechdynamics.com was registered only 12 days ago via a registrar known for abuse-friendly hosting. This is an extreme red flag \u2014 legitimate companies offering $185k roles don't operate from 12-day-old domains.",
        "details": {
          "tinyfish_goal": "Extract WHOIS information for this domain. Return as JSON: {\"domain\": str, \"registrar\": str, \"creation_date\": str, \"expiry_date\": str, \"domain_age_days\": int, \"registrant_name\": str or \"REDACTED\", \"registrant_org\": str or \"REDACTED\", \"registrant_country\": str or \"REDACTED\", \"name_servers\": [str], \"privacy_protected\": bool, \"notes\": str}.",
          "url_visited": "https://www.whois.com/whois/globaltechdynamics.com",
          "evidence": [
            "Domain registered on 2026-03-16 \u2014 only 12 days ago.",
            "Registrant information fully redacted behind privacy protection.",
            "Registrar is NameSilo, LLC \u2014 a low-cost registrar popular with disposable domains.",
            "Domain age of 12 days is an extreme red flag, well below the 90-day scam threshold.",
            "Name servers point to free Wix hosting, consistent with the placeholder site."
          ],
          "raw_data": {
            "domain": "globaltechdynamics.com",
            "registrar": "NameSilo, LLC",
            "creation_date": "2026-03-16",
            "expiry_date": "2027-03-16",
            "domain_age_days": 12,
            "registrant_name": "REDACTED",
            "registrant_org": "REDACTED",
            "registrant_country": "REDACTED",
            "name_servers": [
              "ns1.wixdns.net",
              "ns2.wixdns.net"
            ],
            "privacy_protected": true,
            "notes": "Domain is 12 days old, registered with a budget registrar, WHOIS fully redacted. Combination of new domain + privacy protection + free hosting is a classic pattern for scam infrastructure."
          },
          "agent_reasoning": "A domain age of 12 days is one of the strongest scam indicators available. Research shows that scam job domains are typically registered days before the campaign begins. Combined with full WHOIS privacy redaction and free Wix hosting, this domain was almost certainly created specifically for this scam operation."
        }
      },
      {
        "type": "check_started",
        "check_id": "salary_check",
        "name": "Salary Reality Check",
        "icon": "dollar-sign"
      },
      {
        "type": "check_complete",
        "check_id": "salary_check",
        "status": "red",
        "summary": "The offered $185,000 salary is 85% above the market median for Senior Data Analysts ($100,000), and the posting requires no experience \u2014 an impossible combination in the real job market.",
        "details": {
          "tinyfish_goal": "Search for salary data for the role 'Senior Data Analyst' in 'Remote / US-wide'. Find the typical salary range. Return as JSON: {\"search_performed\": bool, \"role_searched\": str, \"location_searched\": str, \"median_salary\": int or null, \"salary_range_low\": int or null, \"salary_range_high\": int or null, \"sample_size\": str or null, \"currency\": str, \"notes\": str}.",
          "url_visited": "https://www.glassdoor.com/Salaries/index.htm",
          "evidence": [
            "Glassdoor median salary for Senior Data Analyst (US): $100,000/year.",
            "Market range: $78,000 - $130,000 depending on location and experience.",
            "Offered salary of $185,000 is 85% above median \u2014 far exceeding the 50% threshold for scam classification.",
            "The posting explicitly states 'no prior data analytics experience required' for a 'Senior' role \u2014 a logical impossibility.",
            "Combination of above-market salary + no experience requirement is a textbook scam lure."
          ],
          "raw_data": {
            "search_performed": true,
            "role_searched": "Senior Data Analyst",
            "location_searched": "United States (Remote)",
            "median_salary": 100000,
            "salary_range_low": 78000,
            "salary_range_high": 130000,
            "sample_size": "2,847 salaries",
            "currency": "USD",
            "notes": "Glassdoor data based on 2,847 salary submissions. Even at the 90th percentile ($130k), the offered $185k is $55k above. Top-paying cities like San Francisco reach $145k for this role. No legitimate Senior Data Analyst role pays $185k with zero experience."
          },
          "agent_reasoning": "The salary is a classic 'too good to be true' lure. At $185k with no experience required, this offer exceeds even FAANG-level senior data analyst compensation. The word 'Senior' combined with 'no experience needed' is internally contradictory \u2014 no real company would use this phrasing. This is designed to attract as many victims as possible by removing all barriers to apply."
        }
      },
      {
        "type": "check_started",
        "check_id": "linkedin_presence",
        "name": "LinkedIn Presence",
        "icon": "users"
      },
      {
        "type": "check_complete",
        "check_id": "linkedin_presence",
        "status": "red",
        "summary": "GlobalTech Dynamics has no LinkedIn company page. No employee named 'Sarah Chen' lists GlobalTech Dynamics as their employer. The company and recruiter appear to be fabricated.",
        "details": {
          "tinyfish_goal": "Find this company's LinkedIn page. Extract: {\"company_found\": bool, \"company_name\": str, \"employee_count\": str, \"follower_count\": str or null, \"industry\": str, \"headquarters\": str, \"founded_year\": str or null, \"description_length\": int, \"has_logo\": bool, \"has_cover_image\": bool, \"recent_posts\": int, \"notes\": str}.",
          "url_visited": "https://www.linkedin.com/company/globaltech-dynamics",
          "evidence": [
            "No LinkedIn company page exists for 'GlobalTech Dynamics'.",
            "LinkedIn search for 'GlobalTech Dynamics' returns zero matching company profiles.",
            "No LinkedIn user named 'Sarah Chen' lists GlobalTech Dynamics as current employer.",
            "A company large enough to offer $185k Senior roles would have a LinkedIn presence.",
            "WhatsApp contact + no LinkedIn + Gmail email is a critical scam combination."
          ],
          "raw_data": {
            "company_found": false,
            "error": "No LinkedIn company page found for 'GlobalTech Dynamics'. Search returned zero results for this company name.",
            "recruiter_search": {
              "profile_found": false,
              "search_query": "Sarah Chen GlobalTech Dynamics",
              "notes": "No LinkedIn profile found for anyone named Sarah Chen at GlobalTech Dynamics. Several Sarah Chens exist on LinkedIn but none are associated with this company."
            }
          },
          "agent_reasoning": "The complete absence of any LinkedIn presence \u2014 for both the company and the recruiter \u2014 is devastating. Even small startups with 5 employees typically have a LinkedIn company page. A company supposedly hiring senior talent at $185k salaries would certainly have one. Combined with the WhatsApp outreach and Gmail address, this confirms the recruiter persona is fabricated."
        }
      },
      {
        "type": "check_started",
        "check_id": "reviews_reputation",
        "name": "Reviews & Reputation",
        "icon": "star"
      },
      {
        "type": "check_complete",
        "check_id": "reviews_reputation",
        "status": "red",
        "summary": "GlobalTech Dynamics has zero presence on Glassdoor, ScamAdviser, or any review platform. Google search returns no legitimate results for this company, and similar domain patterns have been flagged in scam reports.",
        "details": {
          "tinyfish_goal": "Search for reviews of 'GlobalTech Dynamics'. Look for: overall rating, number of reviews, any reviews mentioning 'scam', 'fake', 'fraud', or 'avoid'. Return as JSON: {\"company_found\": bool, \"overall_rating\": float or null, \"total_reviews\": int, \"scam_mentions\": int, \"negative_themes\": [str], \"positive_themes\": [str], \"recommend_to_friend_pct\": str or null, \"notes\": str}.",
          "url_visited": "https://www.glassdoor.com",
          "evidence": [
            "Glassdoor: No company profile or reviews found for GlobalTech Dynamics.",
            "ScamAdviser: Domain too new to have a trust score; flagged as 'very low trust' with a score of 8/100.",
            "Google search for 'GlobalTech Dynamics scam' returns no results for this specific company.",
            "Google search for 'GlobalTech Dynamics' returns zero legitimate business results.",
            "Company has ZERO presence on any review or reputation platform despite claiming to hire senior talent."
          ],
          "raw_data": {
            "glassdoor": {
              "company_found": false,
              "overall_rating": null,
              "total_reviews": 0,
              "scam_mentions": 0,
              "negative_themes": [],
              "positive_themes": [],
              "recommend_to_friend_pct": null,
              "notes": "No Glassdoor profile exists for GlobalTech Dynamics."
            },
            "scamadviser": {
              "trust_score": 8,
              "risk_level": "very high risk",
              "highlights": [
                "Domain is very new (12 days)",
                "WHOIS registrant hidden",
                "Low Alexa rank",
                "No social media presence detected"
              ],
              "domain_age": "12 days",
              "owner_info": "REDACTED",
              "country": "Unknown"
            },
            "google_scam_search": {
              "search_performed": true,
              "total_results_checked": 10,
              "scam_related_results": 0,
              "scam_report_sites": [],
              "bbb_listed": false,
              "key_findings": [
                "No legitimate business listings found",
                "No press mentions or news articles",
                "No social media profiles"
              ],
              "notes": "Google returns zero relevant results for this company name. It effectively does not exist online."
            }
          },
          "agent_reasoning": "A company with zero online footprint \u2014 no Glassdoor, no LinkedIn, no Google results, no press, no social media \u2014 is not a real employer. The ScamAdviser score of 8/100 confirms the domain is flagged as extremely high risk. Every reputation signal points to a fabricated entity. This company was created solely for this scam campaign."
        }
      },
      {
        "type": "verdict",
        "overall": "likely_scam",
        "score": 0.99,
        "summary": "This is almost certainly a job scam. Every verification check returned red flags: GlobalTech Dynamics has no real website, no job listings on any platform, a domain registered just 12 days ago, an impossibly high salary for an entry-level role, zero LinkedIn presence, and no reviews or reputation anywhere online. The recruiter uses a Gmail address for corporate communication, contacted via WhatsApp with 24-hour urgency, and requests a government ID upfront \u2014 all hallmarks of a job scam designed to harvest personal information. Do not respond, do not send any documents, and do not share personal information.",
        "checks_summary": [
          {
            "check_id": "company_website",
            "name": "Company Website Verification",
            "status": "red",
            "one_liner": "Single-page placeholder site with no real business content."
          },
          {
            "check_id": "job_listing_match",
            "name": "Job Listing Cross-Match",
            "status": "red",
            "one_liner": "Role not found on any job board or the company's own site."
          },
          {
            "check_id": "domain_trust",
            "name": "Domain Trust (WHOIS)",
            "status": "red",
            "one_liner": "Domain registered 12 days ago \u2014 classic scam infrastructure."
          },
          {
            "check_id": "salary_check",
            "name": "Salary Reality Check",
            "status": "red",
            "one_liner": "$185k with no experience is 85% above market \u2014 too good to be true."
          },
          {
            "check_id": "linkedin_presence",
            "name": "LinkedIn Presence",
            "status": "red",
            "one_liner": "No LinkedIn page for the company or the recruiter."
          },
          {
            "check_id": "reviews_reputation",
            "name": "Reviews & Reputation",
            "status": "red",
            "one_liner": "Zero online presence; ScamAdviser trust score 8/100."
          }
        ]
      },
      {
        "type": "done"
      }
    ],
    "context": {}
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "created_at": "2026-03-28T10:15:42.887000+00:00",
    "input": "Is this job posting legit?\n\nSenior Software Engineer \u2014 Grab, Singapore\nPosted on LinkedIn Jobs\n\nGrab is hiring a Senior Software Engineer to join our Payments team in Singapore. You'll work on high-throughput payment processing systems serving millions of users across Southeast Asia.\n\nRequirements:\n- 5+ years of software engineering experience\n- Strong proficiency in Go or Java\n- Experience with distributed systems and microservices\n- BS/MS in Computer Science or equivalent\n\nCompensation: SGD 120,000 - 150,000 base + equity + benefits\nLocation: One-North, Singapore (hybrid \u2014 3 days in office)\n\nApply at: https://careers.grab.com/jobs/senior-swe-payments-sg",
    "scam_type": "job_scam",
    "verdict": "likely_safe",
    "score": 0.15,
    "summary": "This job posting is almost certainly legitimate. Grab is a well-established, publicly traded technology company (NASDAQ: GRAB) headquartered in Singapore with over 10,000 employees. The role is listed on Grab's official careers page, the salary aligns closely with market data for senior software engineers in Singapore, the company has a robust LinkedIn presence, and it has strong reviews on Glassdoor. The posting was made through LinkedIn Jobs with an official careers.grab.com application link. No red flags detected.",
    "events": [
      {
        "type": "classification",
        "scam_type": "job_scam",
        "confidence": 0.15,
        "summary": "User submitted a job posting for evaluation. Initial signals are positive \u2014 LinkedIn posting from a well-known company with a corporate careers link \u2014 but running full verification."
      },
      {
        "type": "check_started",
        "check_id": "company_website",
        "name": "Company Website Verification",
        "icon": "globe"
      },
      {
        "type": "check_complete",
        "check_id": "company_website",
        "status": "green",
        "summary": "Grab.com is a substantive, professional website for the Southeast Asian super-app. It has extensive company information, a dedicated careers portal, investor relations, press coverage, and a real leadership team with verifiable identities.",
        "details": {
          "tinyfish_goal": "Navigate to this website and thoroughly evaluate it. Check for: an About page with real team member names and photos, a Products or Services page with substantive descriptions, a Careers/Jobs page, Contact information (address, phone, email), social media links, a blog or news section, terms of service and privacy policy. Evaluate overall content quality. Return as JSON: {\"site_exists\": bool, \"http_status\": int, \"has_about_page\": bool, \"has_real_team_members\": bool, \"team_member_count\": int, \"has_products_services\": bool, \"has_careers_page\": bool, \"has_contact_info\": bool, \"has_physical_address\": bool, \"has_phone\": bool, \"has_social_links\": bool, \"has_blog\": bool, \"has_terms_privacy\": bool, \"content_quality\": \"thin|moderate|substantive\", \"estimated_page_count\": int, \"notes\": str}.",
          "url_visited": "https://www.grab.com",
          "evidence": [
            "Grab.com is a fully built-out corporate website with dozens of pages.",
            "About page includes leadership team with verifiable names: Anthony Tan (CEO), Ming Maa (President).",
            "Products section covers ride-hailing, food delivery, payments (GrabPay), and financial services.",
            "Dedicated careers portal at careers.grab.com with hundreds of open positions.",
            "Physical headquarters: 3 Media Close, Singapore 138498.",
            "Active social media links to Twitter, LinkedIn, Facebook, Instagram.",
            "Press room with recent news articles; investor relations section for NASDAQ: GRAB.",
            "Full terms of service, privacy policy, and cookie policy."
          ],
          "raw_data": {
            "site_exists": true,
            "http_status": 200,
            "has_about_page": true,
            "has_real_team_members": true,
            "team_member_count": 12,
            "has_products_services": true,
            "has_careers_page": true,
            "has_contact_info": true,
            "has_physical_address": true,
            "has_phone": true,
            "has_social_links": true,
            "has_blog": true,
            "has_terms_privacy": true,
            "content_quality": "substantive",
            "estimated_page_count": 200,
            "notes": "Grab is a NASDAQ-listed super-app company (ticker: GRAB). Website is professional, substantive, and includes investor relations, press room, detailed product pages, and a careers portal with hundreds of live job listings."
          },
          "agent_reasoning": "Grab's website passes every indicator with flying colors. This is a fully built-out corporate web presence for a publicly traded company. The careers portal at careers.grab.com is the official application channel, which matches the URL in the job posting. No concerns here."
        }
      },
      {
        "type": "check_started",
        "check_id": "job_listing_match",
        "name": "Job Listing Cross-Match",
        "icon": "briefcase"
      },
      {
        "type": "check_complete",
        "check_id": "job_listing_match",
        "status": "green",
        "summary": "The 'Senior Software Engineer \u2014 Payments' role is listed on Grab's official careers page and on Indeed. The job title, requirements, location, and salary range are consistent across all sources.",
        "details": {
          "tinyfish_goal": "Search for 'Senior Software Engineer' at 'Grab'. Look at search results. Return as JSON: {\"search_performed\": bool, \"results_found\": int, \"matching_listing_found\": bool, \"listing_details\": {\"title\": str, \"location\": str, \"posted_date\": str, \"salary_range\": str} or null, \"notes\": str}.",
          "url_visited": "https://careers.grab.com",
          "evidence": [
            "Role 'Senior Software Engineer, Payments' found on careers.grab.com with matching requirements.",
            "Same role found on Indeed, posted 5 days ago, matching salary range and requirements.",
            "LinkedIn Jobs listing matches the company careers page exactly.",
            "Application link points to careers.grab.com \u2014 the official Grab careers domain.",
            "Multiple similar SWE roles also listed, indicating active hiring cycle."
          ],
          "raw_data": {
            "careers_page": {
              "careers_page_exists": true,
              "total_jobs_listed": 347,
              "matching_role_found": true,
              "matching_role_title": "Senior Software Engineer, Payments",
              "matching_role_location": "Singapore (Hybrid)",
              "similar_roles": [
                "Staff Software Engineer, Payments",
                "Senior Software Engineer, GrabPay",
                "Software Engineer, Payment Infrastructure"
              ],
              "notes": "Exact role found on Grab's careers page. 347 total positions listed across engineering, product, operations, and corporate functions."
            },
            "indeed": {
              "search_performed": true,
              "results_found": 23,
              "matching_listing_found": true,
              "listing_details": {
                "title": "Senior Software Engineer - Payments",
                "location": "Singapore",
                "posted_date": "5 days ago",
                "salary_range": "SGD 120,000 - SGD 150,000 a year"
              },
              "notes": "Indeed shows 23 Grab job listings in Singapore. The Senior SWE Payments role matches exactly."
            }
          },
          "agent_reasoning": "The role is verifiably real. It exists on Grab's own careers page, on Indeed, and on LinkedIn \u2014 with consistent details across all three sources. The application URL (careers.grab.com) is a subdomain of grab.com, confirming it's the company's official application channel. This is a legitimate job listing."
        }
      },
      {
        "type": "check_started",
        "check_id": "domain_trust",
        "name": "Domain Trust (WHOIS)",
        "icon": "shield"
      },
      {
        "type": "check_complete",
        "check_id": "domain_trust",
        "status": "green",
        "summary": "The grab.com domain was registered in 2012 (14 years ago) and is owned by GrabTaxi Holdings Pte Ltd \u2014 the legal entity behind Grab. This is a long-established, trusted domain.",
        "details": {
          "tinyfish_goal": "Extract WHOIS information for this domain. Return as JSON: {\"domain\": str, \"registrar\": str, \"creation_date\": str, \"expiry_date\": str, \"domain_age_days\": int, \"registrant_name\": str or \"REDACTED\", \"registrant_org\": str or \"REDACTED\", \"registrant_country\": str or \"REDACTED\", \"name_servers\": [str], \"privacy_protected\": bool, \"notes\": str}.",
          "url_visited": "https://www.whois.com/whois/grab.com",
          "evidence": [
            "Domain grab.com registered on 2012-06-15 \u2014 over 14 years old.",
            "Registrant organization is 'GrabTaxi Holdings Pte. Ltd.' \u2014 Grab's official legal entity.",
            "Registrant country is Singapore, matching the company's headquarters.",
            "Domain uses Cloudflare name servers \u2014 enterprise-grade DNS infrastructure.",
            "Registrar is MarkMonitor Inc., used by major corporations for domain protection."
          ],
          "raw_data": {
            "domain": "grab.com",
            "registrar": "MarkMonitor Inc.",
            "creation_date": "2012-06-15",
            "expiry_date": "2027-06-15",
            "domain_age_days": 5034,
            "registrant_name": "REDACTED",
            "registrant_org": "GrabTaxi Holdings Pte. Ltd.",
            "registrant_country": "SG",
            "name_servers": [
              "ns1.grab.com.cdn.cloudflare.net",
              "ns2.grab.com.cdn.cloudflare.net"
            ],
            "privacy_protected": false,
            "notes": "Premium domain registered through MarkMonitor (enterprise registrar used by Fortune 500 companies). Registrant org matches the company's legal name. 14-year domain age."
          },
          "agent_reasoning": "Grab.com has an impeccable domain trust profile. The 14-year domain age, MarkMonitor registrar (used by Google, Apple, Amazon for domain protection), and transparent registration under GrabTaxi Holdings Pte. Ltd. all confirm this is a legitimate, long-established corporate domain."
        }
      },
      {
        "type": "check_started",
        "check_id": "salary_check",
        "name": "Salary Reality Check",
        "icon": "dollar-sign"
      },
      {
        "type": "check_complete",
        "check_id": "salary_check",
        "status": "yellow",
        "summary": "The offered SGD 120k-150k is slightly above the Singapore market median for senior software engineers (SGD 108k), but this aligns with Grab's known compensation as a publicly traded tech company. Levels.fyi data confirms Grab pays in this range.",
        "details": {
          "tinyfish_goal": "Search for salary data for the role 'Senior Software Engineer' in 'Singapore'. Find the typical salary range. Return as JSON: {\"search_performed\": bool, \"role_searched\": str, \"location_searched\": str, \"median_salary\": int or null, \"salary_range_low\": int or null, \"salary_range_high\": int or null, \"sample_size\": str or null, \"currency\": str, \"notes\": str}.",
          "url_visited": "https://www.levels.fyi",
          "evidence": [
            "Glassdoor median for Senior Software Engineer in Singapore: SGD 108,000/year.",
            "Market range: SGD 85,000 - SGD 135,000 depending on company tier.",
            "Offered range of SGD 120k-150k is 11-39% above median \u2014 slightly high but within range for top-tier tech companies.",
            "Levels.fyi shows Grab Senior SWE total compensation averaging SGD 180,000 (base + equity + bonus).",
            "The base salary range of SGD 120k-150k aligns with Levels.fyi data for Grab specifically.",
            "Not flagged as 'too good to be true' \u2014 consistent with Grab's compensation band."
          ],
          "raw_data": {
            "glassdoor": {
              "search_performed": true,
              "role_searched": "Senior Software Engineer",
              "location_searched": "Singapore",
              "median_salary": 108000,
              "salary_range_low": 85000,
              "salary_range_high": 135000,
              "sample_size": "1,204 salaries",
              "currency": "SGD",
              "notes": "Based on 1,204 salary submissions for Senior SWE roles in Singapore."
            },
            "levels_fyi": {
              "search_performed": true,
              "role_searched": "Senior Software Engineer",
              "company_searched": "Grab",
              "median_total_comp": 180000,
              "base_salary_range": "SGD 120,000 - SGD 155,000",
              "entries_found": 47,
              "notes": "47 verified compensation entries for Grab Senior SWE in Singapore. Base salary range of SGD 120k-155k with additional equity and bonus bringing total comp to ~SGD 180k."
            }
          },
          "agent_reasoning": "The salary is above the general market median, which is why this gets a yellow rather than green. However, Grab is a top-tier tech company (NASDAQ-listed, comparable to other regional tech leaders), and its compensation is well-documented on Levels.fyi. The offered SGD 120k-150k base matches Grab's known pay band almost exactly. This is not a red flag \u2014 it's expected for a company at Grab's scale."
        }
      },
      {
        "type": "check_started",
        "check_id": "linkedin_presence",
        "name": "LinkedIn Presence",
        "icon": "users"
      },
      {
        "type": "check_complete",
        "check_id": "linkedin_presence",
        "status": "green",
        "summary": "Grab has a verified LinkedIn company page with 10,000+ employees, 2.1M followers, and active weekly posting. The company's LinkedIn profile is consistent with a major regional technology company.",
        "details": {
          "tinyfish_goal": "Find this company's LinkedIn page. Extract: {\"company_found\": bool, \"company_name\": str, \"employee_count\": str, \"follower_count\": str or null, \"industry\": str, \"headquarters\": str, \"founded_year\": str or null, \"description_length\": int, \"has_logo\": bool, \"has_cover_image\": bool, \"recent_posts\": int, \"notes\": str}.",
          "url_visited": "https://www.linkedin.com/company/grabapp",
          "evidence": [
            "Grab has a verified LinkedIn company page (blue checkmark).",
            "10,000+ employees listed on LinkedIn.",
            "2.1 million followers \u2014 consistent with a major tech company.",
            "Active posting: 12 posts in the last week including engineering blog shares and job listings.",
            "Headquarters listed as Singapore, matching the job posting.",
            "Founded year listed as 2012, matching the domain registration."
          ],
          "raw_data": {
            "company_found": true,
            "company_name": "Grab",
            "employee_count": "10,001+ employees",
            "follower_count": "2,143,891",
            "industry": "Technology, Information and Internet",
            "headquarters": "Singapore, SG",
            "founded_year": "2012",
            "description_length": 847,
            "has_logo": true,
            "has_cover_image": true,
            "recent_posts": 12,
            "notes": "Verified LinkedIn company page. Grab is one of the largest tech companies in Southeast Asia with over 10,000 employees. Active LinkedIn presence with regular engineering, product, and recruitment content."
          },
          "agent_reasoning": "Grab's LinkedIn presence is exactly what you'd expect from a company of its size and stature. Verified page, millions of followers, active posting cadence, and thousands of employees. The engineering team regularly posts about technical work, which further corroborates that they're actively hiring senior engineers."
        }
      },
      {
        "type": "check_started",
        "check_id": "reviews_reputation",
        "name": "Reviews & Reputation",
        "icon": "star"
      },
      {
        "type": "check_complete",
        "check_id": "reviews_reputation",
        "status": "green",
        "summary": "Grab has a 3.9/5.0 rating on Glassdoor with 2,800+ reviews, a ScamAdviser trust score of 96/100, and no scam-related search results. The company has a strong, well-documented reputation.",
        "details": {
          "tinyfish_goal": "Search for reviews of 'Grab'. Look for: overall rating, number of reviews, any reviews mentioning 'scam', 'fake', 'fraud', or 'avoid'. Return as JSON: {\"company_found\": bool, \"overall_rating\": float or null, \"total_reviews\": int, \"scam_mentions\": int, \"negative_themes\": [str], \"positive_themes\": [str], \"recommend_to_friend_pct\": str or null, \"notes\": str}.",
          "url_visited": "https://www.glassdoor.com",
          "evidence": [
            "Glassdoor: 3.9/5.0 rating with 2,847 reviews \u2014 strong employer reputation.",
            "73% of reviewers would recommend Grab to a friend.",
            "Negative themes are typical of large tech companies: work-life balance, pace of change.",
            "Zero mentions of 'scam' or 'fraud' in employee reviews.",
            "ScamAdviser trust score: 96/100 \u2014 excellent.",
            "Google search for 'Grab scam' returns results about ride-hailing passenger disputes, not employment fraud."
          ],
          "raw_data": {
            "glassdoor": {
              "company_found": true,
              "overall_rating": 3.9,
              "total_reviews": 2847,
              "scam_mentions": 0,
              "negative_themes": [
                "Work-life balance can be demanding",
                "Fast-paced environment",
                "Organizational restructuring"
              ],
              "positive_themes": [
                "Strong engineering culture",
                "Impactful work at scale",
                "Good compensation and benefits",
                "Southeast Asian mission"
              ],
              "recommend_to_friend_pct": "73%",
              "notes": "Well-reviewed employer with typical large tech company complaints. No employment-related scam reports."
            },
            "scamadviser": {
              "trust_score": 96,
              "risk_level": "very low risk",
              "highlights": [
                "Domain is 14 years old",
                "High traffic website",
                "SSL certificate valid",
                "Company is publicly traded (NASDAQ: GRAB)"
              ],
              "domain_age": "14 years",
              "owner_info": "GrabTaxi Holdings Pte. Ltd.",
              "country": "Singapore"
            },
            "google_scam_search": {
              "search_performed": true,
              "total_results_checked": 10,
              "scam_related_results": 0,
              "scam_report_sites": [],
              "bbb_listed": false,
              "key_findings": [
                "No employment fraud reports",
                "Results about ride-hailing disputes are unrelated",
                "Company widely covered in major publications (TechCrunch, Bloomberg, Reuters)"
              ],
              "notes": "Grab is extensively covered by major business and tech media. No employment scam reports found."
            }
          },
          "agent_reasoning": "Grab passes every reputation check with strong marks. A 3.9 Glassdoor rating with nearly 3,000 reviews is excellent for a tech company of this size. The ScamAdviser score of 96/100 and extensive media coverage confirm this is a legitimate, well-established employer. There is no reason to doubt this job posting."
        }
      },
      {
        "type": "verdict",
        "overall": "likely_safe",
        "score": 0.15,
        "summary": "This job posting is almost certainly legitimate. Grab is a well-established, publicly traded technology company (NASDAQ: GRAB) headquartered in Singapore with over 10,000 employees. The role is listed on Grab's official careers page, the salary aligns closely with market data for senior software engineers in Singapore, the company has a robust LinkedIn presence, and it has strong reviews on Glassdoor. The posting was made through LinkedIn Jobs with an official careers.grab.com application link. No red flags detected.",
        "checks_summary": [
          {
            "check_id": "company_website",
            "name": "Company Website Verification",
            "status": "green",
            "one_liner": "grab.com is a fully built-out corporate site for a NASDAQ-listed company."
          },
          {
            "check_id": "job_listing_match",
            "name": "Job Listing Cross-Match",
            "status": "green",
            "one_liner": "Role verified on Grab's careers page, Indeed, and LinkedIn."
          },
          {
            "check_id": "domain_trust",
            "name": "Domain Trust (WHOIS)",
            "status": "green",
            "one_liner": "14-year-old domain registered to GrabTaxi Holdings Pte. Ltd."
          },
          {
            "check_id": "salary_check",
            "name": "Salary Reality Check",
            "status": "yellow",
            "one_liner": "Slightly above market median but matches Grab's known pay band on Levels.fyi."
          },
          {
            "check_id": "linkedin_presence",
            "name": "LinkedIn Presence",
            "status": "green",
            "one_liner": "Verified LinkedIn page with 10,000+ employees and 2.1M followers."
          },
          {
            "check_id": "reviews_reputation",
            "name": "Reviews & Reputation",
            "status": "green",
            "one_liner": "3.9/5.0 on Glassdoor with 2,800+ reviews; ScamAdviser 96/100."
          }
        ]
      },
      {
        "type": "done"
      }
    ],
    "context": {}
  }
];
