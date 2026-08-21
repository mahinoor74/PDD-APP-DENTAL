package com.toothmate.app.ui.components

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.NightlightRound
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.toothmate.app.ui.navigation.Screen

import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.viewmodel.AuthViewModel

sealed class BottomNavItem(val title: String, val route: String, val icon: ImageVector) {
    object Mirror : BottomNavItem("Mirror", Screen.SmartMirror.route, Icons.Default.CameraAlt)
    object Dashboard : BottomNavItem("Dashboard", Screen.Dashboard.route, Icons.Default.GridView)
    object Chatbot : BottomNavItem("Dr. Minty", Screen.Chatbot.route, Icons.Default.ChatBubbleOutline)
    object Profile : BottomNavItem("Profile", Screen.Profile.route, Icons.Default.PersonOutline)
    object Theme : BottomNavItem("Theme", Screen.Language.route, Icons.Default.NightlightRound)
}

@Composable
fun BottomNavigationBar(navController: NavController) {
    val context = LocalContext.current
    val authViewModel = remember { AuthViewModel(UserPreferences(context)) }
    val isDarkMode by authViewModel.isDarkMode.collectAsState()

    val items = listOf(
        BottomNavItem.Mirror,
        BottomNavItem.Dashboard,
        BottomNavItem.Chatbot,
        BottomNavItem.Profile,
        BottomNavItem.Theme
    )

    val navBackStackEntry = navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry.value?.destination?.route

    Surface(
        color = if (isDarkMode) Color(0xFF1E293B) else Color.White,
        shadowElevation = 14.dp,
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
    ) {
        NavigationBar(
            containerColor = if (isDarkMode) Color(0xFF1E293B) else Color.White,
            windowInsets = WindowInsets(0, 0, 0, 0),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
        ) {
            items.forEach { item ->
                val isThemeTab = item.route == Screen.Language.route
                val isSelected = if (isThemeTab) false else currentRoute == item.route
                val itemIcon = if (isThemeTab) {
                    if (isDarkMode) Icons.Default.WbSunny else Icons.Default.NightlightRound
                } else item.icon

                val itemTitle = if (isThemeTab) {
                    if (isDarkMode) "Light" else "Dark"
                } else item.title

                NavigationBarItem(
                    icon = {
                        Icon(
                            itemIcon,
                            contentDescription = itemTitle,
                            modifier = Modifier.size(20.dp),
                            tint = if (isSelected) Color(0xFF0F766E) else if (isDarkMode) Color(0xFF94A3B8) else Color(0xFF64748B)
                        )
                    },
                    label = {
                        Text(
                            text = itemTitle,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
                            color = if (isSelected) Color(0xFF0F766E) else if (isDarkMode) Color(0xFF94A3B8) else Color(0xFF64748B)
                        )
                    },
                    selected = isSelected,
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF0F766E),
                        selectedTextColor = Color(0xFF0F766E),
                        indicatorColor = Color(0xFFCCFBF1)
                    ),
                    onClick = {
                        if (isThemeTab) {
                            authViewModel.toggleDarkMode()
                        } else if (currentRoute != item.route) {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = (item.route != Screen.Dashboard.route)
                            }
                        }
                    }
                )
            }
        }
    }
}
