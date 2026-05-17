"""
export_3d.py

Export 3D: IFC, GLB, PNG esplosi.
"""

import os
import numpy as np
from typing import List, Dict
from collections import defaultdict

from config import log, MM2M
from geometry import LayoutRow, _ensure_dir


# ============================================================================
# IFC EXPORT
# ============================================================================

def export_ifc_packing(rows, run_order, W, H, crates, out_dirs, prefix,
                       thickness_mm=None, material="hpl"):
    """Esporta IFC 3D gerarchico con casse e pannelli."""
    try:
        import ifcopenshell
    except Exception as e:
        log.warning(f"ifcopenshell non installato: {e}")
        return

    if thickness_mm is None:
        thickness_mm = {"hpl": 12.0, "corian": 12.0, "inox": 2.0, 
                       "corian_grecato": 18.0}.get((material or "hpl").lower(), 12.0)

    if thickness_mm <= 0:
        log.warning("Spessore IFC ≤ 0. Correggo a 1.0 mm.")
        thickness_mm = 1.0

    if_dir = _ensure_dir(os.path.join(out_dirs["root"], "ifc"))
    base = os.path.basename(prefix)
    
    try:
        _export_ifc_with_ifcopenshell(rows, run_order, W, H, crates, if_dir, base, thickness_mm)
    except Exception as e:
        log.error(f"❌ Export IFC fallito: {e}")


