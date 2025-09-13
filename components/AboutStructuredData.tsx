export default function AboutStructuredData() {
  // Organization Schema for SchoolChecker.io
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolChecker.io",
    "url": "https://schoolchecker.io",
    "logo": "https://schoolchecker.io/api/og?title=About%20SchoolChecker.io&location=UK&rating=Free",
    "description": "The UK's only 100% free school finder, helping parents discover the best schools with Ofsted ratings, performance data, and catchment areas.",
    "sameAs": [
      "https://twitter.com/schoolcheckerio"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@schoolchecker.io",
      "contactType": "customer service"
    },
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Pavlos Inglesis",
      "description": "Parent and creator of SchoolChecker.io, committed to making school information accessible to all parents in the UK."
    },
    "mission": "To provide free, accessible school information to all parents in the UK, ensuring no one is excluded from finding the best education for their children due to paywalls or subscription fees."
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://schoolchecker.io"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": "https://schoolchecker.io/about"
      }
    ]
  };

  // FAQ Schema for About page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Who created SchoolChecker.io?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SchoolChecker.io was created by Pavlos Inglesis, a parent living in the UK with two daughters. He was frustrated by paywalls and subscription services that charged for accessing publicly available government data about schools."
        }
      },
      {
        "@type": "Question",
        "name": "Why is SchoolChecker.io free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We believe that school information should be accessible to all parents, regardless of their financial situation. There should be no class division in accessing information about your children's education. All data comes from official government sources and should be free to access."
        }
      },
      {
        "@type": "Question",
        "name": "What data sources do you use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use official UK government data from the Department for Education, Ofsted inspection reports, and the School Workforce Census. All data is publicly available and we simply present it in a more accessible and user-friendly format."
        }
      },
      {
        "@type": "Question",
        "name": "Will there ever be a paywall?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, there will never be a paywall or subscription required. We may add non-intrusive advertisements in the future to cover operational costs, but the core functionality will always remain free."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact you?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact us at info@schoolchecker.io with any questions, feedback, or suggestions. We'd love to hear from parents, teachers, and education professionals about how we can improve the service."
        }
      }
    ]
  };

  const allSchemas = [organizationSchema, breadcrumbSchema, faqSchema];

  return (
    <>
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
    </>
  );
}
