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
  #the checkpoint of 'uauthor_id is null' is because in this way
  #we're only taking info from the changelog, and ignoring info from 
  #cvsanaly.

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
                  from   scmlog_extra s 
                  where  uauthor_changelog is not null
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


evol_notrev_commits <- function(granularity){
  #Not Reviewed Commits evolution

  q<- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits_not_rev, 0) as commits_not_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.id)) as commits_not_rev
                  from   scmlog_extra s
                  where  ureviewer_changelog is null and
                         uauthor_changelog is not null
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_notrev_commits <- query(q)
  return (data_notrev_commits)
}

evol_rev_commits <- function(granularity){
  #Reviewed Commits evolution

  q<- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits_rev, 0) as commits_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.id)) as commits_rev
                  from   scmlog_extra s
                  where  ureviewer_changelog is not null and
                         uauthor_changelog is not null
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_rev_commits <- query(q)
  return (data_rev_commits)
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
                  from   scmlog_extra s 
                  where s.uauthor_changelog is not null
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
					count(distinct(s.uauthor_changelog)) as authors
				from   scmlog_extra s 
                                where  s.uauthor_changelog is not null
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

evol_authors_rev <- function(granularity){
        # Authors evolution
        q <- paste ("select m.id as id,
                        m.year as year,
                        m.month as month,
                        DATE_FORMAT(m.date, '%b %Y') as date,
                        IFNULL(pm.authors, 0) as authors_rev
                        from   months m
                        left join(
                                select year(s.date) as year,
                                        month(s.date) as month,
                                        count(distinct(s.uauthor_changelog)) as authors
                                from   scmlog_extra s
                                where  s.uauthor_changelog is not null and
                                       s.ureviewer_changelog is not null
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

evol_authors_notrev <- function(granularity){
        # Authors evolution
        q <- paste ("select m.id as id,
                        m.year as year,
                        m.month as month,
                        DATE_FORMAT(m.date, '%b %Y') as date,
                        IFNULL(pm.authors, 0) as authors_not_rev
                        from   months m
                        left join(
                                select year(s.date) as year,
                                        month(s.date) as month,
                                        count(distinct(s.uauthor_changelog)) as authors_notrev
                                from   scmlog_extra s
                                where  s.uauthor_changelog is not null and
                                       s.ureviewer_changelog is null
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



evol_reviewers <- function(granularity){
        # Reviewers evolution
        q <- paste ("select m.id as id,
                        m.year as year,
                        m.month as month,
                        DATE_FORMAT(m.date, '%b %Y') as date,
                        IFNULL(pm.reviewers, 0) as reviewers
                        from   months m
                        left join(
                                select year(s.date) as year,
                                        month(s.date) as month,
                                        count(distinct(s.ureviewer_changelog)) as reviewers
                                from   scmlog_extra s
                                where  s.ureviewer_changelog is not null and
                                       s.uauthor_changelog is not null
                                group by year(s.date),
                                        month(s.date)
                                order by year(s.date),
                                        month(s.date) ) as pm
                        on (
                                m.year = pm.year and
                                m.month = pm.month);")

        data_reviewers <- query(q)

        return (data_reviewers)
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
                  from   scmlog_extra s, 
                         actions a
                  where  a.commit_id = s.id and
                         s.uauthor_changelog is not null
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

evol_files_rev <- function(granularity){
  
  #Files per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files_rev
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(a.file_id)) as files
                  from   scmlog_extra s,
                         actions a
                  where  a.commit_id = s.id and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null
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


evol_files_not_rev <- function(granularity){
  
  #Files per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files_not_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(a.file_id)) as files
                  from   scmlog_extra s,
                         actions a
                  where  a.commit_id = s.id and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null
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
                  from   scmlog_extra s, 
                         actions a
                  where  a.commit_id = s.id and
                         s.uauthor_changelog is not null
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
                  from   scmlog_extra s
                  where  s.uauthor_changelog is not null
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

evol_info_data_rev <- function() {

	# Get some general stats from the database
	##
	q <- paste("SELECT count(id) as commits, 
				count(distinct(committer_id)) as committers, 
				count(distinct(uauthor_changelog)) as authors, 
                                count(distinct(ureviewer_changelog)) as reviewers,
				DATE_FORMAT (min(date), '%Y-%m-%d') as first_date, 
				DATE_FORMAT (max(date), '%Y-%m-%d') as last_date 
				FROM scmlog_extra
                                where uauthor_changelog is not null and
                                ureviewer_changelog is not null;")
	data1 <- query(q)
	q <- paste("SELECT count(distinct(name)) as branches from branches")
	data2 <- query(q)
	q <- paste("SELECT count(distinct(file_id)) as files 
                    from actions a,
                         scmlog_extra s
                    where a.commit_id = s.id and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null ")
	data3 <- query(q)
	q <- paste("SELECT count(distinct(uri)) as repositories from repositories")
	data4 <- query(q)
	q <- paste("SELECT count(*) as actions 
                    from actions a, 
                         scmlog_extra s
                    where s.id = a.commit_id and 
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
	data5 <- query(q)
	q <- paste("select uri as url,type from repositories")
	data6 <- query(q)
        q <- paste("select count(distinct(s.id))/timestampdiff(month,min(s.date),max(s.date)) as avg_commits_month 
                    from scmlog_extra s 
                    where s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
        data7 <- query(q)
        q <- paste("select count(distinct(a.file_id))/timestampdiff(month,min(s.date),max(s.date)) as avg_files_month 
                    from scmlog_extra s, 
                         actions a 
                    where a.commit_id=s.id and 
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
        data8 <- query(q)
        q <- paste("select count(distinct(s.id))/count(distinct(i.udev)) as avg_commits_author 
                    from scmlog_extra s, 
                         identities i 
                    where i.udev=s.uauthor_changelog and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
        data9 <- query(q)
        q <- paste("select count(distinct(s.uauthor_changelog))/timestampdiff(month,min(s.date),max(s.date)) as avg_authors_month 
                    from scmlog_extra s
                    where s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
        data10 <- query(q)
        q <- paste("select count(distinct(s.ureviewer_changelog))/timestampdiff(month,min(s.date),max(s.date)) as avg_reviewers_month 
                     from scmlog_extra s
                     where s.uauthor_changelog is not null and
                           s.ureviewer_changelog is not null")
        data11 <- query(q)
        q <- paste("select count(distinct(a.file_id))/count(distinct(s.uauthor_changelog)) as avg_files_author 
                    from scmlog_extra s, 
                         actions a 
                    where a.commit_id=s.id and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null")
        data12 <- query(q)
        q <- paste ("select count(*) as companies from companies where name <> 'webkit' and name <> 'unknown' and name <> 'volunteer'")
        data13 <- query(q)

        q <- paste("select count(distinct(c.id)) as companies_2006
                    from scmlog_extra s,
                         people_companies pc,
                         companies c
                    where s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null and 
                          c.name <>'webkit' and
                          c.name <>'unknown' and
                          c.name <> 'volunteer' and
                          year(s.date) = 2006")
        data14 <- query(q)
        q <- paste("select count(distinct(c.id)) as companies_2009
                    from scmlog_extra s,
                         people_companies pc,
                         companies c
                    where s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null and 
                          c.name <>'webkit' and
                          c.name <>'unknown' and
                          c.name <> 'volunteer' and
                          year(s.date) = 2009")
        data15 <- query(q)
        q <- paste("select count(distinct(c.id)) as companies_2012
                    from scmlog_extra s,
                         people_companies pc,
                         companies c
                    where s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null and 
                          c.name <>'webkit' and
                          c.name <>'unknown' and
                          c.name <> 'volunteer' and
                          year(s.date) = 2012")
        data16 <- query(q)


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
        agg_data = merge(agg_data, data13)
        agg_data = merge(agg_data, data14)
        agg_data = merge(agg_data, data15)
        agg_data = merge(agg_data, data16)
	return (agg_data)
}

top_authors <- function() {
	q <- paste("select i.identity as name, 
                          count(distinct(s.id)) as commits
                   from   identities i,
                          scmlog_extra s
                   where  s.uauthor_changelog = i.udev and
                          i.type = 'name' and
                          s.uauthor_changelog is not null
                   group by i.udev
                   order by count(distinct(s.id)) desc
                   limit 10;")

        data_top_authors = query(q)
        return (data_top_authors)


}

top_authors_rev <- function() {
        q <- paste("select i.identity as author_rev,
                          count(distinct(s.id)) as commits_rev
                   from   identities i,
                          scmlog_extra s
                   where  s.uauthor_changelog = i.udev and
                          i.type = 'name' and
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null
                   group by i.udev
                   order by count(distinct(s.id)) desc
                   limit 10;")

        data_top_authors = query(q)
        return (data_top_authors)


}


top_authors_rev_year <- function(year) {
        q <- paste("select i.identity as author_rev,
                          count(distinct(s.id)) as commits_rev
                   from   identities i,
                          scmlog_extra s
                   where  s.uauthor_changelog = i.udev and
                          i.type = 'name' and 
                          s.uauthor_changelog is not null and
                          s.ureviewer_changelog is not null and
                          year(s.date)=",year," 
                   group by i.udev
                   order by count(distinct(s.id)) desc
                   limit 10;")
        
        data_top_authors = query(q)
        return (data_top_authors)


}


top_reviewers <- function() {
        q <- paste("select i.identity as name, 
                          count(distinct(s.id)) as commits
                   from   identities i,
                          scmlog_extra s
                   where  s.ureviewer_changelog = i.udev and
                          i.type = 'name' and
                          s.uauthor_changelog is not null
                   group by i.identity
                   order by count(distinct(s.id)) desc
                   limit 10;")
        
        data_top_reviewers = query(q)
        return (data_top_reviewers)
}


top_committers <- function(days = 0) {
	if (days == 0 ) {
	q <- paste("SELECT count(s.id) as commits, p.email as developer
				FROM scmlog_extra s JOIN people p ON p.id=s.committer_id 
				GROUP BY p.email ORDER BY commits DESC 
				LIMIT 10;")
	} else {
    q <- paste("SELECT @maxdate:=max(date) from scmlog_extra limit 1;")
    data <- query(q)
	q <- paste("SELECT count(s.id) as commits, p.email as developer
			   FROM scmlog_extra s JOIN people p ON p.id=s.committer_id
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
                      scmlog_extra s
                 where c.id = pc.company_id and
                       pc.author_id = s.uauthor_changelog and
                       c.name <>'webkit' and
                       c.name <>'unknown' and
                       c.name <>'volunteer'
                 group by c.name
                 order by count(distinct(s.id)) desc;")
    companies_list <- query(q)
    return (companies_list)
}

companies_evolution <- function(){
#unique number of active companies per month and its evolution

    q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.companies, 0) as num_companies
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(pc.company_id)) as companies
                  from   scmlog_extra s,
                         people_companies pc
                  where  s.uauthor_changelog = pc.author_id and
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

    num_companies<- query(q)
    print (num_companies)
}


companies_evolution_rev <- function(){

    q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.companies, 0) as num_companies_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(pc.company_id)) as companies
                  from   scmlog_extra s,
                         people_companies pc
                  where  s.uauthor_changelog = pc.author_id and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
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
                  
    num_companies_rev<- query(q)
    print (num_companies_rev)


}


companies_evolution_not_rev <- function() {

    q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.companies, 0) as num_companies_not_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(pc.company_id)) as companies
                  from   scmlog_extra s,
                         people_companies pc
                  where  s.uauthor_changelog = pc.author_id and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
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
                  
    num_companies_notrev<- query(q)
    print (num_companies_notrev)
}


companies_reviewers <- function(){
#companies that are able to review, and their reviewers activity

    q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.companies, 0) as num_companies
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(pc.company_id)) as companies_reviewers
                  from   scmlog_extra s,
                         people_companies pc
                  where  s.ureviewer_changelog = pc.author_id and
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
                  
    num_companies_reviewer<- query(q)
    print (num_companies_reviewer)

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


company_notrev_commits <- function(company_name){

    q <- paste("select  m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits, 0) as commits_not_rev
           from  months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.id)) as commits
                  from   scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
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

company_rev_commits <- function(company_name){

    q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits, 0) as commits_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.id)) as commits
                  from   scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
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

company_files <- function(company_name) {

    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(a.file_id)) as files
                  from   scmlog_extra s,
                         actions a,
                         people_companies pc,
                         companies c
                  where  a.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
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

    files <- query(q)
    print (files)
    return (files)
}


company_notrev_files <- function(company_name) {

    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files_not_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(a.file_id)) as files
                  from   scmlog_extra s,
                         actions a,
                         people_companies pc,
                         companies c
                  where  a.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by year(s.date),
                         month(s.date) 
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month)
           order by m.id;")

    files <- query(q)
    print (files)
    return (files)
}

company_rev_files <- function(company_name) {


    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.files, 0) as files_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(a.file_id)) as files
                  from   scmlog_extra s,
                         actions a,
                         people_companies pc,
                         companies c
                  where  a.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by year(s.date),
                         month(s.date) 
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month)
           order by m.id;")

    files <- query(q)
    print (files)
    return (files)
}


company_authors <- function(company_name) {


    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.authors, 0) as authors
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.uauthor_changelog)) as authors
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
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month)
           order by m.id;")

    authors <- query(q)
    print (authors)
    return (authors)
}


company_authors_rev <- function(company_name) {


    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.authors, 0) as authors_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.uauthor_changelog)) as authors
                  from   scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month)
           order by m.id;")

    authors_rev <- query(q)
    print (authors_rev)
    return (authors_rev)
}


company_authors_notrev <- function(company_name) {


    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.authors, 0) as authors_notrev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.uauthor_changelog)) as authors
                  from   scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month)
           order by m.id;")

    authors_notrev <- query(q)
    print (authors_notrev)
    return (authors_notrev)
}




company_reviewers <- function(company_name) {


    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.reviewers, 0) as reviewers
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         count(distinct(s.ureviewer_changelog)) as reviewers
                  from   scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  s.ureviewer_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null  and
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

    authors <- query(q)
    print (authors)
    return (authors)
}