def _export_ifc_with_ifcopenshell(rows, run_order, W, H, crates, out_dir, base, t_mm):
    """IFC gerarchico: Site/Building/Storey → CRATE_assembly → LEVEL_assembly → Plates."""
    import ifcopenshell

    def guid():
        return ifcopenshell.guid.new()
    
    def cp3(x=0.0, y=0.0, z=0.0):
        return m.create_entity("IfcCartesianPoint", Coordinates=(float(x), float(y), float(z)))
    
    def dir3(x=1.0, y=0.0, z=0.0):
        return m.create_entity("IfcDirection", DirectionRatios=(float(x), float(y), float(z)))
    
    def axis3(origin=(0,0,0), axis=(0,0,1), refdir=(1,0,0)):
        return m.create_entity("IfcAxis2Placement3D",
                               Location=cp3(*origin), Axis=dir3(*axis), RefDirection=dir3(*refdir))
    
    def lp(relative_to, origin=(0,0,0), x_dir=(1,0,0), z_dir=(0,0,1)):
        return m.create_entity("IfcLocalPlacement",
                               PlacementRelTo=relative_to,
                               RelativePlacement=axis3(origin=origin, axis=z_dir, refdir=x_dir))
    
    def rect_profile(xdim, ydim):
        return m.create_entity(
            "IfcRectangleProfileDef",
            ProfileType="AREA",
            XDim=float(xdim),
            YDim=float(ydim),
            Position=m.create_entity("IfcAxis2Placement2D",
                                     Location=m.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0)))
        )
    
    def extruded(profile, depth_mm):
        return m.create_entity(
            "IfcExtrudedAreaSolid",
            SweptArea=profile,
            Depth=float(depth_mm),
            ExtrudedDirection=dir3(0,0,1),
            Position=axis3()
        )
    
    def make_pset_panelinfo(elem, attrs: dict):
        props = []
        for k, v in attrs.items():
            if isinstance(v, (int, float)):
                val = m.create_entity("IfcReal", v)
                prop = m.create_entity("IfcPropertySingleValue",
                                       Name=str(k), NominalValue=val, Unit=None)
            else:
                prop = m.create_entity("IfcPropertySingleValue",
                                       Name=str(k),
                                       NominalValue=m.create_entity("IfcLabel", str(v)),
                                       Unit=None)
            props.append(prop)
        pset = m.create_entity("IfcPropertySet", GlobalId=guid(), Name="Pset_PanelInfo", HasProperties=props)
        m.create_entity("IfcRelDefinesByProperties", GlobalId=guid(),
                        RelatedObjects=[elem], RelatingPropertyDefinition=pset)

    # IFC base
    m = ifcopenshell.file(schema="IFC4")
    project = m.create_entity("IfcProject", GlobalId=guid(), Name=base)
    si_len_mm = m.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE", Prefix="MILLI")
    units = m.create_entity("IfcUnitAssignment", Units=[si_len_mm])
    project.UnitsInContext = units

    context = m.create_entity("IfcGeometricRepresentationContext",
                              ContextIdentifier="Model", ContextType="Model",
                              CoordinateSpaceDimension=3, Precision=1e-5,
                              WorldCoordinateSystem=axis3(origin=(0,0,0)))

    site = m.create_entity("IfcSite", GlobalId=guid(), Name="Site")
    bldg = m.create_entity("IfcBuilding", GlobalId=guid(), Name="Packing")
    storey = m.create_entity("IfcBuildingStorey", GlobalId=guid(), Name="Level 0", Elevation=0.0)

    m.create_entity("IfcRelAggregates", GlobalId=guid(), RelatingObject=project, RelatedObjects=[site])
    m.create_entity("IfcRelAggregates", GlobalId=guid(), RelatingObject=site, RelatedObjects=[bldg])
    m.create_entity("IfcRelAggregates", GlobalId=guid(), RelatingObject=bldg, RelatedObjects=[storey])

    site.ObjectPlacement = lp(None, origin=(0,0,0))
    bldg.ObjectPlacement = lp(site.ObjectPlacement, origin=(0,0,0))
    storey.ObjectPlacement = lp(bldg.ObjectPlacement, origin=(0,0,0))

    run_pos = {s: i+1 for i, s in enumerate(run_order)} if run_order else {}

    by_sheet = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    offset_x = 0.0
    gap_crates = max(float(W) * 0.2, 200.0)

    all_crate_assemblies = []
    contained = []

    for ci, c in enumerate(crates, start=1):
        crate_asm = m.create_entity(
            "IfcElementAssembly",
            GlobalId=guid(),
            Name=f"CRATE_{ci}",
            AssemblyPlace="FACTORY", PredefinedType="NOTDEFINED"
        )
        crate_asm.ObjectPlacement = lp(storey.ObjectPlacement, origin=(offset_x, 0.0, 0.0))
        contained.append(crate_asm)
        all_crate_assemblies.append(crate_asm)

        level_assemblies = []
        z_local = 0.0
        sep = 5.0
        
        for lvl_idx, s in enumerate(c["sheets"], start=1):
            run = run_pos.get(s, None)
            lvl_name = f"LEVEL_{lvl_idx:02d} (SHEET {int(s)}{' RUN '+str(run) if run else ''})"
            lvl_asm = m.create_entity(
                "IfcElementAssembly",
                GlobalId=guid(),
                Name=lvl_name,
                AssemblyPlace="FACTORY", PredefinedType="NOTDEFINED"
            )
            lvl_asm.ObjectPlacement = lp(crate_asm.ObjectPlacement, origin=(0.0, 0.0, z_local))
            level_assemblies.append(lvl_asm)
            contained.append(lvl_asm)

            for p in by_sheet.get(s, []):
                prof = rect_profile(p.width, p.height)
                solid = extruded(prof, t_mm)
                shape = m.create_entity(
                    "IfcShapeRepresentation",
                    ContextOfItems=context,
                    RepresentationIdentifier="Body",
                    RepresentationType="SweptSolid",
                    Items=[solid]
                )
                pds = m.create_entity("IfcProductDefinitionShape", Representations=[shape])
                elem = m.create_entity(
                    "IfcPlate",
                    GlobalId=guid(),
                    Name=f"{p.panel_id}-{p.panel_number}",
                    Representation=pds
                )
                elem.ObjectPlacement = lp(lvl_asm.ObjectPlacement,
                                          origin=(float(p.x), float(p.y), 0.0))
                contained.append(elem)

                make_pset_panelinfo(elem, {
                    "PanelID": str(p.panel_id),
                    "PanelNumber": str(p.panel_number),
                    "CrateID": int(ci),
                    "LevelIndex": int(lvl_idx),
                    "Sheet": int(s),
                    "RunOrder": int(run) if run is not None else -1,
                    "WidthMM": float(p.width),
                    "HeightMM": float(p.height),
                    "ThicknessMM": float(t_mm),
                    "Rotated": int(1 if p.rotated else 0),
                })

            z_local += (t_mm + sep)

        m.create_entity("IfcRelAggregates", GlobalId=guid(),
                        RelatingObject=crate_asm, RelatedObjects=level_assemblies)

        offset_x += (float(W) + gap_crates)

    m.create_entity("IfcRelContainedInSpatialStructure", GlobalId=guid(),
                    RelatingStructure=storey, RelatedElements=contained)

    path = os.path.join(out_dir, f"{base}_packing.ifc")
    m.write(path)
    log.info(f"IFC export (grouped): {path}")


