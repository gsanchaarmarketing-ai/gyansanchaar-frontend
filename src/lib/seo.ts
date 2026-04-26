/**
 * Centralised SEO helpers.
 * All structured data (JSON-LD) schemas live here.
 */

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gyansanchaar.com'

// ── WebSite + SearchAction (enables Google Sitelinks Searchbox) ────────────
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GyanSanchaar',
    url: BASE,
    description: 'Find colleges and courses across India. Apply directly — no agents, no fees.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/colleges?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ── Organization (brand knowledge panel) ──────────────────────────────────
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GyanSanchaar',
    url: BASE,
    logo: `${BASE}/logo.png`,
    description: 'College discovery and application platform for students in Northeast India.',
    foundingLocation: { '@type': 'Place', name: 'Guwahati, Assam, India' },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'founders@gyansanchaar.com',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Assamese'],
    },
    sameAs: [
      'https://twitter.com/gyansanchaar',
      'https://www.linkedin.com/company/gyansanchaar',
      'https://www.facebook.com/gyansanchaar',
    ],
  }
}

// ── BreadcrumbList ────────────────────────────────────────────────────────
export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url.startsWith('http') ? c.url : `${BASE}${c.url}`,
    })),
  }
}

// ── FAQPage ───────────────────────────────────────────────────────────────
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

// ── EducationalOrganization (college page) ────────────────────────────────
export function collegeSchema(college: {
  name: string; slug: string; city: string; state?: { name: string };
  website?: string; logo_path?: string; nirf_rank?: number; naac_grade?: string;
  about?: string; contact_email?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: college.name,
    url: college.website ?? `${BASE}/colleges/${college.slug}`,
    sameAs: college.website ? [`${BASE}/colleges/${college.slug}`, college.website] : [`${BASE}/colleges/${college.slug}`],
    ...(college.logo_path ? { logo: college.logo_path } : {}),
    description: college.about ?? `${college.name} in ${college.city}, India.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city,
      addressRegion: college.state?.name ?? '',
      addressCountry: 'IN',
    },
    ...(college.contact_email ? { email: college.contact_email } : {}),
  }
}

// ── Course schema ─────────────────────────────────────────────────────────
export function courseSchema(course: {
  name: string; slug: string; description?: string;
  duration_months: number; default_fee?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    url: `${BASE}/courses/${course.slug}`,
    description: course.description ?? course.name,
    timeRequired: `P${course.duration_months}M`,
    provider: { '@type': 'Organization', name: 'GyanSanchaar', sameAs: BASE },
    ...(course.default_fee ? { offers: { '@type': 'Offer', price: course.default_fee, priceCurrency: 'INR' } } : {}),
  }
}

// ── Article schema ────────────────────────────────────────────────────────
export function articleSchema(article: {
  title: string; slug: string; excerpt?: string;
  published_at?: string; updated_at?: string; cover_image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    url: `${BASE}/articles/${article.slug}`,
    ...(article.cover_image ? { image: article.cover_image } : {}),
    description: article.excerpt ?? article.title,
    datePublished: article.published_at ?? '',
    dateModified: article.updated_at ?? article.published_at ?? '',
    author: { '@type': 'Organization', name: 'GyanSanchaar', url: BASE },
    publisher: {
      '@type': 'Organization', name: 'GyanSanchaar', url: BASE,
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
    },
  }
}

// ── HowTo (for "How It Works" AEO) ────────────────────────────────────────
export function howItWorksSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to apply to a college through GyanSanchaar',
    description: 'Apply to colleges across India for free using GyanSanchaar in 4 simple steps.',
    totalTime: 'PT10M',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Discover', text: 'Tell us your stream, marks and budget. We surface the best-fit colleges for your profile.' },
      { '@type': 'HowToStep', position: 2, name: 'Apply', text: 'One form. Multiple colleges. Your application goes straight to the admissions office.' },
      { '@type': 'HowToStep', position: 3, name: 'Book Counselling', text: 'Get connected with the college\'s assigned counsellor — no commissions, ever.' },
      { '@type': 'HowToStep', position: 4, name: 'Get Admitted', text: 'We stay with you through offer letters, document verification and enrolment.' },
    ],
  }
}
