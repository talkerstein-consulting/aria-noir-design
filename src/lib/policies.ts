/**
 * The five policy documents, transcribed from arianoir.com.
 *
 * Substantively unchanged — these are the house's legal positions and are
 * not ours to rewrite. What changed is the shape: the live warranty page
 * ships seven numbered variants of the same document on one URL (website
 * copy, checkout copy, packaging-insert copy, an FAQ), which is a copy
 * deck that was pasted rather than a page. Only the website version
 * belongs on the website; the rest are kept out of the reader's way.
 *
 * Run-on clauses that were genuinely lists are set as lists here. On the
 * live pages "Structural defects of the frameManufacturing faults in
 * hinges" is one unbroken sentence, which is how an exclusions clause
 * becomes unreadable.
 */

import type { ProseSection } from "@/components/page/prose-page";

export type Policy = {
  slug: string;
  eyebrow: string;
  title: string;
  updated: string;
  sections: readonly ProseSection[];
};

const UPDATED = "6 May 2025";

export const warranty: Policy = {
  slug: "warranty",
  eyebrow: "Client",
  title: "International Limited Warranty",
  updated: UPDATED,
  sections: [
    {
      id: "cover",
      title: "What is covered",
      body: [
        "Aria Noir eyewear is conceived as an object of permanence. Each frame is engineered, assembled, and inspected to meet uncompromising standards of design, material integrity, and execution.",
        "Aria Noir provides a two (2) year International Limited Warranty from the original date of purchase, covering verified manufacturing defects in materials or workmanship under normal and intended conditions of use.",
        [
          "Structural defects of the frame",
          "Manufacturing faults in hinges, joints, or internal architecture",
          "Defects related to original assembly or finishing",
        ],
        "If a defect is confirmed, Aria Noir will, at its sole discretion, repair the product using original or equivalent components, replace it with the same or a comparable model, or provide an alternative solution consistent with Aria Noir standards. All interventions preserve the original aesthetic, balance, and performance of the eyewear.",
      ],
    },
    {
      id: "exclusions",
      title: "Exclusions",
      body: [
        "Aria Noir eyewear is designed for longevity, not indestructibility. This warranty does not cover:",
        [
          "Normal wear, aging, or patina resulting from use",
          "Scratches or surface wear to lenses",
          "Damage caused by impact, accident, misuse, or improper handling",
          "Exposure to extreme heat, chemicals, solvents, saltwater, or corrosive environments",
          "Unauthorized repairs, adjustments, or modifications",
          "Loss or theft",
        ],
      ],
    },
    {
      id: "authenticity",
      title: "Authenticity and proof of purchase",
      body: [
        "This warranty applies exclusively to authentic Aria Noir eyewear purchased through arianoir.com or an authorized Aria Noir retailer.",
        "Valid proof of purchase is required. Products obtained through unauthorized sellers are not eligible for warranty service.",
      ],
    },
    {
      id: "service",
      title: "Making a claim",
      body: [
        "Contact support@arianoir.com with your proof of purchase and clear images of the issue. Our team will review the claim and advise on next steps.",
        "All evaluations are conducted by Aria Noir or its authorized service partners, and final determinations are made in alignment with brand standards. Shipping and handling costs may vary by region and are assessed individually.",
      ],
    },
    {
      id: "international",
      title: "International applicability",
      body: [
        "This warranty is valid worldwide. It does not affect statutory consumer rights under applicable local laws, which may vary by jurisdiction.",
        "Aria Noir reserves the right to modify, suspend, or discontinue warranty terms at its discretion, without affecting warranties already issued.",
      ],
    },
  ],
};

export const shipping: Policy = {
  slug: "shipping",
  eyebrow: "Client",
  title: "Shipping",
  updated: UPDATED,
  sections: [
    {
      id: "processing",
      title: "Processing",
      body: [
        "Each Aria Noir piece is handcrafted and packed with intention. Orders are typically processed within 2–3 business days.",
      ],
    },
    {
      id: "united-states",
      title: "United States",
      body: [
        "Standard shipping arrives in 2–5 business days. Expedited options are available at checkout.",
      ],
    },
    {
      id: "international",
      title: "International",
      body: [
        "We ship to select countries worldwide, with free worldwide standard shipping arriving in 4–10 business days. Tracking is provided on dispatch.",
      ],
    },
    {
      id: "damages",
      title: "Damages and lost parcels",
      body: [
        "If your order arrives damaged or does not arrive at all, notify us within 48 hours of delivery or estimated arrival at support@arianoir.com. We will work with you to resolve it.",
      ],
    },
  ],
};