# ============================================================================
# GLB EXPORT
# ============================================================================

def export_glb_packing(rows, run_order, W, H, crates, out_dirs, prefix,
                       thickness_mm=None, material="hpl",
                       grid_cols=4, crate_gap_mm=700.0, level_gap_mm=100.0,
                       panel_spread_pct=0.08, panel_gap_mm=4.0,
                       micro_lift_mm=0.2, add_cameras=True):
    """Export GLB per Blender con casse in griglia."""
    try:
        import trimesh
        import numpy as np
    except Exception as e:
        log.warning(f"⚠️ GLB non esportato: {e}")
        return

    MM2M_local = 1.0/1000.0
    if thickness_mm is None:
        thickness_mm = {"hpl": 12.0, "corian": 12.0, "inox": 2.0, 
                       "corian_grecato": 18.0}.get((material or "hpl").lower(), 12.0)

    t = float(thickness_mm) * MM2M_local
    lvl_gap = float(level_gap_mm) * MM2M_local
    base_pad = 60.0 * MM2M_local
    gap_crates = float(crate_gap_mm) * MM2M_local
    Wm, Hm = float(W)*MM2M_local, float(H)*MM2M_local
    spread = float(panel_spread_pct)
    grow_xy = float(panel_gap_mm) * MM2M_local
    micro_lift = float(micro_lift_mm) * MM2M_local

    by_sheet = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    # Colori panel_id
    palette = np.array([
        [220,  20,  60], [ 65, 105, 225], [ 46, 139,  87], [255, 215,   0],
        [128,   0, 128], [255, 140,   0], [ 70, 130, 180], [100, 149, 237],
        [210, 105,  30], [ 60, 179, 113]
    ], dtype=np.uint8)
    uniq_ids = sorted({r.panel_id for r in rows}, key=str)
    id2col = {pid: palette[i % len(palette)] for i, pid in enumerate(uniq_ids)}

    scene = trimesh.Scene()

    def T(tx=0.0, ty=0.0, tz=0.0):
        M = np.eye(4, dtype=float)
        M[0,3], M[1,3], M[2,3] = float(tx), float(ty), float(tz)
        return M

    def make_base(wm, hm, pad):
        bw, bh, bz = wm + 2*pad, hm + 2*pad, 0.004
        base = trimesh.creation.box([bw, bh, bz])
        base.visual.vertex_colors = np.tile([220,220,220,255], (base.vertices.shape[0], 1))
        return base, bz

    ncr = max(1, len(crates))
    cols = max(1, int(grid_cols))
    z_sep_level = t + lvl_gap

    for i, c in enumerate(crates):
        r_idx, c_idx = divmod(i, cols)
        cx = c_idx * (Wm + gap_crates)
        cy = r_idx * (Hm + gap_crates)

        crate_node = f"Crate_{int(c['crate_id'])}"
        scene.graph.update(frame_to=crate_node, matrix=T(cx, cy, 0.0), geometry=None)

        base, bz = make_base(Wm, Hm, base_pad)
        scene.add_geometry(base, node_name=f"{crate_node}_PLANE")
        scene.graph.update(
            frame_to=f"{crate_node}_PLANE",
            frame_from=crate_node,
            matrix=T(Wm/2.0, Hm/2.0, -(bz/2.0 + micro_lift))
        )

        cx_lvl, cy_lvl = Wm/2.0, Hm/2.0
        z = 0.0
        
        for lvl_idx, s in enumerate(c["sheets"], start=1):
            lvl_node = f"{crate_node}/Level_{lvl_idx:02d}"
            scene.graph.update(frame_to=lvl_node, frame_from=crate_node, matrix=T(0, 0, z), geometry=None)

            for p in by_sheet.get(s, []):
                ex = float(p.width) * MM2M_local + grow_xy
                ey = float(p.height) * MM2M_local + grow_xy

                cxp_nom = (float(p.x) + float(p.width)/2.0) * MM2M_local
                cyp_nom = (float(p.y) + float(p.height)/2.0) * MM2M_local
                dx, dy = (cxp_nom - cx_lvl), (cyp_nom - cy_lvl)
                cxp = cx_lvl + dx*(1.0 + spread)
                cyp = cy_lvl + dy*(1.0 + spread)

                box = trimesh.creation.box([ex, ey, t])
                col = id2col.get(p.panel_id, np.array([200,200,200], dtype=np.uint8))
                box.visual.vertex_colors = np.tile(np.append(col, 255), (box.vertices.shape[0], 1))

                gname = f"{p.panel_id}-{p.panel_number}"
                scene.add_geometry(box, node_name=gname)
                scene.graph.update(frame_to=gname, frame_from=lvl_node, matrix=T(cxp, cyp, t/2.0))

            z += z_sep_level

    # Centra scena
    try:
        center = scene.bounding_box_oriented.centroid
        if np.isfinite(center).all():
            scene.graph.shift(-center)
    except Exception:
        pass

    # Camere
    if add_cameras:
        try:
            from trimesh.scene.cameras import Camera
            bounds = scene.bounds
            extent = np.max(bounds[1] - bounds[0])
            dist = 2.2*extent if np.isfinite(extent) and extent > 0 else 5.0
            cam_iso = Camera(fov=(50, 50), resolution=(1600, 1200))
            cam_top = Camera(fov=(50, 50), resolution=(1600, 1200))
            scene.graph.update(frame_to="Camera_Isometric", matrix=T(dist, dist, dist), geometry=cam_iso)
            scene.graph.update(frame_to="Camera_Top", matrix=T(0, 0, dist), geometry=cam_top)
        except Exception:
            pass

    glb_dir = os.path.join(out_dirs["root"], "glb") if out_dirs else "."
    os.makedirs(glb_dir, exist_ok=True)
    base_name = os.path.basename(prefix)
    glb_path = os.path.join(glb_dir, f"{base_name}_packing.glb")
    
    try:
        scene.export(glb_path)
        log.info(f"🎥 3D viewer salvato (GLB): {glb_path}")
    except Exception as e:
        log.error(f"❌ Export GLB fallito: {e}")


