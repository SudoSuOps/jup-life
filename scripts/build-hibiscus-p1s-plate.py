"""Create a standard, unsliced 3MF first-article plate. No printer G-code."""
from pathlib import Path
import io, zipfile, sys
import numpy as np
import trimesh
ROOT = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1] / 'public/prototypes/hibiscus-petg'
out = ROOT / 'HIBISCUS-PETG-V02-P1S-FIRST-PLATE.3mf'
items = [('COASTER', 68, 128), ('FIT-RING', 184, 128)]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
    z.writestr('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
    with z.open('3D/3dmodel.model', 'w', force_zip64=True) as binary:
        f = io.TextIOWrapper(binary, encoding='utf-8')
        f.write('<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">JUP LIFE Hibiscus V02 - P1S first article - unsliced</metadata><resources>')
        for number,(name,x,y) in enumerate(items,1):
            mesh=trimesh.load(ROOT/f'HIBISCUS-PETG-V02-{name}.stl', force='mesh')
            assert mesh.is_watertight and mesh.is_volume
            assert x+mesh.bounds[0,0]>=0 and x+mesh.bounds[1,0]<=256
            assert y+mesh.bounds[0,1]>=0 and y+mesh.bounds[1,1]<=256
            f.write(f'<object id="{number}" type="model" name="Hibiscus V02 {name}"><mesh><vertices>')
            for start in range(0,len(mesh.vertices),10000):
                f.write(''.join(f'<vertex x="{a:.7f}" y="{b:.7f}" z="{c:.7f}"/>' for a,b,c in mesh.vertices[start:start+10000]))
            f.write('</vertices><triangles>')
            for start in range(0,len(mesh.faces),10000):
                f.write(''.join(f'<triangle v1="{a}" v2="{b}" v3="{c}"/>' for a,b,c in mesh.faces[start:start+10000]))
            f.write('</triangles></mesh></object>')
        f.write('</resources><build>')
        for number,(_,x,y) in enumerate(items,1):
            f.write(f'<item objectid="{number}" transform="1 0 0 0 1 0 0 0 1 {x} {y} 0"/>')
        f.write('</build></model>'); f.flush(); f.detach()
assert out.stat().st_size < 25*1024*1024
with zipfile.ZipFile(out) as z: assert z.testzip() is None
print(out, out.stat().st_size)
