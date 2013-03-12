## Copyright (C) 2012 Bitergia
##
## This program is free software; you can redistribute it and/or modify
## it under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 3 of the License, or
## (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License
## along with this program; if not, write to the Free Software
## Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
##
## This file is a part of the vizGrimoire.R package
##
## Authors:
##   Jesus M. Gonzalez-Barahona <jgb@bitergia.com>
##
##
## Usage:
##  R --no-restore --no-save --args dbschema user passwd [enddate [startdate] ] < its-analysis.R > script.out

## Note: this script works with bicho databases obtained from Bugzilla

## Where vizGrimoire is
vizgrimoirer.dir <- "/home/acs/devel/bitergia/reports/VizGrimoireR"

## Times class
source(paste (c (vizgrimoirer.dir, "/", "ClassTimes.R"),
       collapse=''))
## TimeSeriesYears class
source(paste (c (vizgrimoirer.dir, "/", "ClassTimeSeriesYears.R"),
              collapse=''))
## TimeSeriesMonths class
source(paste (c (vizgrimoirer.dir, "/", "ClassTimeSeriesMonths.R"),
              collapse=''))
## Query class
source(paste (c (vizgrimoirer.dir, "/", "ClassQuery.R"),
              collapse=''))
## QueryTimeSerie class
source(paste (c (vizgrimoirer.dir, "/", "ClassQueryTimeSerie.R"),
              collapse=''))
## ITSTicketsTimes class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSTicketsTimes.R"),
              collapse=''))
## ITSTicketsChangesTimes class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSTicketsChangesTimes.R"),
              collapse=''))
## TimedEvents class
source(paste (c (vizgrimoirer.dir, "/", "ClassTimedEvents.R"),
              collapse=''))
## ITSMonthly class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthly.R"),
              collapse=''))
## ITSMonthlyOpen class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthlyOpen.R"),
              collapse=''))
## ITSMonthlyChanged class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthlyChanged.R"),
              collapse=''))
## ITSMonthlyClosed class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthlyClosed.R"),
              collapse=''))
## ITSMonthlyLastClosed class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthlyLastClosed.R"),
              collapse=''))
## ITSMonthlyClosed class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSMonthlyVarious.R"),
              collapse=''))
## ITSTicketsMovements class
source(paste (c (vizgrimoirer.dir, "/", "ClassITSTicketsMovements.R"),
              collapse=''))

source(paste (c (vizgrimoirer.dir, "/", "vizgrimoire.R"),
              collapse=''))

## Analyze command line args, and produce config params from them
conf <- ConfFromCommandLine()
## Kind of repository (Bugzilla, Launchpad, Jira, SourceForge, Allura, GoogleCode, etc.)
## Connect to the database
SetDBChannel (conf$user, conf$password, conf$database)

## Find out the kind of repository (bugzilla, launchpad, etc.)
conf$repokind <- FindoutRepoKind ()

##
## Time to close and related times
##

## Closed tickets: time ticket was open, first closed, time-to-first-close
closed <- new ("ITSTicketsTimes")
JSON(closed, 'its-issues_closed.json')

## Distribution of time to fix (first close)
tofix <- new ("Times", closed$tofix,
              "Time to fix, first close")
PlotDist (tofix, 'its-distrib_tofix_days', "days")
PlotDist (tofix, 'its-distrib_tofix_hours', "hours")
PlotDist (tofix, 'its-distrib_tofix_mins', "mins")
PlotDist (tofix, 'its-distrib_tofix_weeks', "weeks")

## Distribution of time to fix (last close)
tofixlast <- new ("Times", closed$tofixlast,
                  "Time to fix, last close")
PlotDist (tofixlast, 'its-distrib_tofixlast_days', "days")
PlotDist (tofixlast, 'its-distrib_tofixlast_hours', "hours")
PlotDist (tofixlast, 'its-distrib_tofixlast_mins', "mins")

## Which quantiles we're interested in
quantiles_spec = c(.99,.95,.5,.25)

