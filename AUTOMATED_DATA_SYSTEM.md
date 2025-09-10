# 🤖 Automated Data Fetching System

This system automatically downloads and updates school data from the Department for Education (DfE) monthly, ensuring your school information stays current and accurate.

## 🎯 **Problem Solved**

- **Outdated Data**: Your current data is from September 2024, causing headteacher discrepancies
- **Manual Updates**: No need to manually download and process data
- **Data Freshness**: Automatically keeps school information current

## 🚀 **Quick Start**

### 1. **Install the System**
```bash
npm run data:auto:install
```

### 2. **Test the System**
```bash
npm run data:auto
```

### 3. **Check Data Status**
```bash
npm run data:status
```

### 4. **Set Up Monthly Automation**
```bash
npm run data:auto:setup
```

## 📋 **Available Commands**

| Command | Description |
|---------|-------------|
| `npm run data:auto` | Fetch fresh data immediately |
| `npm run data:auto:setup` | Set up monthly cron job |
| `npm run data:status` | Check current data status |
| `npm run data:auto:install` | Install the automated system |

## 🔄 **How It Works**

### **Automatic Data Sources**
The system tries multiple data sources in order:

1. **DfE GIAS Downloads** - Official downloads page
2. **DfE API (Current)** - Current API endpoint  
3. **DfE API (Alternative)** - Alternative endpoint

### **Smart Update Logic**
- ✅ **Checks data age** - Only updates if data is older than 30 days
- ✅ **Multiple sources** - Tries different URLs if one fails
- ✅ **Automatic processing** - Downloads and imports data automatically
- ✅ **Logging** - Detailed logs saved to `logs/` directory

### **Monthly Schedule**
- **When**: 1st of every month at 2:00 AM
- **What**: Downloads latest DfE data and updates database
- **Result**: Fresh school information including current headteachers

## 📁 **File Structure**

```
scripts/
├── automated-data-fetcher.js    # Main automation script
├── setup-automated-fetcher.sh   # Installation script
└── data-status.js              # Status checker

logs/
└── data-fetcher-YYYY-MM-DD.log  # Daily logs

data/raw/
└── edubasealldata-YYYY-MM-DD.csv # Downloaded data files
```

## 🔍 **Monitoring & Logs**

### **Check Data Status**
```bash
npm run data:status
```
Shows:
- Local data file age and size
- Database record counts
- Sample school data
- Next steps

### **View Logs**
```bash
ls logs/
cat logs/data-fetcher-2025-01-05.log
```

## 🛠️ **Manual Operations**

### **Force Data Update**
Even if data is recent, you can force an update:
```bash
# Temporarily modify the script to ignore age check
node scripts/automated-data-fetcher.js --now
```

### **Run Monthly Job Manually**
```bash
npm run data:auto
```

## 🎯 **Benefits**

### **Solves Headteacher Discrepancy**
- **Before**: Lisa Kattenhorn (outdated data)
- **After**: Francesca Perry (current data from DfE)

### **Automatic Maintenance**
- ✅ No manual intervention required
- ✅ Monthly updates keep data fresh
- ✅ Multiple fallback data sources
- ✅ Comprehensive logging and monitoring

### **Data Quality**
- ✅ Official DfE data sources
- ✅ Automatic processing and validation
- ✅ Database updates with fresh information

## 🔧 **Troubleshooting**

### **Data Sources Fail**
If all data sources fail:
1. Check internet connection
2. Verify DfE service status
3. Check logs for specific errors
4. Try manual download from DfE website

### **Cron Job Not Running**
```bash
# Check if cron is running
ps aux | grep cron

# Restart the automation
npm run data:auto:setup
```

### **Database Issues**
```bash
# Check database connection
npm run data:status

# Verify Supabase credentials in .env.local
```

## 📊 **Expected Results**

After setting up the automated system:

- **Data Age**: Always less than 30 days old
- **Headteacher Info**: Current and accurate
- **School Details**: Up-to-date from official DfE sources
- **Automation**: Runs monthly without manual intervention

## 🎉 **Success Indicators**

✅ **System Working**: `npm run data:status` shows recent data  
✅ **Automation Active**: Monthly cron job scheduled  
✅ **Fresh Data**: Headteacher names match current DfE records  
✅ **Logs Clean**: No errors in daily log files  

---

**🎯 This automated system will solve your headteacher data discrepancy and keep your school information current automatically!**

