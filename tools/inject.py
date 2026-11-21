#!/usr/bin/env python3
"""Inject src/*.js and src/*.css modules into a built page (index.html or the Claude artifact copy).
Usage: python3 tools/inject.py PAGE.html [module ...]   (default modules: muhasaba)
Each module is wrapped in markers so re-running replaces it instead of duplicating."""
import sys, os, re
page = sys.argv[1]; mods = sys.argv[2:] or ['muhasaba']
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = open(page, encoding='utf-8').read()
ANCHOR = "document.addEventListener(\"click\", e=>{ const b = e.target.closest('[data-hgo=\"fast\"]');"
for m in mods:
    js = open(os.path.join(root, 'src', m + '.js'), encoding='utf-8').read().strip()
    a, b = f'/*<<{m}>>*/', f'/*<</{m}>>*/'
    t = re.sub(re.escape(a) + '.*?' + re.escape(b) + '\n?', '', t, flags=re.S)
    i = t.index(ANCHOR); j = t.index('\n', i) + 1
    t = t[:j] + a + '\n' + js + '\n' + b + '\n' + t[j:]
    cp = os.path.join(root, 'src', m + '.css')
    if os.path.exists(cp):
        css = open(cp, encoding='utf-8').read().strip()
        t = re.sub(re.escape(a) + '.*?' + re.escape(b) + '\n?', '', t, count=0, flags=re.S) if False else t
        ca, cb = f'/*<<{m}-css>>*/', f'/*<</{m}-css>>*/'
        t = re.sub(re.escape(ca) + '.*?' + re.escape(cb) + '\n?', '', t, flags=re.S)
        k = t.rindex('</style>', 0, t.index('<script'))  if '<script' in t else t.rindex('</style>')
        # last </style> before the app script
        k = max(x.start() for x in re.finditer('</style>', t[:t.index(ANCHOR)]))
        t = t[:k] + ca + '\n' + css + '\n' + cb + '\n' + t[k:]
open(page, 'w', encoding='utf-8').write(t)
print('injected', mods, len(t))
