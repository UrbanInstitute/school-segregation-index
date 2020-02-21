import csv

with open("../CCD-PSS2015_SegCounterfactuals_glea_FINALIZED.csv") as sourceFile:
	reader = csv.reader(sourceFile)
	head = next(reader)
	h = {}
	for i in range(0, len(head)):
		h[head[i]] = i

	with open('dotData/csv/allSchools.csv', 'w', newline='') as outFile:
		writer = csv.writer(outFile)
		writer.writerow(["schoolid","level","type","lon","lat","population","compareMedian"])
		for row in reader:
			schoolTypeString = ""
			for schoolType in ["tps", "charter", "magnet", "private"]:
				if(row[h[schoolType]] == "1"):
					schoolTypeString =schoolType
					break
			if(schoolTypeString == ""):
				print ("error error")

			minorityPercent = float(row[h["minority_school"]]) / float(row[h["population_school"]])
			
			districtMinorityPercent = .5 #THIS WILL CHANGE, A VAL FROM DATA
			compareMedian = "above" if (minorityPercent > districtMinorityPercent) else "below"

			writer.writerow([row[h["schid"]], row[h["level"]], schoolTypeString , row[h["lon"]], row[h["lat"]], row[h["population_school"]], compareMedian ])




# with open("../CCD-PSS2015_SegCounterfactuals_glea_FINALIZED.csv") as sourceFile:
# 	reader = csv.reader(sourceFile)
# 	head = next(reader)
# 	h = {}
# 	for i in range(0, len(head)):
# 		h[head[i]] = i

# 	for level in ["1","2","3"]:
# 		for schoolType in ["charter","private","magnet","tps"]:
# 			with open('dotData/csv/lvl_%s_%s.csv'%(level, schoolType), 'w', newline='') as outFile:
# 				writer = csv.writer(outFile)
# 				writer.writerow(["schoolid","lon","lat","population","compareMedian"])
# 				for row in reader:
# 					if(row[h["level"]] == level and row[h[schoolType]] == "1"):
# 						minorityPercent = float(row[h["minority_school"]]) / float(row[h["population_school"]])
# 						districtMinorityPercent = .5 #THIS WILL CHANGE, A VAL FROM DATA
# 						compareMedian = "above" if (minorityPercent > districtMinorityPercent) else "below"
# 						writer.writerow([row[h["schid"]] , row[h["lon"]], row[h["lat"]], row[h["population_school"]], compareMedian ])
# 				sourceFile.seek(0)
# 				next(reader)
