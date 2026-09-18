package com.morrislabs.routemapper.data.models

data class RouteRequest(
    val addresses: List<String>,
    val roundTrip: Boolean = false,
    val travelMode: String = "driving",
    val avoid: List<String> = emptyList()
)

data class RouteResponse(
    val orderedStops: List<String>,
    val waypointOrder: List<Int>,
    val legs: List<Leg>,
    val totalDistanceMeters: Double,
    val totalDistanceMiles: Double,
    val totalDurationSeconds: Int,
    val overviewPolyline: String?,
    val bounds: Bounds?
)

data class Leg(
    val startAddress: String,
    val endAddress: String,
    val startLocation: LatLngData,
    val endLocation: LatLngData,
    val distanceMeters: Double,
    val distanceText: String,
    val durationSeconds: Int,
    val durationText: String,
    val steps: List<Step>
)

data class Step(
    val instructionHtml: String,
    val distanceText: String,
    val durationText: String,
    val polyline: String?
)

data class LatLngData(
    val lat: Double,
    val lng: Double
)

data class Bounds(
    val northeast: LatLngData,
    val southwest: LatLngData
)

data class ErrorResponse(
    val error: String,
    val message: String
)
