package com.morrislabs.routemapper.util

import android.content.Intent
import android.net.Uri
import com.morrislabs.routemapper.data.models.RouteResponse

// Maps URL waypoints are capped at 9 intermediate stops (origin + 9 + destination = 11 total).
const val MAPS_NAV_MAX_STOPS = 11

fun buildMapsNavIntent(route: RouteResponse, travelMode: String): Intent {
    // Truncate to the Maps cap; the first MAPS_NAV_MAX_STOPS stops in optimized order.
    val stops = route.orderedStops.take(MAPS_NAV_MAX_STOPS)
    val middle = stops.drop(1).dropLast(1)
    // Transit is not supported in the Maps URL scheme; fall back to driving.
    val mode = if (travelMode == "transit") "driving" else travelMode.lowercase()

    // Uri.Builder.appendQueryParameter percent-encodes the full value, including the
    // pipe separators between waypoints. Uri.parse() on a hand-built string does not,
    // which caused Maps to truncate at the first unencoded |.
    val uri = Uri.Builder()
        .scheme("https")
        .authority("www.google.com")
        .path("/maps/dir/")
        .appendQueryParameter("api", "1")
        .appendQueryParameter("origin", stops.first())
        .appendQueryParameter("destination", stops.last())
        .apply {
            if (middle.isNotEmpty()) {
                appendQueryParameter("waypoints", middle.joinToString("|"))
            }
        }
        .appendQueryParameter("travelmode", mode)
        .build()

    return Intent(Intent.ACTION_VIEW, uri)
}
