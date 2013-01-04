#!/bin/bash
#
# Updates Bitergia M0 Report
#

PROJECT='Webkit'
SCM_DIR='/home/acs/devel/projects/WebKit'
SCM_DB='dizquierdo_webkit_all'
ITS_DB='acs_bicho_webkit'
ITS_URL='https://bugzilla.webkit.org/buglist.cgi?product=WebKit'
REPORT_DIR=`pwd`
dbuser='webkit'
dbpasswd='webkit'
bicho_backend='bg'

# debug
set -x

echo "Updating $PROJECT data"

# TODO: check general env, dirs, tools, db connection ...

cd $SCM_DIR
git pull > $REPORT_DIR/git.log 2>&1
mysql -u "$dbuser" --password="$dbpasswd" "$SCM_DB" -e 'drop table months'
cvsanaly2 -g -u $dbuser -p "$dbpasswd" -d "$SCM_DB" --extensions=Months > cvsanaly2.log 2>&1
cd $REPORT_DIR
# R --no-restore --no-save --args $SCM_DB $dbuser $dbpasswd < scm-analysis.R > scm-analysis.log 2>&1
R --no-restore --no-save --args $SCM_DB $dbuser $dbpasswd < scm-milestone0.R > scm-milestone0.log 2>&1
bicho -g --db-user-out=$dbuser --db-password-out=$dbpasswd --db-database-out=$ITS_DB -d 1 -b $bicho_backend= -u $ITS_URL > bicho.log 2>&1
R --no-restore --no-save --args $ITS_DB $dbuser $dbpasswd < its-milestone0.R > its-milestone0.log 2>&1
echo "DONE"
