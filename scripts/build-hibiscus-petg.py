"""Hibiscus PETG V02: shallow raised flower, rounded raised rim, six-piece case.
Units mm. Original V01 flower preserved in hibiscus_shape_v01.py.
Run python scripts/build-hibiscus-petg.py public/prototypes/hibiscus-petg
Requires numpy scipy trimesh manifold3d matplotlib.
"""
from pathlib import Path
import sys,json,hashlib,zipfile
import numpy as np
import trimesh
from scipy.ndimage import gaussian_filter
from hibiscus_shape_v01 import engraving
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource

out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
R=52.;T=4.2;H=5.4
def smooth(t):
    t=np.clip(t,0,1);return t*t*(3-2*t)
def flower(x,y):
    original=engraving(x,y)
    r=np.hypot(x,y);a=np.arctan2(y,x)
    local=(a-.22+np.pi/5)%(2*np.pi/5)-np.pi/5
    edge=37.8+6*np.cos(5*(a-.22))+.8*np.sin(15*(a-.22))
    # Additional light secondary veins; the original primary vein pattern remains.
    vein=np.zeros_like(r)
    for off in np.linspace(-.40,.40,21):
        curve=off*(.40+.60*np.clip(r/42,0,1))+.026*np.sin(r/6+off*6)
        d=r*np.sin(local-curve)
        vein=np.maximum(vein,.065*np.exp(-(d/.23)**2))
    original=np.clip(original+vein*smooth((r-15)/5)*smooth((edge-r-3)/4),0,.88)
    return original
def top(x,y):
    r=np.hypot(x,y)
    # The V01 underside sculpture becomes visible positive top relief for opaque PETG.
    # Flower peaks stay below the three flat glass-support lands at z=4.2.
    z=3.3+.8*flower(x,y)/.88
    for a0 in np.deg2rad([90,210,330]):
        d=np.hypot(x-18*np.cos(a0),y-18*np.sin(a0))
        z+=(T-z)*(1-smooth((d-1.7)/.8))
    raised=2.1*smooth((r-48.6)/.65)*smooth((51.8-r)/.65)
    return z+raised-.25*smooth((r-51.6)/.4)
def bottom(x,y):
    return .4*smooth((np.hypot(x,y)-51.5)/.5)

# High resolution below nominal 0.4 mm nozzle scale; smooth radial rim profile.
nr=200;nt=1080
ang=np.arange(nt)*2*np.pi/nt
# Dense edge rings improve the smooth rim and inner wall definition.
rr=np.unique(np.r_[np.linspace(0,48,nr)[1:],np.linspace(48.1,R,45)])
nr=len(rr)
x=(rr[:,None]*np.cos(ang)).ravel();y=(rr[:,None]*np.sin(ang)).ravel()
n=1+len(x)
lo=np.r_[bottom(np.array(0.),np.array(0.)),bottom(x,y)]
hi=np.r_[top(np.array(0.),np.array(0.)),top(x,y)]
v=np.vstack([np.column_stack([np.r_[0,x],np.r_[0,y],lo]),np.column_stack([np.r_[0,x],np.r_[0,y],hi])])
j=np.arange(nt);k=(j+1)%nt
faces=[np.column_stack([np.zeros(nt,dtype=int),1+k,1+j]),np.column_stack([np.full(nt,n,dtype=int),n+1+j,n+1+k])]
for ring in range(nr-1):
    u=1+ring*nt;a=u+j;b=u+k;c=u+nt+j;d=u+nt+k
    faces.extend([np.column_stack([a,b,c]),np.column_stack([b,d,c]),np.column_stack([a+n,c+n,b+n]),np.column_stack([b+n,c+n,d+n])])
u=1+(nr-1)*nt;a=u+j;b=u+k
faces.extend([np.column_stack([a,b,b+n]),np.column_stack([a,b+n,a+n])])
coaster=trimesh.Trimesh(vertices=v,faces=np.vstack(faces),process=False)
assert coaster.is_watertight and coaster.is_winding_consistent and coaster.volume>0
assert np.min(hi-lo)>2.6

