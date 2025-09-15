import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Primary School KS2 Rankings - SchoolChecker.io',
  description: 'Learn how SchoolChecker.io calculates primary school rankings using Reading, Writing & Maths performance data. See real examples and ranking methodology.',
  keywords: 'school rankings, primary school performance, RWM ranking, school comparison methodology, KS2 results ranking',
  alternates: {
    canonical: 'https://schoolchecker.io/how-school-rankings-work',
  },
  openGraph: {
    title: 'Primary School KS2 Rankings - SchoolChecker.io',
    description: 'Learn how SchoolChecker.io calculates primary school rankings using Reading, Writing & Maths performance data.',
    url: 'https://schoolchecker.io/how-school-rankings-work',
    siteName: 'SchoolChecker.io',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function HowSchoolRankingsWork() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-4xl">
            <nav className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-200">Primary School KS2 Rankings</span>
              </div>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Primary School KS2 Rankings</h1>
            <p className="text-lg text-gray-300">
              Understanding how SchoolChecker.io calculates primary school rankings using official Key Stage 2 performance data
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schoolchecker.io Ranking Methodology</h2>
            <p className="text-gray-700 mb-4">
              SchoolChecker.io ranks primary schools using a comprehensive methodology based on official Key Stage 2 (KS2) 
              performance data published by the Department for Education. The ranking system follows industry best practices 
              to ensure fair and accurate comparisons.
            </p>
            <p className="text-gray-700">
              Rankings are calculated annually for each academic year and are based on the percentage of pupils meeting 
              the expected standard in Reading, Writing & Maths (RWM) assessments.
            </p>
          </div>

          {/* Ranking Criteria */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ranking Criteria (In Order of Priority)</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Reading, Writing & Maths Expected Percentage</h3>
                <p className="text-gray-700 mb-2">
                  The primary ranking factor is the percentage of pupils meeting the expected standard in all three subjects combined.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Higher percentages rank higher.</strong> This is the most important factor as it represents overall academic achievement.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Reading, Writing & Maths Higher Percentage</h3>
                <p className="text-gray-700 mb-2">
                  When schools have identical expected percentages, the percentage achieving at a higher standard is compared.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Higher percentages rank higher.</strong> This rewards schools that excel beyond the expected standard.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Gap Between Expected and Higher</h3>
                <p className="text-gray-700 mb-2">
                  When both expected and higher percentages are identical, the consistency gap is examined.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Smaller gaps rank higher.</strong> This rewards schools with more consistent performance across all ability levels.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. GPS Expected Percentage</h3>
                <p className="text-gray-700 mb-2">
                  When schools are tied on all RWM criteria, GPS (Grammar, Punctuation & Spelling) expected percentage is compared.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Higher GPS percentages rank higher.</strong> This provides a meaningful academic tie-breaker based on literacy performance.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5. GPS Higher Standard Percentage</h3>
                <p className="text-gray-700 mb-2">
                  When schools are tied on all previous criteria, GPS higher standard percentage is compared for extra accuracy.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Higher GPS higher percentages rank higher.</strong> This final criterion ensures maximum precision in ranking schools with very similar performance.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tied Schools</h3>
                <p className="text-gray-700 text-sm">
                  Schools with identical performance across all five criteria are considered tied and receive the same ranking position.
                </p>
              </div>
            </div>
          </div>

          {/* Real Examples */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Real School Examples (2024 Data)</h2>
            
            <div className="space-y-8">
              {/* Example 1 - Top School */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Example 1: High-Performing School</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Link href="/school/mossbourne-riverside-academy-140426" className="text-blue-600 hover:text-blue-800 hover:underline">
                        Mossbourne Riverside Academy
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">URN: 140426 | Hackney, London</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">RWM Expected:</span>
                        <span className="font-semibold text-green-700">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">RWM Higher:</span>
                        <span className="font-semibold text-green-700">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Gap:</span>
                        <span className="font-semibold text-green-700">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GPS Expected:</span>
                        <span className="font-semibold text-green-700">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GPS Higher:</span>
                        <span className="font-semibold text-green-700">47%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ranking Calculation</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Primary Factor:</strong> 75% RWM Expected (excellent)</p>
                      <p><strong>Secondary Factor:</strong> 25% RWM Higher (very good)</p>
                      <p><strong>Tertiary Factor:</strong> 50% gap (reasonable consistency)</p>
                      <p><strong>Quaternary Factor:</strong> 78% GPS Expected (excellent)</p>
                      <p><strong>Quinary Factor:</strong> 47% GPS Higher (excellent)</p>
                      <p className="mt-3 p-2 bg-green-100 rounded">
                        <strong>Result:</strong> This school ranks very highly due to strong performance in both expected and higher standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 2 - Average School */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Example 2: Average-Performing School</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Link href="/school/abraham-moss-community-school-150009" className="text-blue-600 hover:text-blue-800 hover:underline">
                        Abraham Moss Community School
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">URN: 150009 | Manchester</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">RWM Expected:</span>
                        <span className="font-semibold text-blue-700">54%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">RWM Higher:</span>
                        <span className="font-semibold text-blue-700">7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Gap:</span>
                        <span className="font-semibold text-blue-700">47%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GPS Expected:</span>
                        <span className="font-semibold text-blue-700">66%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">GPS Higher:</span>
                        <span className="font-semibold text-blue-700">27%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ranking Calculation</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Primary Factor:</strong> 54% RWM Expected (below average)</p>
                      <p><strong>Secondary Factor:</strong> 7% RWM Higher (low)</p>
                      <p><strong>Tertiary Factor:</strong> 47% gap (large gap indicates inconsistency)</p>
                      <p><strong>Quaternary Factor:</strong> 66% GPS Expected (average)</p>
                      <p><strong>Quinary Factor:</strong> 27% GPS Higher (below average)</p>
                      <p className="mt-3 p-2 bg-blue-100 rounded">
                        <strong>Result:</strong> This school ranks lower due to below-average performance in both expected and higher standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 3 - Comparison */}
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">Example 3: Ranking Comparison</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Let's compare two schools with similar expected percentages to see how tie-breaking works:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School A</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>75%</strong></p>
                        <p>RWM Higher: <strong>25%</strong></p>
                        <p>Gap: <strong>50%</strong></p>
                        <p>GPS Expected: <strong>78%</strong></p>
                        <p>GPS Higher: <strong>35%</strong></p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School B</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>75%</strong></p>
                        <p>RWM Higher: <strong>25%</strong></p>
                        <p>Gap: <strong>50%</strong></p>
                        <p>GPS Expected: <strong>78%</strong></p>
                        <p>GPS Higher: <strong>40%</strong></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-gray-900 mb-2">Ranking Decision</h4>
                    <div className="text-sm space-y-1">
                      <p>1. Both have 75% RWM Expected → <strong>Tie</strong></p>
                      <p>2. Both have 25% RWM Higher → <strong>Tie</strong></p>
                      <p>3. Both have 50% Gap → <strong>Tie</strong></p>
                      <p>4. Both have 78% GPS Expected → <strong>Tie</strong></p>
                      <p>5. School B has 40% vs School A's 35% GPS Higher → <strong>School B wins</strong></p>
                      <p className="mt-2 p-2 bg-purple-100 rounded">
                        <strong>Result:</strong> School B ranks higher due to better GPS higher standard performance, despite being tied on all other criteria.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 4 - Early Differentiation */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50 mt-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Example 4: Early Differentiation</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Schools with different expected percentages are ranked immediately by the primary criterion:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School C</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>85%</strong></p>
                        <p>RWM Higher: <strong>15%</strong></p>
                        <p>Gap: <strong>70%</strong></p>
                        <p>GPS Expected: <strong>72%</strong></p>
                        <p>GPS Higher: <strong>28%</strong></p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School D</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>78%</strong></p>
                        <p>RWM Higher: <strong>30%</strong></p>
                        <p>Gap: <strong>48%</strong></p>
                        <p>GPS Expected: <strong>85%</strong></p>
                        <p>GPS Higher: <strong>45%</strong></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-gray-900 mb-2">Ranking Decision</h4>
                    <div className="text-sm space-y-1">
                      <p>1. School C has 85% vs School D's 78% RWM Expected → <strong>School C wins</strong></p>
                      <p className="mt-2 p-2 bg-green-100 rounded">
                        <strong>Result:</strong> School C ranks higher due to superior RWM expected performance, despite School D's better performance in other areas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 5 - GPS Tie-Breaking */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50 mt-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Example 5: GPS Tie-Breaking</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Schools tied on RWM criteria are differentiated by GPS performance:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School E</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>68%</strong></p>
                        <p>RWM Higher: <strong>18%</strong></p>
                        <p>Gap: <strong>50%</strong></p>
                        <p>GPS Expected: <strong>82%</strong></p>
                        <p>GPS Higher: <strong>32%</strong></p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">School F</h4>
                      <div className="space-y-1 text-sm">
                        <p>RWM Expected: <strong>68%</strong></p>
                        <p>RWM Higher: <strong>18%</strong></p>
                        <p>Gap: <strong>50%</strong></p>
                        <p>GPS Expected: <strong>75%</strong></p>
                        <p>GPS Higher: <strong>38%</strong></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-gray-900 mb-2">Ranking Decision</h4>
                    <div className="text-sm space-y-1">
                      <p>1. Both have 68% RWM Expected → <strong>Tie</strong></p>
                      <p>2. Both have 18% RWM Higher → <strong>Tie</strong></p>
                      <p>3. Both have 50% Gap → <strong>Tie</strong></p>
                      <p>4. School E has 82% vs School F's 75% GPS Expected → <strong>School E wins</strong></p>
                      <p className="mt-2 p-2 bg-blue-100 rounded">
                        <strong>Result:</strong> School E ranks higher due to better GPS expected performance, despite School F's superior GPS higher percentage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Percentile Calculation */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Percentile Calculation</h2>
            <p className="text-gray-700 mb-4">
              Once schools are ranked, percentiles are calculated to show how each school compares to all others:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <code className="text-sm text-gray-800">
                Percentile = ((Total Schools - Rank + 1) / Total Schools) × 100
              </code>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">Rank 1,438 out of 15,074 schools</span>
                <span className="font-semibold text-green-700">Top 10%</span>
              </div>
              <div className="text-sm text-gray-600 ml-4">
                Calculation: ((15,074 - 1,438 + 1) / 15,074) × 100 = 90.5% → "Top 10%"
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources & Updates</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Official Data Sources</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Department for Education (DfE) Key Stage 2 performance data</li>
                  <li>Official school information from EduBase</li>
                  <li>Annual updates following DfE publication schedule</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ranking Updates</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Rankings are recalculated annually when new KS2 data is published</li>
                  <li>Historical rankings are preserved for comparison across years</li>
                  <li>Schools are ranked within their respective academic years</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Limitations</h2>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Rankings vs. Progress</h3>
                <p className="text-amber-700 text-sm">
                  Rankings show <strong>achievement levels</strong> (how high pupils finish), not <strong>progress</strong> 
                  (how much they improve). A school with excellent rankings may not necessarily add the most value to pupils' education.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Context Matters</h3>
                <p className="text-blue-700 text-sm">
                  Rankings don't account for factors like pupil demographics, special educational needs, 
                  or socio-economic challenges that may affect performance.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-semibold text-green-800 mb-2">Use Rankings Wisely</h3>
                <p className="text-green-700 text-sm">
                  Rankings are one tool among many for school comparison. Consider Ofsted reports, 
                  school visits, and other factors when making educational decisions.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-600 text-white rounded-lg p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore School Rankings</h2>
            <p className="text-blue-100 mb-6">
              Now that you understand how rankings work, explore schools in your area and see their performance data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/best-primary-schools-england" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View All Schools
              </Link>
              <Link 
                href="/schools-near-me" 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                Schools Near Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
