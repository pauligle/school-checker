export const metadata = {
  title: "About Us - SchoolChecker.io | The UK's Free School Finder",
  description: "Learn about SchoolChecker.io, the UK's only 100% free school finder. We help parents discover the best schools with Ofsted ratings, performance data, and catchment areas.",
  keywords: "about schoolchecker, school finder uk, free school search, ofsted data, school performance",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About SchoolChecker.io
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              The UK's only 100% free school finder, helping parents make informed decisions about their children's education.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Mission Section */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Story</h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-6">
              <p>
                Ok…so you are wondering what is this website and why it is 100% free.
              </p>
              <p>
                Are the data maybe wrong? Should I trust them?
              </p>
              <p>
                Well…let me explain what is this site and why it exists.
              </p>
              <p>
                My name is <strong>Pavlos Inglesis</strong>, I live in the UK and I have 2 daughters.
              </p>
              <p>
                A few years ago, I was researching schools for my daughters in the area that we live and I was always stumbling upon paywalls and data that are well kept behind subscription services and monthly payments.
              </p>
              <p>
                But…why?
              </p>
              <p>
                What would that mean for the way people try to find the best for their children? Why would someone pay to access data that are already available publicly from the UK Government?
              </p>
              <p>
                That was honestly extremely frustrating and it showed evidently that there is a clear class division onto who gets to educate their children or at least find what the good schools are in the UK.
              </p>
              <p>
                There are platforms and websites that want you to pay to basically see all the info that are available for free in the gov.uk website but are not really into a nice digestible format or experience.
              </p>
              <p>
                I am not a developer but I thought this info and utility must be 100%. Forever.
              </p>
              <p>
                Parents should be able to see quickly what are the best schools in their area and decide where their children should attend.
              </p>
              <p>
                Also, parents and carers should be able to find quickly if they can be accepted in a school or not and what is their possibility of getting accepted in a school.
              </p>
              <p>
                This is a project that I am planning to keep free forever.
              </p>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold text-green-800 mb-2">My Promise to You:</p>
                <ul className="space-y-2 text-green-700">
                  <li>• There will never be a paywall.</li>
                  <li>• There will never be a subscription.</li>
                  <li>• There are no trackers outside from basic anonymized Google Analytics as pretty much every website has.</li>
                  <li>• You will never be required to enter your email.</li>
                  <li>• I don't care to collect.</li>
                </ul>
              </div>
              <p>
                But…because there will be some added costs if this becomes too popular, there might be some ads in the future just to cover those costs. I will make sure these are never too intrusive or annoying.
              </p>
              <p>
                That's it.
              </p>
              <p>
                This is the very early stage of this project and I am looking to add even more information and data literally every day. This is still a working project.
              </p>
              <p>
                I am just a parent looking to find a good school for his children and I am sure you probably also belong to this category of wonderful people.
              </p>
              <p>
                If you have any questions, complaints or even proposals on what exactly are you looking to see on this website to help you decide what are the best schools in your area and where you child would attend please feel free to send an email to <strong>info@schoolchecker.io</strong>. I'd be glad to discuss anything!
              </p>
              <p className="text-center text-xl font-semibold text-gray-900 mt-8">
                Take care and keep on being an awesome parent!
              </p>
              <p className="text-center text-lg font-semibold text-blue-600">
                Pavlos Inglesis
              </p>
            </div>
          </section>


          {/* Data Sources Section */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Data Sources</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              All data comes directly from official government sources, ensuring accuracy and reliability:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="https://www.gov.uk/government/organisations/department-for-education" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">🏛️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Department for Education</h3>
                <p className="text-gray-700 text-sm">School performance data, pupil numbers, and characteristics</p>
              </a>
              <a 
                href="https://www.gov.uk/government/organisations/ofsted" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ofsted</h3>
                <p className="text-gray-700 text-sm">Inspection reports, ratings, and school quality assessments</p>
              </a>
              <a 
                href="https://www.gov.uk/government/collections/school-workforce-census" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">School Workforce Census</h3>
                <p className="text-gray-700 text-sm">Teacher data, pupil-to-teacher ratios, and staffing information</p>
              </a>
            </div>
          </section>



        </div>
      </div>
    </div>
  );
}