## Yearly quantiles of time to fix (minutes)
events.tofix <- new ("TimedEvents",
                     closed$open, closed$tofix %/% 60)
quantiles <- QuantilizeYears (events.tofix, quantiles_spec)

Plot(quantiles, 'its-quantiles-year-time_to_fix_min')
JSON(quantiles, 'its-quantiles-year-time_to_fix_min.json')

## Monthly quantiles of time to fix (hours)
events.tofix.hours <- new ("TimedEvents",
                           closed$open, closed$tofix %/% 3600)
quantiles.month <- QuantilizeMonths (events.tofix.hours, quantiles_spec)

Plot(quantiles.month, 'its-quantiles-month-time_to_fix_hour')
JSON(quantiles.month, 'its-quantiles-month-time_to_fix_hour.json')

## Changed tickets: time ticket was attended, last move
changed <- new ("ITSTicketsChangesTimes")
JSON(changed, 'its-issues_changed.json')

## Distribution of time to attention
toatt <- new ("Times", changed$toattention,
              "Time to attention")
PlotDist (toatt, 'its-distrib_toatt_days', "days")
PlotDist (toatt, 'its-distrib_toatt_hours', "hours")
PlotDist (toatt, 'its-distrib_toatt_mins', "mins")
PlotDist (toatt, 'its-distrib_toatt_weeks', "weeks")

## Yearly quantiles of time to attention (minutes)
events.toatt <- new ("TimedEvents",
                     changed$open, changed$toattention %/% 60)
quantiles <- QuantilizeYears (events.tofix, quantiles_spec)

Plot(quantiles, 'its-quantiles-year-time_to_attention_min')
JSON(quantiles, 'its-quantiles-year-time_to_attention_min.json')


## #
## # Open, closed issues per week
## #

## # New tickets per week
## q <- "SELECT YEAR (submitted_on) * 52 + WEEK (submitted_on) AS yearweek,
##         DATE_FORMAT(submitted_on, '%Y %V') AS year_week,
## 	YEAR (submitted_on) AS year,
##         WEEK (submitted_on) AS week,
##         COUNT(*) AS open
##       FROM issues
##       GROUP BY yearweek"
## issues_open_weekly <- query(q)

## # Changed tickets per week
## q <- "SELECT year(changed_on) * 52 + WEEK (changed_on) AS yearweek,
##         DATE_FORMAT(changed_on, '%Y %V') AS year_week,
## 	YEAR (changed_on) AS year,
##         WEEK (changed_on) AS week,
##         count(changed_by) AS changed,
##         count(distinct(changed_by)) AS changers
##       FROM changes
##       GROUP BY yearweek"
## issues_changed_weekly <- query(q)

## # Closed tickets per week (using first closing date)
## q <- "SELECT YEAR (time_closed) * 52 + WEEK (time_closed) AS yearweek,
##         DATE_FORMAT(time_closed, '%Y %V') AS year_week,
## 	YEAR (time_closed) AS year,
##         WEEK (time_closed) AS week,
##         COUNT(*) as closed
##       FROM (
##          SELECT issue_id, MIN(changed_on) time_closed
##          FROM changes 
##          WHERE new_value='RESOLVED' OR new_value='CLOSED' 
##          GROUP BY issue_id) ch 
##       GROUP BY yearweek"
## issues_closed_weekly <- query(q)

## # Closed tickets per week (using last closing date)
## q <- "SELECT YEAR (time_closed) * 52 + WEEK (time_closed) AS yearweek,
##         DATE_FORMAT(time_closed, '%Y %V') AS year_week,
## 	YEAR (time_closed) AS year,
##         WEEK (time_closed) AS week,
##         COUNT(*) as closed_last
##       FROM (
##          SELECT issue_id, MAX(changed_on) time_closed
##          FROM changes 
##          WHERE new_value='RESOLVED' OR new_value='CLOSED' 
##          GROUP BY issue_id) ch 
##       GROUP BY yearweek"
## issues_closed_weekly_last <- query(q)