# ============================================================================
# PNG EXPLODED 3D
# ============================================================================

def export_png_exploded_3d_min(rows, crates, W, H, out_dirs, prefix, thickness_mm,
                                explode_gap_z=100.0, sep_in_stack=5.0, level_offset_xy=80.0,
                                edge_alpha=0.45, face_alpha=0.92, line_w=0.5,
                                draw_sheet_frame=True, draw_crate_bbox=False, draw_shadows=True,
                                draw_level_labels=True, draw_connectors=True,
                                dpi=300, zoom=1.30, margin_px=15):
    """Export PNG 3D esplosi con miglioramenti grafici."""
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    by_sheet = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    # Palette colori
    rng = np.random.default_rng(42)
    uniq_ids = sorted({r.panel_id for r in rows}, key=str)
    
    base_palette = np.array([
        [231,  76,  60], [  52, 152, 219], [  46, 204, 113], [241, 196,  15],
        [155,  89, 182], [230, 126,  34], [  26, 188, 156], [ 52,  73,  94],
        [192,  57,  43], [  41, 128, 185], [ 39, 174,  96], [243, 156,  18],
        [142,  68, 173], [211,  84,   0], [  22, 160, 133], [ 44,  62,  80],
    ], dtype=float) / 255.0
    
    if len(base_palette) < len(uniq_ids):
        extra = rng.random((len(uniq_ids)-len(base_palette), 3))*0.6 + 0.25
        base_palette = np.vstack([base_palette, extra])
    id2col = {pid: base_palette[i] for i, pid in enumerate(uniq_ids)}

    def _box_faces(x0, y0, z0, dx, dy, dz):
        x1, y1, z1 = x0+dx, y0+dy, z0+dz
        v = np.array([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],
                      [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]])
        return [
            [v[0],v[1],v[2],v[3]],  # bottom
            [v[4],v[5],v[6],v[7]],  # top
            [v[0],v[1],v[5],v[4]],  # front
            [v[1],v[2],v[6],v[5]],  # right
            [v[2],v[3],v[7],v[6]],  # back
            [v[3],v[0],v[4],v[7]],  # left
        ]

    def _shadow_polygon(x0, y0, ex, ey, z_base, shadow_offset=2.0):
        offset = shadow_offset
        return np.array([
            [x0-offset, y0-offset, z_base],
            [x0+ex+offset, y0-offset, z_base],
            [x0+ex+offset, y0+ey+offset, z_base],
            [x0-offset, y0+ey+offset, z_base]
        ])

    def _axes_equal_3d(ax):
        ext = np.array([ax.get_xlim3d(), ax.get_ylim3d(), ax.get_zlim3d()], float)
        sz = ext[:,1]-ext[:,0]
        c = ext.mean(axis=1)
        r = 0.5*max(sz)
        ax.set_xlim3d(c[0]-r, c[0]+r)
        ax.set_ylim3d(c[1]-r, c[1]+r)
        ax.set_zlim3d(c[2]-r, c[2]+r)

    def _apply_view(ax, name, zoom=1.0):
        views = {"iso": (25, -45), "top": (90, -90), "front": (0, -90), "side": (0, 0)}
        elev, azim = views.get(name, (25, -45))
        ax.view_init(elev=elev, azim=azim)
        try:
            ax.dist = max(2.0, 10.0 / max(zoom, 0.1))
        except Exception:
            pass

    def _setup_ax_style(ax, show_grid=False):
        ax.set_axis_off()
        if show_grid:
            ax.grid(True, linestyle='--', alpha=0.15, linewidth=0.5)
        ax.xaxis.pane.fill = False
        ax.yaxis.pane.fill = False
        ax.zaxis.pane.fill = False
        ax.xaxis.pane.set_edgecolor('none')
        ax.yaxis.pane.set_edgecolor('none')
        ax.zaxis.pane.set_edgecolor('none')

    png_dir = out_dirs["png"] if out_dirs else "."
    exp_dir = os.path.join(png_dir, "exploded3d")
    os.makedirs(exp_dir, exist_ok=True)
    base_name = os.path.basename(prefix)

    def _draw_crate(ax, crate, show_labels=True, level_offset_xy_override=None,
                    explode_gap_override=None, shadows=True):
        z_stack = 0.0
        minx, miny, minz = 1e9, 1e9, 0.0
        maxx, maxy, maxz = -1e9, -1e9, 0.0
        level_centers = []
        
        _lvl_off = level_offset_xy if level_offset_xy_override is None else level_offset_xy_override
        _gap_z = explode_gap_z if explode_gap_override is None else explode_gap_override

        for lvl_idx, s in enumerate(crate["sheets"], start=1):
            z_placement = z_stack + (lvl_idx-1)*_gap_z
            offx = (lvl_idx-1)*_lvl_off
            offy = (lvl_idx-1)*_lvl_off

            if draw_sheet_frame:
                xs = [offx, offx+W, offx+W, offx, offx]
                ys = [offy, offy, offy+H, offy+H, offy]
                zs = [z_placement]*5
                ax.plot(xs, ys, zs, color=(0.2,0.2,0.2,0.5), lw=1.0, linestyle='--')

            level_centers.append((offx + W/2, offy + H/2, z_placement))

            for p in by_sheet.get(s, []):
                ex, ey, ez = float(p.width), float(p.height), float(thickness_mm)
                x0 = offx + float(p.x)
                y0 = offy + float(p.y)
                z0 = z_placement

                if draw_shadows and shadows:
                    shadow = _shadow_polygon(x0, y0, ex, ey, z0 - 0.5)
                    shadow_poly = Poly3DCollection([shadow],
                                                  facecolors=(0, 0, 0, 0.15),
                                                  edgecolors='none',
                                                  linewidths=0)
                    ax.add_collection3d(shadow_poly)

                faces = _box_faces(x0, y0, z0, ex, ey, ez)
                col = id2col.get(p.panel_id, (0.7,0.7,0.7))
                
                face_colors = [
                    (*col, face_alpha * 0.6),  # bottom
                    (*col, face_alpha),        # top
                    (*col, face_alpha * 0.85), # front
                    (*col, face_alpha * 0.75), # right
                    (*col, face_alpha * 0.80), # back
                    (*col, face_alpha * 0.70), # left
                ]
                
                for i, face in enumerate(faces):
                    poly = Poly3DCollection([face],
                                          facecolors=face_colors[i],
                                          edgecolors=(0.1, 0.1, 0.1, edge_alpha),
                                          linewidths=line_w)
                    ax.add_collection3d(poly)

                minx = min(minx, x0)
                miny = min(miny, y0)
                maxx = max(maxx, x0+ex)
                maxy = max(maxy, y0+ey)
                maxz = max(maxz, z0+ez)

            if draw_level_labels and show_labels:
                label_x = offx + W + 50
                label_y = offy + H/2
                label_z = z_placement + thickness_mm/2
                label_text = f"Level {lvl_idx}\nSheet {s}"
                ax.text(label_x, label_y, label_z, label_text,
                       fontsize=8, ha='left', va='center',
                       bbox=dict(boxstyle='round,pad=0.5', 
                                facecolor='white', 
                                edgecolor='gray',
                                alpha=0.85))

            z_stack += (thickness_mm + sep_in_stack)

        if draw_connectors and len(level_centers) > 1:
            for i in range(len(level_centers)-1):
                x0, y0, z0 = level_centers[i]
                x1, y1, z1 = level_centers[i+1]
                ax.plot([x0, x1], [y0, y1], [z0, z1],
                       color=(0.4, 0.4, 0.4, 0.3),
                       linestyle=':',
                       linewidth=1.2)

        margin = 40
        ax.set_xlim(minx-margin, maxx+margin)
        ax.set_ylim(miny-margin, maxy+margin)
        ax.set_zlim(-10, maxz + (len(crate["sheets"])-1)*explode_gap_z + 60)
        _axes_equal_3d(ax)
        _setup_ax_style(ax)

    # Overview ISO
    n = max(1, len(crates))
    fig = plt.figure(figsize=(12, 7*n), dpi=dpi, facecolor='white')
    fig.suptitle(f"Panel Packing - 3D Exploded View", 
                fontsize=16, fontweight='bold', y=0.995)
    
    for i, c in enumerate(crates, start=1):
        ax = fig.add_subplot(n, 1, i, projection='3d')
        _draw_crate(ax, c, show_labels=True)
        _apply_view(ax, "iso", zoom=zoom)
        
        n_sheets = len(c["sheets"])
        n_panels = sum(len(by_sheet.get(s, [])) for s in c["sheets"])
        title = (f"Crate {int(c['crate_id'])} - "
                f"{n_sheets} Level{'s' if n_sheets>1 else ''} - "
                f"{n_panels} Panel{'s' if n_panels>1 else ''}")
        ax.set_title(title, fontsize=11, pad=10, fontweight='semibold')
    
    ov_path = os.path.join(exp_dir, f"{base_name}_ALL_CRATES_EXPLODED3D_ISO.png")
    plt.savefig(ov_path, dpi=dpi, bbox_inches='tight', facecolor='white', 
               edgecolor='none', pad_inches=0.3)
    plt.close(fig)
    log.info(f"📸 PNG esploso 3D – overview: {ov_path}")

    # Per cassa: tavola 2×2
    for c in crates:
        cid = int(c["crate_id"])
        n_sheets = len(c["sheets"])
        n_panels = sum(len(by_sheet.get(s, [])) for s in c["sheets"])
        
        fig = plt.figure(figsize=(14, 12), dpi=dpi, facecolor='white')
        fig.suptitle(f"Crate {cid} - Multi-View Analysis ({n_sheets} levels, {n_panels} panels)", 
                    fontsize=14, fontweight='bold', y=0.98)
        
        views = [
            ("iso",   "Isometric View"),
            ("top",   "Top View"),
            ("front", "Front View"),
            ("side",  "Side View"),
        ]

        for i, (view_name, view_title) in enumerate(views, start=1):
            ax = fig.add_subplot(2, 2, i, projection='3d')

            if view_name == "iso":
                lvl_off = level_offset_xy
                gap_z = explode_gap_z
                use_shadows = True
                view_zoom = zoom
            elif view_name == "top":
                lvl_off = level_offset_xy
                gap_z = max(thickness_mm + sep_in_stack, explode_gap_z * 0.2)
                use_shadows = False
                view_zoom = zoom * 1.35
            else:
                lvl_off = 0.0
                gap_z = explode_gap_z * 1.35
                use_shadows = False
                view_zoom = zoom

            _draw_crate(ax, c,
                        show_labels=False,
                        level_offset_xy_override=lvl_off,
                        explode_gap_override=gap_z,
                        shadows=use_shadows)
            _apply_view(ax, view_name, zoom=view_zoom)
            ax.set_title(view_title, fontsize=11, pad=8, fontweight='semibold')

        # Legenda colori
        crate_ids = set()
        for s in c["sheets"]:
            for p in by_sheet.get(s, []):
                crate_ids.add(p.panel_id)
        
        if len(crate_ids) <= 10:
            legend_elements = [
                mpatches.Patch(facecolor=id2col.get(pid, (0.7,0.7,0.7)), 
                             edgecolor='black', 
                             label=f'ID: {pid}')
                for pid in sorted(crate_ids, key=str)
            ]
            fig.legend(handles=legend_elements, 
                      loc='lower center', 
                      ncol=min(5, len(legend_elements)),
                      fontsize=9,
                      framealpha=0.9,
                      bbox_to_anchor=(0.5, -0.02))
        
        grid_path = os.path.join(exp_dir, f"{base_name}_CRATE_{cid:02d}_EXPLODED3D_GRID.png")
        plt.savefig(grid_path, dpi=dpi, bbox_inches='tight', facecolor='white',
                   edgecolor='none', pad_inches=0.3)
        plt.close(fig)
        log.info(f"📸 PNG esploso 3D – Crate {cid:02d} (4 viste): {grid_path}")


