'use client'

import ClientSchoolsMap from '@/components/ClientSchoolsMap';
import PrimaryResultsCard from '@/components/PrimaryResultsCard';
import AdmissionsCard from '@/components/AdmissionsCard';
import OfstedParentViewCard from '@/components/OfstedParentViewCard';
import GCSEResultsCard from '@/components/GCSEResultsCard';
import GCSEResultsMultiYearCard from '@/components/GCSEResultsMultiYearCard';

interface SchoolPageClientProps {
  school: any;
  gcseData: any;
  gcseMultiYearData: any;
  parentViewData: any;
}

export default function SchoolPageClient({ school, gcseData, gcseMultiYearData, parentViewData }: SchoolPageClientProps) {
  return (
    <>
      {/* School Location Map */}
      <div className="bg-gray-50 py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">School Location</h2>
              <a 
                href={`/?school=${school.urn}`} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg text-sm md:text-base"
              >
                <span>🗺️</span>
                View on Main Map
              </a>
            </div>
            <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <ClientSchoolsMap 
                center={school.lat && school.lon ? [school.lat, school.lon] : [51.5074, -0.1278]} 
                zoom={15}
                selectedSchool={school}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-7xl space-y-8">

          {/* School Details Section */}
          <div id="school-details" className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              School Details
            </h2>
            
            {/* School Details Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">School Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Phase</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.phaseofeducation__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Type</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.typeofestablishment__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Age Range</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.statutorylowage}-{school.statutoryhighage}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Gender</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.gender__name_ || 'Mixed'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Coeducational Sixth Form</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.officialsixthform__name_ === 'Has a sixth form' ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Has Nursery</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.nurseryprovision__name_ === 'Has Nursery Classes' ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Religious Character</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.religiouscharacter__name_ || 'Does not apply'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Principal</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.headtitle__name_ || ''} {school.headfirstname || ''} {school.headlastname || ''}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Address</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.street}, {school.town}, {school.postcode}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Phone Number</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.telephonenum || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Website</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.schoolwebsite ? (
                          <a 
                            href={school.schoolwebsite.startsWith('http') ? school.schoolwebsite : `https://${school.schoolwebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {school.schoolwebsite}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Academy Sponsor</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.trusts__code_ && school.trusts__name_ ? (
                          <a 
                            href={`https://www.compare-school-performance.service.gov.uk/multi-academy-trust/${school.trusts__code_}/${school.trusts__name_.toLowerCase().replace(/\s+/g, '-')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {school.trusts__name_}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Local Authority</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.la__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Unique Reference Number</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.urn || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pupils Data Section */}
          <div id="pupils-data" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              Pupils Data
            </h2>
            
            {/* Pupil Summary Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Pupil Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Total Pupils</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {(school.pupils_202425 || school.numberofpupils)?.toLocaleString() || 'N/A'}
                        {school.schoolcapacity && (school.pupils_202425 || school.numberofpupils) && (
                          <span className="text-gray-500 ml-1">
                            ({Math.round(((school.pupils_202425 || school.numberofpupils) / school.schoolcapacity) * 100)}% capacity)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Age Range</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.statutorylowage}-{school.statutoryhighage}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Gender</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.gender__name_ || 'Mixed'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Boy/Girl Ratio</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.boys_202425 && school.girls_202425 && (school.pupils_202425 || school.numberofpupils) ? (
                          <>
                            <div>{((school.girls_202425 / (school.pupils_202425 || school.numberofpupils)) * 100).toFixed(1)}% Girls</div>
                            <div>{((school.boys_202425 / (school.pupils_202425 || school.numberofpupils)) * 100).toFixed(1)}% Boys</div>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Eligible for Free School Meals</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.fsm_202425 || 0} pupils ({school.fsm_percentage_202425?.toFixed(1) || 0}%)
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">First Language is Not English</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.english_first_language_202425 && (school.pupils_202425 || school.numberofpupils) ? (
                          <>
                            {(school.pupils_202425 || school.numberofpupils) - school.english_first_language_202425} pupils
                            <span className="text-gray-500 ml-1">
                              ({(((school.pupils_202425 || school.numberofpupils) - school.english_first_language_202425) / (school.pupils_202425 || school.numberofpupils) * 100).toFixed(1)}%)
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    {school.young_carers_202425 > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Young Carers</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          {school.young_carers_202425} ({school.young_carers_percentage_202425?.toFixed(1) || 0}%)
                        </td>
                      </tr>
                    )}
                    {school.pupil_to_all_teacher_ratio_2024 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Pupils per Teacher</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">{school.pupil_to_all_teacher_ratio_2024}</td>
                      </tr>
                    )}
                    {((school.sen_with_statements_202425 && school.sen_with_statements_202425 !== '') || (school.sen_without_statements_202425 && school.sen_without_statements_202425 !== '')) && (
                      <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Pupils with SEN Support</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          {(() => {
                            const senWithStatements = parseInt(school.sen_with_statements_202425) || 0;
                            const senWithoutStatements = parseInt(school.sen_without_statements_202425) || 0;
                            const totalSen = senWithStatements + senWithoutStatements;
                            const totalPupils = school.pupils_202425 || school.numberofpupils || 1;
                            const percentage = (totalSen / totalPupils * 100).toFixed(1);
                            return `${totalSen} pupils (${percentage}%)`;
                          })()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pupil Ethnicities Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Pupil Ethnicities</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    {(() => {
                      // Create ethnicity mapping from school data
                      const ethnicityMapping = {
                        'White, British': school.white_british_percentage_202425,
                        'White, Irish': school.white_irish_percentage_202425,
                        'White, Other': school.white_other_percentage_202425,
                        'Asian, Indian': school.asian_indian_percentage_202425,
                        'Asian, Pakistani': school.asian_pakistani_percentage_202425,
                        'Asian, Bangladeshi': school.asian_bangladeshi_percentage_202425,
                        'Asian, Other': school.asian_other_percentage_202425,
                        'Black, African': school.black_african_percentage_202425,
                        'Black, Caribbean': school.black_caribbean_percentage_202425,
                        'Black, Other': school.black_other_percentage_202425,
                        'Mixed, White & Black Caribbean': school.mixed_white_black_caribbean_percentage_202425,
                        'Mixed, White & Black African': school.mixed_white_black_african_percentage_202425,
                        'Mixed, White & Asian': school.mixed_white_asian_percentage_202425,
                        'Mixed, Other': school.mixed_other_percentage_202425,
                        'Chinese': school.chinese_percentage_202425,
                        'Gypsy/Roma': school.gypsy_roma_percentage_202425,
                        'Traveller of Irish Heritage': school.traveller_irish_heritage_percentage_202425,
                        'Other': school.other_ethnicity_percentage_202425,
                        'Unclassified': school.unclassified_ethnicity_percentage_202425
                      };
                      
                      // Convert to array and filter out ethnicities with 0 or no data
                      const ethnicities = Object.entries(ethnicityMapping)
                        .map(([name, percentage]) => ({
                          name,
                          percentage: percentage || 0
                        }))
                        .filter(eth => eth.percentage > 0)
                        .sort((a, b) => b.percentage - a.percentage);
                      
                      return ethnicities.map((ethnicity, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">{ethnicity.name}</td>
                          <td className="py-2 pl-1 pr-4 text-gray-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(ethnicity.percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium min-w-[3rem]">{ethnicity.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Primary Results Section */}
          <div id="primary-results" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-600 rounded"></span>
              Primary Results
            </h2>
            <PrimaryResultsCard schoolData={school} />
          </div>

          {/* Admissions Section */}
          <div id="admissions" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Admissions
            </h2>
            
            <AdmissionsCard 
              urn={school.urn} 
              schoolName={school.establishmentname}
              phase={school.phaseofeducation__name_}
              preloadedData={null}
            />
          </div>

          {/* Parent View Section */}
          <div id="parent-reviews" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-6 md:px-8 pt-6 md:pt-8">
              Parent Reviews
            </h2>
            
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <OfstedParentViewCard 
                urn={school.urn} 
                schoolName={school.establishmentname}
                preloadedData={parentViewData}
              />
            </div>
          </div>

          {/* GCSE Results Section - Show for Secondary schools (16 plus, Secondary, All-through) */}
          {(school.phaseofeducation__name_ === '16 plus' || school.phaseofeducation__name_ === 'Secondary' || school.phaseofeducation__name_ === 'All-through') && (
            <div id="gcse-results" className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-6 md:px-8 pt-6 md:pt-8 flex items-center gap-3">
                <span className="w-1 h-6 bg-purple-600 rounded"></span>
                GCSE Results
              </h2>
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <GCSEResultsMultiYearCard 
                  urn={school.urn} 
                  preloadedData={gcseMultiYearData}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}