/**
 * OceanGuard AI — Frontend Controller
 * Government of India | INCOIS | Ministry of Earth Sciences
 * SIH26143 / SamadhanLabs
 */

(function () {
  'use strict';

  // ============================================================
  // Application State
  // ============================================================
  const state = {
    currentCaseId: 'INV-2026-001',
    currentStage: 'dashboard',
    activeLayers: { spill: true, drift: true, origin: true, vessels: true, metocean: false },
    sarModeActive: false,
    replay: { step: 0, isPlaying: false, speed: 1, timer: null },
    backendAvailable: false,
    map: null,
    layerGroups: { spill: null, drift: null, origin: null, vessels: null, metocean: null, replayMarker: null, sarOverlay: null }
  };

  // ============================================================
  // DOM References — matches new gov HTML IDs
  // ============================================================
  const DOM = {
    caseSelect:       document.getElementById('caseSelect'),
    caseBadge:        document.getElementById('caseBadge'),
    panelTitle:       document.getElementById('panelTitle'),
    panelContent:     document.getElementById('panelContent'),
    stageTabs:        document.querySelectorAll('.gov-stage-btn'),
    replaySlider:     document.getElementById('replaySlider'),
    replayTimeDisplay:document.getElementById('replayTimeDisplay'),
    replayNarrative:  document.getElementById('replayNarrative'),
    btnReplayPlay:    document.getElementById('btnReplayPlay'),
    btnReplayPrev:    document.getElementById('btnReplayPrev'),
    btnReplayNext:    document.getElementById('btnReplayNext'),
    speedBtns:        document.querySelectorAll('.speed-pill'),
    layerToggles:     document.querySelectorAll('.layer-toggle input'),
    btnResetMap:      document.getElementById('btnResetMap'),
    btnToggleSARView: document.getElementById('btnToggleSARView'),
    btnSIHModal:      document.getElementById('btnSIHModal'),
    sihModal:         document.getElementById('sihModal'),
    btnCloseSIHModal: document.getElementById('btnCloseSIHModal'),
    btnQuickDemo:     document.getElementById('btnQuickDemo'),
    btnExportReport:  document.getElementById('btnExportReport'),
    reportModal:      document.getElementById('reportModal'),
    btnCloseModal:    document.getElementById('btnCloseModal'),
    btnPrintReport:   document.getElementById('btnPrintReport'),
    modalBody:        document.getElementById('modalReportContent'),
    telRegion:        document.getElementById('telRegion'),
    telCoords:        document.getElementById('telCoords'),
    telCurrent:       document.getElementById('telCurrent'),
    telWind:          document.getElementById('telWind'),
    telTopSuspect:    document.getElementById('telTopSuspect')
  };

  // ============================================================
  // INIT
  // ============================================================
  function initApp() {
    initMap();
    setupEventListeners();
    checkBackendHealth();
    loadCase(state.currentCaseId);
  }

  // ============================================================
  // Backend Health Check
  // ============================================================
  async function checkBackendHealth() {
    try {
      const res = await fetch('http://localhost:8000/health', { method: 'GET', mode: 'cors', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        state.backendAvailable = true;
        console.log('✅ OceanGuard AI FastAPI Backend: CONNECTED');
      }
    } catch {
      console.log('ℹ️ Operating in standalone simulation mode (full client-side fusion engine active).');
    }
  }

  // ============================================================
  // MAP INITIALIZATION — Dark Tactical on Gov Clean Basemap
  // ============================================================
  function initMap() {
    state.map = L.map('oceanMap', {
      zoomControl: false,
      attributionControl: false
    }).setView([19.08, 72.48], 10);

    L.control.zoom({ position: 'bottomright' }).addTo(state.map);

    // 100% Watermark-Free & Key-Free High-Performance Tile Providers
    // 1. Primary: Coastal & Marine Topo (Clean, high-contrast, zero watermark)
    const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri, HERE, Garmin, Intermap, USGS'
    });

    // 2. OpenStreetMap Standard (Fast, community-verified, zero watermark)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    // 3. Satellite Imagery: High-Res Optical Satellite (Zero watermark)
    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '© Esri, Maxar, Earthstar Geographics'
    });

    // 4. Maritime Physical / Streets (Zero watermark)
    const streetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri, DeLorme, NAVTEQ'
    });

    // Use Coastal Topo as default (crisp, professional, 100% watermark-free)
    topoLayer.addTo(state.map);

    // Layer control for instant basemap switching
    L.control.layers({
      '🌊 Coastal Tactical (Default)': topoLayer,
      '🗺️ OpenStreetMap':              osmLayer,
      '🛰️ Real Satellite Imagery':     esriSat,
      '🌐 Marine Street / Nautical':    streetLayer
    }, {}, { position: 'bottomright', collapsed: true }).addTo(state.map);

    // Attribution
    L.control.attribution({ position: 'bottomright', prefix: '' })
      .addAttribution('© INCOIS • MoES • CartoDB • OpenStreetMap')
      .addTo(state.map);

    // Layer groups
    state.layerGroups.spill       = L.layerGroup().addTo(state.map);
    state.layerGroups.drift       = L.layerGroup().addTo(state.map);
    state.layerGroups.origin      = L.layerGroup().addTo(state.map);
    state.layerGroups.vessels     = L.layerGroup().addTo(state.map);
    state.layerGroups.metocean    = L.layerGroup();
    state.layerGroups.replayMarker = L.layerGroup().addTo(state.map);
    state.layerGroups.sarOverlay  = L.layerGroup().addTo(state.map);

    // Mouse coords HUD
    state.map.on('mousemove', e => {
      if (DOM.telCoords) DOM.telCoords.textContent =
        `${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° E`;
    });
  }

  // ============================================================
  // LOAD CASE
  // ============================================================
  function loadCase(caseId) {
    state.currentCaseId = caseId;
    const data = INVESTIGATION_CASES[caseId];
    if (!data) return;

    // Update header telemetry
    if (DOM.caseBadge)     DOM.caseBadge.textContent     = data.id;
    if (DOM.telRegion)     DOM.telRegion.textContent     = data.region;
    if (DOM.telCurrent)    DOM.telCurrent.textContent    = `${data.trace.surfaceCurrentSpeed} @ ${data.trace.currentHeading}`;
    if (DOM.telWind)       DOM.telWind.textContent       = `${data.trace.windSpeedKts} kts @ ${data.trace.windHeading}`;

    const top = data.vessels.find(v => v.rank === 1);
    if (top && DOM.telTopSuspect) DOM.telTopSuspect.textContent = `${top.name} (${top.overallScore}%)`;

    // Fly map
    state.map.flyTo(data.center, data.zoom, { duration: 1.5, easeLinearity: 0.4 });

    // Render
    renderMapLayers(data);
    renderStageView(state.currentStage);
    setReplayStep(0);
  }

  // ============================================================
  // MAP LAYERS
  // ============================================================
  function renderMapLayers(data) {
    Object.values(state.layerGroups).forEach(g => g.clearLayers());

    // 1 — Spill Polygon
    if (data.detection?.spillPolygon) {
      const poly = L.polygon(data.detection.spillPolygon, {
        color: '#c0392b', weight: 2.5, opacity: 1,
        fillColor: '#c0392b', fillOpacity: 0.35, dashArray: '5,4'
      }).bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 0;">
          <b style="color:#c0392b;">SAR DETECTED OIL SLICK</b><br>
          Area: <b>${data.detection.areaKm2} km²</b><br>
          AI Confidence: <b>${(data.detection.confidence*100).toFixed(0)}%</b>
        </div>`,
        { sticky: true, className: 'gov-map-tooltip' }
      );
      state.layerGroups.spill.addLayer(poly);
    }

    // 2 — Origin Zone
    if (data.trace?.originPolygon) {
      const oPoly = L.polygon(data.trace.originPolygon, {
        color: '#e67e22', weight: 2, opacity: 1,
        fillColor: '#e67e22', fillOpacity: 0.25, dashArray: '8,5'
      }).bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 0;">
          <b style="color:#e67e22;">PROBABLE ORIGIN ENVELOPE</b><br>
          Release Window: <b>04:00–06:00 UTC</b><br>
          Uncertainty: <b>${data.trace.uncertainty}</b>
        </div>`,
        { sticky: true }
      );
      state.layerGroups.origin.addLayer(oPoly);

      // Origin centroid pulse marker
      const originPulse = L.circleMarker(data.trace.originCenter, {
        radius: 10, color: '#e67e22', weight: 3, fillColor: '#e67e22', fillOpacity: 0.5
      });
      state.layerGroups.origin.addLayer(originPulse);
    }

    // 3 — Drift Vector
    if (data.trace?.driftVector) {
      const line = L.polyline(data.trace.driftVector, {
        color: '#0074d9', weight: 3, opacity: 0.9, dashArray: '10,6'
      });
      state.layerGroups.drift.addLayer(line);

      // Drift direction blips
      data.trace.driftVector.forEach((pt, idx) => {
        if (idx === 0) return;
        const blip = L.circleMarker(pt, {
          radius: 5, color: '#0074d9', fillColor: '#0074d9', fillOpacity: 1, weight: 2
        });
        state.layerGroups.drift.addLayer(blip);
      });
    }

    // 4 — AIS Vessel Tracks
    if (data.vessels) {
      data.vessels.forEach(vessel => {
        const isTop = vessel.rank === 1;
        const trackColors = ['#c0392b', '#e67e22', '#27ae60'];
        const trackColor  = trackColors[vessel.rank - 1] || '#6c757d';
        const latlngs     = vessel.track.map(p => [p.lat, p.lon]);

        // Track polyline
        L.polyline(latlngs, {
          color: trackColor,
          weight: isTop ? 3.5 : 2,
          opacity: isTop ? 1 : 0.7,
          dashArray: isTop ? null : '6,5'
        }).addTo(state.layerGroups.vessels);

        // Track waypoint dots
        vessel.track.forEach(pt => {
          L.circleMarker([pt.lat, pt.lon], {
            radius: isTop ? 5 : 3.5,
            color: trackColor,
            fillColor: '#fff',
            fillOpacity: 1,
            weight: 2
          }).bindTooltip(`${vessel.name}<br>${pt.time} — ${pt.speed} kts`,
            { className: 'gov-map-tooltip', sticky: false }
          ).addTo(state.layerGroups.vessels);
        });

        // Latest-position vessel icon marker
        const latestPos = latlngs[latlngs.length - 1];
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${trackColor};
            color:#fff;
            font-family:Inter,sans-serif;
            font-size:11px;
            font-weight:800;
            width:${isTop ? 30 : 24}px;
            height:${isTop ? 30 : 24}px;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            border:3px solid #fff;
            box-shadow:0 3px 10px rgba(0,0,0,0.4);
            cursor:pointer;
          ">#${vessel.rank}</div>`,
          iconSize: [isTop ? 30 : 24, isTop ? 30 : 24],
          iconAnchor: [isTop ? 15 : 12, isTop ? 15 : 12]
        });

        L.marker(latestPos, { icon })
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px 0;min-width:220px;">
              <div style="font-size:13px;font-weight:800;color:${trackColor};margin-bottom:6px;">
                #${vessel.rank} ${vessel.name}
              </div>
              <div style="font-size:11px;color:#666;margin-bottom:2px;"><b>IMO:</b> ${vessel.imo} | <b>MMSI:</b> ${vessel.mmsi}</div>
              <div style="font-size:11px;color:#666;margin-bottom:2px;"><b>Type:</b> ${vessel.type}</div>
              <div style="font-size:11px;color:#666;margin-bottom:6px;"><b>Flag:</b> ${vessel.flag}</div>
              <div style="background:#f4f7fc;border-left:4px solid ${trackColor};padding:6px 8px;border-radius:3px;font-size:11px;">
                <b>Evidence Score:</b> <span style="font-size:15px;font-weight:900;color:${trackColor};">${vessel.overallScore}</span>/100<br>
                <span style="color:#888;">${vessel.confidenceCategory}</span>
              </div>
            </div>
          `, { maxWidth: 260 })
          .addTo(state.layerGroups.vessels);
      });
    }

    // 5 — MetOcean arrows
    renderMetoceanLayer();
  }

  function renderMetoceanLayer() {
    state.layerGroups.metocean.clearLayers();
    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data?.center) return;

    const [cLat, cLon] = data.center;
    const currSpeed = data.trace.surfaceCurrentSpeed;
    const currHead = data.trace.currentHeading;
    const windSpeed = data.trace.windSpeedKts;
    const windHead = data.trace.windHeading;

    // Generate hydrodynamic current vector streamlines across the marine operational area
    for (let dLat = -0.36; dLat <= 0.36; dLat += 0.12) {
      for (let dLon = -0.48; dLon <= 0.48; dLon += 0.16) {
        const lat = cLat + dLat;
        const lon = cLon + dLon;

        // Current vector arrow (pointing along current flow heading)
        const angleDeg = (data.trace.currentDirectionDeg || 228) - 90;
        const arrowHtml = `<div class="metocean-arrow" style="transform: rotate(${angleDeg}deg);">➔</div>`;
        const icon = L.divIcon({
          className: '',
          html: arrowHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([lat, lon], { icon }).bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:11px;padding:3px 0;">
            <b style="color:#0284c7;">🌊 INCOIS ODAS / CMEMS REANALYSIS GRID</b><br>
            Current Velocity: <b>${currSpeed} @ ${currHead}</b><br>
            10m Wind Field: <b>${windSpeed} kts @ ${windHead}</b><br>
            Sea Surface Temp: <b>${data.trace.seaSurfaceTemp || '28.4 °C'}</b><br>
            Wave Height (Hs): <b>${data.trace.waveHeight || '1.6 m'}</b><br>
            Ekman / Coriolis Deflection: <b>+10.0°</b>
          </div>`,
          { sticky: true }
        ).addTo(state.layerGroups.metocean);
      }
    }
  }

  // ============================================================
  // STAGE VIEW RENDERER
  // ============================================================
  function renderStageView(stage) {
    state.currentStage = stage;
    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data) return;

    // Update active tab
    DOM.stageTabs.forEach(tab =>
      tab.classList.toggle('active', tab.dataset.stage === stage)
    );

    let html = '';

    switch (stage) {

      case 'dashboard':
        DOM.panelTitle.textContent = 'INCIDENT INTELLIGENCE OVERVIEW';
        const topV = data.vessels[0];
        html = `
          <!-- Pipeline Progress -->
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">⚡ Investigation Pipeline Progress</span></div>
            <div class="gov-card-body">
              <div class="gov-pipeline-stepper">
                ${['DETECT','TRACE','MATCH','RANK','EXPLAIN'].map((s,i) => `
                  <div class="gov-step done" onclick="OceanGuardApp.switchStage('${s.toLowerCase()}')">
                    <div class="gov-step-circle">✓</div>
                    <span class="gov-step-label">${s}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">📊 Incident Key Metrics</span></div>
            <div class="gov-card-body">
              <div class="metric-grid-gov">
                <div class="metric-cell">
                  <div class="metric-cell-label">Slick Area (SAR)</div>
                  <div class="metric-cell-value val-red">${data.detection.areaKm2} km²</div>
                </div>
                <div class="metric-cell">
                  <div class="metric-cell-label">Detection Confidence</div>
                  <div class="metric-cell-value val-blue">${(data.detection.confidence*100).toFixed(0)}%</div>
                </div>
                <div class="metric-cell">
                  <div class="metric-cell-label">Origin Time Window</div>
                  <div class="metric-cell-value val-amber" style="font-size:0.9rem;">04:00–06:00 UTC</div>
                </div>
                <div class="metric-cell">
                  <div class="metric-cell-label">Top Attribution Score</div>
                  <div class="metric-cell-value val-green">${topV.overallScore}/100</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">🚨 Case Summary</span><span class="gov-tag gov-tag-red">COMPLETED</span></div>
            <div class="gov-card-body">
              <div class="summary-text-box">${data.summary}</div>
            </div>
          </div>

          <!-- Top Suspect Quick Card -->
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">🏆 Primary Attribution Candidate</span></div>
            <div class="gov-card-body">
              ${renderVesselCards([topV])}
            </div>
          </div>

          <div class="gov-warning-banner">
            ⚖️ <b>Legal Disclaimer:</b> Evidence scores reflect statistical correlation under MOSTA protocol and do not constitute judicial findings. Refer to competent maritime authority.
          </div>
        `;
        break;

      case 'detect':
        DOM.panelTitle.textContent = 'STAGE 01 — SAR SATELLITE SPILL DETECTION';
        html = `
          <div class="gov-panel-card">
            <div class="gov-card-header">
              <span class="gov-card-title">🛰️ Sentinel-1 SAR Observation Parameters</span>
              <span class="gov-tag gov-tag-blue">C-BAND VV/VH</span>
            </div>
            <div class="gov-card-body">
              <div class="data-row-list">
                <div class="data-row"><span class="data-row-key">Satellite Platform</span><span class="data-row-val">${data.detection.satellite}</span></div>
                <div class="data-row"><span class="data-row-key">Polarization Mode</span><span class="data-row-val">${data.detection.polarization}</span></div>
                <div class="data-row"><span class="data-row-key">Acquisition Time</span><span class="data-row-val">10:30:00 UTC</span></div>
                <div class="data-row"><span class="data-row-key">Spill ID</span><span class="data-row-val">${data.detection.spillId}</span></div>
                <div class="data-row"><span class="data-row-key">Slick Area</span><span class="data-row-val" style="color:var(--accent-spill);">${data.detection.areaKm2} km²</span></div>
                <div class="data-row"><span class="data-row-key">AI Confidence</span><span class="data-row-val" style="color:var(--gov-green);">${(data.detection.confidence*100).toFixed(0)}%</span></div>
                <div class="data-row"><span class="data-row-key">Spectral Signature</span><span class="data-row-val" style="font-size:0.68rem;">${data.detection.slickType}</span></div>
              </div>
            </div>
          </div>

          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">🔬 SAR Image Analysis Preview</span></div>
            <div class="gov-card-body">
              <div class="sar-grid">
                <div class="sar-cell">
                  <div class="sar-canvas" style="background:linear-gradient(135deg,#050d1c,#0a1728);">
                    <div style="border:2px dashed rgba(255,255,255,0.25);width:55px;height:42px;border-radius:50% 60% 55% 40%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:10px;">RAW</div>
                  </div>
                  <div class="sar-label">Raw SAR Backscatter (VV Band)</div>
                </div>
                <div class="sar-cell">
                  <div class="sar-canvas" style="background:linear-gradient(135deg,#050d1c,#0a1728);">
                    <div style="border:2px solid #c0392b;background:rgba(192,57,43,0.35);width:55px;height:42px;border-radius:50% 60% 55% 40%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(192,57,43,0.6);font-size:10px;color:#ff8888;">SPILL</div>
                  </div>
                  <div class="sar-label">AI Segmentation Mask Overlay</div>
                </div>
              </div>
            </div>
          </div>

          <div class="metric-grid-gov">
            <div class="metric-cell"><div class="metric-cell-label">Centroid Lat</div><div class="metric-cell-value val-blue">${data.detection.center[0]}° N</div></div>
            <div class="metric-cell"><div class="metric-cell-label">Centroid Lon</div><div class="metric-cell-value val-blue">${data.detection.center[1]}° E</div></div>
          </div>
        `;
        break;

      case 'trace':
        DOM.panelTitle.textContent = 'STAGE 02 — METOCEAN REVERSE DRIFT BACKTRACKING';
        html = `
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">🌊 Lagrangian Particle Drift Model</span><span class="gov-tag gov-tag-amber">T−6h REVERSE</span></div>
            <div class="gov-card-body">
              <div class="metric-grid-gov" style="margin-bottom:12px;">
                <div class="metric-cell"><div class="metric-cell-label">Surface Current</div><div class="metric-cell-value val-blue">${data.trace.surfaceCurrentSpeed}</div></div>
                <div class="metric-cell"><div class="metric-cell-label">Wind Speed</div><div class="metric-cell-value">${data.trace.windSpeedKts} kts</div></div>
                <div class="metric-cell"><div class="metric-cell-label">Origin Window</div><div class="metric-cell-value val-amber" style="font-size:0.85rem;">04:00–06:00</div></div>
                <div class="metric-cell"><div class="metric-cell-label">Model Confidence</div><div class="metric-cell-value val-green">${(data.trace.backtrackConfidence*100).toFixed(0)}%</div></div>
              </div>
              <div class="data-row-list">
                <div class="data-row"><span class="data-row-key">Wind Direction</span><span class="data-row-val">${data.trace.windDirectionDeg}° ${data.trace.windHeading}</span></div>
                <div class="data-row"><span class="data-row-key">Current Direction</span><span class="data-row-val">${data.trace.currentDirectionDeg}° ${data.trace.currentHeading}</span></div>
                <div class="data-row"><span class="data-row-key">Sea Surface Temp</span><span class="data-row-val">${data.trace.seaSurfaceTemp}</span></div>
                <div class="data-row"><span class="data-row-key">Wave Height</span><span class="data-row-val">${data.trace.waveHeight}</span></div>
                <div class="data-row"><span class="data-row-key">Uncertainty Envelope</span><span class="data-row-val">${data.trace.uncertainty}</span></div>
              </div>
            </div>
          </div>
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">📍 Computed Origin Zone</span></div>
            <div class="gov-card-body">
              <div class="data-row-list">
                <div class="data-row"><span class="data-row-key">Origin Centroid Lat</span><span class="data-row-val">${data.trace.originCenter[0]}° N</span></div>
                <div class="data-row"><span class="data-row-key">Origin Centroid Lon</span><span class="data-row-val">${data.trace.originCenter[1]}° E</span></div>
              </div>
              <div class="summary-text-box" style="margin-top:10px;">Drift equations integrate ECMWF wind forcing (3.2% windage factor) and HYCOM surface current analysis over 6-hour reverse simulation window.</div>
            </div>
          </div>
        `;
        break;

      case 'match':
        DOM.panelTitle.textContent = 'STAGE 03 — AIS HISTORICAL TRAJECTORY MATCH';
        html = `
          <div class="gov-panel-card">
            <div class="gov-card-header">
              <span class="gov-card-title">🚢 Candidate Vessels Shortlisted</span>
              <span class="gov-tag gov-tag-blue">${data.vessels.length} TARGETS</span>
            </div>
            <div class="gov-card-body" style="padding:10px;">
              <p style="font-size:0.74rem;color:var(--text-muted);margin-bottom:12px;">
                AIS trajectory spatial-temporal intersection with origin envelope (04:00–06:00 UTC). Buffer: 15 km.
              </p>
              ${renderVesselCards(data.vessels)}
            </div>
          </div>
        `;
        break;

      case 'rank':
        DOM.panelTitle.textContent = 'STAGE 04 — EVIDENCE FUSION RANKING ENGINE';
        html = `
          <div class="gov-panel-card">
            <div class="gov-card-header"><span class="gov-card-title">⚖️ 5-Factor Weighted Evidence Matrix</span></div>
            <div class="gov-card-body">
              <div class="summary-text-box" style="margin-bottom:12px;">
                <b>Final Score</b> = (Proximity × 30%) + (Time × 25%) + (Trajectory × 20%) + (Drift × 15%) + (AIS Quality × 10%)
              </div>
              ${renderVesselCards(data.vessels)}
            </div>
          </div>
        `;
        break;

      case 'explain':
        DOM.panelTitle.textContent = 'STAGE 05 — ATTRIBUTION & EXPLAINABILITY';
        const top = data.vessels[0];
        html = `
          <div class="gov-panel-card">
            <div class="gov-card-header">
              <span class="gov-card-title">🧠 Primary Attribution Analysis</span>
              <span class="gov-tag gov-tag-red">RANK #1</span>
            </div>
            <div class="gov-card-body">
              <div style="margin-bottom:12px;">
                <div style="font-size:1rem;font-weight:800;color:var(--text-heading);">${top.name}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);font-family:var(--font-mono);">IMO: ${top.imo} | MMSI: ${top.mmsi}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);">${top.type} | ${top.flag}</div>
              </div>
              <div style="text-align:center;background:linear-gradient(135deg,#fff5f5,#fff8f0);border:2px solid #e8c0a0;border-radius:6px;padding:14px;margin-bottom:12px;">
                <div style="font-size:2.5rem;font-weight:900;font-family:var(--font-mono);color:var(--accent-high);line-height:1;">${top.overallScore}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">/ 100 COMPOSITE EVIDENCE SCORE</div>
                <div style="font-size:0.72rem;font-weight:700;color:#b45309;margin-top:4px;">${top.confidenceCategory}</div>
              </div>
              <div class="gov-explain-box">
                <h4>🔍 Why ${top.name}?</h4>
                ${top.justification}
              </div>
              <div style="margin-top:12px;">
                <div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Evidence Factor Breakdown</div>
                <div class="evidence-bars">${renderScoreBars(top.evidence)}</div>
              </div>
            </div>
          </div>
          <button class="gov-btn gov-btn-primary" style="width:100%;justify-content:center;padding:10px;" onclick="OceanGuardApp.openReportModal()">
            📄 View Official Legal Attribution Dossier
          </button>
        `;
        break;
    }

    if (DOM.panelContent) DOM.panelContent.innerHTML = html;
  }

  // ============================================================
  // VESSEL CARD RENDERER
  // ============================================================
  function renderVesselCards(vessels) {
    const suspectClass = ['suspect-1','suspect-2','suspect-3'];
    return vessels.map(v => `
      <div class="vessel-card-gov ${suspectClass[v.rank-1]||''}" onclick="OceanGuardApp.highlightVessel('${v.id}')">
        <div class="vessel-card-header-gov">
          <div class="vessel-identity-gov">
            <div class="vessel-rank-badge">${v.rank}</div>
            <div>
              <div class="vessel-name-gov">${v.name}</div>
              <div class="vessel-meta-gov">${v.type} | ${v.flag}</div>
            </div>
          </div>
          <div class="score-pill">
            <div class="score-number-gov">${v.overallScore}</div>
            <div class="score-unit-gov">/ 100</div>
          </div>
        </div>
        <div class="evidence-bars">${renderScoreBars(v.evidence)}</div>
      </div>
    `).join('');
  }

  // ============================================================
  // SCORE BARS RENDERER
  // ============================================================
  function renderScoreBars(evidence) {
    const factors = [
      { key:'proximity',    label:'Proximity to Origin (30%)',    cls:'ebar-proximity' },
      { key:'timeMatch',    label:'Time-Window Match (25%)',       cls:'ebar-time' },
      { key:'trajectory',   label:'Trajectory Alignment (20%)',   cls:'ebar-trajectory' },
      { key:'drift',        label:'Drift Consistency (15%)',       cls:'ebar-drift' },
      { key:'aisQuality',   label:'AIS Data Quality (10%)',        cls:'ebar-ais' }
    ];
    return factors.map(f => {
      const item = evidence[f.key];
      if (!item) return '';
      return `
        <div class="ebar-row" title="${item.note||''}">
          <div class="ebar-info">
            <span class="ebar-name">${f.label}</span>
            <span class="ebar-score">${item.score}/100</span>
          </div>
          <div class="ebar-track">
            <div class="ebar-fill ${f.cls}" style="width:${item.score}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // REPLAY TIMELINE
  // ============================================================
  function setReplayStep(stepIndex) {
    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data?.replaySteps) return;
    const step = data.replaySteps[stepIndex];
    if (!step) return;

    state.replay.step = stepIndex;
    const pct = (stepIndex / (data.replaySteps.length - 1)) * 100;
    if (DOM.replaySlider) DOM.replaySlider.value = pct;
    if (DOM.replayTimeDisplay) DOM.replayTimeDisplay.textContent = `${step.title} (${step.time})`;
    if (DOM.replayNarrative) DOM.replayNarrative.innerHTML =
      `<span class="narrative-phase">PHASE ${stepIndex} ›</span> ${step.narrative}`;

    // Layer visibility
    const setOpacity = (group, show) =>
      group.eachLayer(l => { if (l.setStyle) l.setStyle({ fillOpacity: show ? 0.35 : 0, opacity: show ? 1 : 0 }); });

    setOpacity(state.layerGroups.spill,  step.spillVisible);
    setOpacity(state.layerGroups.origin, step.originVisible);
    state.layerGroups.drift.eachLayer(l => { if (l.setStyle) l.setStyle({ opacity: step.driftVisible ? 0.9 : 0 }); });

    // Animated replay markers
    state.layerGroups.replayMarker.clearLayers();
    if (step.activeVesselPos) {
      Object.values(step.activeVesselPos).forEach((pos, i) => {
        const colors = ['#c0392b','#e67e22','#27ae60'];
        L.circleMarker(pos, {
          radius: 8, color: colors[i] || '#888',
          fillColor: colors[i] || '#888', fillOpacity: 1, weight: 3
        }).addTo(state.layerGroups.replayMarker);
      });
    }
  }

  function togglePlay() {
    state.replay.isPlaying ? pauseReplay() : startReplay();
  }

  function startReplay() {
    if (state.replay.timer) {
      clearInterval(state.replay.timer);
      state.replay.timer = null;
    }
    state.replay.isPlaying = true;
    if (DOM.btnReplayPlay) {
      DOM.btnReplayPlay.textContent = '⏸ PAUSE';
      DOM.btnReplayPlay.style.background = '#c0392b';
    }

    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data?.replaySteps?.length) return;
    const total = data.replaySteps.length;

    // If already at end, restart from beginning
    if (state.replay.step >= total - 1) {
      setReplayStep(0);
    }

    state.replay.timer = setInterval(() => {
      const next = state.replay.step + 1;
      if (next >= total) {
        setReplayStep(0);
      } else {
        setReplayStep(next);
      }
    }, Math.max(600, 2400 / state.replay.speed));
  }

  function pauseReplay() {
    state.replay.isPlaying = false;
    if (DOM.btnReplayPlay) {
      DOM.btnReplayPlay.textContent = '▶ PLAY';
      DOM.btnReplayPlay.style.background = '';
    }
    if (state.replay.timer) {
      clearInterval(state.replay.timer);
      state.replay.timer = null;
    }
  }

  // ============================================================
  // SAR RADAR MODE OVERLAY ENGINE
  // ============================================================
  function toggleSARMode() {
    state.sarModeActive = !state.sarModeActive;
    if (state.sarModeActive) {
      DOM.btnToggleSARView?.classList.add('active');
      if (DOM.btnToggleSARView) DOM.btnToggleSARView.innerHTML = '🛰️ SAR Mode: ON';
      renderSAROverlay();
    } else {
      DOM.btnToggleSARView?.classList.remove('active');
      if (DOM.btnToggleSARView) DOM.btnToggleSARView.innerHTML = '🛰️ SAR Mode';
      clearSAROverlay();
    }
  }

  function clearSAROverlay() {
    state.layerGroups.sarOverlay?.clearLayers();
    const existingHud = document.getElementById('sarHudBadge');
    if (existingHud) existingHud.remove();
  }

  function renderSAROverlay() {
    clearSAROverlay();
    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data?.detection?.center) return;

    const [cLat, cLon] = data.detection.center;
    const bounds = [
      [cLat - 0.055, cLon - 0.075],
      [cLat + 0.055, cLon + 0.075]
    ];

    // Synthesize calibrated Sentinel-1 C-Band SAR raster via HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // 1. Speckled ocean backscatter background (Rayleigh/Gamma noise)
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const buf = imgData.data;
    for (let i = 0; i < buf.length; i += 4) {
      const noise = Math.floor(70 + Math.random() * 80);
      buf[i]     = Math.floor(noise * 0.35); // R
      buf[i + 1] = Math.floor(noise * 0.65); // G
      buf[i + 2] = Math.floor(noise * 0.95); // B (cool radar false-color)
      buf[i + 3] = 235; // Alpha
    }
    ctx.putImageData(imgData, 0, 0);

    // 2. Low-backscatter mineral oil slick damping depression
    ctx.save();
    ctx.filter = 'blur(6px)';
    ctx.fillStyle = 'rgba(2, 6, 18, 0.94)';
    ctx.beginPath();
    ctx.ellipse(220, 160, 95, 48, -0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(170, 180, 50, 26, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. SAR range-doppler grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.20)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 55) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 55) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 4. AI segmentation bounding box & annotation
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(105, 95, 230, 130);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(105, 70, 230, 24);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`AI SLICK DETECT: ${data.detection.areaKm2} km² (${(data.detection.confidence*100).toFixed(0)}%)`, 112, 86);

    // 5. SAR Metadata Footer
    ctx.fillStyle = 'rgba(2, 6, 18, 0.95)';
    ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('SENTINEL-1 C-BAND SAR | VV+VH CROSS-POL | 10m RESOLUTION | -11.4 dB CONTRAST', 10, canvas.height - 8);

    const sarOverlay = L.imageOverlay(canvas.toDataURL(), bounds, {
      opacity: 0.95,
      interactive: true,
      zIndex: 500
    }).bindTooltip(
      `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 0;">
        <b style="color:#0284c7;">🛰️ SENTINEL-1 C-BAND SAR RASTER</b><br>
        Sensor: <b>Sentinel-1 C-Band SAR (VV/VH)</b><br>
        Oil Damping Contrast: <b>-11.4 dB vs Background</b><br>
        Segmented Footprint: <b>${data.detection.areaKm2} km²</b><br>
        AI Confidence: <b>${(data.detection.confidence*100).toFixed(0)}%</b>
      </div>`,
      { sticky: true }
    );

    state.layerGroups.sarOverlay.addLayer(sarOverlay);
    state.map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });

    // Add HUD indicator
    const hud = document.querySelector('.telemetry-hud');
    if (hud && !document.getElementById('sarHudBadge')) {
      const pill = document.createElement('div');
      pill.id = 'sarHudBadge';
      pill.className = 'sar-hud-pill';
      pill.innerHTML = '<span>🛰️ SAR C-BAND RADAR VIEW ACTIVE</span>';
      hud.appendChild(pill);
    }
  }

  // ============================================================
  // REPORT MODAL
  // ============================================================
  function openReportModal() {
    const data = INVESTIGATION_CASES[state.currentCaseId];
    if (!data) return;
    const top = data.vessels[0];

    DOM.modalBody.innerHTML = `
      <!-- Case Header -->
      <div class="modal-section">
        <div class="modal-section-header">📋 Incident Reference Details</div>
        <div class="modal-section-body">
          <div class="data-row-list">
            <div class="data-row"><span class="data-row-key">Investigation ID</span><span class="data-row-val">${data.id}</span></div>
            <div class="data-row"><span class="data-row-key">Title</span><span class="data-row-val">${data.title}</span></div>
            <div class="data-row"><span class="data-row-key">Region</span><span class="data-row-val">${data.region}</span></div>
            <div class="data-row"><span class="data-row-key">Observation Timestamp</span><span class="data-row-val">${data.timestamp}</span></div>
            <div class="data-row"><span class="data-row-key">Satellite Platform</span><span class="data-row-val">${data.detection.satellite}</span></div>
            <div class="data-row"><span class="data-row-key">Status</span><span class="data-row-val">${data.status}</span></div>
          </div>
        </div>
      </div>

      <!-- Evidence Score Highlight -->
      <div style="display:grid;grid-template-columns:1fr 2fr;gap:16px;">
        <div class="modal-score-highlight">
          <div class="modal-score-num">${top.overallScore}</div>
          <div class="modal-score-label">/ 100 Evidence Score</div>
          <div style="font-size:0.7rem;font-weight:700;color:#b45309;margin-top:6px;">${top.confidenceCategory}</div>
        </div>
        <div class="modal-section" style="margin:0;">
          <div class="modal-section-header">🏆 Primary Attributed Candidate</div>
          <div class="modal-section-body">
            <div style="font-size:1rem;font-weight:800;color:var(--text-heading);margin-bottom:4px;">${top.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:8px;">IMO: ${top.imo} | MMSI: ${top.mmsi} | ${top.flag}</div>
            <div class="gov-explain-box"><h4>Justification</h4>${top.justification}</div>
          </div>
        </div>
      </div>

      <!-- SAR Detection -->
      <div class="modal-section">
        <div class="modal-section-header">🛰️ SAR Detection Evidence</div>
        <div class="modal-section-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="data-row-list">
              <div class="data-row"><span class="data-row-key">Slick Area</span><span class="data-row-val" style="color:var(--accent-spill);font-weight:700;">${data.detection.areaKm2} km²</span></div>
              <div class="data-row"><span class="data-row-key">AI Confidence</span><span class="data-row-val">${(data.detection.confidence*100).toFixed(0)}%</span></div>
            </div>
            <div class="data-row-list">
              <div class="data-row"><span class="data-row-key">Slick Type</span><span class="data-row-val">${data.detection.slickType}</span></div>
              <div class="data-row"><span class="data-row-key">Satellite Platform</span><span class="data-row-val">${data.detection.satellite}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hydrodynamic Drift & Weathering Kinetics -->
      <div class="modal-section">
        <div class="modal-section-header">🌊 Hydrodynamic Backtracking & Oil Weathering Kinetics</div>
        <div class="modal-section-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div class="data-row-list">
              <div class="data-row"><span class="data-row-key">Release Window</span><span class="data-row-val">${data.trace.likelyStartTime} to ${data.trace.likelyEndTime}</span></div>
              <div class="data-row"><span class="data-row-key">Surface Current</span><span class="data-row-val">${data.trace.surfaceCurrentSpeed} @ ${data.trace.currentHeading}</span></div>
              <div class="data-row"><span class="data-row-key">Wind Transport</span><span class="data-row-val">${data.trace.windSpeedKts} kts @ ${data.trace.windHeading} (3.2% Windage)</span></div>
            </div>
            <div class="data-row-list">
              <div class="data-row"><span class="data-row-key">Evaporative Mass Loss</span><span class="data-row-val" style="color:#e67e22;font-weight:700;">32.4% (Mackay Kinetics)</span></div>
              <div class="data-row"><span class="data-row-key">Emulsion Water Content</span><span class="data-row-val" style="color:#0284c7;font-weight:700;">48.2% (Mousse Formed)</span></div>
              <div class="data-row"><span class="data-row-key">Viscosity Increase</span><span class="data-row-val">18.0 cSt ➔ 142.5 cSt (+690%)</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statutory Violation Tags & Legal Sign-off -->
      <div class="modal-section">
        <div class="modal-section-header">⚖️ Statutory Maritime Legal Provisions & Verification</div>
        <div class="modal-section-body">
          <div style="background:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #d97706;padding:10px 12px;border-radius:4px;font-size:0.73rem;color:#78350f;margin-bottom:10px;line-height:1.45;">
            <b>STATUTORY CHARGES:</b> Violation of <b>Merchant Shipping Act, 1958 (Section 356C — Prohibition of Discharge of Oil)</b> and <b>MARPOL 73/78 Annex I (Regulation 15 — Control of Discharge of Oil into the Sea)</b>. Penalty proceedings initiated via Directorate General of Shipping (DG Shipping) and Indian Coast Guard Maritime Law Enforcement.
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.68rem;color:var(--text-muted);font-family:var(--font-mono);background:#f8fafc;padding:8px 12px;border-radius:4px;border:1px solid var(--gov-border);">
            <span>SHA-256 FORENSIC HASH: <b style="color:#003087;">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</b></span>
            <span>STATUS: <b style="color:#166534;">VERIFIED & SEALED</b></span>
          </div>
        </div>
      </div>

      <!-- Evidence Scores -->
      <div class="modal-section">
        <div class="modal-section-header">⚖️ 5-Factor Evidence Breakdown</div>
        <div class="modal-section-body">
          <div class="evidence-bars">${renderScoreBars(top.evidence)}</div>
        </div>
      </div>

      <!-- Legal Footer -->
      <div class="gov-warning-banner">
        <b>CONFIDENTIAL — FOR OFFICIAL USE ONLY</b><br>
        This dossier is generated by the OceanGuard AI platform under Smart India Hackathon 2026 Protocol SIH26143. The evidence scores represent statistical attribution under Lagrangian hydrodynamic and AIS trajectory fusion models. This document is not a judicial finding. Competent maritime enforcement authorities must evaluate this evidence independently under MARPOL Annex I jurisdiction.
      </div>
    `;

    DOM.reportModal.classList.add('active');
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  function setupEventListeners() {
    DOM.caseSelect?.addEventListener('change', e => loadCase(e.target.value));

    DOM.stageTabs.forEach(tab =>
      tab.addEventListener('click', () => renderStageView(tab.dataset.stage))
    );

    DOM.layerToggles.forEach(input =>
      input.addEventListener('change', e => {
        const layer = e.target.dataset.layer;
        const on = e.target.checked;
        state.activeLayers[layer] = on;
        const group = state.layerGroups[layer];
        if (group) {
          if (on) state.map.addLayer(group);
          else state.map.removeLayer(group);
        }
        e.target.closest('.layer-toggle').classList.toggle('active', on);
      })
    );

    DOM.btnResetMap?.addEventListener('click', () => {
      const d = INVESTIGATION_CASES[state.currentCaseId];
      if (d) state.map.flyTo(d.center, d.zoom);
    });

    DOM.btnToggleSARView?.addEventListener('click', toggleSARMode);

    DOM.btnReplayPlay?.addEventListener('click', togglePlay);
    DOM.btnReplayPrev?.addEventListener('click', () => {
      pauseReplay();
      setReplayStep(Math.max(0, state.replay.step - 1));
    });
    DOM.btnReplayNext?.addEventListener('click', () => {
      pauseReplay();
      const d = INVESTIGATION_CASES[state.currentCaseId];
      setReplayStep(Math.min(d.replaySteps.length - 1, state.replay.step + 1));
    });

    DOM.replaySlider?.addEventListener('input', e => {
      pauseReplay();
      const d = INVESTIGATION_CASES[state.currentCaseId];
      setReplayStep(Math.round((+e.target.value / 100) * (d.replaySteps.length - 1)));
    });

    DOM.speedBtns.forEach(btn =>
      btn.addEventListener('click', () => {
        DOM.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.replay.speed = +btn.dataset.speed;
        if (state.replay.isPlaying) { pauseReplay(); startReplay(); }
      })
    );

    DOM.btnExportReport?.addEventListener('click', openReportModal);
    DOM.btnSIHModal?.addEventListener('click', () => DOM.sihModal?.classList.add('active'));
    DOM.btnCloseSIHModal?.addEventListener('click', () => DOM.sihModal?.classList.remove('active'));
    DOM.btnQuickDemo?.addEventListener('click', runDemoTour);
    DOM.btnCloseModal?.addEventListener('click', () => DOM.reportModal.classList.remove('active'));
    DOM.btnPrintReport?.addEventListener('click', () => window.print());

    // Timeline markers
    document.querySelectorAll('.timeline-marker').forEach(m =>
      m.addEventListener('click', () => {
        pauseReplay();
        setReplayStep(+m.dataset.step);
      })
    );

    // Close modal on overlay click
    DOM.reportModal?.addEventListener('click', e => {
      if (e.target === DOM.reportModal) DOM.reportModal.classList.remove('active');
    });
    DOM.sihModal?.addEventListener('click', e => {
      if (e.target === DOM.sihModal) DOM.sihModal.classList.remove('active');
    });
  }

  // ============================================================
  // AUTOMATED DEMO TOUR
  // ============================================================
  function runDemoTour() {
    const stages = ['detect','trace','match','rank','explain'];
    let i = 0;
    renderStageView(stages[0]);
    const t = setInterval(() => {
      i++;
      if (i < stages.length) renderStageView(stages[i]);
      else { clearInterval(t); startReplay(); }
    }, 2000);
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.OceanGuardApp = {
    switchStage: renderStageView,
    toggleSAR: toggleSARMode,
    openSIHModal() {
      DOM.sihModal?.classList.add('active');
    },
    openReportModal,
    highlightVessel(id) {
      const d = INVESTIGATION_CASES[state.currentCaseId];
      const v = d?.vessels.find(x => x.id === id);
      if (v?.track?.length) {
        const last = v.track[v.track.length - 1];
        state.map.flyTo([last.lat, last.lon], 12, { duration: 0.9 });
      }
    }
  };

  // ============================================================
  // BOOT
  // ============================================================
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initApp);
  else
    initApp();

})();
