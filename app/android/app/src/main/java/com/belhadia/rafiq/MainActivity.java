package com.belhadia.rafiq;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RafiqAlarmsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
