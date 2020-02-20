import fiona
import csv
# from shapely.geometry import shape


def explode(coords):
    """Explode a GeoJSON geometry's coordinates object and yield coordinate tuples.
    As long as the input is conforming, the type of the geometry doesn't matter."""
    for e in coords:
        if isinstance(e, (float, int)):
            yield coords
            break
        else:
            for f in explode(e):
                yield f

def bbox(f):
    x, y = zip(*list(explode(f['geometry']['coordinates'])))
    return min(x), min(y), max(x), max(y)

# import os
# os.environ['GDAL_DATA'] = fiona._env.GDALDataFinder.search_wheel('literally any string')


with fiona.Env():
	with fiona.open("schoolDistricts/shapefile/schoolDistricts.shp") as collection:
		with open('schoolDistricts/boundaries/boundaries.csv', 'w', newline='') as outFile:
			writer = csv.writer(outFile)
			writer.writerow(["geoid","lon1","lat1","lon2","lat2"])

			for c in collection:
				writer.writerow( [c["properties"]["GEOID"]] + list(bbox(c)))