## # Tickets open and closed (first close) per week
## issues_open_closed_week <- mergeWeekly (issues_open_weekly, issues_closed_weekly)
## plotTimeSerieWeekN (issues_open_closed_week, c("open", "closed"),
##                     "its-open-closed-week", c("Tickets open", "closed"))

## # Tickets open and closed (last close) per week
## issues_open_closed_last_week <- mergeWeekly (issues_open_weekly,
## 			     		     issues_closed_weekly_last)
## plotTimeSerieWeekN (issues_open_closed_last_week, c("open", "closed_last"),
##                     "its-open-closed-last-week", c("Tickets open", "closed"))

## # Tickets closed (first and last close) per week
## issues_closed_week <- mergeWeekly (issues_closed_weekly,
## 			     		     issues_closed_weekly_last)
## plotTimeSerieWeekN (issues_closed_week, c("closed", "closed_last"),
##                     "its-closed-week",
## 		    c("Tickets closed first", "last"))

## # Tickets changed per week
## issues_changed_closed_week <- mergeWeekly (issues_changed_weekly,
##                                            issues_closed_weekly)
## plotTimeSerieMonthN (issues_changed_closed_week, c("changed", "closed"),
##                      "its-changed-week",
##                      c("Tickets changed", "closed"))

##
## Open, closed, changed issues per month
##

## Open tickets per month
open.monthly <- new ("ITSMonthlyOpen")
JSON(open.monthly, "its-open-monthly.json")

## Changed tickets per month
changed.monthly <- new ("ITSMonthlyChanged")
JSON(changed.monthly, "its-changed-monthly.json")

## Closed tickets per month (using first closing date)
closed.monthly <- new ("ITSMonthlyClosed")
JSON(closed.monthly, "its-closed-monthly.json")


# Closed tickets per month (using last closing date)
## q <- "SELECT year(time_closed) * 12 + month(time_closed) AS id,
##         year(time_closed) AS year,
##         month(time_closed) AS month,
##         DATE_FORMAT (time_closed, '%b %Y') as date,
##         COUNT(*) as closed_last
##       FROM (
##          SELECT issue_id, MAX(changed_on) time_closed
##          FROM changes 
##          WHERE new_value='RESOLVED' OR new_value='CLOSED' 
##          GROUP BY issue_id) ch 
##       GROUP BY year,month"
## issues_closed_monthly_last <- query(q)

## Closed tickets per month (using last closing date)
lastclosed.monthly <- new ("ITSMonthlyLastClosed")
JSON(lastclosed.monthly, "its-lastclosed-monthly.json")

## All parameters about tickets per month
all.monthly <- new ("ITSMonthlyVarious")
JSON(all.monthly, "its-all-monthly.json")
JSON(all.monthly, "its-evolutionary.json")


# Tickets open and closed (first close) per month
Plot (all.monthly, c("open", "closed"),
      "its-open-closed-month", c("Tickets open", "closed"))

# Tickets open and closed (last close) per month
Plot (all.monthly, c("open", "lastclosed"),
      "its-open-lastclosed-month", c("Tickets open", "closed"))

# Tickets closed (first and last close) per month
Plot (all.monthly, c("closed", "lastclosed"),
      "its-closed-month", c("Tickets closed first", "last"))

# Tickets changed per month
Plot (all.monthly, c("changed", "closed"),
      "its-changed-month", c("Tickets changed", "closed"))

#
# Number of changes, comments per issue
#
## Movements of tickets: number of changes, comments, for tickets that have both
movements <- new ("ITSTicketsMovements")
PlotDist(movements, "its-issues-movements")
JSON(movements, 'its-issues-movements.json')


#plotBoxPlot (issues_operations$changes, 'its_issue_changes-bloxplot')
#plotBoxPlot (issues_operations$comments, 'its_issue_comments-bloxplot')
#plotBoxPlot (issues_operations$changes + issues_operations$comments,
#             'its_issue_operations-bloxplot')
