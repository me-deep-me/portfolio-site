"""
visualization.py

Generazione PNG per visualizzazione layout 2D delle lastre.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from typing import List, Dict
from geometry import LayoutRow
from config import log


def export_png_layouts(rows: List[LayoutRow], prefix: str, W: int, H: int,
                       run_order: List[int], out_dirs: Dict[str, str], dpi: int = 150):
    """
    Genera un PNG per ogni lastra con visualizzazione 2D del layout.
    
    Args:
        rows: Lista di pannelli posizionati
        prefix: Prefisso file output
        W, H: Dimensioni lastra
        run_order: Ordine di lavorazione
        out_dirs: Dizionario con path cartelle output
        dpi: Risoluzione immagini
    """
    sheets = max(r.sheet for r in rows)
    run_pos = {s: i+1 for i, s in enumerate(run_order)}
    png_dir = out_dirs["png"] if out_dirs else "."
    
    log.info(f"🖨️  Layout finale: {sheets} lastre totali")
    log.info("🎨  Generazione PNG in corso…")
    
    for s in range(1, sheets + 1):
        fig_width = W / 100
        fig_height = H / 100
        fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=dpi)
        
        # Setup assi
        ax.set_xlim(0, W)
        ax.set_ylim(0, H)
        ax.invert_yaxis()
        ax.set_aspect("equal")
        ax.axis("off")
        
        # Disegna pannelli
        for r in (r for r in rows if r.sheet == s):
            rect = patches.Rectangle(
                (r.x, r.y), r.width, r.height,
                linewidth=0.5, 
                edgecolor='black', 
                facecolor='lightgray'
            )
            ax.add_patch(rect)
            
            # Label pannello
            label = f"{r.panel_number} - {r.panel_id}\n{int(r.width)}x{int(r.height)}"
            if r.rotated:
                label += " (R)"
            
            scale_factor = min(r.width, r.height) / 180
            fontsize = max(42, scale_factor)
            
            ax.text(
                r.x + r.width/2, 
                r.y + r.height/2, 
                label,
                ha='center', 
                va='center', 
                fontsize=fontsize, 
                color='black',
                bbox=dict(
                    facecolor='white', 
                    edgecolor='none', 
                    boxstyle='round,pad=0.3'
                )
            )
        
        # Nome file
        panel_tags = [f"{r.panel_id}{r.panel_number}" for r in rows if r.sheet == s]
        suffix = "_".join(panel_tags)
        run_prefix = f"RUN{run_pos.get(s, s):03d}_"
        filename = os.path.join(
            png_dir, 
            f"{run_prefix}{os.path.basename(prefix)}_sheet{s:03d}_{suffix}.png"
        )
        
        plt.savefig(filename, dpi=dpi, bbox_inches='tight')
        plt.close()
    
    log.info(f"✅ Generati {sheets} PNG di layout")