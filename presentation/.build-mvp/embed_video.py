"""Preserve the existing native PowerPoint video object in the rebuilt deck."""
from copy import deepcopy
from pathlib import Path
import posixpath
import zipfile
import xml.etree.ElementTree as ET

root = Path('presentation/.build-mvp')
P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PR = 'http://schemas.openxmlformats.org/package/2006/relationships'
CT = 'http://schemas.openxmlformats.org/package/2006/content-types'
P14 = 'http://schemas.microsoft.com/office/powerpoint/2010/main'
for prefix, uri in [('p', P), ('a', A), ('r', R), ('p14', P14)]:
    ET.register_namespace(prefix, uri)
ns = {'p': P, 'a': A}

with zipfile.ZipFile('presentation/ube-farm-client-presentation.pptx') as source, zipfile.ZipFile(root / 'candidate.pptx') as draft:
    entries = {name: draft.read(name) for name in draft.namelist()}
    original = ET.fromstring(source.read('ppt/slides/slide4.xml'))
    movie = next(deepcopy(pic) for pic in original.findall('.//p:pic', ns) if pic.find('.//a:videoFile', ns) is not None)
    original_rels = {r.attrib['Id']: r for r in ET.fromstring(source.read('ppt/slides/_rels/slide4.xml.rels'))}
    slide_path = 'ppt/slides/slide7.xml'
    rels_path = 'ppt/slides/_rels/slide7.xml.rels'
    slide = ET.fromstring(entries[slide_path])
    rels = ET.fromstring(entries[rels_path])
    tree = slide.find('p:cSld/p:spTree', ns)
    ids = [int(element.attrib.get('id', 0)) for element in slide.findall('.//p:cNvPr', ns)]
    movie.find('p:nvPicPr/p:cNvPr', ns).set('id', str(max(ids, default=0) + 1))
    movie.find('p:nvPicPr/p:cNvPr', ns).set('name', 'Existing From Root to Story prototype video')
    click = movie.find('p:nvPicPr/p:cNvPr/a:hlinkClick', ns)
    # The media action needs no hyperlink relationship. Remove the source's
    # empty r:id so package validation can distinguish it from a broken link.
    if click is not None and click.attrib.get('{' + R + '}id') == '':
        del click.attrib['{' + R + '}id']
    used_ids = {element.attrib['Id'] for element in rels}
    mapping = {'rId1': 'rIdRooteVideo', 'rId2': 'rIdRooteMedia', 'rId3': 'rIdRootePoster'}
    assert not used_ids.intersection(mapping.values())
    for element in movie.iter():
        for key, value in list(element.attrib.items()):
            if key.startswith('{' + R + '}') and value in mapping:
                element.set(key, mapping[value])
    for old, new in mapping.items():
        relation = deepcopy(original_rels[old])
        original_path = posixpath.normpath(posixpath.join('ppt/slides', relation.attrib['Target']))
        extension = '.mp4' if old in ('rId1', 'rId2') else '.png'
        new_path = 'ppt/media/roote-prototype' + extension
        entries[new_path] = source.read(original_path)
        relation.set('Id', new)
        relation.set('Target', '../media/roote-prototype' + extension)
        rels.append(relation)
    transform = movie.find('p:spPr/a:xfrm', ns)
    transform.find('a:off', ns).attrib.update(x=str(64 * 9525), y=str(250 * 9525))
    transform.find('a:ext', ns).attrib.update(cx=str(700 * 9525), cy=str(394 * 9525))
    tree.append(movie)
    entries[slide_path] = ET.tostring(slide, encoding='utf-8', xml_declaration=True)
    entries[rels_path] = ET.tostring(rels, encoding='utf-8', xml_declaration=True)
    types = ET.fromstring(entries['[Content_Types].xml'])
    extensions = {e.attrib.get('Extension') for e in types}
    for extension, content_type in [('mp4', 'video/mp4'), ('png', 'image/png')]:
        if extension not in extensions:
            ET.SubElement(types, '{' + CT + '}Default', Extension=extension, ContentType=content_type)
    ET.register_namespace('', CT)
    entries['[Content_Types].xml'] = ET.tostring(types, encoding='utf-8', xml_declaration=True)
    with zipfile.ZipFile(root / 'candidate-with-video.pptx', 'w', zipfile.ZIP_DEFLATED) as out:
        for name, content in entries.items():
            out.writestr(name, content)
print('Preserved native embedded prototype video on slide 7.')
