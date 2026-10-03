"""JUP-003 Sunrise Channel: original CAD artwork; dimensions in millimetres.
Run: python scripts/build-sunrise-channel.py public/prototypes/sunrise-channel
Dependencies: numpy shapely trimesh manifold3d mapbox-earcut matplotlib cairosvg
"""
from pathlib import Path
import sys,json,math,hashlib
import numpy as np
from shapely.geometry import Point,LineString,Polygon,box
from shapely.ops import unary_union
import trimesh
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
diameter=104.;thickness=4.2
disk=Point(0,0).buffer(diameter/2,quad_segs=192)
art=Point(0,0).buffer(48,quad_segs=160)
def stroke(points,width=.8):
    return LineString(points).buffer(width/2,cap_style='round',join_style='round')
def wave(x0,x1,y,width=.8,amp=.45,phase=0):
    x=np.linspace(x0,x1,60)
    return stroke(list(zip(x,y+amp*np.sin(x*.30+phase))),width)
groups={.30:[],.55:[],.75:[]}
# Original rock banks form a perspective channel, opening toward the viewer.
left=[(-24,-52),(-23,-45),(-17,-41),(-19,-36),(-14,-31),(-16,-27),(-12,-23),(-13,-18),(-9,-14),(-11,-10),(-7,-6),(-8,-2),(-5,2),(-6,6),(-3,10),(-4,12)]
right=[(3,12),(5,9),(4,5),(8,2),(7,-3),(11,-7),(9,-12),(14,-16),(12,-22),(17,-27),(16,-31),(21,-36),(19,-42),(25,-47),(28,-52)]
channel=Polygon(left+right).buffer(0)
groups[.55].append(channel)
# Horizon; sun outline, disk and sparse rays. Horizon is above the vanishing point.
groups[.30].append(stroke([(-45,13),(45,13)],.8))
sun=Point(0,22).buffer(7,quad_segs=96)
groups[.30].append(sun)
groups[.75].append(sun.boundary.buffer(.38))
for angle in [20,45,70,95,120,145,170]:
    a=math.radians(angle)
    groups[.30].append(stroke([(9.5*math.cos(a),22+9.5*math.sin(a)),(12.5*math.cos(a),22+12.5*math.sin(a))],.75))
# Far ocean lines, cut wide enough for a 0.4 mm nozzle trial.
for y in [15.2,17.6,20.1,23,26,29.2]:
    extent=math.sqrt(max(0,46**2-y**2))
    water=wave(-extent,extent,y,.65,.22,y)
    groups[.30].append(water.difference(sun.buffer(1.4)))
# Specular sunrise ripples: expanding irregular arcs inside the channel.
for i,y in enumerate(np.linspace(-43,8,17)):
    w=2.1+(8-y)*.30
    ripple=wave(-w,w,y,.85,.42,i*.9).intersection(channel.buffer(-1.1))
    if not ripple.is_empty:groups[.75].append(ripple)
# Continuous bank outlines, plus rock strata and rounded erosion pockets.
for bank in [left,right]:groups[.75].append(stroke(bank,.85))
for side in [-1,1]:
    for i,y in enumerate([-38,-31,-24,-17,-10,-3,4]):
        edge=side*(5+(10-y)*.35)
        outer=side*math.sqrt(max(0,45.5**2-y**2))
        x=np.linspace(edge+side*2.1,outer,30)
        if len(x):
            line=stroke(list(zip(x,y+.9*np.sin(x*.4+i))),.75)
            groups[.30].append(line.difference(channel.buffer(1.2)))
        px=side*(abs(edge)+5.5)
        pocket=Point(px,y+2).buffer(1.2,quad_segs=24)
        groups[.55].append(pocket.difference(channel.buffer(1.4)))
# Short rock fractures; deterministic locations; no photographic copying.
rng=np.random.default_rng(31003)
for i in range(48):
    x,y=rng.uniform(-44,44),rng.uniform(-43,8)
    p=Point(x,y)
    if art.buffer(-2).contains(p) and not channel.buffer(3.5).contains(p):
        groups[.30].append(stroke([(x,y),(x+.6,y+1.1),(x+.2,y+2.1)],.65))
