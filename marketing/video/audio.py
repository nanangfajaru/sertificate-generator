import numpy as np, wave
SR=44100; T=30.0; N=int(SR*T)
rng=np.random.default_rng(7)
music=np.zeros(N); sfx=np.zeros(N)
def tt(d): return np.arange(int(SR*d))/SR
def add(buf,t0,sig,g=1.0):
    i=int(t0*SR); j=min(N,i+len(sig))
    if j>i: buf[i:j]+=sig[:j-i]*g
def lp(x,fc):  # one-pole lowpass via FFT (zero-phase-ish brickwall-soft)
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/np.sqrt(1+(f/fc)**4); return np.fft.irfft(X,len(x))
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/np.sqrt(1+(lo/np.maximum(f,1))**4)/np.sqrt(1+(f/hi)**4); return np.fft.irfft(X,len(x))
def note(m): return 440*2**((m-69)/12)
# ---------- music: 112 bpm, I–V–vi–IV in C
bpm=112; beat=60/bpm; bar=4*beat
prog=[[48,52,55,60],[43,50,55,59],[45,52,57,60],[41,48,53,57]]
nb=int(T/bar)+1
for b in range(nb):
    ch=prog[b%4]; t0=b*bar
    # pad
    d=bar+0.4; x=tt(d); e=np.minimum(1,x/0.35)*np.minimum(1,np.maximum(0,(d-x)/0.5))
    pad=sum(np.sin(2*np.pi*note(m+12)*x)+0.25*np.sin(2*np.pi*note(m+12)*2*x+.3) for m in ch[1:])
    add(music,t0,pad*e,0.035)
    # bass (beats 1 and 3, plus pickup)
    for k,bt in enumerate([0,2,3.5]):
        x=tt(beat*1.4); s=np.sin(2*np.pi*note(ch[0]-12)*x)*np.exp(-x*3.5)*np.minimum(1,x/0.01)
        add(music,t0+bt*beat,s,0.16 if k<2 else 0.09)
    # arp 8ths
    seq=[ch[1],ch[2],ch[3],ch[2]+12,ch[3],ch[2],ch[1]+12,ch[3]]
    for k,m in enumerate(seq):
        x=tt(0.5); f=note(m+12)
        s=(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x))*np.exp(-x*9)*np.minimum(1,x/0.004)
        add(music,t0+k*beat/2,s,0.05)
    # kick 1,3 ; hat offbeats ; clap 2,4
    for bt in [0,2]:
        x=tt(0.25); f=50+90*np.exp(-x*30); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*14)
        add(music,t0+bt*beat,s,0.30)
    for k in range(4):
        x=tt(0.05); s=np.diff(rng.standard_normal(len(x)+1))*np.exp(-x*90)
        add(music,t0+(k+0.5)*beat,s,0.025)
    for bt in [1,3]:
        x=tt(0.18); s=bp(rng.standard_normal(len(x)),900,4000)*np.exp(-x*22)
        add(music,t0+bt*beat,s,0.07)
# music envelope: fade in, gentle dip under logo/CTA accents, fade out
tm=np.arange(N)/SR
menv=np.minimum(1,tm/0.8)*np.clip((30-tm)/1.6,0,1)
music*=menv
# ---------- sfx
def click(g=1,f=2200):
    x=tt(0.04); return (np.sin(2*np.pi*f*x)*np.exp(-x*160)+0.6*rng.standard_normal(len(x))*np.exp(-x*900))*g
def key():
    x=tt(0.03); f=rng.uniform(1800,3200)
    return bp(rng.standard_normal(len(x)),1500,6000)*np.exp(-x*220)*0.5+np.sin(2*np.pi*f*x)*np.exp(-x*300)*0.25
def whoosh(d=0.5,up=True):
    x=tt(d); n=rng.standard_normal(len(x)); out=np.zeros(len(x)); w=int(0.04*SR); h=w//2; win=np.hanning(w)
    for i in range(0,len(x)-w,h):
        p=i/len(x); c=(300+3000*p) if up else (3300-3000*p)
        out[i:i+w]+=bp(n[i:i+w]*win,c*0.6,c*1.6)
    e=np.sin(np.pi*np.clip(x/d,0,1))**2; return out*e*0.65