# ============================================================================
# IFC CRATES (alternativo)
# ============================================================================

def export_ifc_crates(rows: List[LayoutRow], run_order: List[int],
                      W: float, H: float, crates: List[dict],
                      thickness_mm: float, out_dirs: Dict[str, str], prefix: str):
    """
    Crea un IFC con una cassa per gruppo, e tutti i pannelli impilati a livelli.
    - Unità base IFC: metri (convertiamo mm -> m).
    - Ogni pannello = IfcBuildingElementProxy con solido estruso.
    - I livelli sono distanziati di 20 mm.
    """
    try:
        import ifcopenshell
        import ifcopenshell.api as ifcapi
    except Exception as e:
        log.warning("⚠️ ifcopenshell non installato. Salto export IFC.")
        return

    mm = 1.0
    m = 1.0/1000.0
    level_gap_mm = 20.0

    # IFC base model
    model = ifcopenshell.file()

    # Project/Site/Building/Storey
    project = ifcapi.run("root.create_entity", model, ifc_class="IfcProject", name="Nesting Project")
    context = ifcapi.run("unit.assign_unit", model, length={"is_metric": True, "raw": "MILLIMETRE"})
    ifcapi.run("context.add_context", model, context=project)

    site = ifcapi.run("root.create_entity", model, ifc_class="IfcSite", name="Site")
    building = ifcapi.run("root.create_entity", model, ifc_class="IfcBuilding", name="Building")
    storey = ifcapi.run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="Ground")

    ifcapi.run("aggregate.assign_object", model, relating_object=project, product=site)
    ifcapi.run("aggregate.assign_object", model, relating_object=site, product=building)
    ifcapi.run("aggregate.assign_object", model, relating_object=building, product=storey)

    # Mappa: sheet -> lista pannelli
    by_sheet: Dict[int, List[LayoutRow]] = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    # Disposizione casse lungo X
    offset_x_mm = 0.0
    gap_crates_mm = 200.0

    # Material
    mat = ifcapi.run("material.add_material", model, name="PanelMaterial")

    for c in crates:
        crate_id = int(c["crate_id"])
        sheets = list(c["sheets"])
        
        # Nodo di aggregazione per la cassa
        crate_assembly = ifcapi.run("root.create_entity", model, ifc_class="IfcElementAssembly",
                                    name=f"Crate_{crate_id}")
        ifcapi.run("aggregate.assign_object", model, relating_object=storey, product=crate_assembly)

        # Per ogni livello (sheet) dentro la cassa
        for lvl_idx, s in enumerate(sheets):
            level_z_mm = lvl_idx * level_gap_mm

            # Pannelli su questo sheet
            from geometry import sort_parts_within_sheet
            parts = sort_parts_within_sheet(by_sheet.get(s, []))
            
            for p in parts:
                # Geometria: rettangolo estruso
                prof = ifcapi.run(
                    "geometry.add_profile_representation", model,
                    context=project,
                    profile={"type": "RECTANGLE", "xdim": p.width * m, "ydim": p.height * m}
                )
                body = ifcapi.run(
                    "geometry.add_extruded_area_solid", model,
                    profile=prof,
                    depth=thickness_mm * m,
                    extrude_direction=(0.0, 0.0, 1.0)
                )
                shape = ifcapi.run(
                    "geometry.add_shape", model,
                    context=project,
                    shape=body
                )

                elem = ifcapi.run("root.create_entity", model, ifc_class="IfcBuildingElementProxy",
                                  name=f"{p.panel_id}-{p.panel_number}")
                ifcapi.run("geometry.assign_representation", model, product=elem, representation=shape)
                ifcapi.run("material.assign_material", model, product=elem, type="IfcMaterial", material=mat)

                # Posizione
                ox = (offset_x_mm + p.x) * m
                oy = (p.y) * m
                oz = (level_z_mm) * m

                ifcapi.run("geometry.edit_object_placement", model, product=elem,
                           matrix=((1,0,0,ox),(0,1,0,oy),(0,0,1,oz),(0,0,0,1)))

                # Aggancia alla cassa
                ifcapi.run("aggregate.assign_object", model, relating_object=crate_assembly, product=elem)

        # Sposta offset per prossima cassa
        offset_x_mm += (W + gap_crates_mm)

    # Salvataggio
    out_dir = out_dirs["root"] if out_dirs else "."
    base = os.path.basename(prefix)
    ifc_path = os.path.join(out_dir, f"{base}_crates.ifc")
    model.write(ifc_path)
    print(f"🧱 IFC esportato: {ifc_path}")


