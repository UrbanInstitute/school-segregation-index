
# Reproject source shapefile (from NCES) to web mercator
# Source: https://nces.ed.gov/programs/edge/Geographic/DistrictBoundaries, 2018 boundaries (2017-18 school year)
ogr2ogr schoolDistricts/shapefile/schoolDistricts.shp -t_srs "EPSG:4326" schoolDistricts/source/EDGE_SCHOOLDISTRICT_TL18_SY1718/schooldistrict_sy1718_tl18.shp

#Convert shapefile to geojson
ogr2ogr -f GeoJSON schoolDistricts/geoJson/schoolDistricts.geojson schoolDistricts/shapefile/schoolDistricts.shp


##alice add ndjson stuff here


#Convert geojson to mbtiles, min zoom level 6 (max 14 by default). Replace old mbtiles
tippecanoe -o schoolDistricts/mbtiles/schoolDistricts.mbtiles schoolDistricts/geoJson/schoolDistricts.geojson -Z6 --force
