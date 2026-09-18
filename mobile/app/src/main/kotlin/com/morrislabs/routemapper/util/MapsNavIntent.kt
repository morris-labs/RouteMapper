package com.morrislabs.routemapper.util

import android.content.Intent
import android.net.Uri
import com.morrislabs.routemapper.data.models.RouteResponse
import java.net.URLEncoder

// Maps URL waypoints are capped at 9 intermediate stops (origin + 9 + destination = 11 total).
const val MAPS_NAV_MAX_STOPS = 11

fun canHandOffToMaps(route: RouteResponse): Boolean =
    route.orderedStops.size <= MAPS_NAV_MAX_STOPS

fun buildMapsNavIntent(route: RouteResponse, travelMode: String): Intent {
    val stops = route.orderedStops
    fun enc(s: String) = URLEncoder.encode(s, "UTF-8")

    val url = buildString {
        append("https://www.google.com/maps/dir/?api=1")
        append("&origin=${enc(stops.first())}")
        append("&destination=${enc(stops.last())}")
        val middle = stops.drop(1).dropLast(1)
        if (middle.isNotEmpty()) append("&waypoints=${middle.joinToString("|") { enc(it) }}")
        // Transit is not supported in the Maps URL scheme; fall back to driving.
        val mode = if (travelMode == "transit") "driving" else travelMode.lowercase()
        append("&travelmode=$mode")
    }
    return Intent(Intent.ACTION_VIEW, Uri.parse(url))
}
