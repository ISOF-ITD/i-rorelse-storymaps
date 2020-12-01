export function swapCoordinates(array) {
    return [array[1], array[0]]
}

// this function zooms in/out only three or two levels at a time,
// and calls itself recursively after that
// because setZoomAround doesn't zoom smoothly above these values
export function smoothZoom(map, zoom, timeout, coords) {

    let partlyZoom = zoom;
    
    if(map.getZoom() + 3 < parseInt(zoom)) {
        partlyZoom = map.getZoom() + 3
    }
    else if(map.getZoom() - 2 > parseInt(zoom)) {
        partlyZoom = map.getZoom() - 2
    }

    map.setZoomAround(coords, partlyZoom, {animate: true})

    if(partlyZoom != zoom){
        // next iteration
        setTimeout(function(){
        smoothZoom(map, zoom, timeout, coords)
        }, timeout)
    }
}