company_lines <- function(company_name) {

    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.added_lines, 0) as added_lines,
                  IFNULL(pm.removed_lines, 0) as removed_lines
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         sum(cl.added) as added_lines,
                         sum(cl.removed) as removed_lines
                  from   commits_lines cl,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  cl.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
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

    lines_added_removed <- query(q)
    print (lines_added_removed)
    return (lines_added_removed)
}


company_lines_rev <- function(company_name) {

    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.added_lines, 0) as added_lines_rev,
                  IFNULL(pm.removed_lines, 0) as removed_lines_rev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         sum(cl.added) as added_lines,
                         sum(cl.removed) as removed_lines
                  from   commits_lines cl,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  cl.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
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

    lines_added_removed <- query(q)
    print (company_lines_rev)
    return (lines_added_removed)
}

company_lines_notrev <- function(company_name) {

    q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.added_lines, 0) as added_lines_notrev,
                  IFNULL(pm.removed_lines, 0) as removed_lines_notrev
           from   months m
           left join(
                  select year(s.date) as year,
                         month(s.date) as month,
                         sum(cl.added) as added_lines,
                         sum(cl.removed) as removed_lines
                  from   commits_lines cl,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  cl.commit_id = s.id and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
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

    lines_added_removed <- query(q)
    print (lines_added_removed)
    return (lines_added_removed)
}






