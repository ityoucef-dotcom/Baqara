package com.belhadia.rafiq;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/** Plays the full adhan on the alarm stream, with a notification that stops it. */
public class AdhanService extends Service {
    static final String ACTION_STOP = "com.belhadia.rafiq.STOP_ADHAN";
    private MediaPlayer player;

    @Override
    public int onStartCommand(Intent i, int flags, int startId) {
        if (i != null && ACTION_STOP.equals(i.getAction())) { stopSelf(); return START_NOT_STICKY; }
        String title = i == null ? "" : i.getStringExtra("title");
        String body = i == null ? "" : i.getStringExtra("body");
        String sound = i == null ? null : i.getStringExtra("sound");

        Intent stop = new Intent(this, AdhanService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 2, stop, PendingIntent.FLAG_IMMUTABLE);
        PendingIntent open = PendingIntent.getActivity(this, 3, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new NotificationCompat.Builder(this, Alarms.playingChannel(this))
                .setSmallIcon(R.drawable.ic_stat_rafiq)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setContentIntent(open)
                .setDeleteIntent(stopPi)
                .addAction(0, "إيقاف الأذان", stopPi)
                .setOngoing(true)
                .build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(42, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(42, n);

        release();
        try {
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            player.setDataSource(this, Alarms.soundUri(this, sound));
            player.setOnCompletionListener(mp -> stopSelf());
            player.prepare();
            player.start();
        } catch (Exception e) {
            stopSelf();
        }
        return START_NOT_STICKY;
    }

    private void release() {
        if (player != null) { try { player.stop(); } catch (Exception ignored) {} player.release(); player = null; }
    }

    @Override
    public void onDestroy() { release(); super.onDestroy(); }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
