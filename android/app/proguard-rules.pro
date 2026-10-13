# Keep JavaScript bridge interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep DataStore preferences
-keep class androidx.datastore.** { *; }

# Keep Firebase Messaging
-keep class com.google.firebase.messaging.** { *; }
