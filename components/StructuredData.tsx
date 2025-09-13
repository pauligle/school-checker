// Define types locally to match the actual interfaces
interface SchoolData {
  urn: string;
  establishmentname: string;
  slug: string;
  lat: number;
  lon: number;
  typeofestablishment__name_: string;
  phaseofeducation__name_: string;
  la__name_: string;
  numberofpupils: number;
  numberofboys: number;
  numberofgirls: number;
  gender__name_: string;
  age_range: string;
  schoolcapacity: number;
  address: string;
  postcode: string;
  telephonenum: string;
  schoolwebsite: string;
  headtitle__name_: string;
  headfirstname: string;
  headlastname: string;
  trusts__name_: string;
  trusts__code_: string;
  street: string;
  town: string;
  statutorylowage: number;
  statutoryhighage: number;
  religiouscharacter__name_: string;
  nurseryprovision__name_: string;
  pupils_202425: number;
}

interface InspectionData {
  id: string;
  inspection_date: string;
  outcome: number;
  previous_outcome: number;
  quality_of_education: number;
  behaviour_and_attitudes: number;
  personal_development: number;
  effectiveness_of_leadership: number;
  inspection_type: string;
  inspector_name: string;
}

interface StructuredDataProps {
  school: SchoolData;
  inspection?: InspectionData | null;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function StructuredData({ school, inspection, breadcrumbs }: StructuredDataProps) {
  // Organization Schema for SchoolChecker.io
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolChecker.io",
    "url": "https://schoolchecker.io",
    "logo": "https://schoolchecker.io/logo.png",
    "description": "The only 100% free school checker in the UK. Find and compare schools with Ofsted ratings, performance data, and detailed school information.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+44-xxx-xxx-xxxx",
      "contactType": "customer service",
      "email": "info@schoolchecker.io"
    }
  };

  // Educational Organization Schema for the school
  const educationalOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": school.establishmentname,
    "url": `https://schoolchecker.io/school/${school.slug}`,
    "description": `Complete school information for ${school.establishmentname} including Ofsted ratings, performance data, pupil demographics, and more.`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": school.street,
      "addressLocality": school.town,
      "addressRegion": school.la__name_,
      "postalCode": school.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": school.lat,
      "longitude": school.lon
    },
    "telephone": school.telephonenum || undefined,
    "website": school.schoolwebsite || undefined,
    "educationalLevel": school.phaseofeducation__name_,
    "schoolType": school.typeofestablishment__name_,
    "hasCredential": inspection ? {
      "@type": "EducationalOccupationalCredential",
      "name": "Ofsted Rating",
      "credentialCategory": inspection.outcome === 1 ? "Outstanding" : 
                          inspection.outcome === 2 ? "Good" : 
                          inspection.outcome === 3 ? "Requires Improvement" : 
                          inspection.outcome === 4 ? "Inadequate" : "Not Rated",
      "recognizedBy": {
        "@type": "Organization",
        "name": "Ofsted",
        "url": "https://www.gov.uk/government/organisations/ofsted"
      }
    } : undefined
  };

  // Local Business Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": school.establishmentname,
    "image": `https://schoolchecker.io/api/og?title=${encodeURIComponent(school.establishmentname)}&location=${encodeURIComponent(school.la__name_)}&rating=School`,
    "description": `School information for ${school.establishmentname} in ${school.la__name_}, ${school.postcode}. View Ofsted ratings, performance data, and detailed school information.`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": school.street,
      "addressLocality": school.town,
      "addressRegion": school.la__name_,
      "postalCode": school.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": school.lat,
      "longitude": school.lon
    },
    "telephone": school.telephonenum || undefined,
    "website": school.schoolwebsite || undefined,
    "openingHours": "Mo-Fr 08:00-16:00",
    "priceRange": "Free"
  };

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the Ofsted rating for ${school.establishmentname}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": inspection ? 
            `The school has an Ofsted rating of ${inspection.outcome === 1 ? 'Outstanding' : inspection.outcome === 2 ? 'Good' : inspection.outcome === 3 ? 'Requires Improvement' : inspection.outcome === 4 ? 'Inadequate' : 'Not Available'}.` :
            "No recent Ofsted inspection data is available for this school."
        }
      },
      {
        "@type": "Question",
        "name": `What type of school is ${school.establishmentname}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${school.establishmentname} is a ${school.phaseofeducation__name_.toLowerCase()} school in ${school.la__name_}.`
        }
      },
      {
        "@type": "Question",
        "name": `How many pupils attend ${school.establishmentname}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${school.establishmentname} has approximately ${school.pupils_202425 || school.numberofpupils || 'unknown number of'} pupils.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrganizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
