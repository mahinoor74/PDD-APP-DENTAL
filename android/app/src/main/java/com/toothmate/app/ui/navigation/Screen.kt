package com.toothmate.app.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Auth : Screen("auth")
    object Demographics : Screen("demographics")
    object Assessment : Screen("assessment")
    object Success : Screen("success")
    object Prescription : Screen("prescription")
    object SmartMirror : Screen("smart_mirror")
    object Chatbot : Screen("chatbot")
    object Dashboard : Screen("dashboard")
    object Profile : Screen("profile")
    object Language : Screen("language")
}
