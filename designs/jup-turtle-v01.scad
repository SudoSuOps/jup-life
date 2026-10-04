// JUP TURTLE 001 — TPU 95A coaster
// Flat drink face, shallow engraved sea-turtle artwork, perimeter catch lip.
// Units: mm
$fn=180;

diameter=104;
base_h=3.0;
lip_h=0.45;
lip_w=1.8;
engrave_depth=0.45;
art_scale=0.92;

module turtle2d(){
  union(){
    // shell
    scale([1.05,0.78]) circle(d=52);
    // head
    translate([0,28]) scale([0.85,1.0]) circle(d=14);
    // front flippers
    translate([-28,13]) rotate(28) scale([1.55,0.55]) circle(d=22);
    translate([ 28,13]) rotate(-28) scale([1.55,0.55]) circle(d=22);
    // rear flippers
    translate([-23,-18]) rotate(-32) scale([1.20,0.50]) circle(d=18);
    translate([ 23,-18]) rotate(32) scale([1.20,0.50]) circle(d=18);
    // tail
    translate([0,-30]) polygon(points=[[-4,0],[4,0],[0,-9]]);
  }
}

module shell_channels2d(){
  // Organic scute lines carved into shell.
  union(){
    for(a=[0,60,120]) rotate(a) square([2.0,42],center=true);
    difference(){
      scale([1.05,0.78]) circle(d=36);
      scale([1.05,0.78]) circle(d=31);
    }
    difference(){
      scale([1.05,0.78]) circle(d=22);
      scale([1.05,0.78]) circle(d=18);
    }
  }
}

module coaster_body(){
  difference(){
    union(){
      cylinder(d=diameter,h=base_h);
      // Low perimeter catch lip; center remains essentially flat.
      translate([0,0,base_h]) difference(){
        cylinder(d=diameter,h=lip_h);
        cylinder(d=diameter-2*lip_w,h=lip_h+0.02);
      }
    }

    // Turtle silhouette engraving.
    translate([0,0,base_h-engrave_depth])
      linear_extrude(height=engrave_depth+0.02)
        scale([art_scale,art_scale]) turtle2d();

    // Shallower shell-detail channels to keep a crisp premium read.
    translate([0,0,base_h-engrave_depth*0.62])
      linear_extrude(height=engrave_depth*0.62+0.02)
        scale([art_scale,art_scale]) shell_channels2d();
  }
}

coaster_body();
