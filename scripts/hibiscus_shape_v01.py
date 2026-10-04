"""Original JUP LIFE Hibiscus V01 engraving function, preserved from the owner's print pack."""
import numpy as np
R=52.0
def engraving(x,y):
    # Work in the original 104 mm design coordinates, scalable in XY.
    x=x*52/R;y=y*52/R;r=np.hypot(x,y);a=np.arctan2(y,x)
    rot=.22;local=(a-rot+np.pi/5)%(2*np.pi/5)-np.pi/5
    edge=37.8+6.0*np.cos(5*(a-rot))+0.8*np.sin(15*(a-rot))
    mask=np.clip((edge-r)/.85,0,1)*np.clip((r-4)/3,0,1)
    # Broad petal relief with gentle folds and an incised perimeter.
    petal=(.20+.19*(1-(r/46)**2)+.11*np.cos(local*7))
    outline=.26*np.exp(-((r-(edge-1.1))/.55)**2)
    seams=.20*np.exp(-((np.abs(local)-np.pi/5+.035)/.035)**2)
    veins=np.zeros_like(r)
    for off in [-.36,-.24,-.12,0,.12,.24,.36]:
        curve=off*(.40+.60*np.clip(r/42,0,1))+.035*np.sin(r/7+off*4)
        d=r*np.sin(local-curve)
        veins=np.maximum(veins,.15*np.exp(-(d/.32)**2))
    veins*=np.clip((r-9)/5,0,1)*np.clip((edge-r-3)/4,0,1)
    throat=.78*np.exp(-(r/7.8)**2)
    h=np.maximum(mask*(petal+outline+seams+veins),throat)
    # Curved style/stamen, with rounded stigma pads and pollen beads.
    for t in np.linspace(0,1,85):
        sx=2+19*t;sy=1+9*t+4*t*t
        h=np.maximum(h,.70*np.exp(-((x-sx)**2+(y-sy)**2)/(1.0**2)))
    for sx,sy in [(23,16),(24,12.5),(20,18),(26,16.8),(22,20)]:
        h=np.maximum(h,.82*np.exp(-((x-sx)**2+(y-sy)**2)/(1.25**2)))
    for t in np.linspace(.35,.9,10):
        sx=2+19*t;sy=1+9*t+4*t*t
        for sign in [-1,1]:
            h=np.maximum(h,.65*np.exp(-((x-sx+sign*1.7)**2+(y-sy-sign*1.1)**2)/(.55**2)))
    return np.clip(h,0,.85)*np.clip((46.4-r)/1.2,0,1)

