# Copyright (C) 2012-2013 Bitergia
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
#
# R library that contains all of the necessary queries to 
# create a basic analysis of a given community

completeZeroMonthly <- function (data) {	
	firstmonth = as.integer(data$id[1])
	lastmonth = as.integer(data$id[nrow(data)])
	months = data.frame('id'=c(firstmonth:lastmonth))
	completedata <- merge (data, months, all=TRUE)
	completedata[is.na(completedata)] <- 0
	return (completedata)
}

library(optparse)

parse_options <- function () {
	option_list <- list(			
			make_option(c("-d", "--database"), dest="database", 
					help="Database with SCM data"),
			make_option(c("-u", "--dbuser"), dest="dbuser", 
					help="Database user", default="root"),
			make_option(c("-p", "--dbpass"), dest="dbpassword", 
					help="Database user password", default=""),			
			make_option(c("-r", "--reports"), dest="reports", default="",
					help="Reports to be generated (repositories, companies)"),			
			make_option(c("-s", "--start"), dest="startdate", 
					help="Start date for the report", default="1900-01-01"),
			make_option(c("-e", "--end"), dest="enddate", 
					help="End date for the report", default="2100-01-01"),
	)
	parser <- OptionParser(usage = "%prog [options]", option_list = option_list)
	options <- parse_args(parser)
	
	if (is.null(options$database)) {		
		print_help(parser)
		stop("Database param is required")
	}
	
	return (options)
}

library(rjson)
#
# Create a JSON file with some R object
#
createJSON <- function (data, filename) {
	sink(filename)
	cat(toJSON(data))
	sink()
}

library(RMySQL)
connectDB <- function (options) {
	mychannel <- dbConnect(MySQL(), user=options$dbuser, password=options$dbpassword, 
			host="localhost", db=options$database)
	dbGetQuery(mychannel, "SET NAMES 'utf8'")
	return (mychannel)
}
# TODO: Ugly this global mychannel var here!
query <- function(...) dbGetQuery(mychannel, ...)

