# K12 School segregation

### Dependencies
gdal stuff
python packages (make package.json)
python3

### Build dot data for map:
**Reshape source csv data to uploadable mapbox csv**
`python3 scripts/mapping/dotData/reshape_map_dot_data.py k12-segregation`

**Upload csv to Mapbox**
To replace dot data:
- go to [https://studio.mapbox.com/tilesets/](https://studio.mapbox.com/tilesets/)
- replace k12-seg-schools-4zduy1 data with data/mapping/dotData/csv/allSchools.csv

**Build feature boundaries from shapefile**
`python3 scripts/mapping/schoolDistricts/get_feature_boundaries.py k12-segregation`