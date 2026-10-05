"""Blender photographic depth scene. Run with blender --background --python this_file.

The artwork is a 2.5D cutaway: photographic cards at measured contact anchors,
not a simulated growing season or a fully modeled botanical specimen.
"""
import bpy, os, sys, math
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'design', 'assets', 'story')
os.makedirs(os.path.join(OUT, 'frames'), exist_ok=True)
ARGS = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
PROOF = '--proof' in ARGS
PHONE = '--phone' in ARGS
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 720 if PHONE else 1280
scene.render.resolution_y = 960 if PHONE else 720
scene.render.resolution_percentage = 50 if PROOF else 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = False
scene.world.color = (.035, .055, .04)
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.render.fps = 24
scene.frame_start, scene.frame_end = 1, 72

def card(name, filename, x, y, z, width, height):
    bpy.ops.mesh.primitive_plane_add(size=2, location=(x,y,z))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (width/2,height/2,1)
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = bpy.data.images.load(os.path.join(ROOT,filename), check_existing=True)
    texture.interpolation = 'Linear'
    emission = nodes.new('ShaderNodeEmission')
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    mix = nodes.new('ShaderNodeMixShader')
    output = nodes.new('ShaderNodeOutputMaterial')
    links = material.node_tree.links
    links.new(texture.outputs['Color'], emission.inputs['Color'])
    links.new(texture.outputs['Alpha'], mix.inputs[0])
    links.new(transparent.outputs[0], mix.inputs[1])
    links.new(emission.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0],output.inputs[0])
    material.surface_render_method = 'DITHERED'
    obj.data.materials.append(material)
    return obj

landscape = card('Far hills and cultivated landscape','design/assets/origin/landscape.png',0,0,-.35,10.4,13.8667)
soil = card('Underground soil wall','design/assets/origin/soil.png',0,-7.1,0,13.5,7.6)
plant = card('Trellis and attached vine','design/assets/origin/plant.png',0,0,.06,10,13.3333)
# Source crown (70%,14%) aligns to pipe foot (82%,74.6%) in shared world space.
yam = card('Yam and fine roots','design/assets/story/yam-roots.png',2.5,-5.22,.08,4,5.3333)
foreground = card('Near framing foliage','design/assets/origin/foreground.png',0,0,.3,10,13.3333)
cover = card('Soil cutaway cover','design/assets/origin/soil.png',0,-7.1,.16,13.5,7.6)
def rough_top(obj):
    # Geometry, rather than a rectangular image edge, defines the soil surface.
    material = obj.data.materials[0]
    vertices, faces = [], []
    for i in range(41):
        x = -1 + i/20
        wave = .055 * math.sin(i*2.3) + .035 * math.cos(i*1.7)
        vertices.extend([(x,1+wave,0),(x,-1,0)])
        if i: faces.append((2*i-2,2*i-1,2*i+1,2*i))
    mesh = bpy.data.meshes.new(obj.name+' irregular edge')
    mesh.from_pydata(vertices,[],faces); mesh.update()
    uv = mesh.uv_layers.new()
    for polygon in mesh.polygons:
        for index in polygon.loop_indices:
            co = mesh.vertices[mesh.loops[index].vertex_index].co
            uv.data[index].uv = ((co.x+1)/2,(co.y+1)/2)
    obj.data = mesh; mesh.materials.append(material)
rough_top(soil); rough_top(cover)
for frame,y in [(1,-7.1),(25,-7.1),(61,-15.4),(72,-15.4)]:
    cover.location.y = y
    cover.keyframe_insert(data_path='location',frame=frame)

bpy.ops.object.camera_add(location=(0,1.25,9))
camera = bpy.context.object
camera.name = 'Descent camera'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 7.2 if PHONE else 10
camera.rotation_euler = (0,0,0)
scene.camera = camera
for frame,x,y,scale in [(1,1.2 if PHONE else 0,1.25,7.2 if PHONE else 10),(18,1.2 if PHONE else .05,-.05,7.2 if PHONE else 9.9),(43,1.8 if PHONE else .1,-3.35,7.4 if PHONE else 9.7),(65,2.05 if PHONE else .15,-5.5,7.4 if PHONE else 9.5),(72,2.05 if PHONE else .15,-5.5,7.4 if PHONE else 9.5)]:
    camera.location.x, camera.location.y = x,y
    camera.data.ortho_scale = scale
    camera.keyframe_insert(data_path='location',frame=frame)
    camera.data.keyframe_insert(data_path='ortho_scale',frame=frame)

# Small depth-dependent drift; physically connected plant/yam stay together.
for frame,x in [(1,0),(72,-.18)]:
    landscape.location.x = x
    landscape.keyframe_insert(data_path='location',frame=frame)
for frame,x in [(1,0),(72,.22)]:
    foreground.location.x = x
    foreground.keyframe_insert(data_path='location',frame=frame)
scene.frame_set(72)
scene.render.filepath = os.path.join(OUT, 'phone-end.png' if PHONE else 'desktop-end.png')
bpy.ops.file.make_paths_relative()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'harvest-story-phone.blend' if PHONE else 'harvest-story.blend'))
frames = [1,10,20,30,40,50,60,72] if PROOF else range(1,73)
folder = 'proof-phone' if PHONE and PROOF else 'proof' if PROOF else 'frames-phone' if PHONE else 'frames'
os.makedirs(os.path.join(OUT,folder),exist_ok=True)
for frame in frames:
    scene.frame_set(frame)
    scene.render.filepath = os.path.join(OUT,folder,f'{frame-1:03}.png')
    bpy.ops.render.render(write_still=True)
if not PROOF:
    scene.frame_set(72)
    yam.hide_render = True
    scene.render.filepath = os.path.join(OUT,'clean-phone.png' if PHONE else 'clean-desktop.png')
    bpy.ops.render.render(write_still=True)
    yam.hide_render = False
    for obj in [landscape,soil,plant,foreground,cover]: obj.hide_render = True
    scene.render.film_transparent = True
    scene.frame_set(72)
    scene.render.filepath = os.path.join(OUT,'handoff-phone.png' if PHONE else 'handoff.png')
    bpy.ops.render.render(write_still=True)
