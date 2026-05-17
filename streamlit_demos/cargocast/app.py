"""
CargoCast — Container Load Estimator
Streamlit demo by Mattia Erigoni

Given a list of packages (dimensions + quantities), estimates how many
standard shipping containers are needed and shows the 2D floor layout.
"""

import streamlit as st
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.cm as cm
import numpy as np
import pandas as pd

from core.models import Package, Container
from core.optimizer import ContainerOptimizerFast

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CargoCast · Container Estimator",
    page_icon="🚢",
    layout="wide",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main { background-color: #07101c; }
    h1, h2, h3 { color: #6aaee8; }
    .metric-card {
        background: #0f1e2e;
        border: 1px solid rgba(106,174,232,0.18);
        border-radius: 12px;
        padding: 1.2rem 1.5rem;
        text-align: center;
    }
    .metric-value { font-size: 2.2rem; font-weight: 700; color: #6aaee8; }
    .metric-label { font-size: 0.8rem; color: rgba(221,230,242,0.5); letter-spacing: 0.1em; text-transform: uppercase; }
</style>
""", unsafe_allow_html=True)

# ── Header ────────────────────────────────────────────────────────────────────
st.title("🚢 CargoCast")
st.markdown(
    "**Pre-shipment container estimator.** Enter your package list and get an instant "
    "count of containers needed with 2D floor layout — before your packing list exists."
)
st.divider()

# ── Sidebar: Container config ─────────────────────────────────────────────────
with st.sidebar:
    st.header("⚙️ Container Settings")
    container_type = st.selectbox(
        "Container type",
        ["40ft Standard", "20ft Standard", "TIR / Truck"],
        index=0
    )
    CONTAINER_DIMS = {
        "40ft Standard": (12036, 2340, 2280),
        "20ft Standard": (5898, 2340, 2280),
        "TIR / Truck":   (13600, 2400, 2700),
    }
    c_len, c_wid, c_hei = CONTAINER_DIMS[container_type]
    st.info(f"**{container_type}**\n\n{c_len/1000:.1f}m × {c_wid/1000:.1f}m × {c_hei/1000:.1f}m")

    st.divider()
    st.markdown("**About CargoCast**")
    st.caption(
        "Built for a healthcare infrastructure company to estimate logistics costs "
        "at the commercial offer stage — before confirmed packing lists. "
        "Powered by a Skyline bin-packing heuristic."
    )
    st.caption("by [Mattia Erigoni](https://mattiaerigoni.com)")

# ── Package input table ───────────────────────────────────────────────────────
st.subheader("📦 Package List")
st.caption("Enter dimensions in **mm** and quantity for each crate/box type.")

# Default example rows
DEFAULT = pd.DataFrame([
    {"Description": "Wall panels crate",      "Length (mm)": 3100, "Width (mm)": 1300, "Height (mm)": 1400, "Qty": 8},
    {"Description": "Door crate",             "Length (mm)": 2200, "Width (mm)":  300, "Height (mm)": 2100, "Qty": 6},
    {"Description": "Steel profiles bundle",  "Length (mm)": 3200, "Width (mm)":  900, "Height (mm)":  900, "Qty": 4},
    {"Description": "Accessories box",        "Length (mm)": 1200, "Width (mm)": 1200, "Height (mm)": 1000, "Qty": 3},
])

edited = st.data_editor(
    DEFAULT,
    num_rows="dynamic",
    use_container_width=True,
    column_config={
        "Description":   st.column_config.TextColumn("Description", width="large"),
        "Length (mm)":   st.column_config.NumberColumn("Length (mm)",  min_value=1, max_value=15000, step=10),
        "Width (mm)":    st.column_config.NumberColumn("Width (mm)",   min_value=1, max_value=3000,  step=10),
        "Height (mm)":   st.column_config.NumberColumn("Height (mm)",  min_value=1, max_value=3000,  step=10),
        "Qty":           st.column_config.NumberColumn("Qty",          min_value=1, max_value=500,   step=1),
    },
    hide_index=True,
)

# ── Run ───────────────────────────────────────────────────────────────────────
run = st.button("🚀 Calculate containers", type="primary", use_container_width=True)

if run:
    # Validate
    if edited.empty or edited["Qty"].sum() == 0:
        st.warning("Add at least one package row.")
        st.stop()

    # Build Package list
    packages = []
    for i, row in edited.iterrows():
        try:
            pkg = Package(
                id=f"pkg_{i}",
                length=int(row["Length (mm)"]),
                width=int(row["Width (mm)"]),
                height=int(row["Height (mm)"]),
                quantity=int(row["Qty"]),
                description=str(row["Description"]),
            )
            packages.append(pkg)
        except Exception:
            st.error(f"Row {i+1} has invalid data — skipped.")

    if not packages:
        st.error("No valid packages to process.")
        st.stop()

    container = Container(length=c_len, width=c_wid, height=c_hei)
    optimizer = ContainerOptimizerFast(container)

    with st.spinner("Running bin-packing optimizer..."):
        result = optimizer.place_packages_multi(packages)

    containers   = result["containers"]
    not_placed   = result["not_placed"]
    total_units  = result["total_units"]
    total_placed = result["total_placed"]

    # ── KPI metrics ──────────────────────────────────────────────────────────
    st.divider()
    st.subheader("📊 Results")

    n_containers = len(containers)
    avg_eff = np.mean([c["efficiency_area"] for c in containers]) * 100 if containers else 0
    not_placed_count = sum(p.quantity for p in not_placed)

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Containers needed", f"{n_containers}", delta=None)
    with col2:
        st.metric("Avg floor efficiency", f"{avg_eff:.1f}%")
    with col3:
        st.metric("Total crates placed", f"{total_placed}")
    with col4:
        if not_placed_count > 0:
            st.metric("⚠️ Not placed", f"{not_placed_count}", delta=f"-{not_placed_count}", delta_color="inverse")
        else:
            st.metric("Not placed", "0 ✅")

    # ── Not placed warning ────────────────────────────────────────────────────
    if not_placed:
        st.warning(
            f"**{not_placed_count} crate(s) could not fit** in any container "
            f"(exceed container dimensions). Check sizes:"
        )
        for p in not_placed:
            st.caption(f"• {p.description} — {p.length}×{p.width}×{p.height}mm × {p.quantity}")

    # ── 2D floor layout per container ─────────────────────────────────────────
    st.divider()
    st.subheader("🗺️ Floor Layout")
    st.caption("Top-down view of each container (length × width). Crates shown to scale.")

    COLORS = cm.get_cmap("tab20", max(len(packages), 1))
    # Map package id → color index
    pkg_color = {pkg.id: i for i, pkg in enumerate(packages)}

    for cidx, cont in enumerate(containers):
        eff_pct = cont["efficiency_area"] * 100
        st.markdown(f"**Container {cidx + 1}** — Floor efficiency: `{eff_pct:.1f}%`")

        fig, ax = plt.subplots(figsize=(14, 3.5))
        fig.patch.set_facecolor("#0b1724")
        ax.set_facecolor("#07101c")

        # Container outline
        ax.add_patch(patches.Rectangle(
            (0, 0), c_len, c_wid,
            linewidth=2, edgecolor="#6aaee8", facecolor="none"
        ))

        # Place each crate
        for placement in cont["placed"]:
            pkg  = placement["package"]
            x, y = placement["x"], placement["y"]
            L, W = placement["length"], placement["width"]
            cidx_color = pkg_color.get(pkg.id, 0)
            color = COLORS(cidx_color)

            rect = patches.Rectangle(
                (x, y), L, W,
                linewidth=0.8,
                edgecolor="white",
                facecolor=(*color[:3], 0.75)
            )
            ax.add_patch(rect)

            # Label inside crate if large enough
            font_size = max(5, min(9, int(min(L, W) / 300)))
            if L > 200 and W > 200:
                label = pkg.description[:22] + ("…" if len(pkg.description) > 22 else "")
                ax.text(
                    x + L / 2, y + W / 2, label,
                    ha="center", va="center",
                    fontsize=font_size, color="white", wrap=True,
                    fontweight="bold"
                )

        ax.set_xlim(-200, c_len + 200)
        ax.set_ylim(-200, c_wid + 200)
        ax.set_aspect("equal")
        ax.set_xlabel("Length (mm)", color="#6aaee8", fontsize=9)
        ax.set_ylabel("Width (mm)",  color="#6aaee8", fontsize=9)
        ax.tick_params(colors="#6aaee8")
        for spine in ax.spines.values():
            spine.set_edgecolor("#6aaee8")

        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

    # ── Detail table ──────────────────────────────────────────────────────────
    st.divider()
    st.subheader("📋 Placement Detail")
    rows = []
    for cont in containers:
        for p in cont["placed"]:
            pkg = p["package"]
            rows.append({
                "Container": cont["container_index"],
                "Description": pkg.description,
                "L×W×H (mm)": f"{p['length']}×{p['width']}×{pkg.height}",
                "Rotated": "↻" if p["rotated"] else "—",
                "X (mm)": p["x"],
                "Y (mm)": p["y"],
            })
    if rows:
        st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
