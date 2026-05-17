from __future__ import annotations

"""
Modulo: core/optimizer.py

Contiene due algoritmi di piazzamento su più container:
- ContainerOptimizerFast: approccio Skyline/Bottom-Left semplificato con quantity>1
- ContainerOptimizer: approccio Bottom-Left a griglia che espande le quantità in unità

Entrambi restituiscono lo stesso schema dati serializzabile.
"""

import math
from typing import List, Dict, Tuple

from .models import Package, Container


class ContainerOptimizerFast:
    """
    Ottimizzatore veloce (Skyline / Bottom-Left) per il posizionamento dei colli in più container.
    Differenze rispetto a ContainerOptimizer:
      - non esplode ogni collo in unità singole: usa quantity > 1
      - posiziona solo su "frontiera" (skyline) invece che scansionare tutta la griglia
    Risultato: molto più veloce su liste grandi.
    """

    def __init__(self, container: Container):
        self.template = container

    def _fits(self, pkg: Package, x: int, y: int, placed: List[Dict], rotated: bool = False) -> bool:
        """Verifica se un package entra alle coordinate (x,y) senza overlap."""
        L, W = (pkg.width, pkg.length) if rotated else (pkg.length, pkg.width)
        C = self.template
        if x + L > C.length or y + W > C.width or pkg.height > C.height:
            return False
        for p in placed:
            if not (x + L <= p['x'] or p['x'] + p['length'] <= x or
                    y + W <= p['y'] or p['y'] + p['width'] <= y):
                return False
        return True

    def _place_one_container(self, packages: List[Package]) -> Tuple[List[Dict], List[Package]]:
        """Riempie UN container con i pacchi dati, usando un algoritmo skyline semplificato.
        Ritorna: (placed, remaining)
        """
        placed: List[Dict] = []
        remaining: List[Package] = []

        # Ordina i pacchi per area di base decrescente
        packages.sort(key=lambda p: p.footprint_area(), reverse=True)

        # Skyline: lista di punti (x,y) disponibili per nuovi colli
        skyline: List[Tuple[int, int]] = [(0, 0)]

        for pkg in packages:
            qty_left = pkg.quantity
            while qty_left > 0:
                pos_found = None
                rot = False
                # prova tutti i punti dello skyline
                for (sx, sy) in skyline:
                    if self._fits(pkg, sx, sy, placed, rotated=False):
                        pos_found = (sx, sy); rot = False; break
                    if self._fits(pkg, sx, sy, placed, rotated=True):
                        pos_found = (sx, sy); rot = True; break
                if pos_found:
                    x, y = pos_found
                    L, W = (pkg.width, pkg.length) if rot else (pkg.length, pkg.width)
                    placed.append({
                        'package': pkg,
                        'x': x, 'y': y,
                        'length': L, 'width': W,
                        'rotated': rot
                    })
                    qty_left -= 1
                    # aggiorna skyline: aggiungi bordo destro e superiore
                    skyline.append((x + L, y))
                    skyline.append((x, y + W))
                else:
                    break
            if qty_left > 0:
                remaining.append(Package(
                    id=pkg.id, length=pkg.length, width=pkg.width,
                    height=pkg.height, quantity=qty_left, description=pkg.description
                ))
        return placed, remaining

    def place_packages_multi(self, packages: List[Package]) -> Dict:
        """Packing su più container con algoritmo skyline veloce."""
        placeable: List[Package] = []
        not_placeable: List[Package] = []
        for pkg in packages:
            base_ok = (
                (pkg.length <= self.template.length and pkg.width <= self.template.width) or
                (pkg.width <= self.template.length and pkg.length <= self.template.width)
            )
            if pkg.height > self.template.height:
                not_placeable.append(pkg)
            elif base_ok:
                placeable.append(pkg)
            else:
                not_placeable.append(pkg)

        containers: List[Dict] = []
        idx = 1
        remaining = placeable
        while remaining:
            placed, remaining = self._place_one_container(remaining)
            if not placed:
                not_placeable.extend(remaining)
                break
            area_used = sum(p['length'] * p['width'] for p in placed)
            eff_area = area_used / self.template.floor_area()
            containers.append({
                'placed': placed,
                'efficiency_area': eff_area,
                'area_used': area_used,
                'container_index': idx,
                'container': Container(self.template.length, self.template.width, self.template.height)
            })
            idx += 1

        total_units = sum(pkg.quantity for pkg in packages)
        total_placed = sum(len(c['placed']) for c in containers)
        return {
            'containers': containers,
            'not_placed': not_placeable,
            'total_units': total_units,
            'total_placed': total_placed
        }


