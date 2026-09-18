package com.morrislabs.routemapper.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.morrislabs.routemapper.viewmodel.RouteOptions

private val TRAVEL_MODES = listOf("driving", "walking", "bicycling", "transit")
private val AVOID_OPTIONS = listOf("tolls" to "Tolls", "highways" to "Highways", "ferries" to "Ferries")

@Composable
fun OptionsPanel(options: RouteOptions, onOptionsChange: (RouteOptions) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("Options", style = MaterialTheme.typography.titleSmall)

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Travel mode", style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(TRAVEL_MODES) { mode ->
                        FilterChip(
                            selected = options.travelMode == mode,
                            onClick = { onOptionsChange(options.copy(travelMode = mode)) },
                            label = { Text(mode.replaceFirstChar { it.uppercase() }) }
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Round trip")
                Switch(
                    checked = options.roundTrip,
                    onCheckedChange = { onOptionsChange(options.copy(roundTrip = it)) }
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text("Avoid", style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    AVOID_OPTIONS.forEach { (value, label) ->
                        FilterChip(
                            selected = value in options.avoid,
                            onClick = {
                                val newAvoid = if (value in options.avoid)
                                    options.avoid - value else options.avoid + value
                                onOptionsChange(options.copy(avoid = newAvoid))
                            },
                            label = { Text(label) }
                        )
                    }
                }
            }
        }
    }
}
