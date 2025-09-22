import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Understanding GCSE KS4 Results | SchoolChecker.io',
  description: 'Learn what GCSE KS4 results mean including Attainment 8, Progress 8, Grade 5+ English & Maths, EBacc, and more. Complete guide for parents.',
  keywords: 'GCSE results, KS4 results, Attainment 8, Progress 8, EBacc, Grade 5 English Maths, school performance, secondary school results',
  openGraph: {
    title: 'Understanding GCSE KS4 Results | SchoolChecker.io',
    description: 'Complete guide to understanding GCSE KS4 results including Attainment 8, Progress 8, and EBacc for parents choosing secondary schools.',
    type: 'website',
  },
};

export default function UnderstandingGCSEKS4Results() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Understanding GCSE KS4 Results
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            GCSE results can be confusing with all the different measures and scores. This guide explains 
            what each metric means and how to interpret them when choosing a secondary school for your child.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#attainment-8" className="block text-blue-600 hover:text-blue-800 hover:underline">
              1. Attainment 8 Score
            </a>
            <a href="#grade-5-english-maths" className="block text-blue-600 hover:text-blue-800 hover:underline">
              2. Grade 5 or Above in English and Maths
            </a>
            <a href="#five-gcses-grade-4" className="block text-blue-600 hover:text-blue-800 hover:underline">
              3. 5 or More GCSEs at Grade 9-4 (or A*-C)
            </a>
            <a href="#entering-ebacc" className="block text-blue-600 hover:text-blue-800 hover:underline">
              4. Entering EBacc
            </a>
            <a href="#ebacc-average-point-score" className="block text-blue-600 hover:text-blue-800 hover:underline">
              5. EBacc Average Point Score
            </a>
            <a href="#progress-8" className="block text-blue-600 hover:text-blue-800 hover:underline">
              6. Progress 8
            </a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Attainment 8 */}
          <section id="attainment-8" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Attainment 8 Score</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Attainment 8 score measures how well students perform across eight key subjects at GCSE level. 
                It's designed to give a balanced view of a school's academic performance by looking at both 
                traditional academic subjects and other qualifications.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The score is calculated by taking the best results from English and maths (double-weighted), 
                plus the best results from three subjects from the English Baccalaureate (EBacc) group 
                (sciences, humanities, and languages), and three other qualifications. Each grade is converted 
                to a points score, with higher grades earning more points.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> A higher Attainment 8 score indicates that 
                students at the school are achieving better grades across a broad range of subjects. 
                This gives you a good overall picture of the school's academic standards.
              </p>
            </div>
          </section>

          {/* Grade 5 English and Maths */}
          <section id="grade-5-english-maths" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Grade 5 or Above in English and Maths</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                This measure shows the percentage of students who achieve at least a Grade 5 (equivalent to 
                the old Grade C+) in both English and maths GCSEs. Grade 5 is considered a "strong pass" 
                and is often the minimum requirement for many further education courses and apprenticeships.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                English and maths are considered fundamental skills that all students need for future success, 
                whether they're going to university, starting an apprenticeship, or entering the workplace. 
                This measure focuses specifically on these two core subjects.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> A higher percentage means more students are 
                leaving school with solid foundations in the most important subjects. This is particularly 
                important if your child struggles with English or maths, as it shows the school's ability 
                to help students reach this crucial benchmark.
              </p>
            </div>
          </section>

          {/* Five GCSEs Grade 4 */}
          <section id="five-gcses-grade-4" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 5 or More GCSEs at Grade 9-4 (or A*-C)</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                This measure shows the percentage of students who achieve at least five GCSEs at Grade 4 
                or above (equivalent to the old Grade C or above). This is often seen as the minimum 
                standard for many further education opportunities and is considered a "standard pass."
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The measure includes any five GCSE subjects, giving students flexibility in which subjects 
                they count towards this total. This means students can play to their strengths while still 
                meeting this important benchmark.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> A higher percentage indicates that the school 
                successfully helps most students achieve a solid foundation of qualifications. This is 
                reassuring if you're concerned about your child's overall academic performance across 
                multiple subjects.
              </p>
            </div>
          </section>

          {/* Entering EBacc */}
          <section id="entering-ebacc" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Entering EBacc</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The English Baccalaureate (EBacc) is a set of subjects that the government considers 
                important for students to study. To "enter" the EBacc, students must study GCSEs in 
                English, maths, sciences, humanities (history or geography), and a language.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                This measure shows the percentage of students who are taking the full range of EBacc 
                subjects. It doesn't measure how well they perform in these subjects, just whether 
                they're studying the complete set.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> A higher percentage suggests the school 
                encourages students to study a broad, academic curriculum. This is particularly important 
                if you want your child to keep their options open for university or if you value a 
                traditional academic education.
              </p>
            </div>
          </section>

          {/* EBacc Average Point Score */}
          <section id="ebacc-average-point-score" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. EBacc Average Point Score</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                While the "Entering EBacc" measure shows how many students study the EBacc subjects, 
                this measure shows how well they actually perform in those subjects. It calculates the 
                average points score across all EBacc subjects for students who are entered for the EBacc.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Each GCSE grade is converted to points (Grade 9 = 9 points, Grade 8 = 8 points, etc.), 
                and the average is calculated across English, maths, sciences, humanities, and languages. 
                This gives a more detailed picture of academic achievement in these core subjects.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> A higher average point score indicates that 
                students are not only studying the EBacc subjects but performing well in them. This is 
                particularly relevant if you're considering academic pathways like A-levels or university 
                for your child.
              </p>
            </div>
          </section>

          {/* Progress 8 */}
          <section id="progress-8" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Progress 8</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Progress 8 is perhaps the most important measure for parents because it shows how much 
                progress students make during their time at the school, rather than just their final results. 
                It compares students' actual results with what they were predicted to achieve based on 
                their prior attainment at primary school.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                A score of 0 means students made exactly the progress expected. A positive score means 
                students made more progress than expected, while a negative score means they made less 
                progress. The measure is designed to be fair to schools with different intakes.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Schools are categorized as "Well above average," "Above average," "Average," "Below average," 
                or "Well below average" based on their Progress 8 score. This helps identify schools that 
                are particularly effective at helping students improve.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>What this means for parents:</strong> This is often the most telling measure because 
                it shows how much value the school adds to students' education. A school with a high Progress 8 
                score is particularly good at helping students exceed expectations, regardless of their 
                starting point.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Takeaways</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>Attainment 8</strong> shows overall academic performance across eight subjects</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>Grade 5+ English & Maths</strong> indicates strong foundations in core subjects</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>5+ GCSEs Grade 4+</strong> shows broad qualification achievement</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span><strong>Progress 8</strong> is often the most important measure - it shows how much the school helps students improve</span>
            </li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            Remember: no single measure tells the whole story. Look at multiple measures together to get 
            a complete picture of a school's performance.
          </p>
        </div>
      </div>
    </div>
  );
}
