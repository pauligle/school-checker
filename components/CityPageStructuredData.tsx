interface CityPageStructuredDataProps {
  cityName: string;
  citySlug: string;
}

export default function CityPageStructuredData({ cityName, citySlug }: CityPageStructuredDataProps) {
  // Organization Schema for SchoolChecker.io
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolChecker.io",
    "url": "https://schoolchecker.io",
    "logo": "https://schoolchecker.io/api/og?title=Schools%20in%20" + encodeURIComponent(cityName) + "&location=" + encodeURIComponent(cityName) + "&rating=Best%20Schools",
    "description": "The UK's only 100% free school finder, helping parents discover the best schools with Ofsted ratings, performance data, and catchment areas.",
    "sameAs": [
      "https://twitter.com/schoolcheckerio"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@schoolchecker.io",
      "contactType": "customer service"
    }
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
        "name": "Schools",
        "item": "https://schoolchecker.io/schools-near-me"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Schools in ${cityName}`,
        "item": `https://schoolchecker.io/${citySlug}`
      }
    ]
  };

  // FAQ Schema for city pages
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What are the best schools in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can find the best schools in ${cityName} using our free school finder. We provide detailed Ofsted ratings, performance data, and school information to help you make informed decisions about your child's education.`
        }
      },
      {
        "@type": "Question",
        "name": `How many schools are there in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${cityName} has numerous primary and secondary schools. Use our interactive map and search tools to explore all available schools in the area with their ratings and detailed information.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I find schools near me in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Use our "Schools Near Me" feature to find schools in your local area within ${cityName}. You can search by postcode, use the interactive map, or browse by school type and ratings.`
        }
      },
      {
        "@type": "Question",
        "name": `What school types are available in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${cityName} offers a variety of school types including primary schools, secondary schools, academies, grammar schools, and independent schools. Use our filters to find the specific type of school you're looking for.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I compare schools in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our platform allows you to compare schools in ${cityName} by Ofsted ratings, performance data, pupil numbers, and other key metrics. All information is free and comes from official government sources.`
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
