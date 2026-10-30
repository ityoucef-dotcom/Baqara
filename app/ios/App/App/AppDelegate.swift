import UIKit
import Capacitor
import UserNotifications
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit
import ActivityKit
#endif

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        RafiqSounds.install()
        return true
    }

    // show reminders with their sound even while the app is open
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

/// Registers the app's own plugin on the Capacitor bridge.
class RafiqViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(RafiqAlarmsPlugin())
    }
}

/// Notification and alarm sounds ship inside the web assets (public/sounds);
/// iOS only plays custom sounds from the main bundle root or Library/Sounds, so copy them there.
enum RafiqSounds {
    static func install() {
        let fm = FileManager.default
        guard let src = Bundle.main.resourceURL?.appendingPathComponent("public/sounds"),
              let lib = fm.urls(for: .libraryDirectory, in: .userDomainMask).first else { return }
        let dst = lib.appendingPathComponent("Sounds")
        try? fm.createDirectory(at: dst, withIntermediateDirectories: true)
        guard let files = try? fm.contentsOfDirectory(atPath: src.path) else { return }
        for f in files where f.hasSuffix(".caf") {
            let to = dst.appendingPathComponent(f)
            try? fm.removeItem(at: to)
            try? fm.copyItem(at: src.appendingPathComponent(f), to: to)
        }
    }
}

#if canImport(AlarmKit)
@available(iOS 26.0, *)
struct RafiqAlarmData: AlarmMetadata {}
#endif

