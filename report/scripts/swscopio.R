#
# swcopio
#
# R library for the swscopio system
#
# Author: Jesus M. Gonzalez-Barahona <jgb@bitergia.com>
#

#
# Merge two dataframes with weekly data, filling holes with 0
#
# Both dataframes should have a "yearweek" column, which is an integer year*52+week
#
mergeWeekly <- function (d1, d2) {

d = merge (d1, d2, all=TRUE)
firstweek = as.integer(d$yearweek[1])
lastweek = as.integer(d$yearweek[nrow(d)])
weeks = data.frame('yearweek'=c(firstweek:lastweek))
d = merge (d, weeks, all=TRUE)
d[is.na(d)] <- 0

return (d)
}


#
# List of colors for plots
#
colors <- c("black", "green", "red", "blue", "orange", "brown")

#
# Plot several columns of a timeserie
#
#  data: data frame to plot
#  columns: names of the columns in data frame to plot
#  labels: strings to show as labels
#

plotTimeSerieWeekN <- function (data, columns, filename, labels=columns) {
   pdffilename <- paste (c(filename, ".pdf"), collapse='')
   pdffilenamediff <- paste (c(filename, "-diff.pdf"), collapse='')
   pdffilenamecum <- paste (c(filename, "-cumsum.pdf"), collapse='')

   # Build label for Y axis
   label <- ""
   for (col in 1:length(columns)) {
      if (col != 1) {
         label <- paste (c(label, " / "), collapse='')
      }
      label = paste (c(label, labels[col], " (", colors[col] ,")"),
                     collapse='')
   }

   # Regular plot
   pdf(file=pdffilename, height=3.5, width=5)
   timeserie <- ts (data[columns[1]],
      start=c(data$year[1],data$week[1]), frequency=52)
   ts.plot (timeserie, col=colors[1], ylab=label)
   if (length (columns) > 1) {
      for (col in 2:length(columns)) {
         timeserie <- ts (data[columns[col]],
            start=c(data$year[1],data$week[1]), frequency=52)
         lines (timeserie, col=colors[col])
      }
   }
   dev.off()

   # Cummulative plot
#    pdf(file=pdffilenamecum, height=3.5, width=5)
#    timeserie <- ts (cumsum(data[columns[1]]),
#       start=c(data$year[1],data$month[1]), frequency=12)
#    ts.plot (timeserie, col=colors[1], ylab=label)
#    if (length (columns) > 1) {
#       for (col in 2:length(columns)) {
#          timeserie <- ts (cumsum(data[columns[col]]),
#             start=c(data$year[1],data$month[1]), frequency=12)
#          lines (timeserie, col=colors[col])
#       }
#    }
#    dev.off()
}