# ============================================================================
# DXF 3D FALLBACK
# ============================================================================

def _export_dxf3d_fallback(rows, run_order, W, H, crates, out_dir, base, t_mm):
    """
    Crea un DXF 3D con un box per pannello alla quota del proprio livello cassa.
    Nota: ezdxf richiede i 4 vertici come LISTA per add_3dface.
    """
    import ezdxf
    from collections import defaultdict

    # raggruppo pannelli per foglio
    by_sheet = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    # impilamento: livello n => z = n*(t_mm+5)
    sep = 5.0

    for ci, c in enumerate(crates, start=1):
        doc = ezdxf.new(setup=True)
        doc.header["$INSUNITS"] = 4  # mm
        msp = doc.modelspace()

        z = 0.0
        for lvl, s in enumerate(c["sheets"], start=1):
            for p in by_sheet.get(s, []):
                x0, y0 = float(p.x), float(p.y)
                x1, y1 = x0 + float(p.width), y0 + float(p.height)

                # 8 vertici del parallelepipedo (base ABCD, top EFGH)
                A = (x0, y0, z)
                B = (x1, y0, z)
                C = (x1, y1, z)
                D = (x0, y1, z)
                E = (x0, y0, z + t_mm)
                F = (x1, y0, z + t_mm)
                G = (x1, y1, z + t_mm)
                H = (x0, y1, z + t_mm)

                # 6 facce (quad) del box, in senso orario:
                msp.add_3dface([A, B, C, D])  # base
                msp.add_3dface([E, F, G, H])  # top
                msp.add_3dface([A, B, F, E])  # lato 1
                msp.add_3dface([B, C, G, F])  # lato 2
                msp.add_3dface([C, D, H, G])  # lato 3
                msp.add_3dface([D, A, E, H])  # lato 4

            z += (t_mm + sep)

        name = os.path.join(out_dir, f"{base}_crate{ci:02d}_3d.dxf")
        try:
            doc.saveas(name)
            log.info(f"DXF 3D crate {ci}: {name}")
        except Exception as e:
            log.error(f"❌ Salvataggio DXF 3D cassa {ci} fallito: {e}")