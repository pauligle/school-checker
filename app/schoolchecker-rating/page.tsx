import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Schoolchecker.io Rating Explained | How School Ratings are calculated when there is no Ofsted Report and Why',
  description: 'Learn how school ratings are calculated using Ofsted data. Understand why calculated ratings are provided and how they help parents compare schools fairly.',
  keywords: 'schoolchecker rating, school rating calculation, Ofsted rating, school comparison, education data, school performance',
};

export default function SchoolcheckerRatingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Schoolchecker.io Rating Explained
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              How fair, comparable school ratings are calculated using official Ofsted data
            </p>
          </div>

          {/* The Problem Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-red-600 rounded"></span>
              The Problem: Ofsted&apos;s System Change
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Before September 2024</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <p className="text-gray-700">Schools received an <strong>overall effectiveness rating</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <p className="text-gray-700">Easy to compare schools with a single rating</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <p className="text-gray-700">Clear: Outstanding, Good, Requires Improvement, or Inadequate</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">After September 2024</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✗</span>
                    <p className="text-gray-700">No more <strong>overall effectiveness rating</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✗</span>
                    <p className="text-gray-700">Only individual category judgments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 text-xl">✗</span>
                    <p className="text-gray-700">Difficult to compare schools fairly</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-gray-800">
                <strong>The Result:</strong> Parents can no longer easily compare schools. Some schools have old overall ratings, 
                others only have individual category scores.                  How do you compare a &quot;Good&quot; school with a school that has 
                 &quot;Good&quot; in 3 categories but &quot;Outstanding&quot; in 1?
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-gray-800">
                 <strong>What&apos;s Next:</strong> From September 2025, Ofsted will introduce further changes with a new &apos;Report Card&apos; system
                as part of their inspection process. This will bring additional changes to how school performance is assessed and reported.
                <a href="https://www.gov.uk/government/news/single-headline-ofsted-grades-scrapped-in-landmark-school-reform" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-800 underline ml-1">
                  (Source: Ofsted announcement)
                </a>
              </p>
            </div>
          </div>

          {/* The Solution Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-blue-600 rounded"></span>
              The Solution: Schoolchecker.io Rating
            </h2>
            
            <p className="text-lg text-gray-700 mb-6">
               A <strong>weighted average</strong> is calculated using Ofsted&apos;s own historical methodology to create
              a single, comparable rating for every school. This allows schools to be compared at a glance using 
              data from <a href="https://www.gov.uk/government/collections/ofsted-inspections-of-schools" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 underline">Ofsted inspections</a>, 
              even when no overall effectiveness judgement exists.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">How It Is Calculated</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-blue-200">
                  <span className="font-medium text-blue-900">Quality of Education</span>
                  <span className="text-blue-700 font-bold">40% weight</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-blue-200">
                  <span className="font-medium text-blue-900">Leadership & Management</span>
                  <span className="text-blue-700 font-bold">30% weight</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-blue-200">
                  <span className="font-medium text-blue-900">Behaviour & Attitudes</span>
                  <span className="text-blue-700 font-bold">20% weight</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-blue-900">Personal Development</span>
                  <span className="text-blue-700 font-bold">10% weight</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">For Pre-September 2024 Schools</h4>
                <p className="text-gray-700">
                  The official Ofsted overall effectiveness rating is used when available, 
                  as this is the most accurate representation of the school&apos;s performance.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">For Post-September 2024 Schools</h4>
                <p className="text-gray-700">
                  When no overall judgement exists but category judgements are available (such as quality of education, 
                  personal development, etc.), the weighted average is calculated from these individual category judgments 
                  using <a href="https://www.gov.uk/government/news/ofsted-publishes-updates-to-school-inspection-handbooks" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 underline">Ofsted&apos;s historical weighting system</a>.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-gray-800">
                <strong>Important:</strong> The &apos;Schoolchecker.io Rating&apos; is not an official Ofsted rating! 
                It is a calculated rating based on Ofsted&apos;s own historical methodology to enable fair comparison 
                between schools when official overall ratings are not available.
              </p>
            </div>
          </div>

          {/* Why These Weights Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-green-600 rounded"></span>
              Why These Weights?
            </h2>
            
            <p className="text-lg text-gray-700 mb-6">
              The weighting system is based on <a href="https://www.gov.uk/government/news/ofsted-publishes-updates-to-school-inspection-handbooks" 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-blue-600 hover:text-blue-800 underline">Ofsted&apos;s own historical approach</a> 
              before they changed their system. This ensures consistency and fairness.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center">
                  40%
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality of Education</h4>
                  <p className="text-gray-700">
                    The most important factor - what children actually learn and how well they&apos;re taught. 
                    This directly impacts pupil outcomes and future success.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center">
                  30%
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Leadership & Management</h4>
                  <p className="text-gray-700">
                    Strong leadership drives school improvement and ensures high standards are maintained. 
                    Good management creates the conditions for excellent teaching.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center">
                  20%
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Behaviour & Attitudes</h4>
                  <p className="text-gray-700">
                    Positive behavior and attitudes create a safe, productive learning environment 
                    where all pupils can thrive and achieve their potential.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center">
                  10%
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Personal Development</h4>
                  <p className="text-gray-700">
                    Supporting pupils&apos; personal development, wellbeing, and character development 
                    helps them become well-rounded individuals ready for life beyond school.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-purple-600 rounded"></span>
              Why This Matters
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Parents</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Compare any school with any other school fairly</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Get a single, easy-to-understand rating</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Make informed decisions about your child&apos;s education</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Understand school performance at a glance</p>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Schools</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Fair comparison regardless of inspection date</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Uses official Ofsted data and methodology</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Transparent calculation process</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <p className="text-gray-700">Consistent with Ofsted&apos;s historical approach</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transparency Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-orange-600 rounded"></span>
              Transparency & Accuracy
            </h2>
            
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Always Transparent</h3>
                <ul className="space-y-2 text-orange-800">
                  <li>• Calculated ratings are clearly marked as "Schoolchecker.io Rating"</li>
                  <li>• "(calculated)" is shown when using the weighted system</li>
                  <li>• "Official Ofsted Rating" is displayed when using their data</li>
                  <li>• The methodology is explained openly and honestly</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Sources</h3>
                <p className="text-blue-800 mb-3">
                  All calculations are based on official <a href="https://www.gov.uk/government/collections/ofsted-inspections-of-schools" 
                                                           target="_blank" 
                                                           rel="noopener noreferrer" 
                                                           className="text-blue-600 hover:text-blue-800 underline">Ofsted inspection data</a>, 
                  ensuring accuracy and reliability.
                </p>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Inspection data from <a href="https://www.gov.uk/government/collections/ofsted-inspections-of-schools" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:text-blue-800 underline">Ofsted&apos;s official database</a></li>
                  <li>• Category judgments from latest inspections</li>
                  <li>• Historical overall ratings where available</li>
                  <li>• School data from <a href="https://www.gov.uk/government/collections/statistics-school-and-pupil-numbers" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 underline">Department for Education</a></li>
                  <li>• Updated regularly as new inspections are published</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Future Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-indigo-600 rounded"></span>
              Looking Ahead
            </h2>
            
            <p className="text-lg text-gray-700 mb-6">
              <a href="https://www.gov.uk/government/news/single-headline-ofsted-grades-scrapped-in-landmark-school-reform" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800 underline">Ofsted&apos;s plans for their new &quot;Report Card&quot; system</a> 
              are being monitored. When this is introduced in September 2025, 
              the approach will be reviewed and adapted to ensure the most helpful and accurate 
              school ratings continue to be provided for parents.
            </p>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Commitment</h3>
              <p className="text-indigo-800">
                The methodology will always be adapted to provide the most useful, accurate, and fair 
                school ratings possible, using official data and transparent methods. Once there is clarity 
                on the new &apos;Report Card&apos; system, the approach will be further refined to ensure continued 
                accuracy and usefulness.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="bg-gray-900 text-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Compare Schools?</h2>
              <p className="text-gray-300 mb-6">
                Use the free school finder to discover schools in your area and compare them using the fair, transparent rating system.
              </p>
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Find Schools Near Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
