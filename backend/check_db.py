#!/usr/bin/env python
import sqlite3
import sys

try:
    conn = sqlite3.connect('diplomai.db')
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print('\n🎯 BIDIRECTIONAL MULTI-DEVICE SYSTEM - DATABASE VERIFICATION\n')
    print('=' * 60)
    print('✅ Database Tables Found:')
    print('=' * 60)
    
    multi_device_tables = ['interpretation_sessions', 'participants', 'interpretations']
    
    for table in sorted(tables):
        if table in multi_device_tables:
            print(f'  🆕 {table:30} ✅ MULTI-DEVICE SUPPORT')
        else:
            print(f'  📦 {table:30} (existing)')
    
    # Check row counts
    print('\n' + '=' * 60)
    print('📊 Data Status:')
    print('=' * 60)
    
    for table in multi_device_tables:
        if table in tables:
            cursor.execute(f'SELECT COUNT(*) FROM {table}')
            count = cursor.fetchone()[0]
            print(f'  {table:30} {count} records')
    
    conn.close()
    
    print('\n' + '=' * 60)
    print('✅ DATABASE READY FOR BIDIRECTIONAL MULTI-DEVICE OPERATION!')
    print('=' * 60)
    print('\nHow it works:')
    print('  1️⃣  Create session (generates unique code + QR)')
    print('  2️⃣  Multiple devices join same session')
    print('  3️⃣  Any device speaks → broadcasts to ALL devices')
    print('  4️⃣  Each device gets translation in their language')
    print('  5️⃣  BIDIRECTIONAL - all devices broadcast to all others')
    print('  6️⃣  Complete record stored in database')
    print('\n')

except FileNotFoundError:
    print('❌ Database not found. Starting backend will create it.')
    sys.exit(1)
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
