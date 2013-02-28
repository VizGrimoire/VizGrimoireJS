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
# This file is a part of the VizGrimoireJS package
# http://vizgrimoire.bitergia.org/
#
# Analyze and extract metrics from data gathered by MailingListStats tool
# http://metricsgrimoire.github.com/MailingListStats/

source("./mls-lib.R")

options <- parse_options()

mychannel = connectDB(options)

enddatesplit <- strsplit(options$enddate,'-')
endyear <- enddatesplit[[1]][1]
endmonth <- enddatesplit[[1]][2]
enddate <- paste (c("'", options$enddate, "'"), collapse='')

startdatesplit <- strsplit(options$startdate,'-')
startyear <- startdatesplit[[1]][1]
startmonth <- startdatesplit[[1]][2]
startdate <- paste (c("'", options$startdate, "'"), collapse='')

# Mailing lists
q <- paste ("select distinct(mailing_list) from messages")
mailing_lists <- query(q)

if (is.na(mailing_lists$mailing_list)) {
    print ("URL Mailing List")
    q <- paste ("select distinct(mailing_list_url) from messages")
    mailing_lists <- query(q)
    mailing_lists_files <- query(q) 
    mailing_lists_files$mailing_list = gsub("/","_",mailing_lists$mailing_list)
    # print (mailing_lists)
    createJSON (mailing_lists_files, "../data/json/mls-lists.json")
} else {
    print (mailing_lists)
    createJSON (mailing_lists, "../data/json/mls-lists.json")
}

# Aggregated data
static_data <- static_info()
createJSON (static_data, paste("../data/json/mls-static.json",sep=''))

for (mlist in mailing_lists$mailing_list) {
    analList(mlist)
}
analAggregated()

# Top senders
top_senders_data <- list()
top_senders_data[['senders.']]<-top_senders()
top_senders_data[['senders.last year']]<-top_senders(365)
top_senders_data[['senders.last month']]<-top_senders(31)

createJSON (top_senders_data, "../data/json/mls-top.json")

# People list
q <- paste ("select email_address as id, email_address, name, username from people")
people <- query(q)
createJSON (people, "../data/json/mls-people.json")

# Disconnect from DB
dbDisconnect(con)