/// window.Capacitor.Plugins.RafiqAlarms
/// schedule({items:[{id, at (ms), title, body, sound, alarm}]}) replaces everything scheduled before.
@objc(RafiqAlarmsPlugin)
public class RafiqAlarmsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RafiqAlarmsPlugin"
    public let jsName = "RafiqAlarms"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelAll", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "test", returnType: CAPPluginReturnPromise)
    ]

    private let alarmIdsKey = "rafiq.alarmIds"
    private let notifPrefix = "rafiq."

    private var alarmKitAvailable: Bool {
        if #available(iOS 26.0, *) { return true }
        return false
    }

    private func alarmState() -> String {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            switch AlarmManager.shared.authorizationState {
            case .authorized: return "authorized"
            case .denied: return "denied"
            case .notDetermined: return "notDetermined"
            @unknown default: return "unknown"
            }
        }
        #endif
        return "unavailable"
    }

    @objc public override func checkPermissions(_ call: CAPPluginCall) { status(call) }

    @objc func status(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { s in
            UNUserNotificationCenter.current().getPendingNotificationRequests { pending in
                let ours = pending.filter { $0.identifier.hasPrefix(self.notifPrefix) }.count
                let alarms = (UserDefaults.standard.stringArray(forKey: self.alarmIdsKey) ?? []).count
                call.resolve([
                    "notifications": s.authorizationStatus == .authorized ? "authorized" : (s.authorizationStatus == .denied ? "denied" : "notDetermined"),
                    "alarms": self.alarmState(),
                    "pendingNotifications": ours,
                    "scheduledAlarms": alarms
                ])
            }
        }
    }

    @objc public override func requestPermissions(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                Task {
                    _ = try? await AlarmManager.shared.requestAuthorization()
                    self.status(call)
                }
                return
            }
            #endif
            self.status(call)
        }
    }

    @objc func cancelAll(_ call: CAPPluginCall) {
        Task {
            await self.clear()
            call.resolve()
        }
    }

    private func clear() async {
        let center = UNUserNotificationCenter.current()
        let pending = await center.pendingNotificationRequests()
        center.removePendingNotificationRequests(withIdentifiers: pending.map { $0.identifier }.filter { $0.hasPrefix(notifPrefix) })
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            for s in UserDefaults.standard.stringArray(forKey: alarmIdsKey) ?? [] {
                if let id = UUID(uuidString: s) { try? AlarmManager.shared.cancel(id: id) }
            }
        }
        #endif
        UserDefaults.standard.set([String](), forKey: alarmIdsKey)
    }

    @objc func schedule(_ call: CAPPluginCall) {
        let items = (call.getArray("items") as? [[String: Any]]) ?? []
        Task {
            await self.clear()
            let now = Date()
            var list: [(id: String, at: Date, title: String, body: String, sound: String?, alarm: Bool)] = []
            for it in items {
                guard let ms = it["at"] as? Double else { continue }
                let at = Date(timeIntervalSince1970: ms / 1000)
                if at <= now { continue }
                list.append((it["id"] as? String ?? UUID().uuidString, at,
                             it["title"] as? String ?? "", it["body"] as? String ?? "",
                             it["sound"] as? String, it["alarm"] as? Bool ?? false))
            }
            list.sort { $0.at < $1.at }

            var alarmIds: [String] = []
            var useAlarms = false
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) { useAlarms = AlarmManager.shared.authorizationState == .authorized }
            #endif

            var notifs = 0, alarms = 0, failed = 0
            for x in list {
                if x.alarm && useAlarms {
                    #if canImport(AlarmKit)
                    if #available(iOS 26.0, *) {
                        let id = UUID()
                        do {
                            try await self.scheduleAlarm(id: id, at: x.at, title: x.title, sound: x.sound)
                            alarmIds.append(id.uuidString); alarms += 1
                            continue
                        } catch { failed += 1 }
                    }
                    #endif
                }
                // iOS keeps at most 64 pending notifications per app
                if notifs >= 63 { continue }
                let c = UNMutableNotificationContent()
                c.title = x.title
                c.body = x.body
                if let s = x.sound { c.sound = UNNotificationSound(named: UNNotificationSoundName(s)) } else { c.sound = .default }
                let comps = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: x.at)
                let req = UNNotificationRequest(identifier: self.notifPrefix + x.id, content: c,
                                                trigger: UNCalendarNotificationTrigger(dateMatching: comps, repeats: false))
                do { try await UNUserNotificationCenter.current().add(req); notifs += 1 } catch { failed += 1 }
            }
            UserDefaults.standard.set(alarmIds, forKey: self.alarmIdsKey)
            call.resolve(["notifications": notifs, "alarms": alarms, "failed": failed, "alarmState": self.alarmState()])
        }
    }

    /// one-off test a few seconds from now
    @objc func test(_ call: CAPPluginCall) {
        let sound = call.getString("sound")
        let alarm = call.getBool("alarm") ?? false
        let at = Date().addingTimeInterval(call.getDouble("seconds") ?? 10)
        Task {
            #if canImport(AlarmKit)
            if alarm, #available(iOS 26.0, *), AlarmManager.shared.authorizationState == .authorized {
                do {
                    try await self.scheduleAlarm(id: UUID(), at: at, title: call.getString("title") ?? "تجربة المنبّه", sound: sound)
                    call.resolve(["kind": "alarm"]); return
                } catch { }
            }
            #endif
            let c = UNMutableNotificationContent()
            c.title = call.getString("title") ?? "تجربة التنبيه"
            c.body = call.getString("body") ?? ""
            c.sound = sound.map { UNNotificationSound(named: UNNotificationSoundName($0)) } ?? .default
            let req = UNNotificationRequest(identifier: self.notifPrefix + "test", content: c,
                                            trigger: UNTimeIntervalNotificationTrigger(timeInterval: max(1, at.timeIntervalSinceNow), repeats: false))
            try? await UNUserNotificationCenter.current().add(req)
            call.resolve(["kind": "notification"])
        }
    }

    #if canImport(AlarmKit)
    @available(iOS 26.0, *)
    private func scheduleAlarm(id: UUID, at: Date, title: String, sound: String?) async throws {
        let stop = AlarmButton(text: "إيقاف", textColor: .white, systemImageName: "stop.circle")
        let alert = AlarmPresentation.Alert(title: LocalizedStringResource(stringLiteral: title), stopButton: stop)
        let attributes = AlarmAttributes<RafiqAlarmData>(presentation: AlarmPresentation(alert: alert), tintColor: Color(red: 0.06, green: 0.42, blue: 0.33))
        let config = AlarmManager.AlarmConfiguration<RafiqAlarmData>(
            schedule: .fixed(at),
            attributes: attributes,
            sound: sound.map { AlertConfiguration.AlertSound.named($0) } ?? .default)
        _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
    }
    #endif
}
