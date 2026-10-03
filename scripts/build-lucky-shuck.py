"""Prototype geometry, millimetres. Rebuild with Pillow, OpenCV, Shapely,
trimesh, mapbox-earcut and manifold3d. Input: customer-supplied logo PNG.
"""
from pathlib import Path
import sys, json
import cv2
import numpy as np
from PIL import Image
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
import trimesh

out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
im = np.asarray(Image.open(sys.argv[1]).convert('RGBA'))
# Main two-line lettering only. Omit halftone dots and tiny tagline for cleaning.
mask = (im[:460,:,3] > 180).astype('uint8') * 255
n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
clean = np.zeros_like(mask)
for i in range(1,n):
    if stats[i,cv2.CC_STAT_AREA] > 1500: clean[labels == i] = 255
contours, hierarchy = cv2.findContours(clean,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
polys=[]
scale=84/im.shape[1]
def ring(c):
    a=c[:,0,:].astype(float); a[:,0]=(a[:,0]-450)*scale
    a[:,1]=(230-a[:,1])*scale
    return a
for i,c in enumerate(contours):
    if hierarchy[0,i,3] != -1: continue
    holes=[]; j=hierarchy[0,i,2]
    while j != -1:
        if len(contours[j])>=3: holes.append(ring(contours[j]))
        j=hierarchy[0,j,0]
    p=Polygon(ring(c),holes).buffer(0).simplify(.06,preserve_topology=True)
    if not p.is_empty: polys.append(p)
logo=unary_union(polys)
disk=Point(0,0).buffer(52,quad_segs=128)
base=trimesh.creation.extrude_polygon(disk,4.2,engine='earcut')
cutters=[]
for p in logo.geoms if hasattr(logo,'geoms') else [logo]:
    m=trimesh.creation.extrude_polygon(p,.8,engine='earcut')
    m.apply_translation([0,0,3.6]); cutters.append(m)
coaster=trimesh.boolean.difference([base,*cutters],engine='manifold')
# Open six-coaster case: 106 mm cavity; 110 mm outside; 30 mm cavity depth.
outer=trimesh.creation.cylinder(radius=55,height=32,sections=256)
outer.apply_translation([0,0,16])
inner=trimesh.creation.cylinder(radius=53,height=31,sections=256)
inner.apply_translation([0,0,17.5])
case=trimesh.boolean.difference([outer,inner],engine='manifold')
# Loose slip lid: 0.4 mm radial clearance, 2 mm roof and 8 mm skirt.
lidouter=trimesh.creation.cylinder(radius=57.4,height=10,sections=256)
lidouter.apply_translation([0,0,5])
lidinner=trimesh.creation.cylinder(radius=55.4,height=8.2,sections=256)
lidinner.apply_translation([0,0,3.9])
lid=trimesh.boolean.difference([lidouter,lidinner],engine='manifold')
report={}
for name,m in [('lucky-shuck-coaster-v01',coaster),('six-coaster-case-v01',case),('six-coaster-lid-v01',lid)]:
    assert m.is_watertight and m.is_volume, name
    assert m.volume>0
    m.export(out/(name+'.stl'))
    report[name]={'watertight':bool(m.is_watertight),'volume_mm3':round(float(m.volume),2),'size_mm':np.round(m.extents,3).tolist(),'triangles':len(m.faces)}
(out/'mesh-report.json').write_text(json.dumps(report,indent=2)+'\n')
# Orthographic SVG uses the actual toolpath outline, not an AI visualization.
paths=[]
for p in logo.geoms if hasattr(logo,'geoms') else [logo]:
    rs=[p.exterior,*p.interiors]
    d=' '.join('M '+' L '.join(f'{x:.3f},{-y:.3f}' for x,y in r.coords)+' Z' for r in rs)
    paths.append(f'<path d="{d}" fill="#b82b2d" fill-rule="evenodd"/>')
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-58 -58 116 116"><rect x="-58" y="-58" width="116" height="116" fill="#f3eee4"/><circle r="52" fill="#dedad1" stroke="#b9b4a8" stroke-width=".5"/>'+''.join(paths)+'</svg>'
(out/'lucky-shuck-prototype.svg').write_text(svg)
print(json.dumps(report))
