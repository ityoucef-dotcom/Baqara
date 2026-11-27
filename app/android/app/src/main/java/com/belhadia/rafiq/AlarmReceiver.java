package com.belhadia.rafiq;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String action = i.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED".equals(action)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(action) || Intent.ACTION_TIME_CHANGED.equals(action)) {
            Alarms.reschedule(c);
            return;
        }
        if (!Alarms.ACTION_FIRE.equals(action)) return;
        String title = i.getStringExtra("title"), body = i.getStringExtra("body"), sound = i.getStringExtra("sound");
        if (i.getBooleanExtra("alarm", false)) {
            // ring the whole adhan through the alarm stream, stoppable from the notification
            Intent s = new Intent(c, AdhanService.class);
            s.putExtra("title", title); s.putExtra("body", body); s.putExtra("sound", sound);
            try {
                if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(s); else c.startService(s);
                return;
            } catch (Exception e) {
                // fall through to a plain notification
            }
        }
        PendingIntent open = PendingIntent.getActivity(c, 1, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, Alarms.channelFor(c, sound))
                .setSmallIcon(R.drawable.ic_stat_rafiq)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setSound(Alarms.soundUri(c, sound))
                .setAutoCancel(true)
                .setContentIntent(open);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        try { nm.notify(String.valueOf(i.getStringExtra("id")).hashCode(), b.build()); } catch (SecurityException ignored) {}
    }
}
