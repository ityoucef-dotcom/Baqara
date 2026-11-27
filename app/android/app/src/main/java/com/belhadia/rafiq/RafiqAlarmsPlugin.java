package com.belhadia.rafiq;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONObject;

/** Same interface as the iOS RafiqAlarms plugin: status, requestPermissions, schedule, cancelAll, test. */
@CapacitorPlugin(name = "RafiqAlarms", permissions = {
        @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
})
public class RafiqAlarmsPlugin extends Plugin {

    private String notifState() {
        Context c = getContext();
        if (NotificationManagerCompat.from(c).areNotificationsEnabled()) return "authorized";
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") == PermissionState.PROMPT) return "notDetermined";
        return "denied";
    }

    @PluginMethod
    public void status(PluginCall call) {
        Context c = getContext();
        int alarms = 0, notifs = 0;
        long now = System.currentTimeMillis();
        JSONArray items = Alarms.stored(c);
        for (int k = 0; k < items.length(); k++) {
            JSONObject it = items.optJSONObject(k);
            if (it == null || it.optLong("at") <= now) continue;
            if (it.optBoolean("alarm", false) && Alarms.canExact(c)) alarms++; else notifs++;
        }
        JSObject r = new JSObject();
        r.put("alarms", Alarms.canExact(c) ? "authorized" : "denied");
        r.put("notifications", notifState());
        r.put("scheduledAlarms", alarms);
        r.put("pendingNotifications", notifs);
        r.put("platform", "android");
        call.resolve(r);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "permCallback");
        } else {
            permCallback(call);
        }
    }

    @PermissionCallback
    private void permCallback(PluginCall call) {
        Context c = getContext();
        if (!Alarms.canExact(c) && Build.VERSION.SDK_INT >= 31) {
            try {
                Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + c.getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                c.startActivity(i);
            } catch (Exception ignored) {}
        }
        JSObject r = new JSObject();
        r.put("notifications", notifState());
        r.put("alarms", Alarms.canExact(c) ? "authorized" : "denied");
        call.resolve(r);
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray items = call.getArray("items", new JSArray());
        int[] n = Alarms.schedule(getContext(), items);
        JSObject r = new JSObject();
        r.put("alarms", n[0]);
        r.put("notifications", n[1]);
        r.put("failed", n[2]);
        r.put("alarmState", Alarms.canExact(getContext()) ? "authorized" : "denied");
        call.resolve(r);
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        Alarms.cancelAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void test(PluginCall call) {
        Context c = getContext();
        boolean alarm = Boolean.TRUE.equals(call.getBoolean("alarm", false));
        double secs = call.getDouble("seconds", 10.0);
        try {
            JSONObject it = new JSONObject();
            it.put("id", "test-" + System.currentTimeMillis());
            it.put("at", System.currentTimeMillis() + (long) (secs * 1000));
            it.put("title", call.getString("title", "تجربة المنبّه"));
            it.put("body", call.getString("body", ""));
            it.put("sound", call.getString("sound", "chime.caf"));
            it.put("alarm", alarm);
            android.app.AlarmManager am = c.getSystemService(android.app.AlarmManager.class);
            if (Alarms.canExact(c)) am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, it.getLong("at"), Alarms.fireIntent(c, it));
            else am.setAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, it.getLong("at"), Alarms.fireIntent(c, it));
            JSObject r = new JSObject();
            r.put("kind", alarm ? "alarm" : "notification");
            call.resolve(r);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
