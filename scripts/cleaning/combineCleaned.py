import csv

def rowToObject(rowList, header):
    rowObj = {}
    for i in range(0, len(rowList)):
        rowObj[header[i]] = rowList[i]
    return rowObj

blankTownSourceReader = csv.reader(open("data/cleaning/blankTownSource.csv","r"), delimiter=",")
blankTownHandReader = csv.reader(open("data/cleaning/blankTown.csv","r"), delimiter=",")

f = open("data/cleaning/blankTownFinal.csv","w")

blankTownFinalWriter = csv.writer(f, delimiter="\t")

blankTownSourceHeader = next(blankTownSourceReader)
blankTownHandHeader = next(blankTownHandReader)
# print(blankTownSourceHeader)

blankTownFinalWriter.writerow(blankTownHandHeader)

blankRows = []
for row in blankTownSourceReader:
    blankRows.append(row)

for (i,row) in enumerate(blankTownHandReader):
    blankRows[i].append(row[-1])

for blankRow in blankRows:
    blankTownFinalWriter.writerow(blankRow)


f.close()



sourceOrigReader = csv.reader(open("data/charts/source/CCD-PSS2017_SegCounterfactuals_glea_FINALIZED.csv","r"), delimiter=",")
sourceGeoReader = csv.reader(open("data/charts/source/CCDPSS2017_SegCounterfactual_geocoded.csv","r"), delimiter=",")

f2 = open("data/charts/source/combined_source.csv","w")
combinedWriter = csv.writer(f2)

r1s = []
r2s = []

for row in sourceOrigReader:
    r1s.append(row[0:24])

for row in sourceGeoReader:
    r2s.append(row[27:])

for i in range(0, len(r1s)):
    combinedWriter.writerow(r1s[i] + r2s[i])

f2.close()

sourceReader = csv.reader(open("data/charts/source/combined_source.csv","r"))
blankTownReader = csv.reader(open("data/cleaning/blankTownFinal.csv","r"), delimiter="\t")
namesReader = csv.reader(open("data/cleaning/cleanNames.csv","r"))

finalWriter = csv.writer(open("data/cleaned_source.csv","w"))

blankTownHeader = next(blankTownReader)
sourceHeader = next(sourceReader)
namesHeader = next(namesReader)


finalWriter.writerow(sourceHeader)


blankDict = {}
for rowList in blankTownReader:
    row = rowToObject(rowList, blankTownHeader)
    blankDict[row["schid"]] = row["hand_code_city"]

namesDict = {}
for rowList in namesReader:
    row = rowToObject(rowList, namesHeader)
    namesDict[row["schid"]] = row["clean_name"]



# print(blankDict)
for rowList in sourceReader:
    row = rowToObject(rowList, sourceHeader)
    schid = row["schid"]
    if schid in blankDict:
        cityIndex = sourceHeader.index("REV_City")
        rowList[cityIndex] = blankDict[schid]
    if schid in namesDict:
        namesIndex = sourceHeader.index("school_name")
        rowList[namesIndex] = namesDict[schid]
    finalWriter.writerow(rowList)
