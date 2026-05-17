from __future__ import annotations

"""
Modulo: core/models.py

Definisce i modelli di dominio usati dal backend:
- Package: collo/cassa con dimensioni in mm e quantità
- Container: contenitore (40'/20'/TIR) con utility di volume/area

Nessuna dipendenza da UI.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Package:
    """Rappresenta un singolo tipo di collo/cassa.
    length/width/height in millimetri, quantity = numero di colli identici.
    crate_id: identificatore del gruppo cassa (usato per merge post-calcolo).
    """
    id: str
    length: int  # mm
    width: int   # mm
    height: int  # mm
    quantity: int
    description: str
    crate_id: Optional[str] = field(default=None, compare=False)

    def volume(self) -> int:
        """Volume in mm^3."""
        return self.length * self.width * self.height

    def footprint_area(self) -> int:
        """Area di impronta a terra (mm^2)."""
        return self.length * self.width


@dataclass
class Container:
    """Rappresenta un container standard."""
    length: int = 12036  # mm
    width: int = 2340    # mm
    height: int = 2280   # mm

    def volume(self) -> int:
        return self.length * self.width * self.height

    def floor_area(self) -> int:
        return self.length * self.width