# Revolved, rounded/chamfered case profile: 105 mm cavity, 110 mm outside.
profile=np.array([[0,0],[54.5,0],[55,.5],[55,37.1],[54.5,37.6],[53,37.6],[52.5,37.1],[52.5,2.4],[0,2.4],[0,0]])
case=trimesh.creation.revolve(profile,sections=360)
# Open U-shaped access notch. Bottom corners radius 8 mm; no bridge at the top.
from shapely.geometry import Point,box
from shapely.ops import unary_union
notch=unary_union([box(-24,16,24,65),box(-16,8,16,65),Point(-16,16).buffer(8,quad_segs=32),Point(16,16).buffer(8,quad_segs=32)])
tool=trimesh.creation.extrude_polygon(notch,30,engine='earcut')
tool.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[1,0,0]));tool.apply_translation([0,-35,0])
case=trimesh.boolean.difference([case,tool],engine='manifold')
# Rigid PETG slip cap, 0.5 mm radial fit clearance; no snap latch.
lip=np.array([[0,0],[57,0],[57.5,.5],[57.5,9.5],[57,10],[56,10],[55.5,9.5],[55.5,2.4],[0,2.4],[0,0]])
lid=trimesh.creation.revolve(lip,sections=360)
fitring=trimesh.creation.annulus(r_min=52.5,r_max=55,height=5,sections=360)
fitring.apply_translation([0,0,2.5])
report={'prototype':'Hibiscus PETG V02; unprinted','coaster_diameter_mm':104,'glass_support_plane_mm':4.2,'base_plate_mm':3.3,'maximum_flower_relief_mm':.8,'coaster_max_height_mm':5.4,'rim_above_support_plane_mm':1.2,'glass_lands':{'count':3,'radius_from_center_mm':18,'nominal_diameter_mm':3.4,'height_mm':4.2},'case':{'outer_diameter_mm':110,'inner_diameter_mm':105,'height_mm':37.6,'floor_mm':2.4,'six_coaster_stack_mm':32.4,'cavity_height_mm':35.2,'front_opening_width_mm':48},'lid':{'outer_diameter_mm':115,'inner_diameter_mm':111,'height_mm':10,'radial_clearance_mm':.5},'material_target':'orange PETG; supplier profile unspecified','meshes':{}}
meshes={'HIBISCUS-PETG-V02-COASTER':coaster,'HIBISCUS-PETG-V02-CASE':case,'HIBISCUS-PETG-V02-LID':lid,'HIBISCUS-PETG-V02-FIT-RING':fitring}
for name,mesh in meshes.items():
    assert mesh.is_watertight and mesh.is_volume,name
    p=out/(name+'.stl');mesh.export(p)
    m=trimesh.load(p)
    assert m.is_watertight and m.is_volume and m.is_winding_consistent,name+' export'
    assert len(m.split())==1,name+' connected'
    report['meshes'][name]={'triangles':len(m.faces),'watertight':True,'solid':True,'connected_solids':1,'extents_mm':np.round(m.extents,4).tolist(),'volume_cm3':round(float(m.volume/1000),4),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
report['minimum_modeled_coaster_thickness_mm']=round(float(np.min(hi-lo)),4)
(out/'geometry-report.json').write_text(json.dumps(report,indent=2)+'\n')

# Exact 2800 px height preview; color is simulated orange PETG, not a real print.
q=np.linspace(-55,55,2200);xx,yy=np.meshgrid(q,q);r=np.hypot(xx,yy)
z=top(xx,yy)
ls=LightSource(azdeg=310,altdeg=32)
color=np.zeros(z.shape+(3,));color[:]=[.95,.36,.065]
rgb=ls.shade_rgb(color,z,vert_exag=2.2,dx=q[1]-q[0],dy=q[1]-q[0],blend_mode='soft')
rgb[r>R]=[.96,.945,.91]
fig=plt.figure(figsize=(14,10),facecolor='#f5f1e8')
ax=fig.add_axes([.015,.08,.64,.87]);ax.imshow(rgb,extent=[-55,55,-55,55],origin='lower');ax.axis('off')
fig.text(.69,.80,'JUP LIFE',fontsize=28,color='#084b50',fontfamily='serif')
fig.text(.69,.74,'HIBISCUS / PETG V02',fontsize=13,color='#084b50')
fig.text(.69,.64,'ORANGE PETG',fontsize=16,color='#b44b13')
fig.text(.69,.55,'104 mm diameter\n4.2 mm glass support plane\n5.4 mm maximum rim height\nShallow raised flower\nSix-coaster case + lid',fontsize=13,linespacing=1.8,color='#45635f',va='top')
fig.text(.69,.29,'Original five-petal motif\nFine secondary veins\nThree level glass-support lands',fontsize=12,linespacing=1.8,color='#45635f',va='top')
fig.text(.045,.04,'ACTUAL CAD HEIGHT PREVIEW — NOT PRINT PHOTOGRAPHY\nFDM finish and fine vein resolution depend on the printer, filament and toolpaths.',fontsize=10,color='#45635f')
fig.savefig(out/'HIBISCUS-PETG-V02-CAD.png',dpi=200,facecolor=fig.get_facecolor());plt.close(fig)
print(json.dumps(report,indent=2))
