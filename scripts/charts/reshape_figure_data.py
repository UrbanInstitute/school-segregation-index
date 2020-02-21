import csv
from os import environ as env
from sys import argv as argv




with open("%s/%s/data/charts/source/CCD-PSS2015_SegCounterfactuals_glea_FINALIZED.csv"%(env["PROJECT_PATH"], argv[1])) as sourceFile:
	reader = csv.reader(sourceFile)
	head = next(reader)
	h = {}
	for i in range(0, len(head)):
		h[head[i]] = i

	with open('%s/%s/data/charts/csv/wi_schools.csv'%(env["PROJECT_PATH"], argv[1]), 'w', newline='') as outFile:
		writer = csv.writer(outFile)
		# need more here
		writer.writerow(["schoolid", "schoolName","pop", "minority_pop","minority_percent" "sci", "type","compareMedian"])
		for row in reader:
			schoolTypeString = ""
			for schoolType in ["tps", "charter", "magnet", "private"]:
				if(row[h[schoolType]] == "1"):
					schoolTypeString = schoolType
					break
			if(schoolTypeString == ""):
				print ("error error")

			minorityPercent = float(row[h["minority_school"]]) / float(row[h["population_school"]])
			
			districtMinorityPercent = .5 #THIS WILL CHANGE, A VAL FROM DATA
			compareMedian = "above" if (minorityPercent > districtMinorityPercent) else "below"

			writer.writerow([row[h["schid"]],row[h["school_name"]],row[h["population_school"]],row[h["minority_school"]],minorityPercent,row[h["SCI_sys"]],schoolTypeString,compareMedian])
