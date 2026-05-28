package com.labqualite.btp;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * MainActivity — LabQualité BTP
 * 
 * Loads the complete BTP quality control laboratory app from local assets
 * using an Android WebView. All 44 tests, 11 calculators, and the full
 * Material Design 3 interface run natively inside this WebView.
 */
public class MainActivity extends Activity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ── Immersive full-screen with colored status bar ──
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#0D1B2A"));
        window.setNavigationBarColor(Color.parseColor("#0D1B2A"));

        // Make status bar icons light (for dark background)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Dark status bar background → light icons (clear the flag)
            window.getDecorView().setSystemUiVisibility(0);
        }

        // ── Create and configure the WebView ──
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setTextZoom(100);

        // Support viewport meta tag for proper responsive rendering
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // ── Handle navigation: internal vs external links ──
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Keep local asset files inside the WebView
                if (url.startsWith("file://")) {
                    return false;
                }

                // Open YouTube, external web links in the system browser
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                try {
                    startActivity(intent);
                } catch (Exception e) {
                    // No browser available, ignore gracefully
                }
                return true;
            }
        });

        // ── Chrome client for console logging and progress ──
        webView.setWebChromeClient(new WebChromeClient());

        // ── Set background to match app theme ──
        webView.setBackgroundColor(Color.parseColor("#0D1B2A"));

        // ── Load the app from local assets ──
        webView.loadUrl("file:///android_asset/index.html");
    }

    /**
     * Handle the hardware back button for WebView navigation.
     * If the user can go back within the app, navigate back.
     * Otherwise, exit the app normally.
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }
}