evol_closed <- function (closed_condition) {
	q <- paste ("SELECT YEAR(changed_on) * 12 + MONTH(changed_on) AS id,
					YEAR(changed_on) as year,
					MONTH(changed_on) as month,
					DATE_FORMAT (changed_on, '%b %Y') as date,
					count(issue_id) AS closed,
					count(distinct(changed_by)) AS closers
				FROM changes
				WHERE ",closed_condition," 
				GROUP BY year,month
				ORDER BY year,month")
	closed <- query(q)
	return (closed)
}

# Closed tickets: time ticket was open, first closed, time-to-first-close
#q <- paste("SELECT issue_id, issue,
#        submitted_on as time_open,
#        time_closed,
#    time_closed_last,
#    TIMESTAMPDIFF (DAY, submitted_on, ch.time_closed) AS ttofix
#      FROM issues, (
#         SELECT
#           issue_id,
#           MIN(changed_on) AS time_closed,
#           MAX(changed_on) as time_closed_last
#         FROM changes
#         WHERE ",closed_condition,"
#         GROUP BY issue_id) ch
#      WHERE issues.id = ch.issue_id")
#res_issues_closed <- query(q)



evol_changed <- function () {
	# Changed and changers 
	q <- paste ("SELECT year(changed_on) * 12 + month (changed_on) AS id,
					year(changed_on) as year,
					month(changed_on) as month,
					DATE_FORMAT (changed_on, '%b %Y') as date,
					count(changed_by) AS changed,
					count(distinct(changed_by)) AS changers
				FROM changes
				GROUP BY year,month
				ORDER BY year,month")
	changed <- query(q)
	return (changed);
}

evol_opened <- function (closed_condition) {
	q <- paste ("SELECT year(submitted_on) * 12 + month(submitted_on) AS id,
					year(submitted_on) AS year,
					month(submitted_on) AS month,
					DATE_FORMAT (submitted_on, '%b %Y') as date,
					count(submitted_by) AS opened,
					count(distinct(submitted_by)) AS openers
				FROM issues
				GROUP BY year,month
				ORDER BY year,month")
	opened <- query(q)
	return (opened)
}

evol_repositories <- function() {
	q <- paste ("SELECT year(submitted_on) * 12 + month(submitted_on) AS id,
					year(submitted_on) AS year,
					month(submitted_on) AS month,
					DATE_FORMAT (submitted_on, '%b %Y') as date,
					count(DISTINCT(tracker_id)) AS repositories
				FROM issues
				GROUP BY year,month
				ORDER BY year,month")
	repos <- query(q)
	return (repos)	
}


people <- function() {
	q <- paste ("select id,name,email,user_id from people")
	list <- query(q)
	return(list)
}

static_info <- function () {
	## Get some general stats from the database and url info
	##
	q <- paste ("SELECT count(*) as tickets,
					count(distinct(submitted_by)) as openers,
					DATE_FORMAT (min(submitted_on), '%Y-%m-%d') as first_date,
					DATE_FORMAT (max(submitted_on), '%Y-%m-%d') as last_date 
					FROM issues")
	data <- query(q)
	q <- paste ("SELECT count(distinct(changed_by)) as closers FROM changes WHERE ", closed_condition)
	data1 <- query(q)
	q <- paste ("SELECT count(distinct(changed_by)) as changers FROM changes")
	data2 <- query(q)
	q <- paste ("SELECT count(*) as opened FROM issues")
	data3 <- query(q)
	q <- paste ("SELECT count(distinct(issue_id)) as changed FROM changes")
	data4 <- query(q)
	q <- paste ("SELECT count(distinct(issue_id)) as closed FROM changes WHERE", closed_condition)
	data5 <- query(q)
	q <- paste ("SELECT url,name as type FROM trackers t JOIN supported_trackers s ON t.type = s.id limit 1")
	data6 <- query(q)
	q <- paste ("SELECT count(*) as repositories FROM trackers")
	data7 <- query(q)
	agg_data = merge(data, data1)
	agg_data = merge(agg_data, data2)
	agg_data = merge(agg_data, data3)
	agg_data = merge(agg_data, data4)
	agg_data = merge(agg_data, data5)
	agg_data = merge(agg_data, data6)
	agg_data = merge(agg_data, data7)
	return(agg_data)
}

# Top
top_closers <- function(days = 0) {
	if (days == 0 ) {
		q <- paste("SELECT p.user_id as closers, count(c.id) as closed 
						FROM changes c JOIN people p ON c.changed_by = p.id 
						WHERE ", closed_condition, " 
						GROUP BY changed_by ORDER BY closed DESC LIMIT 10;")	
	} else {
		q <- paste("SELECT @maxdate:=max(changed_on) from changes limit 1;")
		data <- query(q)
		q <- paste("SELECT p.user_id as closers, count(c.id) as closed 
						FROM changes c JOIN people p ON c.changed_by = p.id 
						WHERE ", closed_condition, " 
						AND c.id in (select id from changes where DATEDIFF(@maxdate,changed_on)<",days,") 
						GROUP BY changed_by ORDER BY closed DESC LIMIT 10;")		
	}
	data <- query(q)
	return (data)	
}


repos_name <- function() {
	# q <- paste ("select SUBSTRING_INDEX(url,'/',-1) AS name FROM trackers")
	q <- paste ("SELECT url AS name FROM trackers")
	repos_list <- query(q)
	return (repos_list)
}

repo_evol_closed <- function(repo, closed_condition){
	q <- paste ("SELECT YEAR(changed_on) * 12 + MONTH(changed_on) AS id,
					YEAR(changed_on) as year,
					MONTH(changed_on) as month,
					DATE_FORMAT (changed_on, '%b %Y') as date,
					COUNT(issue_id) AS closed,
					COUNT(DISTINCT(changed_by)) AS closers ")
	q <- paste (q, "FROM changes ")
	q <- paste (q, "JOIN issues ON (changes.issue_id = issues.id) ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")
	q <- paste (q, "WHERE ")
	q <- paste (q, closed_condition, " ")
	q <- paste (q, "AND trackers.url=",repo)
	q <- paste (q, "GROUP BY year,month ORDER BY year,month")
	closed <- query(q)
	return (closed)	
}

repo_evol_changed <- function(repo){
	q <- paste ("SELECT YEAR(changed_on) * 12 + MONTH(changed_on) AS id,
					YEAR(changed_on) as year,
					MONTH(changed_on) as month,
					DATE_FORMAT (changed_on, '%b %Y') as date,
					COUNT(changed_by) AS changed,
					COUNT(DISTINCT(changed_by)) AS changers")
	q <- paste (q, "FROM changes ")
	q <- paste (q, "JOIN issues ON (changes.issue_id = issues.id) ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")
	q <- paste (q, "WHERE trackers.url=",repo)
	q <- paste (q, "GROUP BY year,month ORDER BY year,month")
	changed <- query(q)
	return (changed)	
}

repo_evol_opened <- function(repo){
	q <- paste ("SELECT YEAR(submitted_on) * 12 + MONTH(submitted_on) AS id,
					YEAR(submitted_on) AS year,
					MONTH(submitted_on) AS month,
					DATE_FORMAT (submitted_on, '%b %Y') as date,
					COUNT(submitted_by) AS opened,
					COUNT(DISTINCT(submitted_by)) AS openers")
	q <- paste (q, "FROM issues ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")
	q <- paste (q, "WHERE trackers.url=",repo)
	q <- paste (q, "GROUP BY year,month ORDER BY year,month")
	opened <- query(q)
	return (opened)	
}

static_info_repo <- function (repo) {
	q <- paste ("SELECT count(distinct(submitted_by)) as openers,
	                count(*) as opened,
					DATE_FORMAT (min(submitted_on), '%Y-%m-%d') as first_date,
					DATE_FORMAT (max(submitted_on), '%Y-%m-%d') as last_date 
					FROM issues ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")
	q <- paste (q, "WHERE trackers.url=",repo)
	data <- query(q)
	q <- paste ("SELECT count(distinct(changed_by)) as closers, ")
	q <- paste (q, "count(distinct(issue_id)) as closed ")
	q <- paste (q, "FROM changes ")
	q <- paste (q, "JOIN issues ON (changes.issue_id = issues.id) ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")	
	q <- paste (q, "WHERE ", closed_condition, " ")	
	q <- paste (q, "AND trackers.url=",repo)
	print(q)
	data1 <- query(q)
	q <- paste ("SELECT count(distinct(changed_by)) as changers, ")
	q <- paste (q, "count(distinct(issue_id)) as changed ")
	q <- paste (q, "FROM changes ")
	q <- paste (q, "JOIN issues ON (changes.issue_id = issues.id) ")
	q <- paste (q, "JOIN trackers ON (issues.tracker_id = trackers.id) ")	
	q <- paste (q, "WHERE trackers.url=",repo)	
	data2 <- query(q)
	agg_data = merge(data, data1)
	agg_data = merge(agg_data, data2)
	return(agg_data)
}
