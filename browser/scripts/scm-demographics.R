library("vizgrimoire")

## Analyze command line args, and produce config params from them
conf <- ConfFromParameters("acs_cvsanaly_allura", "allura", "allura")
SetDBChannel (conf$user, conf$password, conf$database)

demos <- new ("Demographics")

Pyramid (demos, "2010-01-01", "/tmp/demos-pyramid-2010")
JSON (demos, "/tmp/demos-pyramid-2010.json")
Pyramid (demos, "2012-01-01", "/tmp/demos-pyramid-2012")
JSON (demos, "/tmp/demos-pyramid-2012.json")