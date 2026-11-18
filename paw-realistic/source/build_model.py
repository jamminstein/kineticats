import bpy, math, random, bisect, json, time
from mathutils import Vector
from mathutils.noise import noise_vector
from pathlib import Path
random.seed(57123)
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'rebuilt';WEB=OUT/'web'
for p in [OUT,WEB]:p.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'

def material(name,color,rough=.6):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
 return m
skin=material('Black short fur undercoat',(.009,.008,.0075),.86)
fur=[]
for i in range(7):
 c=[.002,.0035,.005,.008,.013,.021,.036][i];m=material('Fur strand '+str(i),(c,c*.94,c*.87),.58)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Sheen Weight'].default_value=.18;p.inputs['Sheen Roughness'].default_value=.45;p.inputs['Specular IOR Level'].default_value=.28
 fur.append(m)
padmat=material('Soft charcoal paw pads',(.025,.019,.018),.56)
clawmat=material('Warm translucent horn',(.36,.27,.18),.38)
p=clawmat.node_tree.nodes.get('Principled BSDF');p.inputs['Subsurface Weight'].default_value=.035;p.inputs['Coat Weight'].default_value=.12;p.inputs['Coat Roughness'].default_value=.3

model=[]
def ellipsoid(name,center,radii,mat,segments=40,rings=24):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=center)
 o=bpy.context.object;o.name=name;o.scale=radii;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in o.data.polygons:p.use_smooth=True
 if mat:o.data.materials.append(mat)
 return o

def fuse(objects,name,voxel=.035,smooth=6):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 r=o.modifiers.new('Continuous surface','REMESH');r.mode='VOXEL';r.voxel_size=voxel;r.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=r.name)
 s=o.modifiers.new('Soft anatomical transitions','SMOOTH');s.factor=.95;s.iterations=smooth;bpy.ops.object.modifier_apply(modifier=s.name)
 for p in o.data.polygons:p.use_smooth=True
 return o

# x: left/right, y: underside (+), z: toes (+). Four forward digits plus a set-back inner digit.
toes=[(-.65,-.015,.79,.24,.295,.36),(-.235,-.035,1.065,.265,.32,.41),(.255,-.035,1.095,.265,.32,.40),(.66,.01,.83,.235,.285,.35)]
# A continuous foreleg with a rounded, closed crop at the wrist base.
wv=[];wf=[];rings=[(-1.98,.455,.335),(-1.86,.47,.345),(-1.25,.48,.35),(-.65,.50,.36),(-.38,.51,.37)];ns=48
for z,rx,ry in rings:
 for j in range(ns):
  a=j/ns*2*math.pi;wv.append((math.cos(a)*rx,math.sin(a)*ry+.04,z))
for i in range(len(rings)-1):
 for j in range(ns):wf.append((i*ns+j,i*ns+(j+1)%ns,(i+1)*ns+(j+1)%ns,(i+1)*ns+j))
wf.append(tuple(reversed(range(ns))));wf.append(tuple((len(rings)-1)*ns+j for j in range(ns)))
wm=bpy.data.meshes.new('Foreleg continuous rings');wm.from_pydata(wv,[],wf);wm.update();wrist=bpy.data.objects.new('Wrist',wm);bpy.context.collection.objects.link(wrist);wm.materials.append(skin)
parts=[wrist,ellipsoid('Forepaw',(0,0,-.02),(.635,.405,.71),skin),ellipsoid('Knuckle transition',(0,-.015,.52),(.665,.36,.43),skin)]
for i,(x,y,z,rx,ry,rz) in enumerate(toes):parts.append(ellipsoid('Digit '+str(i+2),(x,y,z),(rx,ry,rz),skin))
parts.append(ellipsoid('First digit dewclaw',(.665,.055,-.02),(.20,.235,.25),skin))
body=fuse(parts,'Paw — continuous fur-bearing body',.026,8);model.append(body)
# Keep the cropped wrist base quiet and rounded, without a flat paper-like reverse.

pad_specs=[]
for i,(x,y,z,rx,ry,rz) in enumerate(toes):
 spec=(x,y+ry*.91,z-.005,rx*.64,.105,rz*.49);pad_specs.append(spec)
 o=ellipsoid('Digital pad '+str(i+2),spec[:3],spec[3:],padmat,48,28);model.append(o)
dew=(.715,.275,-.025,.105,.075,.135);pad_specs.append(dew);model.append(ellipsoid('First digital pad',dew[:3],dew[3:],padmat))
# Two distal lobes and three proximal lobes of the central feline metacarpal pad.
palm_parts=[ellipsoid('Main pad volume',(0,.405,.16),(.36,.115,.265),padmat)]
for x,z,rx,rz in [(-.17,.335,.19,.15),(.17,.335,.19,.15),(-.265,-.035,.19,.19),(0,-.085,.20,.18),(.265,-.035,.19,.19)]:palm_parts.append(ellipsoid('Pad lobe',(x,.415,z),(rx,.115,rz),padmat))
palm=fuse(palm_parts,'Metacarpal pad',.018,6);model.append(palm)
carpal=(-.12,.365,-.89,.17,.09,.12);pad_specs.append(carpal);model.append(ellipsoid('Carpal wrist pad',carpal[:3],carpal[3:],padmat))
# Fine leather irregularity is actual geometry and exports with the model.
for o in model[1:]:
 for v in o.data.vertices:
  n=v.normal;co=v.co;v.co+=n*(noise_vector(co*91).x*.0018+noise_vector(co*29).y*.0013)
 o.data.update()

