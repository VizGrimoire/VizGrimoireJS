# Copyright (C) 2012 Bitergia
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
# Authors :
#	Daniel Izquierdo Cortazar <dizquierdo@bitergia.com>
#	Jesus Gonzalez Barahona <jgb@bitergia.com>
#	Alvaro del Castillo San Felix <acs@bitergia.com>


#R library that contains all of the necessary queries to 
#create a basic analysis of a given community

library(RMySQL)


#
# Connect to the database and prepare...
#
mychannel <- dbConnect(MySQL(), user=user, password=password, host="localhost", db=database)
query <- function(...) dbGetQuery(mychannel, ...)
dbGetQuery(mychannel, "SET NAMES 'utf8'")

#TODO: add support for the granularity option  (not user so far)



evol_commits <- function(granularity){
  #Commits evolution

  q<- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits, 0) as commits
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(s.id)) as commits
                  from   scmlog s 
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_commits <- query(q)
  return (data_commits)
}


evol_committers <- function(granularity){
  #Committers evolution
  q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.committers, 0) as committers
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(s.committer_id)) as committers
                  from   scmlog s 
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_committers <- query(q)

  return (data_committers)
}

evol_authors <- function(granularity){
	# Authors evolution
	q <- paste ("select m.id as id,
					m.year as year,
					m.month as month,
					DATE_FORMAT(m.date, '%b %Y') as date,
					IFNULL(pm.authors, 0) as authors
					from   months m
					left join(
					select year(s.date) as year, 
					month(s.date) as month, 
					count(distinct(s.author_id)) as authors
					from   scmlog s 
					group by year(s.date),
					month(s.date)
					order by year(s.date),
					month(s.date) ) as pm
					on (
					m.year = pm.year and
					m.month = pm.month);")
	
	data_authors <- query(q)
	
	return (data_authors)
}



evol_files <- function(granularity){

  #Files per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(a.file_id)) as files
                  from   scmlog s, 
                         actions a
                  where  a.commit_id = s.id
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")


  data_files <- query(q)

  return (data_files)
}


evol_branches <- function(granularity){

  #Branches per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.branches, 0) as branches
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(a.branch_id)) as branches
                  from   scmlog s, 
                         actions a
                  where  a.commit_id = s.id
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (     
                  m.year = pm.year and
                  m.month = pm.month);")

  data_branches <- query(q)

  return (data_branches)
}


evol_repositories <- function(granularity) {

  # Repositories per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.repositories, 0) as repositories
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.repository_id)) as repositories
                  from   scmlog s
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")
  data_repositories <- query(q)
  return (data_repositories)
}

