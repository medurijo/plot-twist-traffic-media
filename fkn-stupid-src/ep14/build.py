import re
b=open('base2.js').read()
a=b.index("// ---------- timeline"); e=b.index("*sunburn.*'];")+len("*sunburn.*'];")
b=b[:a]+open('timing.js').read()+b[e:]
cc=open('cam_cap.js').read().replace("const u = clamp((t - s.t) / Math.max(.3, tn - s.t));","let u = clamp((t - s.t) / Math.max(.3, tn - s.t)); if (s.ez) u = eio(u);")
sg=open('sign_src.js').read(); sg=sg[sg.index('const signShake'):]
b=b.replace("//@@MAIN", open('common.js').read()+"\n"+open('main.js').read()+"\n"+open('upgrade.js').read()+"\n"+open('shots.js').read()+"\n"+sg+"\n"+cc+"\n"+open('overlay.js').read())
open('ep14.js','w').write(b)
