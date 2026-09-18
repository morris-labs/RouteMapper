package com.morrislabs.routemapper.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.morrislabs.routemapper.data.models.RouteResponse
import kotlin.math.floor

@Composable
fun ResultsPanel(route: RouteResponse) {
    val hours = floor(route.totalDurationSeconds / 3600.0).toInt()
    val minutes = ((route.totalDurationSeconds % 3600) / 60.0).toInt()
    val durationText = if (hours > 0) "$hours hr $minutes min" else "$minutes min"
    val distanceMiles = "%.1f".format(route.totalDistanceMiles)

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Route summary", style = MaterialTheme.typography.titleSmall)
            Text("$durationText  ·  $distanceMiles mi", style = MaterialTheme.typography.bodyMedium)
            val stopCount = route.orderedStops.size
            Text(
                "$stopCount stop${if (stopCount != 1) "s" else ""}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
