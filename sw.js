const CACHE = 'sgmt-kakaku-v3';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './icon-180.png'
      ]).catch(function() {
        return cache.add('./index.html');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // 古いキャッシュを全削除
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // ネットワーク優先：ネットがあれば常に最新を取得、失敗時のみキャッシュ使用
  e.respondWith(
    fetch(e.request).then(function(response) {
      // 取得成功したらキャッシュも更新
      var clone = response.clone();
      caches.open(CACHE).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // オフライン時はキャッシュから返す
      return caches.match(e.request).then(function(r) {
        return r || caches.match('./index.html');
      });
    })
  );
});