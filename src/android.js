/* Android app: same native alarm bridge as iOS, with Android wording */
if (window.NATIVE_APP && window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform()==="android"){
  const _npAnd = nativePanelHTML;
  nativePanelHTML = function(){ return _npAnd().replace(/<p class="small">[\s\S]*?<\/p>/, `<p class="small">على أندرويد يُرفع الأذان كاملاً في وقته ولو كان التطبيق مغلقاً والهاتف مقفلاً، ويمكن إيقافه من الإشعار. «منبّه يرنّ» يُسمع ولو كان الهاتف على الصامت.</p>`); };
}
