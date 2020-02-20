
# Reproject source shapefile (from NCES) to web mercator
# Source: https://nces.ed.gov/programs/edge/Geographic/DistrictBoundaries, 2016 boundaries (2015-16 school year)
ogr2ogr schoolDistricts/shapefile/schoolDistricts.shp -t_srs "EPSG:4326" schoolDistricts/source/EDGE_SCHOOLDISTRICT_TL16_SY1516/schooldistrict_sy1516_tl16.shp

#Convert shapefile to geojson
ogr2ogr -f GeoJSON schoolDistricts/geoJson/schoolDistricts.geojson schoolDistricts/shapefile/schoolDistricts.shp

#Convert geojson to mbtiles, min zoom level 6 (max 14 by default). Replace old mbtiles
tippecanoe -o schoolDistricts/mbtiles/schoolDistricts.mbtiles schoolDistricts/geoJson/schoolDistricts.geojson -Z6 --force


mapbox upload urbaninstitute.lvl_1_charter dotData/csv/lvl_1_charter.csv
mapbox upload urbaninstitute.lvl_1_magnet dotData/csv/lvl_1_magnet.csv
mapbox upload urbaninstitute.lvl_1_private dotData/csv/lvl_1_private.csv
mapbox upload urbaninstitute.lvl_1_tps dotData/csv/lvl_1_tps.csv

mapbox upload urbaninstitute.lvl_2_charter dotData/csv/lvl_2_charter.csv
mapbox upload urbaninstitute.lvl_2_magnet dotData/csv/lvl_2_magnet.csv
mapbox upload urbaninstitute.lvl_2_private dotData/csv/lvl_2_private.csv
mapbox upload urbaninstitute.lvl_2_tps dotData/csv/lvl_2_tps.csv

mapbox upload urbaninstitute.lvl_3_charter dotData/csv/lvl_3_charter.csv
mapbox upload urbaninstitute.lvl_3_magnet dotData/csv/lvl_3_magnet.csv
mapbox upload urbaninstitute.lvl_3_private dotData/csv/lvl_3_private.csv
mapbox upload urbaninstitute.lvl_3_tps dotData/csv/lvl_3_tps.csv






tilesets create urbaninstitute.k12-seg-schools --recipe untitled.json --name "k12 segregation schools"