evol_info_data <- function() {

	# Get some general stats from the database
	##
	q <- paste("SELECT count(id) as commits, 
				count(distinct(committer_id)) as committers, 
				count(distinct(author_id)) as authors, 
				DATE_FORMAT (min(date), '%Y-%m-%d') as first_date, 
				DATE_FORMAT (max(date), '%Y-%m-%d') as last_date 
				FROM scmlog;")
	data1 <- query(q)
	q <- paste("SELECT count(distinct(name)) as branches from branches")
	data2 <- query(q)
	q <- paste("SELECT count(distinct(file_name)) as files from files")
	data3 <- query(q)
	q <- paste("SELECT count(distinct(uri)) as repositories from repositories")
	data4 <- query(q)
	q <- paste("SELECT count(*) as actions from actions")
	data5 <- query(q)
	q <- paste("select uri as url,type from repositories")
	data6 <- query(q)
    q <- paste("select count(distinct(s.id))/timestampdiff(month,min(s.date),max(s.date)) 
				as avg_commits_month from scmlog s")
    data7 <- query(q)
    q <- paste("select count(distinct(a.file_id))/timestampdiff(month,min(s.date),max(s.date)) 
				as avg_files_month from scmlog s, actions a where a.commit_id=s.id")
    data8 <- query(q)
    q <- paste("select count(distinct(s.id))/count(distinct(p.id)) 
				as avg_commits_author from scmlog s, people p where p.id=s.author_id")
    data9 <- query(q)
    q <- paste("select count(distinct(s.author_id))/timestampdiff(month,min(s.date),max(s.date)) 
				as avg_authors_month from scmlog s")
    data10 <- query(q)
    q <- paste("select count(distinct(s.committer_id))/timestampdiff(month,min(s.date),max(s.date)) 
				as avg_committers_month from scmlog s")
    data11 <- query(q)
    q <- paste("select count(distinct(a.file_id))/count(distinct(s.author_id)) 
				as avg_files_author from scmlog s, actions a where a.commit_id=s.id")
    data12 <- query(q)
	agg_data = merge(data1, data2)
	agg_data = merge(agg_data, data3)
	agg_data = merge(agg_data, data4)
	agg_data = merge(agg_data, data5)
	agg_data = merge(agg_data, data6)
    agg_data = merge(agg_data, data7)
    agg_data = merge(agg_data, data8)
    agg_data = merge(agg_data, data9)
    agg_data = merge(agg_data, data10)
    agg_data = merge(agg_data, data11)
    agg_data = merge(agg_data, data12)
	return (agg_data)
}

top_committers <- function(days = 0) {
	if (days == 0 ) {
	q <- paste("SELECT count(s.id) as commits, p.email as developer
				FROM scmlog s JOIN people p ON p.id=s.committer_id 
				GROUP BY p.email ORDER BY commits DESC 
				LIMIT 10;")
	} else {
    q <- paste("SELECT @maxdate:=max(date) from scmlog limit 1;")
    data <- query(q)
	q <- paste("SELECT count(s.id) as commits, p.email as developer
			   FROM scmlog s JOIN people p ON p.id=s.committer_id
			   WHERE DATEDIFF(@maxdate,date)<",days," 
			   GROUP BY p.email ORDER BY commits DESC 
			   LIMIT 10;")
	}
	data <- query(q)
	return (data)	
}

top_files_modified <- function() {
	q <- paste("select file_name, count(commit_id) as modifications 
				from action_files a join files f on a.file_id = f.id 
				where action_type='M' group by f.id 
				order by modifications desc limit 10; ")	
	data <- query(q)
	return (data)	
}

people <- function() {
    q <- paste ("select id,name,email from people")
    people_list <- query(q)
    return (people_list);
}

companies_name <- function() {
	q <- paste ("select c.name 
					from companies c,
					people_companies pc,
					scmlog s
					where c.id = pc.company_id and
					pc.people_id = s.author_id
					group by c.name
					order by count(distinct(s.id)) desc;")
	companies_list <- query(q)
	return (companies_list)
}

company_commits <- function(company_name){
	
	
	print (company_name)
	q <- paste("select m.id as id,
					m.year as year,
					m.month as month,
					DATE_FORMAT(m.date, '%b %Y') as date,
					IFNULL(pm.commits, 0) as commits
					from   months m
					left join(
					select year(s.date) as year,
					month(s.date) as month,
					count(distinct(s.id)) as commits
					from   scmlog_extra s,
					people_companies pc,
					companies c
					where  s.uauthor_changelog = pc.author_id and
					pc.company_id = c.id and
					c.name =", company_name, " and
					s.uauthor_changelog is not null and
					s.date>=pc.init and 
					s.date<=pc.end
					group by year(s.date),
					month(s.date)
					order by year(s.date),
					month(s.date)) as pm
					on (
					m.year = pm.year and
					m.month = pm.month)
					order by m.id;")
	
	company_c <- query(q)
	print (company_c)
	return (company_c)
}

company_commits <- function(company_name){		
	print (company_name)
	q <- paste("select m.id as id,
					m.year as year,
					m.month as month,
					DATE_FORMAT(m.date, '%b %Y') as date,
					IFNULL(pm.commits, 0) as commits
					from   months m
					left join(
					select year(s.date) as year,
					month(s.date) as month,
					count(distinct(s.id)) as commits
					from   scmlog s,
					people_companies pc,
					companies c
					where  s.author_id = pc.people_id and
					pc.company_id = c.id and
					c.name =", company_name, " and
					group by year(s.date),
					month(s.date)
					order by year(s.date),
					month(s.date)) as pm
					on (
					m.year = pm.year and
					m.month = pm.month)
					order by m.id;")
	
	company_c <- query(q)
	print (company_c)
	return (company_c)
}