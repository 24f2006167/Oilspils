-- Seed Data for Mumbai High Demo Incident (INV-2026-001)

INSERT INTO investigations (id, title, region, status, summary)
VALUES (
    'INV-2026-001',
    'Mumbai High Offshore Slick (Arabian Sea)',
    'MUMBAI OFFSHORE BASIN',
    'INVESTIGATION COMPLETE',
    'Sentinel-1 SAR C-Band sensor detected 12.4 km2 slick. AIS trajectory fusion established MT OCEAN MONARCH as top candidate (87/100).'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vessels (mmsi, imo, name, flag, vessel_type, length_m, deadweight_tonnage)
VALUES 
    ('419001234', '9238471', 'MT OCEAN MONARCH', 'Panama (PA)', 'Crude Oil Tanker', 248.0, 105400.0),
    ('419005678', '9410291', 'MV CORAL STAR', 'Liberia (LR)', 'Bulk Cargo Carrier', 190.0, 57200.0),
    ('419009988', '9187320', 'STAR HORIZON', 'Singapore (SG)', 'Container Ship', 294.0, 68000.0)
ON CONFLICT (mmsi) DO NOTHING;
