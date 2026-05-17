# -*- mode: python ; coding: utf-8 -*-
# AENEST.spec — onedir build (fast startup, no temp-extraction overhead)

import os

ROOT = os.path.dirname(os.path.abspath(SPEC))
ICO  = os.path.join(ROOT, 'print_cubes_scheme_modular_color_edit_products_miscellaneous_icon_251257.ico')

a = Analysis(
    ['main.py'],
    pathex=[ROOT],
    binaries=[],
    datas=[
        (ICO, '.'),
    ],
    hiddenimports=[
        # moduli locali importati dinamicamente dentro funzioni
        'gui', 'config', 'data_io', 'packing', 'ordering',
        'geometry', 'crate_packing', 'export_xlsx', 'export_dxf',
        'export_3d', 'visualization',
        # librerie di terze parti
        'rectpack', 'rectpack.guillotine', 'rectpack.maxrects',
        'rectpack.skyline', 'rectpack.waste',
        'pandas', 'pandas._libs.tslibs.np_datetime',
        'pandas._libs.tslibs.nattype', 'pandas._libs.tslibs.timedeltas',
        'openpyxl', 'openpyxl.styles', 'openpyxl.utils',
        'xlsxwriter',
        'ezdxf', 'ezdxf.addons',
        'matplotlib', 'matplotlib.backends.backend_agg',
        'matplotlib.backends.backend_pdf',
        'numpy',
        'PIL', 'PIL.Image', 'PIL.ImageDraw',
        'tkinter', 'tkinter.ttk', 'tkinter.filedialog',
        'tkinter.messagebox', 'tkinter.simpledialog',
        'tkinterdnd2',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'IPython', 'jupyter', 'notebook', 'scipy',
        'sklearn', 'tensorflow', 'torch',
        'tkinter.test', 'test',
        'matplotlib.tests', 'numpy.testing',
        'xmlrpc', 'ftplib', 'imaplib', 'smtplib',
    ],
    noarchive=False,
    optimize=1,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],                  # ← vuoto: i binaries vanno in COLLECT (onedir)
    exclude_binaries=True,
    name='AENEST',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,           # UPX rallenta lo startup; disabilitato
    console=False,       # nessuna finestra terminale
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=ICO,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='AENEST',
)
