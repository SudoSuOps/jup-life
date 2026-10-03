// JUP LIFE / Jup Bloom V01 — millimetres. Print prototype; not released.
// 105 diameter x 3.6 thick, continuous flat central 72 mm drink platform.
$fn=180;
diameter=105; height=3.6; groove_depth=0.6;
module flower_grooves(){
 for(a=[0:45:315]) rotate(a) translate([44,0])
  difference(){scale([1.35,1]) circle(5.2); scale([1.35,1]) circle(4.2);}
}
difference(){
 cylinder(d=diameter,h=height);
 translate([0,0,height-groove_depth]) linear_extrude(groove_depth+0.1) flower_grooves();
}