# Curved tapered claws, with rounded bases nested inside their fur sheaths.
def claw(name,start,direction=(0,0,1),length=.33,radius=.071):
 start=Vector(start);forward=Vector(direction).normalized();bend=Vector((-math.copysign(.145,start.x),.17,-.085));verts=[];faces=[];rings=22;sides=12
 for i in range(rings+1):
  t=i/rings;center=start+forward*(length*t)+bend*(t*t);tangent=(forward*length+bend*(2*t)).normalized();axis=tangent.cross(Vector((1,0,0))).normalized();cross=tangent.cross(axis).normalized();r=radius*(1-t)**.78+.0007
  for j in range(sides):
   a=j/sides*2*math.pi;point=center+axis*(math.cos(a)*r*.72)+cross*(math.sin(a)*r);verts.append(tuple(point))
  if i<rings:
   for j in range(sides):
    a=i*sides+j;b=i*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(clawmat)
 for p in o.data.polygons:p.use_smooth=True
 model.append(o)
for i,(x,y,z,rx,ry,rz) in enumerate(toes):claw('Claw '+str(i+2),(x,y-.045,z+rz*.82),(.08 if x<0 else -.08,.02,1),.29 if abs(x)>.5 else .33,.058)
claw('Dewclaw',(.775,.055,.11),(.30,.02,.88),.185,.039)

# The coat is modeled throughout, with no photograph projected onto the reverse.
print('Core, five claws and seven pads built',flush=True)
# Groom individual tapered ribbons over the evaluated body surface. Fur is geometry, not a projected photo.
body.data.calc_loop_triangles();triangles=list(body.data.loop_triangles);cdf=[];total=0
for t in triangles:total+=t.area;cdf.append(total)
verts=[];faces=[];mat_ids=[];N=145000
for j in range(N):
 tri=triangles[bisect.bisect_left(cdf,random.random()*total)];vs=[body.data.vertices[k] for k in tri.vertices];r1=math.sqrt(random.random());r2=random.random();weights=(1-r1,r1*(1-r2),r1*r2)
 pos=sum((v.co*w for v,w in zip(vs,weights)),Vector());normal=sum((v.normal*w for v,w in zip(vs,weights)),Vector()).normalized()
 # Expose the pads on the palmar surface; they are separate fleshy structures.
 if pos.y>.22:
  blocked=False
  for x,y,z,rx,ry,rz in pad_specs:
   if ((pos.x-x)/(rx*1.15))**2+((pos.z-z)/(rz*1.15))**2<1 and pos.y>y-.17:blocked=True;break
  if ((pos.x/.48)**2+((pos.z-.13)/.49)**2<1 and pos.y>.25):blocked=True
  if blocked:continue
 flow=Vector((pos.x*(.7 if pos.z>.1 else .4),0,1));flow-=normal*flow.dot(normal)
 if flow.length<.01:flow=normal.cross(Vector((1,0,0)))
 flow.normalize();side=flow.cross(normal).normalized()
 variation=random.uniform(-.32,.32);flow=(flow+side*variation).normalized();side=flow.cross(normal).normalized()
 guard=random.random()<.035;length=random.uniform(.055,.10) if pos.z<.5 else random.uniform(.035,.075)
 if guard:length*=1.45
 width=random.uniform(.0007,.0015)*(1.1 if guard else 1)
 shade=random.choices(range(7),[18,28,27,16,7,3,.45])[0];start=len(verts);steps=4
 for k in range(steps+1):
  t=k/steps;curl=side*(math.sin(t*math.pi)*length*random.uniform(-.05,.05));p=pos+normal*.0015+flow*(length*t)+normal*(length*(.16*t+.22*t*t))+curl;w=width*(1-t)**.7+.00008
  verts.append(tuple(p-side*w));verts.append(tuple(p+side*w))
  if k<steps:
   a=start+k*2;faces.append((a,a+1,a+3,a+2));mat_ids.append(shade)
mesh=bpy.data.meshes.new('Groomed tapered fur strands');mesh.from_pydata(verts,[],faces);mesh.update();hair=bpy.data.objects.new('Groom — individual fur strands',mesh);bpy.context.collection.objects.link(hair)
for m in fur:hair.data.materials.append(m)
for p,mi in zip(hair.data.polygons,mat_ids):p.material_index=mi;p.use_smooth=True
model.append(hair)
print('Fur generated:',len(verts)//10,'strands;',len(faces),'quads',flush=True)
# Export only the physical asset, without cameras or studio geometry.
bpy.ops.object.select_all(action='DESELECT')
for o in model:o.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=str(WEB/'black-cat-paw.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_texcoords=True,export_cameras=False,export_lights=False)
import shutil
shutil.copy2(WEB/'black-cat-paw.glb',OUT/'black-cat-paw.glb')

# Reproducible studio scene for inspecting the actual mesh.
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1400;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.color=(.7,.7,.7);scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.76,.72,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
scene.view_settings.view_transform='AgX'
back=material('Warm white studio',(.76,.74,.69),.8)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-2.055));floor=bpy.context.object;floor.name='Studio ground';floor.data.materials.append(back)
def area(name,loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,.1))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft key',(-3,-4,6),600,4,(1,.93,.83));area('Soft fill',(4,-2,2),270,3,(.83,.9,1));area('Fur rim',(2,3,4),780,3,(1,.96,.89))
bpy.ops.object.camera_add(location=(2.35,-8,2.25));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,-.03))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.35;scene.camera=cam
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'black-cat-paw.blend'))
scene.render.filepath=str(OUT/'three-quarter-render.png');bpy.ops.render.render(write_still=True)
print('Complete',flush=True)
