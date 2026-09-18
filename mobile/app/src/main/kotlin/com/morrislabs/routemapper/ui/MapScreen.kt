package com.morrislabs.routemapper.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.maps.android.compose.*
import com.morrislabs.routemapper.data.models.RouteResponse
import com.morrislabs.routemapper.util.decodePolyline
import com.morrislabs.routemapper.viewmodel.RouteViewModel
import kotlin.math.floor

private data class MarkerData(
    val position: LatLng,
    val label: String,
    val address: String,
    val cumSeconds: Int,
    val legDuration: String?,
    val legDistance: String?
)

@Composable
fun MapScreen(viewModel: RouteViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val route = state.route

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(LatLng(39.8283, -98.5795), 4f)
    }

    // mapLoaded gates the camera update: newLatLngBounds throws if the map has zero size.
    var mapLoaded by remember { mutableStateOf(false) }

    LaunchedEffect(route?.bounds, mapLoaded) {
        if (!mapLoaded) return@LaunchedEffect
        route?.bounds?.let { b ->
            val bounds = LatLngBounds(
                LatLng(b.southwest.lat, b.southwest.lng),
                LatLng(b.northeast.lat, b.northeast.lng)
            )
            cameraPositionState.animate(CameraUpdateFactory.newLatLngBounds(bounds, 64))
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            uiSettings = MapUiSettings(zoomControlsEnabled = true),
            onMapLoaded = { mapLoaded = true }
        ) {
            if (route != null) RouteOverlay(route = route)
        }

        if (route == null) {
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .background(Color.White.copy(alpha = 0.9f), RoundedCornerShape(8.dp))
                    .padding(16.dp)
            ) {
                Text("Plan a route to see it here", color = Color(0xFF64748B))
            }
        }
    }
}

@Composable
private fun RouteOverlay(route: RouteResponse) {
    val legs = route.legs ?: return
    if (legs.isEmpty()) return

    var selectedMarker by remember { mutableStateOf<Int?>(null) }

    val path = remember(route) {
        legs.flatMap { leg ->
            leg.steps.flatMap { step ->
                step.polyline?.let { decodePolyline(it) } ?: emptyList()
            }
        }
    }

    val markers = remember(route) {
        var cumSeconds = 0
        val pts = mutableListOf<MarkerData>()
        val first = legs.first()
        pts.add(
            MarkerData(
                position = LatLng(first.startLocation.lat, first.startLocation.lng),
                label = "1",
                address = first.startAddress,
                cumSeconds = 0,
                legDuration = null,
                legDistance = null
            )
        )
        legs.forEachIndexed { i, leg ->
            cumSeconds += leg.durationSeconds
            pts.add(
                MarkerData(
                    position = LatLng(leg.endLocation.lat, leg.endLocation.lng),
                    label = "${i + 2}",
                    address = leg.endAddress,
                    cumSeconds = cumSeconds,
                    legDuration = leg.durationText,
                    legDistance = leg.distanceText
                )
            )
        }
        pts
    }

    Polyline(points = path, color = Color(0xFF2563EB), width = 10f)

    markers.forEachIndexed { i, marker ->
        // keys: marker identity + selection state. Without both, the info card never appears
        // because Compose skips recomposition when it thinks nothing changed.
        MarkerComposable(
            marker.label,
            selectedMarker == i,
            state = rememberMarkerState(
                // Include position in the key so stale LatLng values are not reused if
                // the user computes a second route with different stops.
                key = "${marker.label}_${marker.position.latitude}_${marker.position.longitude}",
                position = marker.position
            ),
            anchor = androidx.compose.ui.geometry.Offset(0.5f, 1f),
            zIndex = if (selectedMarker == i) 1f else 0f,
            onClick = {
                selectedMarker = if (selectedMarker == i) null else i
                true
            }
        ) {
            StopMarker(marker = marker, isSelected = selectedMarker == i)
        }
    }
}

@Composable
private fun StopMarker(marker: MarkerData, isSelected: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        if (isSelected) {
            Card(
                modifier = Modifier.widthIn(max = 220.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Stop ${marker.label}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(marker.address, fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    if (marker.cumSeconds == 0) {
                        Text("Starting point", color = Color(0xFF6B7280), fontSize = 11.sp)
                    } else {
                        Text(
                            "+${formatDuration(marker.cumSeconds)} from start",
                            color = Color(0xFF2563EB), fontSize = 11.sp, fontWeight = FontWeight.SemiBold
                        )
                        if (marker.legDuration != null && marker.legDistance != null) {
                            Text(
                                "${marker.legDuration} · ${marker.legDistance} from prev",
                                color = Color(0xFF6B7280), fontSize = 11.sp
                            )
                        }
                    }
                }
            }
            Spacer(Modifier.height(4.dp))
        }
        Box(
            modifier = Modifier.size(32.dp).background(Color(0xFF2563EB), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(marker.label, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

private fun formatDuration(seconds: Int): String {
    val h = floor(seconds / 3600.0).toInt()
    val m = ((seconds % 3600) / 60.0).toInt()
    return if (h == 0) "$m min" else "$h hr $m min"
}