evol_info_data_company_rev <- function(company_name) {

        # Get some general stats from the database
        ##
        q <- paste("SELECT count(distinct(s.id)) as commits_rev, 
                                count(distinct(s.uauthor_changelog)) as authors_rev,
                                DATE_FORMAT (min(s.date), '%Y-%m-%d') as first_date,
                                DATE_FORMAT (max(s.date), '%Y-%m-%d') as last_date
                                FROM scmlog_extra s,
                                     people_companies pc,
                                     companies c
                                where s.uauthor_changelog = pc.author_id and
                                      pc.company_id = c.id and
                                      c.name =", company_name, " and
                                      s.uauthor_changelog is not null and
                                      s.ureviewer_changelog is not null and
                                      s.date>=pc.init and 
                                      s.date<=pc.end;")
        data1 <- query(q)
        q <- paste("SELECT count(distinct(file_id)) as files_rev
                    from actions a,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                    where a.commit_id = s.id and
                          s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
        data3 <- query(q)
        q <- paste("SELECT count(*) as actions_rev 
                    from actions a, 
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                    where s.id = a.commit_id and 
                          s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
        data5 <- query(q)
        q <- paste("select count(distinct(s.id))/timestampdiff(month,min(s.date),max(s.date)) as avg_commits_month_rev
                    from scmlog_extra s,
                    people_companies pc,
                         companies c
                    where s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
                         
        data7 <- query(q)
        q <- paste("select count(distinct(a.file_id))/timestampdiff(month,min(s.date),max(s.date)) as avg_files_month_rev
                    from scmlog_extra s, 
                         actions a,
                         people_companies pc,
                         companies c
                    where a.commit_id=s.id and 
                          s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
        data8 <- query(q)
        q <- paste("select count(distinct(s.id))/count(distinct(i.udev)) as avg_commits_author_rev
                    from scmlog_extra s, 
                         identities i,
                         people_companies pc,
                         companies c
                    where i.udev=s.uauthor_changelog and
                          s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
        data9 <- query(q)
        q <- paste("select count(distinct(s.uauthor_changelog))/timestampdiff(month,min(s.date),max(s.date)) as avg_authors_month_rev
                    from scmlog_extra s,
                    people_companies pc,
                    companies c
                    where s.uauthor_changelog is not null and
                    s.uauthor_changelog = pc.author_id and
                    pc.company_id = c.id and
                    c.name =", company_name, " and
                    s.ureviewer_changelog is not null and
                    s.date>=pc.init and 
                    s.date<=pc.end;")
        data10 <- query(q)
        q <- paste("select count(distinct(s.ureviewer_changelog))/timestampdiff(month,min(s.date),max(s.date)) as avg_reviewers_month 
                     from scmlog_extra s,
                     people_companies pc,
                     companies c
                     where s.uauthor_changelog is not null and
                     s.uauthor_changelog = pc.author_id and
                     pc.company_id = c.id and
                     c.name =", company_name, " and
                     s.ureviewer_changelog is not null and
                     s.date>=pc.init and 
                     s.date<=pc.end;")
        data11 <- query(q)
        q <- paste("select count(distinct(a.file_id))/count(distinct(s.uauthor_changelog)) as avg_files_author_rev
                    from scmlog_extra s, 
                         actions a,
                         people_companies pc,
                         companies c
                    where a.commit_id=s.id and
                          s.uauthor_changelog is not null and
                          s.uauthor_changelog = pc.author_id and
                          pc.company_id = c.id and
                          c.name =", company_name, " and
                          s.ureviewer_changelog is not null and
                          s.date>=pc.init and 
                          s.date<=pc.end;")
        data12 <- query(q)
        agg_data = merge(data1, data3)
        agg_data = merge(agg_data, data5)
        agg_data = merge(agg_data, data7)
        agg_data = merge(agg_data, data8)
        agg_data = merge(agg_data, data9)
        agg_data = merge(agg_data, data10)
        agg_data = merge(agg_data, data11)
        agg_data = merge(agg_data, data12)
        return (agg_data)
}



company_top_authors <- function(company_name) {

    q <- paste ("select i.identity as author,
                         count(distinct(s.id)) as commits                         
                  from   identities i,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  i.udev = s.uauthor_changelog and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         i.type = 'name' and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by i.udev
                  order by count(distinct(s.id)) desc
                  limit 10;")

    top_authors <- query(q)
    return (top_authors)
}

company_top_authors_rev <- function(company_name) {

    q <- paste ("select i.identity as author_rev,
                         count(distinct(s.id)) as commits_rev
                  from   identities i,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  i.udev = s.uauthor_changelog and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
                         i.type = 'name' and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by i.udev
                  order by count(distinct(s.id)) desc
                  limit 10;")

    top_authors_rev <- query(q)
    return (top_authors_rev)
}

company_top_authors_notrev <- function(company_name) {

    q <- paste ("select i.identity as author_notrev,
                         count(distinct(s.id)) as commits_notrev
                  from   identities i,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  i.udev = s.uauthor_changelog and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is null and
                         i.type = 'name' and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by i.udev
                  order by count(distinct(s.id)) desc
                  limit 10;")

    top_authors_notrev <- query(q)
    return (top_authors_notrev)
}




company_top_reviewers <- function(company_name) {

    q <- paste ("select i.identity as reviewer,
                         count(distinct(s.id)) as commits                         
                  from   identities i,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  i.udev = s.ureviewer_changelog and
                         s.ureviewer_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         i.type = 'name' and 
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by i.udev
                  order by count(distinct(s.id)) desc
                  limit 10;")

    top_reviewers <- query(q)
    return (top_reviewers)
}


company_top_authors_year_rev <- function(company_name, year){

    q <- paste ("select  i.identity as author_rev,
                         count(distinct(s.id)) as commits_rev
                  from   identities i,
                         scmlog_extra s,
                         people_companies pc,
                         companies c
                  where  i.udev = s.uauthor_changelog and
                         s.uauthor_changelog = pc.author_id and
                         pc.company_id = c.id and
                         c.name =", company_name, " and
                         s.uauthor_changelog is not null and
                         s.ureviewer_changelog is not null and
                         i.type = 'name' and
                         year(s.date)=",year," and
                         s.date>=pc.init and 
                         s.date<=pc.end
                  group by i.udev
                  order by count(distinct(s.id)) desc
                  limit 10;")
    print (q)
    top_authors_year_rev <- query(q)
    return (top_authors_year_rev)

}




