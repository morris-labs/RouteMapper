package com.morrislabs.routemapper.util

import com.google.android.gms.maps.model.LatLng

fun decodePolyline(encoded: String): List<LatLng> {
    val result = mutableListOf<LatLng>()
    var index = 0
    var lat = 0
    var lng = 0

    while (index < encoded.length) {
        var shift = 0
        var value = 0
        var b: Int
        do {
            b = encoded[index++].code - 63
            value = value or ((b and 0x1f) shl shift)
            shift += 5
        } while (b >= 0x20)
        lat += if ((value and 1) != 0) (value.inv() shr 1) else (value shr 1)

        shift = 0
        value = 0
        do {
            b = encoded[index++].code - 63
            value = value or ((b and 0x1f) shl shift)
            shift += 5
        } while (b >= 0x20)
        lng += if ((value and 1) != 0) (value.inv() shr 1) else (value shr 1)

        result.add(LatLng(lat / 1e5, lng / 1e5))
    }
    return result
}
