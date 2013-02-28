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
#
# Note: this script works with MailingListStats tool

completeZeroMonthly <- function (data) {	
	firstmonth = as.integer(data$id[1])
	lastmonth = as.integer(data$id[nrow(data)])
	months = data.frame('id'=c(firstmonth:lastmonth))
	completedata <- merge (data, months, all=TRUE)
	completedata[is.na(completedata)] <- 0
	return (completedata)
}

library(optparse)

options_common <- function () {
	option_list <- list(			
			make_option(c("-d", "--database"), dest="database", 
					help="Database with MLS data"),
			make_option(c("-u", "--dbuser"), dest="dbuser", 
					help="Database user", default="root"),
			make_option(c("-p", "--dbpass"), dest="dbpassword", 
					help="Database user password", default=""),			
			make_option(c("-r", "--reports"), dest="reports", default="",
					help="Reports to be generated (repositories, companies)"),			
			make_option(c("-s", "--start"), dest="startdate", 
					help="Start date for the report", default="1900-01-01"),
			make_option(c("-e", "--end"), dest="enddate", 
					help="End date for the report", default="2100-01-01")
	)
	return (option_list)
}

parse_options <- function () {
	option_list <- options_common()
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