geometry={}
for depth,shapes in groups.items():
    geometry[depth]=unary_union(shapes).intersection(art).buffer(0).simplify(.025,preserve_topology=True)
base=trimesh.creation.extrude_polygon(disk,thickness,engine='earcut')
for depth,g in sorted(geometry.items()):
    polygons=[g] if g.geom_type=='Polygon' else list(g.geoms)
    tools=[]
    for p in polygons:
        if p.geom_type!='Polygon' or p.area<.03:continue
        cutter=trimesh.creation.extrude_polygon(p,depth+.2,engine='earcut')
        cutter.apply_translation([0,0,thickness-depth]);tools.append(cutter)
    if tools:base=trimesh.boolean.difference([base,*tools],engine='manifold')
assert base.is_watertight and base.is_volume
stl=out/'sunrise-channel-jup-003-v01.stl'
base.export(stl)
loaded=trimesh.load(stl)
assert loaded.is_watertight and loaded.is_volume,'Exported STL must remain a solid'
assert np.allclose(loaded.extents,[104,104,4.2],atol=.001)
assert len(loaded.split())==1
report={'design':'JUP-003 Sunrise Channel V01','status':'CAD prototype; unprinted','material_target':'TPU 95A','units':'mm','diameter_mm':104,'thickness_mm':4.2,'engraving_depths_mm':[.30,.55,.75],'minimum_base_mm':3.45,'nominal_minimum_stroke_mm':.65,'outer_flat_band_mm':4,'watertight_export':True,'solid_export':True,'connected_solids':1,'triangles':len(loaded.faces),'volume_mm3':round(float(loaded.volume),2),'sha256':hashlib.sha256(stl.read_bytes()).hexdigest()}
(out/'mesh-report.json').write_text(json.dumps(report,indent=2)+'\n')
# Preview follows the exact CAD engraving polygons. Colors distinguish depths.
paths=[]
for depth,g in sorted(geometry.items()):
    for p in [g] if g.geom_type=='Polygon' else g.geoms:
        if p.geom_type!='Polygon':continue
        d=' '.join('M '+' L '.join(f'{x:.3f},{-y:.3f}' for x,y in ring.coords)+' Z' for ring in [p.exterior,*p.interiors])
        color={.30:'#70a6a0',.55:'#4c8b88',.75:'#2c6b71'}[depth]
        paths.append(f'<path fill="{color}" fill-rule="evenodd" d="{d}"/>')
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-58 -58 116 116"><rect x="-58" y="-58" width="116" height="116" fill="#f6f1e7"/><circle r="52" fill="#a9c9be" stroke="#497f7a" stroke-width=".4"/>'+''.join(paths)+'</svg>'
(out/'sunrise-channel-top.svg').write_text(svg)
import cairosvg
cairosvg.svg2png(bytestring=svg.encode(),write_to=str(out/'sunrise-channel-top.png'),output_width=2400,output_height=2400)
# A geometric render of the actual exported mesh, with uniform simulated color.
fig=plt.figure(figsize=(10,8),dpi=240,facecolor='#f6f1e7')
ax=fig.add_subplot(111,projection='3d',facecolor='#f6f1e7')
normal=loaded.face_normals
light=np.array([-.3,-.5,1.]);light/=np.linalg.norm(light)
shade=np.clip(.40+.60*np.maximum(0,normal@light),.2,1)
rgb=np.array([.32,.65,.61])
colors=np.c_[shade[:,None]*rgb[None,:],np.ones(len(shade))]
visible=normal[:,2]>=0
surface=Poly3DCollection(loaded.triangles[visible],facecolors=colors[visible],edgecolors='none',linewidths=0,antialiased=False,zsort='min')
ax.add_collection3d(surface)
ax.set_xlim(-57,57);ax.set_ylim(-57,57);ax.set_zlim(0,11)
ax.set_box_aspect((114,114,11));ax.view_init(elev=58,azim=-90)
ax.set_proj_type('ortho');ax.set_axis_off()
fig.subplots_adjust(0,0,1,1)
fig.savefig(out/'sunrise-channel-cad.png',facecolor=fig.get_facecolor(),bbox_inches='tight',pad_inches=.15)
plt.close(fig)
print(json.dumps(report))
