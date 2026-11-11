import numpy as np, json, sys, re, itertools
from scipy.io import wavfile
ep=sys.argv[1]; only=sys.argv[2].split(',') if len(sys.argv)>2 else None
P=f'{ep}/audio/timings.json'; T=json.load(open(P))
def syl(w):
    w=re.sub(r'[^a-z]','',w.lower()); n=len(re.findall(r'[aeiouy]+',w))
    if w.endswith('e') and n>1 and not w.endswith('le'): n-=1
    return max(1,n)
for s in T:
    if only and s['id'] not in only: continue
    sr,a=wavfile.read(f"{ep}/audio/{s['id']}.wav"); a=a.astype(float); a/=abs(a).max()
    hop=int(sr*0.01); e=np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2)) for i in range(len(a)//hop)])
    sil=e<0.06*e.max(); i=0; gaps=[]
    while i<len(sil):
        if sil[i]:
            j=i
            while j<len(sil) and sil[j]: j+=1
            if j-i>=6 and i>5 and j<len(sil)-3: gaps.append((i/100,j/100))
            i=j
        else: i+=1
    nz=np.where(~sil)[0]; t0=nz[0]/100; t1=(nz[-1]+1)/100
    words=s['words']; ph=[[]]
    for k,w in enumerate(words):
        ph[-1].append(k)
        if w['w'][-1] in ',.?!:' and k<len(words)-1: ph.append([])
    n=len(ph); best=None
    for comb in itertools.combinations(range(len(gaps)), n-1):
        b=[t0]+[x for c in comb for x in gaps[c]]+[t1]
        segs=[(b[2*k],b[2*k+1]) for k in range(n)]
        rates=[sum(syl(words[k]['w']) for k in ph[p])/max(0.05,segs[p][1]-segs[p][0]) for p in range(n)]
        cost=np.std(np.log(rates))
        if best is None or cost<best[0]: best=(cost,segs,rates)
    if best is None: print(s['id'],'skip'); continue
    cost,segs,rates=best
    for p,(a0,a1) in zip(ph,segs):
        tot=sum(syl(words[k]['w']) for k in p); c=a0
        for k in p:
            d=(a1-a0)*syl(words[k]['w'])/tot; words[k]['s']=round(c,3); words[k]['e']=round(c+d,3); c+=d
    print(s['id'], round(cost,2), [ (round(x,2),round(y,2)) for x,y in segs], [round(r,1) for r in rates])
json.dump(T,open(P,'w'))
