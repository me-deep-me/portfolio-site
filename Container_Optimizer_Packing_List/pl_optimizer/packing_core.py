from dataclasses import dataclass
from multiprocessing import Pool, cpu_count
import random
from typing import List, Tuple, Dict, Any


# ---------------------------- Data models ----------------------------

@dataclass
class Container:
    length: int
    width: int
    height: int

    def floor_area(self) -> int:
        return self.length * self.width


@dataclass
class Crate:
    collo: str        # numero collo (stringa per comodità)
    label: str        # testo/tag
    L: int            # mm (lunghezza)
    W: int            # mm (larghezza)
    H: int            # mm (altezza)
    # se True si può appoggiare QUALCOSA sopra questa cassa (max 2 livelli in totale)
    can_stack_top: bool = False


# ---------------------------- Ottimizzatore Avanzato ----------------------------

class AdvancedPacker:
    """
    Packer ottimizzato che combina multiple strategie:
    1. Bottom-Left Fill (BLF) con miglior fit
    2. Stacking intelligente con priorità di compattezza
    3. Rotazione dinamica per massimizzare l'utilizzo
    4. Defragmentazione degli spazi
    """
    def __init__(self, container: Container):
        self.C = container
        self.placed: List[Dict[str, Any]] = []
        self.skyline_points = [(0, 0)]  # punti (x, y) disponibili
        self.bottom_items: List[Dict[str, Any]] = []  # items che possono accettare stacking
        self._remaining: List[Crate] = []

    # ----------------- helper geometrici base -----------------

    def _overlap(self, a: Dict[str, Any], b: Dict[str, Any]) -> bool:
        """Verifica sovrapposizione tra due rettangoli."""
        return not (
            a['x'] + a['length'] <= b['x'] or
            b['x'] + b['length'] <= a['x'] or
            a['y'] + a['width'] <= b['y'] or
            b['y'] + b['width'] <= a['y']
        )

    def _can_place_at(self, x: int, y: int, L: int, W: int) -> bool:
        """Verifica se un rettangolo LxW può essere posizionato a (x,y)."""
        if x + L > self.C.length or y + W > self.C.width:
            return False

        test_rect = {'x': x, 'y': y, 'length': L, 'width': W}
        for placed_item in self.placed:
            if placed_item.get('z', 1) == 1:  # solo items al livello base
                if self._overlap(test_rect, placed_item):
                    return False
        return True

    # ----------------- scoring posizioni -----------------

    def _calculate_waste_penalty(self, x: int, y: int, L: int, W: int) -> float:
        """Calcola la penalità per spazio sprecato."""
        right_space = self.C.length - (x + L)
        top_space = self.C.width - (y + W)
        return right_space * 0.1 + top_space * 0.1

    def _calculate_adjacency_bonus(self, x: int, y: int, L: int, W: int) -> float:
        """Calcola bonus per vicinanza ad altri items."""
        bonus = 0.0
        for item in self.placed:
            if item.get('z', 1) == 1:
                # Bonus per condivisione di lati
                if (item['x'] + item['length'] == x or x + L == item['x']) and \
                   not (y + W <= item['y'] or item['y'] + item['width'] <= y):
                    bonus += 10
                if (item['y'] + item['width'] == y or y + W == item['y']) and \
                   not (x + L <= item['x'] or item['x'] + item['length'] <= x):
                    bonus += 10
        return bonus

    def _calculate_position_score(self, x: int, y: int, L: int, W: int) -> float:
        """Calcola un punteggio per una posizione (più basso = migliore)."""
        score = 0.0

        # Bottom-left preference (pesato forte)
        score += y * 1000 + x * 100

        # Penalità per spazi vuoti creati
        waste_penalty = self._calculate_waste_penalty(x, y, L, W)
        score += waste_penalty * 50

        # Bonus per adiacenza agli items esistenti
        adjacency_bonus = self._calculate_adjacency_bonus(x, y, L, W)
        score -= adjacency_bonus * 200

        # Bonus enorme per riempimenti quasi perfetti in larghezza/altezza
        right_gap = self.C.length - (x + L)
        if 0 <= right_gap <= 50:  # tolleranza 50 mm
            score -= 200000

        top_gap = self.C.width - (y + W)
        if 0 <= top_gap <= 50:
            score -= 200000

        return score

    # ----------------- ricerca posizione migliore -----------------

    def _find_best_position(self, crate: Crate):
        """Trova la migliore posizione per un crate usando Bottom-Left Fill ottimizzato."""
        best_pos = None
        best_score = float('inf')
        best_rotation = False

        # Candidati: skyline + griglia + angoli items esistenti
        candidates = set(self.skyline_points)

        step = min(200, min(crate.L, crate.W) // 2) if min(crate.L, crate.W) > 400 else 100
        for x in range(0, self.C.length, step):
            for y in range(0, self.C.width, step):
                candidates.add((x, y))

        for item in self.placed:
            if item.get('z', 1) == 1:
                candidates.add((item['x'] + item['length'], item['y']))
                candidates.add((item['x'], item['y'] + item['width']))
                candidates.add((item['x'] + item['length'], item['y'] + item['width']))

        for x, y in candidates:
            # senza rotazione
            if self._can_place_at(x, y, crate.L, crate.W):
                score = self._calculate_position_score(x, y, crate.L, crate.W)
                if score < best_score:
                    best_score = score
                    best_pos = (x, y, crate.L, crate.W)
                    best_rotation = False

            # con rotazione
            if self._can_place_at(x, y, crate.W, crate.L):
                score = self._calculate_position_score(x, y, crate.W, crate.L)
                if score < best_score:
                    best_score = score
                    best_pos = (x, y, crate.W, crate.L)
                    best_rotation = True

        return best_pos, best_rotation

    # ----------------- stacking -----------------

    def _find_best_stack_position(self, crate: Crate):
        """Trova la migliore posizione per stacking."""
        best_bottom = None
        best_score = float('inf')
        best_rotation = False

        for bottom_item in self.bottom_items:
            if not bottom_item['crate'].can_stack_top:
                continue

            # Vincoli di altezza
            if crate.H + bottom_item['crate'].H > self.C.height:
                continue

            # senza rotazione
            if crate.L <= bottom_item['length'] and crate.W <= bottom_item['width']:
                waste = (bottom_item['length'] - crate.L) * (bottom_item['width'] - crate.W)
                perfect_bonus = 0
                if waste == 0:
                    perfect_bonus = -1000
                elif waste < 100000:
                    perfect_bonus = -500

                score = waste + perfect_bonus
                if score < best_score:
                    best_score = score
                    best_bottom = bottom_item
                    best_rotation = False

            # con rotazione
            if crate.W <= bottom_item['length'] and crate.L <= bottom_item['width']:
                waste = (bottom_item['length'] - crate.W) * (bottom_item['width'] - crate.L)
                perfect_bonus = 0
                if waste == 0:
                    perfect_bonus = -1000
                elif waste < 100000:
                    perfect_bonus = -500

                score = waste + perfect_bonus
                if score < best_score:
                    best_score = score
                    best_bottom = bottom_item
                    best_rotation = True

        return best_bottom, best_rotation

    # ----------------- aggiornamento skyline -----------------

    def _update_skyline(self, x: int, y: int, L: int, W: int) -> None:
        """Aggiorna i punti skyline dopo il posizionamento."""
        new_points = [
            (x + L, y),
            (x, y + W),
            (x + L, y + W),
        ]

        for point in new_points:
            if (point not in self.skyline_points and
                point[0] <= self.C.length and point[1] <= self.C.width):
                self.skyline_points.append(point)

        valid_points = []
        for px, py in self.skyline_points:
            is_valid = True
            for item in self.placed:
                if (item.get('z', 1) == 1 and
                    item['x'] <= px < item['x'] + item['length'] and
                    item['y'] <= py < item['y'] + item['width']):
                    is_valid = False
                    break
            if is_valid:
                valid_points.append((px, py))

        self.skyline_points = valid_points

    # ----------------- API pubbliche di AdvancedPacker -----------------

    def place_crate(self, crate: Crate) -> bool:
        """Posiziona un crate usando la strategia ottimale (stacking + skyline)."""
        # 1) prova stacking
        bottom_item, rotation = self._find_best_stack_position(crate)

        if bottom_item is not None:
            L_final, W_final = (crate.W, crate.L) if rotation else (crate.L, crate.W)

            placed_item = {
                'crate': crate,
                'x': bottom_item['x'],
                'y': bottom_item['y'],
                'length': L_final,
                'width': W_final,
                'rotated': rotation,
                'z': 2,
                'base_h': bottom_item['crate'].H,
                'stacked_on': bottom_item,
            }

            self.placed.append(placed_item)
            if bottom_item in self.bottom_items:
                self.bottom_items.remove(bottom_item)
            return True

        # 2) altrimenti posiziona a pavimento
        position, rotation = self._find_best_position(crate)
        if position is not None:
            x, y, L_final, W_final = position
            placed_item = {
                'crate': crate,
                'x': x,
                'y': y,
                'length': L_final,
                'width': W_final,
                'rotated': rotation,
                'z': 1,
                'base_h': crate.H,
                'stacked_on': None,
            }
            self.placed.append(placed_item)

            if crate.can_stack_top:
                self.bottom_items.append(placed_item)

            self._update_skyline(x, y, L_final, W_final)
            return True

        return False

    def set_remaining(self, remaining: List[Crate]):
        """Imposta la lista di casse rimanenti (per subset-sum e simili)."""
        self._remaining = list(remaining) if remaining else []

    def _subset_sum_slack_on_width(self, capacity: int, limit: int = 12) -> int:
        """
        Calcola, con DP bitset, il miglior riempimento <= capacity usando come 'pezzi'
        le larghezze possibili delle casse rimanenti (sia W che L come alternative di rotazione).
        Ritorna lo 'slack' (capacità - miglior_somma). 0 = riempimento perfetto.
        """
        if capacity <= 0 or not getattr(self, "_remaining", None):
            return max(capacity, 0)

        widths = []
        for cr in self._remaining[:limit]:
            if cr.W > 0:
                widths.append(int(cr.W))
            if cr.L > 0 and cr.L != cr.W:
                widths.append(int(cr.L))

        possible = 1  # bitset: solo 0 raggiungibile all'inizio
        for w in widths:
            if 0 < w <= capacity:
                possible |= (possible << w)

        best = 0
        for s in range(capacity, -1, -1):
            if (possible >> s) & 1:
                best = s
                break
        return capacity - best


# ---------------------------- Funzioni di packing multi-container ----------------------------

def _finalize_container(container: Dict[str, Any], C: Container) -> None:
    """Calcola statistiche finali del container."""
    area_used = sum(
        p['length'] * p['width'] for p in container['placed']
        if p.get('z', 1) == 1
    )
    container['area_used'] = area_used
    container['eff_area'] = area_used / C.floor_area() if C.floor_area() else 0.0


def _optimized_pack_multi(crates: List[Crate], C: Container) -> List[Dict[str, Any]]:
    """
    Packing ottimizzato multi-container basato su AdvancedPacker (skyline).
    Usa l'ordine dei crates così come viene passato (l'ordinamento
    lo facciamo fuori, nel multi-start).
    """
    items = list(crates)
    containers: List[Dict[str, Any]] = []

    def new_container() -> Dict[str, Any]:
        return {
            'index': None,
            'placed': [],
            'eff_area': 0.0,
            'area_used': 0,
            'container': Container(C.length, C.width, C.height),
            'packer': AdvancedPacker(C),
        }

    current_container = new_container()

    for crate in items:
        # Verifica se il crate può essere posizionato fisicamente nel container
        if (crate.H > C.height or
            (crate.L > C.length and crate.W > C.length) or
            (crate.W > C.width and crate.L > C.width)):
            continue

        if current_container['packer'].place_crate(crate):
            current_container['placed'] = current_container['packer'].placed.copy()
        else:
            if current_container['placed']:
                _finalize_container(current_container, C)
                containers.append(current_container)

            current_container = new_container()
            if current_container['packer'].place_crate(crate):
                current_container['placed'] = current_container['packer'].placed.copy()

    if current_container['placed']:
        _finalize_container(current_container, C)
        containers.append(current_container)

    for i, container in enumerate(containers, 1):
        container['index'] = i

    return containers


def _area_used_of(containers: List[Dict[str, Any]]) -> int:
    area = 0
    for cont in containers:
        for p in cont.get('placed', []):
            if p.get('z', 1) == 1:
                area += p['length'] * p['width']
    return area


def _score_solution(containers: List[Dict[str, Any]], C: Container) -> Tuple[int, float]:
    """
    Restituisce un punteggio per una soluzione di packing.
    Più basso = migliore.

    1) Minimizza il numero di container
    2) A parità, massimizza il riempimento del container peggio riempito
       (quindi -min_eff_area come seconda componente).
    """
    if not containers:
        return (9999, 0.0)

    n = len(containers)
    effs = [c.get('eff_area', 0.0) for c in containers if c.get('eff_area') is not None]
    if not effs:
        return (n, 0.0)
    min_eff = min(effs)
    return (n, -min_eff)


# ---------------------------- Heuristic orders ----------------------------

def _order_by_area(crates: List[Crate], rnd: random.Random) -> List[Crate]:
    return sorted(crates, key=lambda c: c.L * c.W, reverse=True)


def _order_by_length(crates: List[Crate], rnd: random.Random) -> List[Crate]:
    return sorted(crates, key=lambda c: max(c.L, c.W), reverse=True)


def _order_by_width(crates: List[Crate], rnd: random.Random) -> List[Crate]:
    return sorted(crates, key=lambda c: min(c.L, c.W), reverse=True)


def _order_random(crates: List[Crate], rnd: random.Random) -> List[Crate]:
    tmp = crates[:]
    rnd.shuffle(tmp)
    return tmp


HEURISTIC_ORDERS = [
    _order_by_area,
    _order_by_length,
    _order_by_width,
    _order_random,
]


def _try_one_config(args) -> List[Dict[str, Any]]:
    """
    Una singola 'corsa' di packing:
    - cambia l'ordine dei colli con una certa euristica + jitter
    - chiama _optimized_pack_multi (AdvancedPacker / skyline)
    """
    base_ok, C, seed = args
    rnd = random.Random(seed)

    order_fun = HEURISTIC_ORDERS[seed % len(HEURISTIC_ORDERS)]
    items = order_fun(base_ok, rnd)

    SMALL_AREA_TH = (C.length * C.width) * 0.03
    small = [c for c in items if c.L * c.W <= SMALL_AREA_TH]
    big = [c for c in items if c.L * c.W > SMALL_AREA_TH]
    rnd.shuffle(small)
    items = big + small

    containers = _optimized_pack_multi(items, C)
    for i, con in enumerate(containers, 1):
        con['index'] = i
    return containers


# ---------------------------- Packer FAST stile ContainerOptimizerFast ----------------------------

def _fast_place_one_container(crates: List[Crate], C: Container) -> Tuple[List[Dict[str, Any]], List[Crate]]:
    """
    Riempie UN container usando una logica stile ContainerOptimizerFast.
    - skyline = frontiera di punti (x,y) candidati
    - ordina per area di base decrescente
    Ritorna: (placed, remaining)
    """
    placed: List[Dict[str, Any]] = []
    remaining: List[Crate] = []

    crates_sorted = sorted(crates, key=lambda c: c.L * c.W, reverse=True)
    skyline = [(0, 0)]

    def fits(crate: Crate, x: int, y: int, rotated: bool = False) -> bool:
        L = crate.W if rotated else crate.L
        W = crate.L if rotated else crate.W

        if x + L > C.length or y + W > C.width or crate.H > C.height:
            return False

        for p in placed:
            if not (
                x + L <= p['x'] or
                p['x'] + p['length'] <= x or
                y + W <= p['y'] or
                p['y'] + p['width'] <= y
            ):
                return False
        return True

    for crate in crates_sorted:
        best_pos = None
        best_rot = False

        for (sx, sy) in skyline:
            if fits(crate, sx, sy, rotated=False):
                best_pos = (sx, sy)
                best_rot = False
                break
            if fits(crate, sx, sy, rotated=True):
                best_pos = (sx, sy)
                best_rot = True
                break

        if best_pos is not None:
            x, y = best_pos
            L = crate.W if best_rot else crate.L
            W = crate.L if best_rot else crate.W

            placed.append({
                'crate': crate,
                'x': x,
                'y': y,
                'length': L,
                'width': W,
                'rotated': best_rot,
                'z': 1,
                'base_h': crate.H,
                'stacked_on': None,
            })

            skyline.append((x + L, y))
            skyline.append((x, y + W))
        else:
            remaining.append(crate)

    remaining = _stack_on_bottoms_fast(placed, remaining, C)
    return placed, remaining


def _stack_on_bottoms_fast(placed: List[Dict[str, Any]],
                           remaining: List[Crate],
                           C: Container) -> List[Crate]:
    """
    Secondo pass: prova ad impilare alcuni 'remaining' sopra i colli di base
    che accettano stacking (crate.can_stack_top == True).
    """
    if not placed or not remaining:
        return remaining

    bottoms = [
        p for p in placed
        if p.get('z', 1) == 1 and getattr(p['crate'], "can_stack_top", False)
    ]

    if not bottoms:
        return remaining

    has_top = {id(b): False for b in bottoms}
    for p in placed:
        if p.get('z', 1) == 2 and p.get('stacked_on') is not None:
            has_top[id(p['stacked_on'])] = True

    new_remaining: List[Crate] = []

    for crate in remaining:
        placed_on = False

        if crate.H > C.height:
            new_remaining.append(crate)
            continue

        for b in bottoms:
            if has_top[id(b)]:
                continue

            base_cr = b['crate']
            if base_cr.H + crate.H > C.height:
                continue

            base_L = b['length']
            base_W = b['width']

            chosen_rot = None
            if crate.L <= base_L and crate.W <= base_W:
                chosen_rot = False
            elif crate.W <= base_L and crate.L <= base_W:
                chosen_rot = True

            if chosen_rot is None:
                continue

            L_top = crate.W if chosen_rot else crate.L
            W_top = crate.L if chosen_rot else crate.W

            placed.append({
                'crate': crate,
                'x': b['x'],
                'y': b['y'],
                'length': L_top,
                'width': W_top,
                'rotated': chosen_rot,
                'z': 2,
                'base_h': base_cr.H,
                'stacked_on': b,
            })
            has_top[id(b)] = True
            placed_on = True
            break

        if not placed_on:
            new_remaining.append(crate)

    return new_remaining


def pack_into_multiple_containers_fast(crates: List[Crate],
                                       container_template: Container
                                       ) -> Tuple[List[Dict[str, Any]], List[Crate]]:
    """
    Versione semplice multi-container basata sulla logica di ContainerOptimizerFast.
    Ritorna: (containers, not_placed) nello stesso formato che usi già.
    """
    if not crates:
        return [], []

    placeable: List[Crate] = []
    not_placeable: List[Crate] = []

    for c in crates:
        fits_xy = (
            (c.L <= container_template.length and c.W <= container_template.width) or
            (c.W <= container_template.length and c.L <= container_template.width)
        )
        if c.H > container_template.height or not fits_xy:
            not_placeable.append(c)
        else:
            placeable.append(c)

    containers: List[Dict[str, Any]] = []
    remaining = placeable
    idx = 1

    while remaining:
        placed, remaining = _fast_place_one_container(remaining, container_template)
        if not placed:
            not_placeable.extend(remaining)
            break

        area_used = sum(
            p['length'] * p['width']
            for p in placed
            if p.get('z', 1) == 1
        )
        eff_area = area_used / container_template.floor_area() \
            if container_template.floor_area() else 0.0

        containers.append({
            'index': idx,
            'placed': placed,
            'eff_area': eff_area,
            'area_used': area_used,
            'container': Container(
                container_template.length,
                container_template.width,
                container_template.height
            ),
        })
        idx += 1

    return containers, not_placeable


# ---------------------------- Strategia a strati + refine ----------------------------

def _dp_fill_width_with_length_cap(
    candidates: List[Crate],
    width_cap: int,
    length_cap: int
) -> List[Tuple[Crate, bool, int, int]]:
    """
    Sceglie un sottoinsieme di 'candidates' per massimizzare l'uso della larghezza (<= width_cap),
    consentendo al più UNA orientazione per cassa, e imponendo che la sua lunghezza (asse X) sia <= length_cap.

    Ritorna: lista di tuple (crate, use_rotated, L_use, W_use)
    """
    from collections import defaultdict

    opts = []  # (idx, W_use, L_use, rot)
    for i, cr in enumerate(candidates):
        if cr.W <= width_cap and cr.L <= length_cap:
            opts.append((i, int(cr.W), int(cr.L), False))
        if cr.L <= width_cap and cr.W <= length_cap and cr.L != cr.W:
            opts.append((i, int(cr.L), int(cr.W), True))

    if not opts:
        return []

    dp = [None] * (width_cap + 1)
    dp[0] = []

    by_crate = defaultdict(list)
    for idx, W_use, L_use, rot in opts:
        by_crate[idx].append((W_use, L_use, rot))

    for idx, variants in by_crate.items():
        new_dp = dp[:]
        for w in range(width_cap + 1):
            if dp[w] is None:
                continue
            for W_use, L_use, rot in variants:
                nw = w + W_use
                if nw <= width_cap:
                    cand = dp[w] + [(idx, rot, L_use, W_use)]
                    if new_dp[nw] is None or len(cand) > len(new_dp[nw]):
                        new_dp[nw] = cand
        dp = new_dp

    best_w = 0
    for w in range(width_cap, -1, -1):
        if dp[w] is not None:
            best_w = w
            break

    picks = dp[best_w] or []
    selected: List[Tuple[Crate, bool, int, int]] = []
    used = set()
    for idx, rot, L_use, W_use in picks:
        if idx not in used:
            used.add(idx)
            cr = candidates[idx]
            selected.append((cr, rot, L_use, W_use))
    return selected


def _pack_layers_long_first(crates: List[Crate], C: Container,
                            *, allow_refine: bool = True
                            ) -> List[Dict[str, Any]]:
    """
    Strategia a STRATI lungo X.
    """
    remaining = crates[:]
    containers: List[Dict[str, Any]] = []

    def new_container() -> Dict[str, Any]:
        return {
            'index': None,
            'placed': [],
            'eff_area': 0.0,
            'area_used': 0,
            'container': Container(C.length, C.width, C.height),
        }

    cur = new_container()
    cur_x = 0

    def _choose_seed(remaining: List[Crate], x_free: int):
        best = None
        best_len = -1
        best_rot = False
        for cr in remaining:
            if cr.H > C.height:
                continue
            if cr.W <= C.width and cr.L <= x_free and cr.L > best_len:
                best = cr; best_len = cr.L; best_rot = False
            if cr.L <= C.width and cr.W <= x_free and cr.W > best_len:
                best = cr; best_len = cr.W; best_rot = True
        return best, best_rot, best_len

    while remaining:
        remaining = [cr for cr in remaining if cr.H <= C.height]
        if not remaining:
            break

        seed, seed_rot, seed_len = _choose_seed(remaining, C.length - cur_x)
        if seed is None:
            if cur['placed']:
                _finalize_container(cur, C)
                containers.append(cur)
            cur = new_container()
            cur_x = 0
            seed, seed_rot, seed_len = _choose_seed(remaining, C.length - cur_x)
            if seed is None:
                break

        if cur_x + seed_len > C.length:
            if cur['placed']:
                _finalize_container(cur, C)
                containers.append(cur)
            cur = new_container()
            cur_x = 0
            continue

        seed_L = seed.L if not seed_rot else seed.W
        seed_W = seed.W if not seed_rot else seed.L
        if seed_W > C.width:
            remaining.remove(seed)
            continue

        y = 0
        cur['placed'].append({
            'crate': seed,
            'x': cur_x,
            'y': y,
            'length': seed_L,
            'width': seed_W,
            'rotated': seed_rot,
            'z': 1,
            'base_h': seed.H,
            'stacked_on': None,
        })
        y += seed_W
        if seed in remaining:
            remaining.remove(seed)

        width_cap = C.width - y
        if width_cap > 0 and remaining:
            candidates = []
            for cr in remaining:
                if cr.W <= width_cap and cr.L <= seed_L:
                    candidates.append(cr)
                    continue
                if cr.L <= width_cap and cr.W <= seed_L:
                    candidates.append(cr)

            picks = _dp_fill_width_with_length_cap(candidates, width_cap, seed_L)
            for cr, rot, L_use, W_use in picks:
                cur['placed'].append({
                    'crate': cr,
                    'x': cur_x,
                    'y': y,
                    'length': L_use,
                    'width': W_use,
                    'rotated': rot,
                    'z': 1,
                    'base_h': cr.H,
                    'stacked_on': None,
                })
                y += W_use
                if cr in remaining:
                    remaining.remove(cr)

        # GAP-FILL
        slack = C.width - y
        if slack > 0 and remaining:
            def best_fit_variant(cr: Crate, slack_local: int):
                candidates2 = []
                if cr.W <= slack_local and cr.L <= seed_L:
                    candidates2.append((cr, False, cr.L, cr.W))
                if cr.L <= slack_local and cr.W <= seed_L and cr.L != cr.W:
                    candidates2.append((cr, True, cr.W, cr.L))
                if not candidates2:
                    return None
                return max(candidates2, key=lambda t: t[3])

            placed_something = True
            while placed_something and slack > 0:
                placed_something = False
                best_tuple = None
                best_cr = None
                for cr in remaining:
                    cand = best_fit_variant(cr, slack)
                    if cand is None:
                        continue
                    if best_tuple is None or cand[3] > best_tuple[3]:
                        best_tuple = cand
                        best_cr = cr
                if best_tuple is not None:
                    cr, rot, L_use, W_use = best_tuple
                    cur['placed'].append({
                        'crate': cr,
                        'x': cur_x,
                        'y': y,
                        'length': L_use,
                        'width': W_use,
                        'rotated': rot,
                        'z': 1,
                        'base_h': cr.H,
                        'stacked_on': None,
                    })
                    y += W_use
                    slack -= W_use
                    remaining.remove(best_cr)
                    placed_something = True

        cur_x += seed_len
        if cur_x >= C.length - 1:
            _finalize_container(cur, C)
            containers.append(cur)
            if allow_refine:
                containers, remaining = _repack_window_if_better(
                    containers, remaining, C, window=2
                )
            cur = new_container()
            cur_x = 0

    if cur['placed']:
        _finalize_container(cur, C)
        containers.append(cur)
        if allow_refine:
            containers, remaining = _repack_window_if_better(
                containers, remaining, C, window=2
            )

    for i, con in enumerate(containers, 1):
        con['index'] = i
    return containers


def _extract_crates_from_containers(containers: List[Dict[str, Any]]) -> List[Crate]:
    items: List[Crate] = []
    for c in containers:
        for p in c['placed']:
            items.append(p['crate'])
    return items


def _repack_window_if_better(containers: List[Dict[str, Any]],
                             remaining: List[Crate],
                             C: Container,
                             window: int = 2):
    """
    Prende gli ultimi 'window' container, li unisce con qualche rimanente,
    ripacka, e se usa meno container o migliora l'efficienza totale, sostituisce.
    """
    if not containers:
        return containers, remaining

    win = containers[-window:] if len(containers) >= window else containers[:]
    pool = _extract_crates_from_containers(win)[:]

    smalls = sorted(
        [r for r in remaining if max(r.L, r.W) <= max(C.length, C.width) // 2],
        key=lambda c: c.L * c.W
    )
    extra = smalls[:min(6, len(smalls))]
    pool += extra

    repacked = _pack_layers_long_first(pool, C, allow_refine=False)

    old_score = _score_solution(win, C)
    new_score = _score_solution(repacked, C)

    if new_score < old_score:
        base = containers[:-window] if len(containers) >= window else []
        for i, con in enumerate(repacked, 1):
            con['index'] = len(base) + i
        containers[:] = base + repacked

        used_now = _extract_crates_from_containers(repacked)
        to_remove = []
        for r in remaining:
            if any(r is u for u in used_now):
                to_remove.append(r)
        for r in to_remove:
            remaining.remove(r)

    return containers, remaining


# ---------------------------- Multi-start main packer v2 ----------------------------

def pack_into_multiple_containers_v2(crates: List[Crate],
                                     container_template: Container,
                                     N_STARTS: int = None,
                                     PARALLEL: bool = True
                                     ) -> Tuple[List[Dict[str, Any]], List[Crate]]:
    if not crates:
        return [], []

    base_ok: List[Crate] = []
    hard_oversize: List[Crate] = []

    for c in crates:
        fits_xy = (
            (c.L <= container_template.length and c.W <= container_template.width) or
            (c.W <= container_template.length and c.L <= container_template.width)
        )
        if not fits_xy or c.H > container_template.height:
            hard_oversize.append(c)
        else:
            base_ok.append(c)

    if not base_ok:
        return [], hard_oversize

    if N_STARTS is None:
        N_STARTS = max(8, 4 * cpu_count())

    seeds = list(range(N_STARTS))
    args = [(base_ok, container_template, s) for s in seeds]

    if PARALLEL and N_STARTS > 1:
        with Pool(min(cpu_count(), N_STARTS)) as P:
            candidates = P.map(_try_one_config, args)
    else:
        candidates = [_try_one_config(a) for a in args]

    best = min(
        candidates,
        key=lambda cons: _score_solution(cons, container_template)
    )

    if best:
        _refine_last_container(best, container_template, K=6, TRIES=80)

    for i, con in enumerate(best, 1):
        con['index'] = i

    return best, hard_oversize


def _refine_last_container(containers: List[Dict[str, Any]],
                           C: Container,
                           K: int = 4,
                           TRIES: int = 20) -> None:
    """Shakira-mode: libera i K pezzi più grandi dell’ultimo container e prova a reinserirli meglio."""
    if not containers:
        return
    last = containers[-1]
    if not last.get('placed'):
        return

    base = [p for p in last['placed'] if p.get('z', 1) == 1]
    cand = sorted(base, key=lambda p: p['length'] * p['width'], reverse=True)[:K]
    keep = [p for p in last['placed'] if p not in cand]
    freed_crates = [p['crate'] for p in cand]

    best_placed = last['placed']
    best_eff = last.get('eff_area', 0.0)

    for t in range(TRIES):
        rnd = random.Random(t)
        pk = AdvancedPacker(C)
        pk.placed = []
        pk.skyline_points = [(0, 0)]

        for p in keep:
            if p.get('z', 1) != 1:
                continue
            pk.placed.append({
                'crate': p['crate'],
                'x': p['x'],
                'y': p['y'],
                'length': p['length'],
                'width': p['width'],
                'rotated': p.get('rotated', False),
                'z': 1,
                'base_h': p['crate'].H,
                'stacked_on': None,
            })

        for cr in rnd.sample(freed_crates, k=len(freed_crates)):
            pk.place_crate(cr)

        new_placed = pk.placed
        area_used = sum(
            p['length'] * p['width'] for p in new_placed
            if p.get('z', 1) == 1
        )
        eff = area_used / C.floor_area()

        if eff > best_eff:
            best_placed = new_placed
            best_eff = eff

    if best_placed is not last['placed']:
        last['placed'] = best_placed
        _finalize_container(last, C)


# ---------------------------- Shim legacy ----------------------------

def pack_into_multiple_containers(crates: List[Crate],
                                  container_template: Container
                                  ) -> Tuple[List[Dict[str, Any]], List[Crate]]:
    """Shim legacy verso la v2 multi-start."""
    return pack_into_multiple_containers_v2(crates, container_template)
