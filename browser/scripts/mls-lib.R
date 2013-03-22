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

source("./util-lib.R")

analAggregated <- function () {
	# sent
	q <- paste("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					count(message_ID) AS sent
					FROM messages
					GROUP BY year,month
					ORDER BY year,month") 
	
	sent_monthly <- query(q)
	
	# senders
	q <- paste ("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					count(distinct(email_address)) AS senders
					FROM messages
					JOIN messages_people on (messages_people.message_id = messages.message_ID)
					WHERE type_of_recipient='From'
					GROUP BY year,month
					ORDER BY year,month")
	senders_monthly <- query(q)
	
	# repositories
	field = "mailing_list"
	q <- paste ("select distinct(mailing_list) from messages")
	mailing_lists <- query(q)
	if (is.na(mailing_lists$mailing_list)) {
		field = "mailing_list_url"
	}		
	q <- paste ("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					count(DISTINCT(",field,")) AS repositories
					FROM messages
					GROUP BY year,month
					ORDER BY year,month")
	repos_monthly <- query(q)
	
	mls_monthly <- completeZeroMonthly (merge (sent_monthly, senders_monthly, all = TRUE))
	mls_monthly <- completeZeroMonthly (merge (mls_monthly, repos_monthly, all = TRUE))
	mls_monthly[is.na(mls_monthly)] <- 0
	createJSON (mls_monthly, paste("../data/json/mls-evolutionary.json"))	
}

analList <- function (listname) {
	
	field = "mailing_list"
	listname_file = gsub("/","_",listname)
	
	if(length(i <- grep("http",listname))) {
		field = "mailing_list_url"
		cat(listname, " is a URL\n")
	}
	
	
	# Messages sent	
	q <- paste("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					count(message_ID) AS sent
					FROM messages WHERE ",field,"='",listname,"'
					GROUP BY year,month
					ORDER BY year,month",sep = '') 
	
	sent_monthly <- query(q)
	
	print (sent_monthly)
	
	# All subjects
	
	q <- paste ("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					subject
					FROM messages  WHERE ",field,"='",listname,"'
					ORDER BY year,month", sep = '')
	subjects_monthly <- query(q)
	
	
	# Senders
	q <- paste ("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					count(distinct(email_address)) AS senders
					FROM messages
					JOIN messages_people on (messages_people.message_id = messages.message_ID)
					WHERE type_of_recipient='From' AND ",field,"='",listname,"'
					GROUP BY year,month
					ORDER BY year,month", sep = '')
	senders_monthly <- query(q)
	
	# All people monthly
	q <- paste ("SELECT year(first_date) * 12 + month(first_date) AS id,
					year(first_date) AS year,
					month(first_date) AS month,
					DATE_FORMAT (first_date, '%b %Y') as date,
					email_address
					FROM messages
					JOIN messages_people on (messages_people.message_id = messages.message_ID)
					WHERE type_of_recipient='From' AND ",field,"='",listname,"'
					ORDER BY year,month", sep = '')
	emails_monthly <- query(q)
	
	mls_monthly <- completeZeroMonthly (merge (sent_monthly, senders_monthly, all = TRUE))
	mls_monthly[is.na(mls_monthly)] <- 0
	# TODO: Multilist approach. We will obsolete it in future
	createJSON (mls_monthly, paste("../data/json/mls-",listname_file,"-evolutionary.json",sep=''))
	# Multirepos filename
	createJSON (mls_monthly, paste("../data/json/",listname_file,"-mls-evolutionary.json",sep=''))
	# createJSON (subjects_monthly, paste("../data/json/mls-",listname,"-subjects-evolutionary.json",sep=''))
	createJSON (emails_monthly, paste("../data/json/mls-",listname_file,"-emails-evolutionary.json",sep=''))
	
	## Get some general stats from the database
	##
	q <- paste ("SELECT count(*) as sent,
					DATE_FORMAT (min(first_date), '%Y-%m-%d') as first_date,
					DATE_FORMAT (max(first_date), '%Y-%m-%d') as last_date,
					COUNT(DISTINCT(email_address)) as senders
					FROM messages 
					JOIN messages_people on (messages_people.message_id = messages.message_ID)
					WHERE ",field,"='",listname,"'",sep='')
	data <- query(q)
	# TODO: Multilist approach. We will obsolete it in future
	createJSON (data, paste("../data/json/mls-",listname_file,"-static.json",sep=''))
	# Multirepos filename
	createJSON (data, paste("../data/json/",listname_file,"-mls-static.json",sep=''))
}

top_senders <- function(days = 0) {
	if (days == 0 ) {
		q <- paste("SELECT email_address as senders, count(m.message_id) as sent 
						FROM messages m join messages_people m_p on m_p.message_id=m.message_ID 
						GROUP by email_address ORDER BY sent DESC LIMIT 10;")
		
	} else {
		q <- paste("SELECT @maxdate:=max(first_date) from messages limit 1;")
		data <- query(q)
		q <- paste("SELECT email_address as senders, count(m.message_id) as sent 
						FROM messages m join messages_people m_p on m_p.message_id=m.message_ID
						WHERE DATEDIFF(@maxdate,first_date)<",days," 
						GROUP by email_address ORDER BY sent DESC LIMIT 10;")		
	}
	data <- query(q)
	return (data)	
}

static_info <- function () {
	q <- paste ("SELECT count(*) as sent,
					DATE_FORMAT (min(first_date), '%Y-%m-%d') as first_date,
					DATE_FORMAT (max(first_date), '%Y-%m-%d') as last_date
					FROM messages")
	num_msg <- query(q)
	q <- paste ("SELECT count(*) as senders from people")
	num_ppl <- query(q)
	# num repositories
	field = "mailing_list"
	q <- paste ("select distinct(mailing_list) from messages")
	mailing_lists <- query(q)
	if (is.na(mailing_lists$mailing_list)) {
		field = "mailing_list_url"
	}
	q <- paste("SELECT COUNT(DISTINCT(",field,")) AS repositories FROM messages")
	num_repos <- query(q)
	q <- paste("SELECT mailing_list_url as url FROM mailing_lists")
	repo_info <- query(q)
	agg_data = merge(num_msg,num_ppl)
	agg_data = merge(agg_data, num_repos)
	agg_data = merge(agg_data, repo_info)
	return (agg_data)
}