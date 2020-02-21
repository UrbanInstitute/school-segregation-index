
# Reproject source shapefile (from NCES) to web mercator
# Source: https://nces.ed.gov/programs/edge/Geographic/DistrictBoundaries, 2016 boundaries (2015-16 school year)
ogr2ogr schoolDistricts/shapefile/schoolDistricts.shp -t_srs "EPSG:4326" schoolDistricts/source/EDGE_SCHOOLDISTRICT_TL16_SY1516/schooldistrict_sy1516_tl16.shp

#Convert shapefile to geojson
ogr2ogr -f GeoJSON schoolDistricts/geoJson/schoolDistricts.geojson schoolDistricts/shapefile/schoolDistricts.shp

#Convert geojson to mbtiles, min zoom level 6 (max 14 by default). Replace old mbtiles
tippecanoe -o schoolDistricts/mbtiles/schoolDistricts.mbtiles schoolDistricts/geoJson/schoolDistricts.geojson -Z6 --force



# To replace dot data:
# 	go to https://studio.mapbox.com/tilesets/
# 	replace k12-seg-schools-4zduy1 data with data/mapping/dotData/csv/allSchools.csv
