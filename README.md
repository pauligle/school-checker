# School Checker - Automated Data Pipeline

A comprehensive school data platform with automated data ingestion from UK government sources, built with Next.js, Supabase, and Leaflet.

## 🏗️ Architecture

```
Government APIs/CSVs → Data Processing → Supabase → Next.js App
     ↓                      ↓              ↓           ↓
  Automated Download → Data Transformation → Storage → Live App
```

## 📊 Data Sources

- **Schools Data**: Get Information about Schools (GIAS) - Monthly updates
- **Ofsted Inspections**: Ofsted inspection reports - Weekly updates  
- **Performance Tables**: School performance data - Annual updates

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔄 Automated Data Pipeline

### Manual Data Pipeline

```bash
# Run complete pipeline (fetch → process → import)
npm run data:pipeline

# Individual steps
npm run data:fetch all        # Download all data sources
npm run data:process all      # Process and clean data
npm run data:import all        # Import to Supabase
```

### Automated Scheduling

```bash
# Start the cron scheduler
npm run cron:setup start

# Test the setup
npm run cron:test all
```

## 📅 Update Schedule

| Data Source | Frequency | Time | Description |
|-------------|-----------|------|-------------|
| **Ofsted** | Weekly | Mondays 2 AM | Latest inspection reports |
| **Schools** | Monthly | 1st of month 3 AM | School information updates |
| **Performance** | Annually | September 1st 4 AM | Exam results and performance |
| **Health Check** | Daily | 6 AM | System monitoring |

## 🛠️ Scripts Reference

### Data Management

```bash
# Fetch data from government sources
npm run data:fetch [all|schools|ofsted|performance]

# Process and clean data
npm run data:process [all|schools|ofsted|performance]

# Import data to Supabase
npm run data:import [all|schools|ofsted|performance]

# Complete pipeline
npm run data:pipeline
```

### Cron Management

```bash
# Start automated scheduler
npm run cron:setup start

# Manual triggers
npm run cron:setup manual [all|schools|ofsted|performance]

# Test the system
npm run cron:test [pipeline|manual|all]

# Check status
npm run cron:setup status
```

### Development

```bash
# Development with cache clearing
npm run dev:clean
npm run dev:fresh
npm run dev:reset

# Build and start
npm run build
npm start
```

## 📁 Project Structure

```
school-checker/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/             # React components
│   └── SchoolsMap.jsx     # Main map component
├── scripts/               # Data pipeline scripts
│   ├── data-fetcher.js    # Download government data
│   ├── data-processor.js  # Clean and transform data
│   ├── data-importer.js   # Import to Supabase
│   ├── setup-cron.js      # Automated scheduling
│   └── test-cron.js       # Testing utilities
├── data/                  # Data storage
│   ├── raw/              # Downloaded CSV files
│   └── processed/        # Cleaned CSV files
├── logs/                  # Pipeline logs
└── lib/                   # Utilities
    └── supabaseClient.ts  # Supabase configuration
```

## 🗄️ Database Schema

### Schools Table
```sql
CREATE TABLE schools (
  urn TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DECIMAL(10,8),
  lon DECIMAL(11,8),
  school_type TEXT,
  phase TEXT,
  local_authority TEXT,
  total_pupils INTEGER,
  gender TEXT,
  age_range TEXT,
  capacity INTEGER,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  website TEXT,
  headteacher TEXT,
  status TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Inspections Table
```sql
CREATE TABLE inspections (
  urn TEXT,
  inspection_date DATE,
  overall_rating TEXT,
  previous_rating TEXT,
  quality_of_education TEXT,
  behaviour_attitudes TEXT,
  personal_development TEXT,
  leadership_management TEXT,
  inspection_type TEXT,
  inspector_name TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (urn, inspection_date)
);
```

### Performance Table
```sql
CREATE TABLE performance (
  urn TEXT,
  school_name TEXT,
  progress_score DECIMAL(5,2),
  attainment_score DECIMAL(5,2),
  disadvantaged_progress DECIMAL(5,2),
  disadvantaged_attainment DECIMAL(5,2),
  year INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (urn, year)
);
```

## 🔧 Configuration

### Data Sources Configuration

Edit `scripts/data-fetcher.js` to modify data sources:

```javascript
const DATA_SOURCES = {
  schools: {
    url: 'https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20241201.csv',
    filename: 'schools.csv',
    updateFrequency: 'monthly'
  },
  // ... other sources
};
```

### Update Frequencies

Modify `scripts/setup-cron.js` to change update schedules:

```javascript
// Weekly Ofsted updates (Mondays at 2 AM)
cron.schedule('0 2 * * 1', async () => {
  // Update logic
});

// Monthly schools updates (1st of month at 3 AM)
cron.schedule('0 3 1 * *', async () => {
  // Update logic
});
```

## 📈 Monitoring

### Log Files

- `logs/fetch-YYYY-MM-DD.log` - Data fetch operations
- `logs/process-YYYY-MM-DD.log` - Data processing operations
- `logs/import-YYYY-MM-DD.log` - Database import operations
- `logs/cron.log` - Automated scheduler logs

### Health Checks

The system includes daily health checks that:
- Verify database connectivity
- Check data file freshness
- Monitor system resources
- Alert on failures

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   # Check if all required variables are set
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Data Fetch Failures**
   ```bash
   # Check government API availability
   npm run data:fetch status
   ```

3. **Database Import Errors**
   ```bash
   # Verify database schema
   npm run data:import stats
   ```

4. **Cron Scheduler Issues**
   ```bash
   # Check scheduler status
   npm run cron:setup status
   ```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
export DEBUG=true

# Run with debug output
npm run data:pipeline
```

## 🔒 Security

- All API keys stored in environment variables
- Service role key only used for data imports
- Public key used for client-side operations
- Regular security updates and monitoring

## 📞 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Run `npm run cron:test all` for diagnostics
3. Review the troubleshooting section above

## 📄 License

This project is licensed under the MIT License.
