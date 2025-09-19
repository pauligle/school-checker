#!/usr/bin/env python3

"""
Convert Excel Parent View files to CSV format for easier processing
"""

import pandas as pd
import sys
import os
from pathlib import Path

def convert_excel_to_csv(excel_path, output_dir):
    """Convert Excel file to CSV format"""
    try:
        filename = os.path.basename(excel_path)
        print(f"📁 Processing: {filename}")
        
        # Read the School Level Data sheet
        df = pd.read_excel(excel_path, sheet_name='School Level Data', skiprows=1)
        
        print(f"📊 Found {len(df)} schools")
        
        # Filter out rows without URN or submissions
        df = df.dropna(subset=['URN'])
        df = df[df['Submissions'].notna()]
        df = df[df['Submissions'] > 0]
        
        print(f"✅ {len(df)} schools with valid data")
        
        # Create output filename
        csv_filename = filename.replace('.xlsx', '.csv')
        csv_path = os.path.join(output_dir, csv_filename)
        
        # Save as CSV
        df.to_csv(csv_path, index=False)
        print(f"💾 Saved: {csv_filename}")
        
        # Check if Harris Academy Chobham is in this file
        harris_data = df[df['URN'] == 139703]
        if not harris_data.empty:
            print(f"🎯 FOUND Harris Academy Chobham in {filename}!")
            print(f"   Submissions: {harris_data['Submissions'].iloc[0]}")
            print(f"   School Name: {harris_data['School Name'].iloc[0]}")
        
        return csv_path
        
    except Exception as e:
        print(f"❌ Error processing {filename}: {str(e)}")
        return None

def main():
    # Set up paths
    script_dir = Path(__file__).parent
    excel_dir = script_dir.parent / 'data' / 'raw' / 'ofsted-parentview-data'
    output_dir = excel_dir / 'converted-csv'
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # Get all Excel files
    excel_files = list(excel_dir.glob('Parent_View_Management_Information_as_at_*.xlsx'))
    
    if not excel_files:
        print("❌ No Excel files found")
        sys.exit(1)
    
    # Sort by modification time (newest first)
    excel_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    print(f"🔍 Found {len(excel_files)} Excel files:")
    for i, file in enumerate(excel_files[:5]):  # Show first 5
        print(f"  {i+1}. {file.name}")
    
    print(f"\n🚀 Converting top 5 most recent files...\n")
    
    converted_files = []
    for excel_file in excel_files[:5]:  # Convert top 5 most recent
        csv_path = convert_excel_to_csv(str(excel_file), str(output_dir))
        if csv_path:
            converted_files.append(csv_path)
        print()
    
    print(f"✅ Conversion complete! {len(converted_files)} files converted.")
    print(f"📁 CSV files saved in: {output_dir}")

if __name__ == "__main__":
    main()
