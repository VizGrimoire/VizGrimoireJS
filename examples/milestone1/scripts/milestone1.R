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
#   Alvaro del Castillo <acs@bitergia.com>


#R library that contains all of the necessary queries to 
#create a basic analysis of a given community

library(RMySQL)


#
# Connect to the database and prepare...
#
mychannel <- dbConnect(MySQL(), user=user, password=password, host="localhost", db=database)
query <- function(...) dbGetQuery(mychannel, ...)


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

evol_commits_noLiferay <- function(granularity){
  #Commits evolution

  q<- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.commits_noLiferay, 0) as commits_noLiferay
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(s.id)) as commits_noLiferay
                  from   scmlog s  join people on (s.author_id = people.id)
                  where email not like '%liferay%'
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_commits_noLiferay <- query(q)
  return (data_commits_noLiferay)
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
                         count(distinct(email)) as committers
                  from   scmlog s 
                  join people on (people.id = s.committer_id)
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
                         count(distinct(email)) as authors
                  from   scmlog s 
                  join people on (people.id = s.author_id)
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

evol_authors_noLiferay <- function(granularity){
  # Authors evolution
  q <- paste ("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.authors_noLiferay, 0) as authors_noLiferay
           from   months m
           left join(
                  select year(s.date) as year, 
                         month(s.date) as month, 
                         count(distinct(email)) as authors_noLiferay
                  from   scmlog s join people on (s.author_id = people.id)
                  where email not like '%liferay%'
                  group by year(s.date),
                         month(s.date)
                  order by year(s.date),
                         month(s.date) ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")

  data_authors_noLiferay <- query(q)

  return (data_authors_noLiferay)
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

evol_lines_added <- function(granularity) {

  # Lines added per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.lines_added, 0) as lines_added
           from   months m
           left join(
                SELECT year(s.date) as year, month(s.date) as month, sum(added) as lines_added
                FROM   scmlog s
                JOIN commits_lines
                ON (commits_lines.commit_id = s.id)
                GROUP BY year(s.date), month(s.date)
                ORDER BY year(s.date), month(s.date)
           ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")
  data_repositories <- query(q)
  return (data_repositories)
}

evol_lines_removed <- function(granularity) {

  # Lines added per month
  q <- paste("select m.id as id,
                  m.year as year,
                  m.month as month,
                  DATE_FORMAT(m.date, '%b %Y') as date,
                  IFNULL(pm.lines_removed, 0) as lines_removed
           from   months m
           left join(
                SELECT year(s.date) as year, month(s.date) as month, sum(removed) as lines_removed
                FROM   scmlog s
                JOIN commits_lines
                ON (commits_lines.commit_id = s.id)
                GROUP BY year(s.date), month(s.date)
                ORDER BY year(s.date), month(s.date)
           ) as pm
           on (
                  m.year = pm.year and
                  m.month = pm.month);")
  data_repositories <- query(q)
  return (data_repositories)
}
