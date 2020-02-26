import json
import csv

from os import environ as env
from sys import argv as argv


workingDict = {}
outDict = {}


with open("%s/%s/data/charts/source/CCD-PSS2015_SegCounterfactuals_glea_FINALIZED.csv"%(env["PROJECT_PATH"], argv[1])) as sourceFile:
	reader = csv.reader(sourceFile)
	head = next(reader)
	h = {}
	for i in range(0, len(head)):
		h[head[i]] = i

	for row in reader:
		gleaid = row[h["gleaid"]]
		level = row[h["level"]]
		districtKey = gleaid + "_" + level

		pop = float(row[h["population_school"]])
		minority = float(row[h["minority_school"]])

		minority_percent = minority/pop

		if districtKey not in workingDict:
			workingDict[districtKey] = {"sumPop": 0, "sumMinority": 0, "minorityPercents": [] }
		
		workingDict[districtKey]["sumPop"] += pop
		workingDict[districtKey]["sumMinority"] += minority
		workingDict[districtKey]["minorityPercents"].append(minority_percent)


for item in workingDict.items():
	districtKey = item[0]
	d = item[1]

	M = d["sumMinority"]/d["sumPop"]
	diffList = [abs(m - M) for m in d["minorityPercents"]]
	sumDiff = sum(diffList)
	# if(districtKey == "5509600_1"):
	# 	print(districtKey, M, sumDiff)
	outDict[districtKey] = {"sum" : sumDiff, "M": M}


		# print(districtKey, M)
	# print(districtKey)


with open("%s/%s/data/charts/json/all_districts.json"%(env["PROJECT_PATH"], argv[1]), "w") as fp:
    json.dump(outDict, fp)