def pop(f0=500,f1=1100):
    x=tt(0.12); f=f0+(f1-f0)*np.minimum(1,x/0.06); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*30)
def bell(f,d=1.2):
    x=tt(d); return (np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*2.01*f*x)+0.15*np.sin(2*np.pi*3.02*f*x))*np.exp(-x*4)*np.minimum(1,x/0.003)
def thud():
    x=tt(0.35); f=45+70*np.exp(-x*20); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*9)
    return s+lp(rng.standard_normal(len(x)),600)*np.exp(-x*25)*0.8
# scene A
add(sfx,0.05,whoosh(0.5),0.35)
for i in range(6): add(sfx,0.6+i*0.2,click(1,1500+i*120),0.25)
add(sfx,1.9,thud(),0.9)
add(sfx,3.0,whoosh(0.5),0.45)
# B logo
add(sfx,3.45,pop(400,900),0.5); add(sfx,3.5,bell(1047,1.4),0.18); add(sfx,3.62,bell(1568,1.4),0.15)
add(sfx,5.3,whoosh(0.45,False),0.4)
# C phone + caption
add(sfx,5.7,whoosh(0.6),0.35); add(sfx,5.75,pop(),0.35)
for tp in [6.8,8.9,10.8]: add(sfx,tp,click(1,2400),0.5)
for s,a,b in [("Aisyah Putri Rahma",7.0,8.6),("aisyah@email.com",9.2,10.5),("Universitas Nusantara",11.1,12.4)]:
    n=len(s)
    for k in range(1,n+1):
        tk=a+(b-a)*(k-0.5)/n
        if s[k-1]!=' ': add(sfx,tk,key(),0.45)
add(sfx,13.1,click(1.2,1800),0.65)
add(sfx,14.0,bell(1319,1.2),0.22); add(sfx,14.12,bell(1976,1.4),0.2)
# D
add(sfx,15.2,whoosh(0.5,False),0.35); add(sfx,15.25,pop(),0.3)
add(sfx,15.55,whoosh(0.9),0.5)
for k in range(10): add(sfx,16.2+k*0.06+rng.uniform(0,.03),bell(rng.uniform(2500,5000),0.5),0.05)
for i in range(3): add(sfx,17.0+i*0.45,pop(600+i*120,1300+i*150),0.35)
# E
add(sfx,20.6,pop(),0.3); add(sfx,20.6,whoosh(1.0),0.4)
add(sfx,21.5,click(1,3000),0.3)
x=tt(1.2); scan=np.sin(2*np.pi*1500*x)*(0.5+0.5*np.sin(2*np.pi*14*x))*np.minimum(1,x/0.05)*np.minimum(1,(1.2-x)/0.1)
add(sfx,21.8,scan,0.05)
add(sfx,23.0,bell(1568,0.6),0.18); add(sfx,23.08,bell(2093,1.2),0.2)
# F
add(sfx,24.9,whoosh(0.5),0.45)
add(sfx,25.4,pop(400,900),0.45)
add(sfx,26.2,pop(500,1200),0.45)
for k,f in enumerate([1047,1319,1568,2093]): add(sfx,26.25+k*0.1,bell(f,1.6),0.14)
# light reverb on sfx
ir=rng.standard_normal(int(0.7*SR))*np.exp(-np.arange(int(0.7*SR))/SR*7); ir=lp(ir,5000); ir/=np.sqrt((ir**2).sum())
L=N+len(ir); wet=np.fft.irfft(np.fft.rfft(sfx,L)*np.fft.rfft(ir,L),L)[:N]
mix=music*0.9+sfx+0.18*wet
mix=np.tanh(mix*1.2)/np.tanh(1.2)
mix*=0.89/np.max(np.abs(mix))
st=np.stack([mix,mix],1)
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
