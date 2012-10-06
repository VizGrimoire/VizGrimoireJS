#! /usr/bin/python

import MySQLdb
from datetime import datetime

db = MySQLdb.connect(host="localhost", # your host, usually localhost
                     user="jgb", # your username
                      passwd="XXX", # your password
                      db="optimis_cvsanaly") # name of the data base

# Cursor for reading from the database
cursor = db.cursor ()
# Cursor for writing to the database
write_cursor = db.cursor ()

# Create months table
write_cursor.execute ("DROP TABLE IF EXISTS months")
write_cursor.execute ("CREATE TABLE months (" + \
        "id INTEGER PRIMARY KEY," + \
        "year INTEGER," + \
        "month INTEGER," + \
        "date DATETIME" + \
        ") CHARACTER SET=utf8")

# Find out first and last dates
cursor.execute ("SELECT MIN(date) FROM scmlog")
minDate = cursor.fetchone ()[0]
cursor.execute ("SELECT MAX(date) FROM scmlog")
maxDate = cursor.fetchone ()[0]


firstMonth = minDate.year * 12 + minDate.month
lastMonth = maxDate.year * 12 + maxDate.month

for period in range (firstMonth, lastMonth+1):
    month = (period -1 ) % 12 + 1 
    year = (period - 1)// 12
    date = str(year) + "-" + str(month) + "-01"
    print (period, year, month, date)
    write_cursor.execute ("INSERT INTO months " + \
                        "(id, year, month, date) VALUES (%s, %s, %s, %s)" %
                    (period, year, month, '"' + date + '"'))

db.commit ()
write_cursor.close ()
cursor.close ()
db.close ()
