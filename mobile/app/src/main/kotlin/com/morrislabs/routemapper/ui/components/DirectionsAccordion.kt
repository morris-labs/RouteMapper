package com.morrislabs.routemapper.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.morrislabs.routemapper.data.models.RouteResponse

@Composable
fun DirectionsAccordion(route: RouteResponse) {
    var expanded by remember { mutableStateOf(false) }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded }
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Turn-by-turn directions", style = MaterialTheme.typography.titleSmall)
                Icon(
                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand"
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)) {
                    route.legs.forEachIndexed { legIdx, leg ->
                        Text(
                            "Leg ${legIdx + 1}: ${leg.startAddress} → ${leg.endAddress}",
                            style = MaterialTheme.typography.labelMedium,
                            modifier = Modifier.padding(vertical = 6.dp)
                        )
                        leg.steps.forEachIndexed { stepIdx, step ->
                            Row(
                                modifier = Modifier.padding(start = 12.dp, bottom = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    "${stepIdx + 1}.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Column {
                                    val plainText = step.instructionHtml
                                        .replace(Regex("<[^>]*>"), "")
                                        .replace("&amp;", "&")
                                        .replace("&lt;", "<")
                                        .replace("&gt;", ">")
                                        .replace("&nbsp;", " ")
                                        .replace("&quot;", "\"")
                                        .replace("&#39;", "'")
                                        .trim()
                                    Text(plainText, style = MaterialTheme.typography.bodySmall)
                                    Text(
                                        "${step.distanceText} · ${step.durationText}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                        if (legIdx < route.legs.size - 1) {
                            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                        }
                    }
                }
            }
        }
    }
}