class ContainerOptimizer:
    """Ottimizza il posizionamento su uno o più container usando un BL a griglia."""

    def __init__(self, container: Container):
        self.template = container
        self.placed_packages: List[Dict] = []  # per container corrente

    # ---------- utility base ----------
    def can_fit(self, package: Package, x: int, y: int, rotated: bool = False) -> bool:
        if rotated:
            length, width = package.width, package.length
        else:
            length, width = package.length, package.width
        C = self.template
        if (x + length > C.length or y + width > C.width or package.height > C.height):
            return False
        for placed in self.placed_packages:
            if self._overlaps(x, y, length, width, placed):
                return False
        return True

    def _overlaps(self, x: int, y: int, length: int, width: int, placed: Dict) -> bool:
        return not (
            x >= placed['x'] + placed['length'] or
            placed['x'] >= x + length or
            y >= placed['y'] + placed['width'] or
            placed['y'] >= y + width
        )

    def _fits_in_empty_container(self, package: Package) -> bool:
        C = self.template
        if package.height > C.height:
            return False
        base_ok = (
            (package.length <= C.length and package.width <= C.width) or
            (package.width <= C.length and package.length <= C.width)
        )
        return base_ok

    # ---------- packing su un container ----------
    def _place_on_single_container(self, units: List[Package], grid_step: int = 100) -> Tuple[List[Dict], List[Package]]:
        self.placed_packages = []
        placed_infos: List[Dict] = []
        remaining = units[:]
        remaining.sort(key=lambda p: p.footprint_area(), reverse=True)
        placed_any = True
        while placed_any:
            placed_any = False
            for y in range(0, self.template.width + 1, grid_step):
                for x in range(0, self.template.length + 1, grid_step):
                    for idx, pkg in enumerate(remaining):
                        best = None
                        best_rot = False
                        if self.can_fit(pkg, x, y, False):
                            best = (x, y); best_rot = False
                        elif self.can_fit(pkg, x, y, True):
                            best = (x, y); best_rot = True
                        if best is not None:
                            lx, ly = best
                            L, W = (pkg.width, pkg.length) if best_rot else (pkg.length, pkg.width)
                            info = {
                                'package': pkg,
                                'x': lx, 'y': ly,
                                'length': L, 'width': W,
                                'rotated': best_rot
                            }
                            self.placed_packages.append(info)
                            placed_infos.append(info)
                            remaining.pop(idx)
                            placed_any = True
                            break
                    if placed_any:
                        break
                if placed_any:
                    break
            if not placed_any and grid_step > 50 and remaining:
                grid_step = 50
                placed_any = True
        return placed_infos, remaining

    # ---------- packing multi-container ----------
    def place_packages_multi(self, packages: List[Package]) -> Dict:
        units: List[Package] = []
        for pkg in packages:
            for _ in range(pkg.quantity):
                units.append(Package(
                    id=pkg.id, length=pkg.length, width=pkg.width,
                    height=pkg.height, quantity=1, description=pkg.description
                ))
        if not units:
            return {'containers': [], 'not_placed': [], 'total_units': 0, 'total_placed': 0}
        placeable: List[Package] = []
        not_placeable: List[Package] = []
        for u in units:
            (placeable if self._fits_in_empty_container(u) else not_placeable).append(u)
        containers: List[Dict] = []
        idx = 1
        remaining = placeable
        while remaining:
            placed_infos, remaining = self._place_on_single_container(remaining, grid_step=100)
            if not placed_infos:
                not_placeable.extend(remaining)
                break
            area_used = sum(p['length'] * p['width'] for p in placed_infos)
            eff_area = area_used / self.template.floor_area()
            containers.append({
                'placed': placed_infos,
                'efficiency_area': eff_area,
                'area_used': area_used,
                'container_index': idx,
                'container': Container(self.template.length, self.template.width, self.template.height)
            })
            idx += 1
        total_placed = sum(len(c['placed']) for c in containers)
        return {
            'containers': containers,
            'not_placed': not_placeable,
            'total_units': len(units),
            'total_placed': total_placed
        }
