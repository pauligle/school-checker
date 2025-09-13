export default function HomepageStructuredData() {
  // Organization Schema for SchoolChecker.io
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolChecker.io",
    "url": "https://schoolchecker.io",
    "logo": "https://schoolchecker.io/api/og?title=SchoolChecker.io&location=UK&rating=Free",
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
      "name": "Pavlos Inglesis"
    }
  };

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SchoolChecker.io",
    "url": "https://schoolchecker.io",
    "description": "The UK's only 100% free school finder, helping parents discover the best schools with Ofsted ratings, performance data, and catchment areas.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://schoolchecker.io/schools-near-me?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SchoolChecker.io",
      "url": "https://schoolchecker.io"
    }
  };

  // FAQ Schema for homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is SchoolChecker.io really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SchoolChecker.io is 100% free forever. There are no paywalls, subscriptions, or hidden fees. We believe school information should be accessible to all parents."
        }
      },
      {
        "@type": "Question",
        "name": "How do you calculate school ratings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use official Ofsted data and government statistics to calculate fair, comparable ratings for schools. When Ofsted ratings aren't available, we provide calculated ratings based on performance data and other official metrics."
        }
      },
      {
        "@type": "Question",
        "name": "What data sources do you use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All our data comes from official UK government sources including the Department for Education, Ofsted, and School Workforce Census. We ensure accuracy and reliability by using only verified government data."
        }
      },
      {
        "@type": "Question",
        "name": "Can I find schools near my location?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can search for schools near your location, by city, or browse our interactive map to find schools in your area with detailed information about catchment areas and ratings."
        }
      },
      {
        "@type": "Question",
        "name": "How often is the data updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We regularly update our database with the latest government data to ensure you have access to the most current school information, Ofsted ratings, and performance data."
        }
      }
    ]
  };

  const allSchemas = [organizationSchema, websiteSchema, faqSchema];

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
