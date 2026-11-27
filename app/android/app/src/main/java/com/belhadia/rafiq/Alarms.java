package com.belhadia.rafiq;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/** Scheduling shared by the plugin, the boot receiver and the alarm receiver. */
final class Alarms {
    static final String PREFS = "rafiq_alarms";
    static final String ACTION_FIRE = "com.belhadia.rafiq.FIRE";

    private Alarms() {}

    /** "adhan_madinah.caf" -> raw resource id of res/raw/adhan_madinah.*, or chime when missing. */
    static int soundRes(Context c, String sound) {
        String name = sound == null ? "chime" : sound.replaceAll("\\.[A-Za-z0-9]+$", "").toLowerCase();
        int id = c.getResources().getIdentifier(name, "raw", c.getPackageName());
        if (id == 0) id = c.getResources().getIdentifier("chime", "raw", c.getPackageName());
        return id;
    }

    static Uri soundUri(Context c, String sound) {
        return Uri.parse("android.resource://" + c.getPackageName() + "/" + soundRes(c, sound));
    }

    /** One notification channel per sound, since a channel's sound is fixed once created. */
    static String channelFor(Context c, String sound) {
        String name = sound == null ? "chime" : sound.replaceAll("\\.[A-Za-z0-9]+$", "").toLowerCase();
        String id = "rafiq_" + name + "_v1";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            if (nm.getNotificationChannel(id) == null) {
                String label = name.startsWith("adhan") ? "الأذان (" + name.substring(Math.min(name.length(), 6)) + ")" : "التذكيرات";
                NotificationChannel ch = new NotificationChannel(id, label, NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(soundUri(c, sound), new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                ch.enableVibration(true);
                nm.createNotificationChannel(ch);
            }
        }
        return id;
    }

    static String playingChannel(Context c) {
        String id = "rafiq_playing_v1";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            if (nm.getNotificationChannel(id) == null) {
                NotificationChannel ch = new NotificationChannel(id, "الأذان وهو يُرفع", NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(null, null);
                nm.createNotificationChannel(ch);
            }
        }
        return id;
    }

    static PendingIntent fireIntent(Context c, JSONObject it) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction(ACTION_FIRE);
        String id = it.optString("id");
        i.setData(Uri.parse("rafiq://alarm/" + Uri.encode(id)));
        i.putExtra("id", id);
        i.putExtra("title", it.optString("title"));
        i.putExtra("body", it.optString("body"));
        i.putExtra("sound", it.optString("sound", "chime.caf"));
        i.putExtra("alarm", it.optBoolean("alarm", false));
        return PendingIntent.getBroadcast(c, id.hashCode(), i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static boolean canExact(Context c) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        return Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static JSONArray stored(Context c) {
        try { return new JSONArray(prefs(c).getString("items", "[]")); } catch (Exception e) { return new JSONArray(); }
    }

    static void cancelAll(Context c) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        JSONArray old = stored(c);
        for (int k = 0; k < old.length(); k++) {
            JSONObject it = old.optJSONObject(k);
            if (it != null) am.cancel(fireIntent(c, it));
        }
        prefs(c).edit().putString("items", "[]").apply();
    }

    /** Replaces everything scheduled with these items; returns {alarms, notifications, failed}. */
    static int[] schedule(Context c, JSONArray items) {
        cancelAll(c);
        AlarmManager am = c.getSystemService(AlarmManager.class);
        long now = System.currentTimeMillis();
        boolean exact = canExact(c);
        int alarms = 0, notifs = 0, failed = 0;
        JSONArray kept = new JSONArray();
        for (int k = 0; k < items.length(); k++) {
            JSONObject it = items.optJSONObject(k);
            if (it == null) continue;
            long at = it.optLong("at");
            if (at <= now) continue;
            try {
                PendingIntent pi = fireIntent(c, it);
                if (exact && it.optBoolean("alarm", false)) {
                    PendingIntent show = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
                    am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), pi);
                    alarms++;
                } else {
                    if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                    else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                    notifs++;
                }
                kept.put(it);
            } catch (Exception e) {
                failed++;
            }
        }
        prefs(c).edit().putString("items", kept.toString()).apply();
        return new int[]{alarms, notifs, failed};
    }

    static void reschedule(Context c) {
        schedule(c, stored(c));
    }
}
