package com.morrislabs.routemapper

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Map
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.morrislabs.routemapper.ui.MapScreen
import com.morrislabs.routemapper.ui.PlanScreen
import com.morrislabs.routemapper.viewmodel.RouteViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                RouteMapperApp()
            }
        }
    }
}

@Composable
fun RouteMapperApp() {
    val navController = rememberNavController()
    val viewModel: RouteViewModel = viewModel()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "plan"

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = "Plan") },
                    label = { Text("Plan") },
                    selected = currentRoute == "plan",
                    onClick = { navController.navigate("plan") { launchSingleTop = true } }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Map, contentDescription = "Map") },
                    label = { Text("Map") },
                    selected = currentRoute == "map",
                    onClick = { navController.navigate("map") { launchSingleTop = true } }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "plan",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("plan") {
                PlanScreen(viewModel = viewModel, onNavigateToMap = {
                    navController.navigate("map") { launchSingleTop = true }
                })
            }
            composable("map") {
                MapScreen(viewModel = viewModel)
            }
        }
    }
}