export const returns: Policy = {
  slug: "returns",
  eyebrow: "Client",
  title: "Returns",
  updated: UPDATED,
  sections: [
    {
      id: "window",
      title: "The window",
      body: [
        "We accept returns within 14 days of delivery, for store credit or exchange only. Items must be unworn, unwashed, and returned in their original packaging with tags intact.",
        "We reserve the right to refuse returns that do not meet these standards.",
      ],
    },
    {
      id: "how",
      title: "How to start a return",
      body: [
        [
          "Email returns@arianoir.com with your order number and reason for return, attaching photographs if the item arrived damaged or defective",
          "Wait for approval — we will send return instructions and the address to ship to",
          "Repackage the frames in their original case and pouch, including all accessories and tags",
          "Ship to the address in your approval email, using a trackable service",
        ],
      ],
    },
    {
      id: "refunds",
      title: "Refunds",
      body: [
        "Once your return is received and inspected, we issue your refund within 5–10 business days.",
        "If something is not sitting right on the face, a return may not be the answer — most fit complaints are an adjustment. Write to support@arianoir.com before you ship anything back.",
      ],
    },
  ],
};

export const privacy: Policy = {
  slug: "privacy",
  eyebrow: "Legal",
  title: "Privacy Policy",
  updated: UPDATED,
  sections: [
    {
      id: "collect",
      title: "What we collect",
      body: [
        "We honor your privacy like we honor our craft — with dignity and discretion. We may collect:",
        [
          "Name, email, and phone number",
          "Billing and shipping information",
          "Purchase history and product preferences",
          "Device information and browser data",
        ],
        "This is collected via order forms, newsletter signups, cookies, and third-party analytics platforms.",
      ],
    },
    {
      id: "use",
      title: "How we use it",
      body: [
        [
          "To process transactions and deliver products",
          "To personalize your experience",
          "To communicate with you about orders, launches, or news",
          "To comply with legal obligations",
        ],
        "We do not sell your information. Any third parties involved — payment gateways, couriers — are strictly for fulfillment purposes.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      body: [
        "Our site uses cookies to enhance the experience and understand how the site is used. You may disable cookies in your browser settings, though parts of the site may stop working.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      body: [
        "You may request to view, correct, or delete your data by contacting admin@arianoir.com. We comply with GDPR, CCPA, and other international privacy standards.",
      ],
    },
  ],
};

export const terms: Policy = {
  slug: "terms",
  eyebrow: "Legal",
  title: "Terms of Service",
  updated: UPDATED,
  sections: [
    {
      id: "agreement",
      title: "The agreement",
      body: [
        "This website is operated by Aria Noir. Throughout the site, the terms “we,” “us,” and “our” refer to Aria Noir. We offer this site and its contents — including products, tools, and services — conditioned upon your acceptance of all terms, conditions, and notices stated here.",
        "By engaging with our site, whether browsing or making a purchase, you agree to be bound by these Terms of Service, including additional terms and policies referenced herein. They apply to all users, including vendors, customers, browsers, affiliates, and contributors. If you do not agree, you may not use the site.",
      ],
    },
    {
      id: "changes",
      title: "Changes to the service",
      body: [
        "We may update, modify, or replace any part of these Terms at any time by posting updates on this page. Continued use of the website following changes constitutes acceptance.",
      ],
    },
    {
      id: "accuracy",
      title: "Accuracy and completeness",
      body: [
        "We are not responsible if information on this site is inaccurate, incomplete, or not current. The material here is provided for general information only, and any reliance on it is at your own discretion.",
      ],
    },
    {
      id: "availability",
      title: "Availability and pricing",
      body: [
        "Our products are available in limited quantities and are subject to return or exchange according to our Returns policy. We reserve the right to limit sales to any person, geographic region, or jurisdiction.",
        "Prices are subject to change without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of products or pricing.",
      ],
    },
    {
      id: "third-party",
      title: "Third-party tools and links",
      body: [
        "We may provide access to third-party tools we neither monitor nor control. Use of such tools is at your own risk, and certain content may include third-party materials not affiliated with Aria Noir.",
      ],
    },
    {
      id: "prohibited",
      title: "Prohibited uses",
      body: [
        "You may not use the site or its content to:",
        [
          "Violate any laws or regulations",
          "Infringe upon our intellectual property",
          "Submit false or misleading information",
          "Upload malicious code or spyware",
          "Spam, phish, or scrape data",
        ],
        "Violation of any of these may result in termination of your access to our services.",
      ],
    },
  ],
};

export const policies: readonly Policy[] = [
  warranty,
  shipping,
  returns,
  privacy,
  terms,
];
