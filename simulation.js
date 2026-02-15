/* Champ Électrostatique v3 — Ultra-Premium · Optimized + Cached Rendering */
(() => {
    'use strict';
    const K = 8.99e9, MU = 1e-6, SC = 100, MR = .05, FLS = .015, FLM = 600, CR = 14;

    // ═══ HARDWARE DETECTION & PERFORMANCE TIERS ═══
    // Tier 0 = Ultra-low (integrated Intel UHD, old laptops, 2-4 cores)
    // Tier 1 = Low-mid (integrated AMD/Intel, 4-6 cores)
    // Tier 2 = Mid-high (discrete GPU or modern integrated, 6-8 cores)
    // Tier 3 = Ultra (discrete NVIDIA/AMD, 8+ cores, 8+GB RAM)
    const PERF = (() => {
        const cores = navigator.hardwareConcurrency || 2;
        const memory = navigator.deviceMemory || 4;
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const isLaptop = /Laptop|Notebook/i.test(navigator.userAgent) || (navigator.platform === 'Win32' && screen.width <= 1920);

        // ── GPU Detection ──
        let gpuVendor = 'unknown', gpuModel = '', gpuTier = -1, isDiscrete = false;
        let gpuRenderer = '';
        try {
            const c = document.createElement('canvas');
            const g = c.getContext('webgl2') || c.getContext('webgl');
            if (g) {
                const dbg = g.getExtension('WEBGL_debug_renderer_info');
                if (dbg) {
                    gpuRenderer = g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
                    const r = gpuRenderer.toLowerCase();

                    // Detect vendor
                    if (/nvidia|geforce|rtx|gtx|quadro/i.test(r)) {
                        gpuVendor = 'nvidia';
                        isDiscrete = true;
                        // RTX 30xx/40xx/50xx = tier 3, GTX 10xx/16xx = tier 2, older = tier 1
                        if (/rtx\s*[3-9]0|rtx\s*[4-9]0|rtx\s*50/i.test(r)) gpuTier = 3;
                        else if (/rtx|gtx\s*1[6-9]|gtx\s*20/i.test(r)) gpuTier = 3;
                        else if (/gtx\s*1[0-5]|gtx\s*9[5-8]|gtx\s*7[5-9]|gt\s*1030/i.test(r)) gpuTier = 2;
                        else gpuTier = 1;
                    } else if (/radeon\s*(rx|pro|vega)|amd.*rx|navi/i.test(r)) {
                        gpuVendor = 'amd-discrete';
                        isDiscrete = true;
                        // RX 6xxx/7xxx/9xxx = tier 3, RX 5xx/580/570 = tier 2
                        if (/rx\s*[6-9][0-9]{3}|rx\s*[7-9][0-9]{2}0|navi\s*(3|2|1[4-9])/i.test(r)) gpuTier = 3;
                        else if (/rx\s*5[6-9]0|rx\s*590|vega/i.test(r)) gpuTier = 2;
                        else gpuTier = 1;
                    } else if (/radeon|amd/i.test(r) && !/rx/i.test(r)) {
                        gpuVendor = 'amd-integrated';
                        isDiscrete = false;
                        // Radeon 780M/760M (Zen4 iGPU) = decent
                        if (/780m|760m|radeon\s*graphics.*ryzen\s*[7-9]/i.test(r)) gpuTier = 2;
                        else gpuTier = 1;
                    } else if (/intel/i.test(r)) {
                        gpuVendor = 'intel';
                        isDiscrete = /arc\s*(a[3-9]|b[5-9])/i.test(r); // Intel Arc discrete
                        if (isDiscrete) {
                            gpuTier = 2;
                        } else if (/iris\s*xe|iris\s*plus\s*g[7-9]|uhd\s*7[7-9]/i.test(r)) {
                            gpuTier = 1; // 11th/12th gen Iris Xe
                        } else if (/uhd\s*6[2-3]0|uhd\s*6[0-1]0|hd\s*6[0-3]0|hd\s*5[0-9]0/i.test(r)) {
                            gpuTier = 0; // 8th gen UHD 620, older HD
                        } else {
                            gpuTier = 0;
                        }
                    } else if (/apple|m[1-4]\s*(pro|max|ultra)?/i.test(r)) {
                        gpuVendor = 'apple';
                        isDiscrete = true;
                        gpuTier = 3;
                    } else {
                        // ANGLE fallback — check for common strings
                        if (/direct3d|d3d11/i.test(r)) gpuTier = 1; // Windows software
                        else gpuTier = 1;
                    }

                    gpuModel = r.replace(/angle \(|\)/gi, '').replace(/,.*direct3d.*|,.*opengl.*/i, '').trim();
                }
                // Clean up detection canvas
                const ext = g.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            }
        } catch(e) { console.warn('[PERF] GPU detection failed:', e); }

        // ── Compute final tier ──
        // CPU tier
        let cpuTier = 1;
        if (cores <= 2) cpuTier = 0;
        else if (cores <= 4 && memory <= 4) cpuTier = 0;
        else if (cores <= 4) cpuTier = 1;
        else if (cores <= 6) cpuTier = 2;
        else if (cores >= 8 && memory >= 8) cpuTier = 3;
        else cpuTier = 2;

        // Use GPU tier if detected, weighted with CPU tier
        let tier;
        if (gpuTier >= 0) {
            // Weight: 60% GPU, 40% CPU for final tier (GPU matters more for this app)
            tier = Math.round(gpuTier * 0.6 + cpuTier * 0.4);
        } else {
            tier = cpuTier;
        }

        // Mobile cap
        if (isMobile) tier = Math.min(tier, 1);

        // Clamp
        tier = Math.max(0, Math.min(3, tier));

        const result = {
            tier,
            cpuTier,
            gpuTier: gpuTier >= 0 ? gpuTier : cpuTier,
            gpuVendor,
            gpuModel,
            gpuRenderer,
            isDiscrete,
            isMobile,
            isLaptop,
            cores,
            memory,
            // Tier-dependent defaults (tier 0 = 🥔 ultimate potato mode)
            particleDefault:  [40,  120,  300,  500][tier],
            bloomDownscale:   [16,   8,    5,    3][tier],
            gaussSamples:     [40,  100,  200,  280][tier],
            fieldSteps:       [180, 350,  600,  800][tier],
            maxChargesGPU:    [8,   16,   32,   32][tier],
            arrowGrid:        [8,   14,   20,   28][tier],
            density:          [6,   12,   16,   20][tier],
            trailLen:         [4,    8,   16,   20][tier],
            arcDepth:         [2,    3,    5,    6][tier],
            arcFreq:          [30,  15,    4,    2][tier],
            dprCap:           [1,    1,    2,    3][tier],     // devicePixelRatio cap
            skipMinorGrid:    tier <= 1,
            skipBloom:        tier <= 0,
            skipGlow:         tier <= 1,
            skipTrails:       tier <= 0,
            reducedFieldFlow: tier <= 1,
            skipAnimEmptyState: tier <= 0,  // skip pulsing empty state animation
            skipSpawnFX:      tier <= 0,    // skip particle burst on charge placement
        };

        // Log detection results — styled console banner
        const tierColors = ['#ff4444','#ff8800','#44bbff','#44ff88'];
        console.log(`%c[PERF] Hardware Detection`, 'font-size:14px;font-weight:bold;color:' + tierColors[tier]);
        console.log(`  CPU: ${cores} cores, ${memory}GB RAM → cpuTier=${cpuTier}`);
        console.log(`  GPU: ${gpuVendor} ${gpuModel || '(unknown)'} → gpuTier=${gpuTier >= 0 ? gpuTier : 'N/A'}`);
        console.log(`  Renderer: ${gpuRenderer || '(unavailable)'}`);
        console.log(`  Discrete: ${isDiscrete}, Mobile: ${isMobile}`);
        console.log(`%c  ⇒ Final tier: ${tier} — ${['Ultra-Low','Low-Mid','Mid-High','Ultra'][tier]}`, 'font-size:13px;font-weight:bold;color:' + tierColors[tier]);
        console.log(`  Quality=${tier}, Particles=${[80,150,300,500][tier]}, Bloom=${tier>0}, DPR cap=${[1,1.5,2,3][tier]}`);

        return result;
    })();
    // Smooth zoom state
    let zoomTarget = 1, zoomVelocity = 0;
    const ZOOM_SPRING = 0.15, ZOOM_DAMP = 0.78;
    const VERT = `#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0,1);}`;
    const FRAG = `#version 300 es
precision highp float;const int MX=32;const float K=8.99e9,MU=1e-6,PI=3.14159265;
uniform int uN,uMode;uniform vec3 uC[MX];uniform vec2 uRes,uPan;uniform float uZoom,uScale,uTime,uChromatic,uVScale;out vec4 fc;
vec3 hsv(vec3 c){vec4 k=vec4(1,.667,.333,3.);vec3 p=abs(fract(c.xxx+k.xyz)*6.-k.www);return c.z*mix(k.xxx,clamp(p-k.xxx,0.,1.),c.y);}
void fieldAt(vec2 wp,out float V,out vec2 E,out float em){V=0.;E=vec2(0.);for(int i=0;i<MX;i++){if(i>=uN)break;vec2 r=wp-uC[i].xy;float d=max(length(r),.03),q=uC[i].z;V+=K*q*MU/d;float e2=K*q*MU/(d*d);E+=e2*normalize(r);}em=length(E);}
vec3 colorAt(vec2 wp){float V;vec2 E;float em;fieldAt(wp,V,E,em);vec3 col=vec3(0.);
if(uMode==1){float n=clamp(V/uVScale,-1.,1.);if(n>=0.){float t=n;vec3 a=vec3(.02,0,.03),b=vec3(.6,.05,.1),c=vec3(1,.4,.05),d=vec3(1,.85,.3);
col=t<.33?mix(a,b,t/.33):t<.66?mix(b,c,(t-.33)/.33):mix(c,d,(t-.66)/.34);}else{float t=-n;vec3 a=vec3(0,.01,.03),b=vec3(0,.08,.35),c=vec3(0,.3,.7),d=vec3(.1,.7,1);
col=t<.33?mix(a,b,t/.33):t<.66?mix(b,c,(t-.33)/.33):mix(c,d,(t-.66)/.34);}}
else if(uMode==2){float t=clamp(log(em+1.)/18.,0.,1.);vec3 a=vec3(.01,0,.02),b=vec3(.2,0,.4),c=vec3(.7,0,.5),d=vec3(1,.3,.7),e=vec3(1,.92,1.);
col=t<.25?mix(a,b,t/.25):t<.5?mix(b,c,(t-.25)/.25):t<.75?mix(c,d,(t-.5)/.25):mix(d,e,(t-.75)/.25);}
else if(uMode==3){float h=(atan(E.y,E.x)+PI)/(2.*PI),t=clamp(log(em+1.)/14.,0.,1.);col=hsv(vec3(h,.85,t*.9));}
else if(uMode==4){float u=.5*8.854e-12*em*em;float t=clamp(log(u*1e8+1.)/18.,0.,1.);vec3 a=vec3(0.),b=vec3(.4,.15,0.),c=vec3(.85,.4,0.),d=vec3(1.,.7,.05),e=vec3(1.,1.,.4);
col=t<.25?mix(a,b,t/.25):t<.5?mix(b,c,(t-.25)/.25):t<.75?mix(c,d,(t-.5)/.25):mix(d,e,(t-.75)/.25);}
return col;}
void main(){vec2 px=gl_FragCoord.xy;px.y=uRes.y-px.y;vec2 ct=uRes*.5+uPan,wp=(px-ct)/(uScale*uZoom);wp.y=-wp.y;
if(uMode<1||uMode>5)discard;
vec3 col;
if(uMode==5){
float V0;vec2 E0;float em0;fieldAt(wp,V0,E0,em0);
float s=min(1.,log(em0+1.)/12.)*.025;vec2 dir=em0>.001?normalize(E0):vec2(0.);vec2 off=dir*s;
float Vr;vec2 Er;float emr;fieldAt(wp+off,Vr,Er,emr);
float Vb;vec2 Eb;float emb;fieldAt(wp-off,Vb,Eb,emb);
float tr=clamp(log(emr+1.)/14.,0.,1.),tg=clamp(log(em0+1.)/14.,0.,1.),tb=clamp(log(emb+1.)/14.,0.,1.);
col=vec3(tr*.7+.1,tg*.3,tb*.8+.1);
float glow=smoothstep(.2,1.,s/.025)*.2;col+=glow*vec3(.4,.2,.9);
}else if(uChromatic>0.5&&uMode>=1&&uMode<=4){
float V1;vec2 E1;float em1;fieldAt(wp,V1,E1,em1);float s=min(1.,log(em1+1.)/12.)*.02;vec2 dir=em1>.001?normalize(E1):vec2(0.);vec2 off=dir*s;
col=vec3(colorAt(wp+off).r,colorAt(wp).g,colorAt(wp-off).b);float glow=smoothstep(.3,1.,s/.02)*.12;col+=glow*vec3(.5,.3,1.);
}else{col=colorAt(wp);}
fc=vec4(col,.88);}`;

    const S = {
        charges: [], tool: 'pointer', drag: null, sel: null, mouse: { x: 0, y: 0 }, pan: { x: 0, y: 0 }, zoom: 1,
        viz: {
            fieldlines: true, heatmap: 0, vectors: false, equipotential: false,
            particles: !PERF.skipTrails,
            arcs: PERF.tier >= 1,
            bloom: !PERF.skipBloom,
            forces: false, landscape: false, superposition: false
        },
        set: {
            density: PERF.density,
            particleN: PERF.particleDefault,
            arrowGrid: PERF.arrowGrid,
            quality: Math.min(3, Math.max(0, PERF.tier)),
            speed: 1,
            autoAdapt: true
        },
        particles: [], testCharges: [], spawnFX: [], arcCache: [], arcT: 0,
        frame: 0, fps: 60, fpsT: 0, fpsF: 0, dirty: true,
        qualNames: ['Basse', 'Moyenne', 'Haute', 'Ultra'],
        qualMult: [.3, .6, 1, 1.5],
        gauss: null, gaussDraw: null, shiftKey: false,
        history: [], historyIdx: -1,
        workA: null, workB: null,
        freeCharge: null, freeTrail: [],
        isCapacitor: false,
        perfMode: PERF.tier <= 1
    };
    // Post-render hooks array (populated later, called from render loop)
    const postRenderHooks = [];
    let viewportW = 0, viewportH = 0, pixelRatio = devicePixelRatio || 1;
    function updateViewport() {
        const r = container.getBoundingClientRect();
        viewportW = r.width;
        viewportH = r.height;
        return r;
    }

    // ═══ CACHE: offscreen canvases for static layers ═══
    const CC = { flc: null, flx: null, eqc: null, eqx: null, vc: null, vx: null, bc: null, bx: null, lc: null, lx: null };
    function initCC() { ['fl', 'eq', 'v', 'b', 'l'].forEach(k => { CC[k + 'c'] = document.createElement('canvas'); CC[k + 'x'] = CC[k + 'c'].getContext('2d'); }); }
    function resizeCC() { const r = container.getBoundingClientRect();['fl', 'eq', 'v', 'b', 'l'].forEach(k => { CC[k + 'c'].width = r.width; CC[k + 'c'].height = r.height; }); S.dirty = true; }
    initCC();

    const canvas = document.getElementById('sim-canvas'), ctx = canvas.getContext('2d');
    const glCanvas = document.getElementById('gl-canvas'), container = document.getElementById('canvas-container');
    const probeReadout = document.getElementById('probe-readout'), chargeEditor = document.getElementById('charge-editor');
    // Cached DOM refs for performance (avoid getElementById in render loop)
    const DOM = {};
    function initDOM() {
        ['probe-pos', 'probe-e', 'probe-v', 'probe-dir', 'readout-energy', 'readout-totalq',
            'status-fps', 'status-charges', 'status-mode',
            'coulomb-q1', 'coulomb-q2', 'coulomb-r', 'coulomb-f', 'coulomb-type', 'coulomb-panel',
            'cap-dv', 'cap-d', 'cap-e', 'capacitor-panel',
            'gauss-flux', 'gauss-qenc', 'gauss-q', 'gauss-verify', 'gauss-readout',
            'work-va', 'work-vb', 'work-dv', 'work-w', 'work-readout',
            'fc-pos', 'fc-vel', 'fc-ek', 'fc-ep', 'fc-etot', 'freecharge-readout',
            'setting-quality', 'val-quality', 'zoom-display'
        ].forEach(id => { DOM[id] = document.getElementById(id); });
    }
    let gl, prog, vao, uL = {};
    function initGL() {
        gl = glCanvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false }); if (!gl) return false;
        function mk(t, s) {
            const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(sh));
            }
            return sh;
        }
        const vs = mk(gl.VERTEX_SHADER, VERT), fs = mk(gl.FRAGMENT_SHADER, FRAG);
        prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('Shader link error:', gl.getProgramInfoLog(prog));
        }
        gl.useProgram(prog);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        vao = gl.createVertexArray(); gl.bindVertexArray(vao); const a = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        ['uN', 'uMode', 'uRes', 'uPan', 'uZoom', 'uScale', 'uTime', 'uChromatic', 'uVScale'].forEach(n => uL[n] = gl.getUniformLocation(prog, n));
        for (let i = 0; i < 32; i++)uL['uC' + i] = gl.getUniformLocation(prog, 'uC[' + i + ']');
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); return true;
    }
    const hasGL = initGL();

    function resize() {
        const maxDpr = S.perfMode ? 1 : PERF.dprCap;
        const d = Math.min(devicePixelRatio || 1, maxDpr), r = updateViewport();
        pixelRatio = d;
        [canvas, glCanvas].forEach(c => { c.width = r.width * d; c.height = r.height * d; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; });
        ctx.setTransform(d, 0, 0, d, 0, 0); if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height); resizeCC();
    }
    // Debounced resize using requestAnimationFrame
    let resizeRAF = 0;
    function debouncedResize() { cancelAnimationFrame(resizeRAF); resizeRAF = requestAnimationFrame(resize); }
    window.addEventListener('resize', debouncedResize); resize();

    // ═══ PHYSICS (hot path — fully inlined, zero alloc) ═══
    // Reusable result objects to avoid GC pressure
    const _ef = { x: 0, y: 0 };
    function eF(x, y) {
        let ex = 0, ey = 0;
        const chs = S.charges, len = chs.length;
        for (let i = 0; i < len; i++) {
            const c = chs[i], dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy;
            if (r2 < MR * MR) continue;
            const r = Math.sqrt(r2), e = K * c.q * MU / (r2 * r);  // combined: (K*q*MU/r2) * (1/r)
            ex += e * dx; ey += e * dy;
        }
        _ef.x = ex; _ef.y = ey; return _ef;
    }
    // Separate version that returns a NEW object (for cases where result is stored)
    function eFNew(x, y) {
        const r = eF(x, y); return { x: r.x, y: r.y };
    }
    function eP(x, y) {
        let v = 0;
        const chs = S.charges, len = chs.length;
        for (let i = 0; i < len; i++) {
            const c = chs[i], dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy;
            if (r2 < MR * MR) continue;
            v += K * c.q * MU / Math.sqrt(r2);
        }
        return v;
    }
    function sysE() {
        let u = 0; for (let i = 0; i < S.charges.length; i++)for (let j = i + 1; j < S.charges.length; j++) {
            const a = S.charges[i], b = S.charges[j], r = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
            if (r > MR) u += K * a.q * MU * b.q * MU / r;
        } return u;
    }
    function p2w(px, py) {
        const cx = viewportW / 2 + S.pan.x, cy = viewportH / 2 + S.pan.y;
        return { x: (px - cx) / (SC * S.zoom), y: (cy - py) / (SC * S.zoom) };
    }
    function w2p(wx, wy) {
        const cx = viewportW / 2 + S.pan.x, cy = viewportH / 2 + S.pan.y;
        return { x: cx + wx * SC * S.zoom, y: cy - wy * SC * S.zoom };
    }
    function fmtSI(v, u) {
        const a = Math.abs(v); if (a >= 1e9) return (v / 1e9).toFixed(2) + ' G' + u; if (a >= 1e6) return (v / 1e6).toFixed(2) + ' M' + u;
        if (a >= 1e3) return (v / 1e3).toFixed(2) + ' k' + u; if (a >= 1) return v.toFixed(2) + ' ' + u; if (a >= 1e-3) return (v * 1e3).toFixed(2) + ' m' + u;
        return v.toExponential(2) + ' ' + u;
    }

    // ═══ FIELD LINE TRACING (quality-adaptive: Euler on potato, RK4 on high) ═══
    function trace(sx, sy, dir) {
        const pts = [{ x: sx, y: sy }]; let x = sx, y = sy;
        const useEuler = S.set.quality <= 1;  // 4x faster on low-end
        const h = (useEuler ? FLS * 1.8 : FLS) * dir;
        const invZ = 1 / (SC * S.zoom);
        const bxn = -viewportW * .5 * invZ - 2, bxx = viewportW * .5 * invZ + 2;
        const byn = -viewportH * .5 * invZ - 2, byx = viewportH * .5 * invZ + 2;
        const maxSteps = useEuler ? Math.min(PERF.fieldSteps, 280) : PERF.fieldSteps;
        const hitR2 = .08 * .08;
        const chs = S.charges, nC = chs.length;
        for (let i = 0; i < maxSteps; i++) {
            const e1 = eF(x, y), e1x = e1.x, e1y = e1.y;
            const m1 = Math.sqrt(e1x * e1x + e1y * e1y);
            if (m1 < 1e-3) break;
            const inv1 = 1 / m1;
            if (useEuler) {
                // Simple Euler — 1 eF call vs 4 for RK4
                x += h * e1x * inv1; y += h * e1y * inv1;
            } else {
                // RK4 for accuracy on high quality
                const d1x = e1x * inv1, d1y = e1y * inv1;
                const e2 = eF(x + .5 * h * d1x, y + .5 * h * d1y);
                const m2 = Math.sqrt(e2.x * e2.x + e2.y * e2.y); if (m2 < 1e-3) break;
                const inv2 = 1 / m2, d2x = e2.x * inv2, d2y = e2.y * inv2;
                const e3 = eF(x + .5 * h * d2x, y + .5 * h * d2y);
                const m3 = Math.sqrt(e3.x * e3.x + e3.y * e3.y); if (m3 < 1e-3) break;
                const inv3 = 1 / m3, d3x = e3.x * inv3, d3y = e3.y * inv3;
                const e4 = eF(x + h * d3x, y + h * d3y);
                const m4 = Math.sqrt(e4.x * e4.x + e4.y * e4.y); if (m4 < 1e-3) break;
                const inv4 = 1 / m4, d4x = e4.x * inv4, d4y = e4.y * inv4;
                x += h * (d1x + 2 * d2x + 2 * d3x + d4x) / 6;
                y += h * (d1y + 2 * d2y + 2 * d3y + d4y) / 6;
            }
            // Inlined hit test — avoid Math.hypot
            let hit = false;
            for (let ci = 0; ci < nC; ci++) {
                const dx = x - chs[ci].x, dy = y - chs[ci].y;
                if (dx * dx + dy * dy < hitR2) { hit = true; break; }
            }
            if (hit) { pts.push({ x, y }); break; }
            if (x < bxn || x > bxx || y < byn || y > byx) break;
            pts.push({ x, y });
        }
        return pts;
    }

    function arrow(c, x, y, a, sz, col) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(sz, 0); c.lineTo(-sz * .5, -sz * .5); c.lineTo(-sz * .5, sz * .5); c.closePath(); c.fillStyle = col; c.fill(); c.restore(); }

    // ═══ CACHED RENDERERS (draw to offscreen canvases) ═══
    function cacheFieldLines() {
        const c = CC.flx; c.clearRect(0, 0, CC.flc.width, CC.flc.height);
        const dn = Math.round(S.set.density * S.qualMult[S.set.quality]);
        for (const ch of S.charges) {
            if (ch.q <= 0) continue; const n = Math.max(4, Math.round(dn * Math.abs(ch.q)));
            for (let i = 0; i < n; i++) {
                const a = 2 * Math.PI * i / n, pts = trace(ch.x + .09 * Math.cos(a), ch.y + .09 * Math.sin(a), 1);
                if (pts.length < 2) continue; c.beginPath(); const p0 = w2p(pts[0].x, pts[0].y); c.moveTo(p0.x, p0.y);
                for (let j = 1; j < pts.length; j++) { const p = w2p(pts[j].x, pts[j].y); c.lineTo(p.x, p.y); }
                c.strokeStyle = 'rgba(0,200,255,0.35)'; c.lineWidth = 1.5; c.stroke();
                const ai = Math.floor(pts.length / 4); if (ai > 2) for (let j = ai; j < pts.length - 2; j += ai) {
                    const p = w2p(pts[j].x, pts[j].y), pn = w2p(pts[j + 1].x, pts[j + 1].y);
                    arrow(c, p.x, p.y, Math.atan2(pn.y - p.y, pn.x - p.x), 6, 'rgba(0,229,255,0.6)');
                }
            }
        }
        if (!S.charges.some(q => q.q > 0)) for (const ch of S.charges) {
            if (ch.q >= 0) continue; const n = Math.max(4, Math.round(dn * Math.abs(ch.q)));
            for (let i = 0; i < n; i++) {
                const a = 2 * Math.PI * i / n, pts = trace(ch.x + .09 * Math.cos(a), ch.y + .09 * Math.sin(a), -1);
                if (pts.length < 2) continue; c.beginPath(); const p0 = w2p(pts[0].x, pts[0].y); c.moveTo(p0.x, p0.y);
                for (let j = 1; j < pts.length; j++) { const p = w2p(pts[j].x, pts[j].y); c.lineTo(p.x, p.y); }
                c.strokeStyle = 'rgba(0,200,255,0.35)'; c.lineWidth = 1.5; c.stroke();
            }
        }
    }

    function cacheEquipot() {
        const c = CC.eqx; c.clearRect(0, 0, CC.eqc.width, CC.eqc.height);
        const st = S.set.quality >= 2 ? 12 : 20, cols = Math.ceil(viewportW / st), rows = Math.ceil(viewportH / st);
        const grid = new Float32Array((cols + 1) * (rows + 1));
        for (let j = 0; j <= rows; j++)for (let i = 0; i <= cols; i++) { const w = p2w(i * st, j * st); grid[j * (cols + 1) + i] = eP(w.x, w.y); }
        const levels = []; for (let v = -5e5; v <= 5e5; v += 2.5e4)if (Math.abs(v) > 1e3) levels.push(v);
        for (let v = -2e4; v <= 2e4; v += 5e3)if (Math.abs(v) > 500) levels.push(v);
        c.lineWidth = 1; for (const lv of levels) {
            const t = Math.min(1, Math.abs(lv) / 3e5); c.strokeStyle = `rgba(255,214,0,${.15 + .35 * t})`; c.beginPath();
            for (let j = 0; j < rows; j++)for (let i = 0; i < cols; i++) {
                const idx = j * (cols + 1) + i;
                const v0 = grid[idx] - lv, v1 = grid[idx + 1] - lv, v2 = grid[(j + 1) * (cols + 1) + i + 1] - lv, v3 = grid[(j + 1) * (cols + 1) + i] - lv;
                const cd = (v0 > 0 ? 8 : 0) | (v1 > 0 ? 4 : 0) | (v2 > 0 ? 2 : 0) | (v3 > 0 ? 1 : 0); if (cd === 0 || cd === 15) continue;
                const x = i * st, y = j * st, edges = [];
                if ((cd & 12) !== 0 && (cd & 12) !== 12) edges.push([x + st * (-v0 / (v1 - v0)), y]);
                if ((cd & 6) !== 0 && (cd & 6) !== 6) edges.push([x + st, y + st * (-v1 / (v2 - v1))]);
                if ((cd & 3) !== 0 && (cd & 3) !== 3) edges.push([x + st * (-v3 / (v2 - v3)), y + st]);
                if ((cd & 9) !== 0 && (cd & 9) !== 9) edges.push([x, y + st * (-v0 / (v3 - v0))]);
                if (edges.length >= 2) { c.moveTo(edges[0][0], edges[0][1]); c.lineTo(edges[1][0], edges[1][1]); }
            } c.stroke();
        }
    }

    function cacheVectors() {
        const c = CC.vx; c.clearRect(0, 0, CC.vc.width, CC.vc.height);
        // On potato, use half the grid density
        const g = S.set.quality <= 0 ? Math.max(8, Math.round(S.set.arrowGrid * .6)) : S.set.arrowGrid;
        const sx = viewportW / g, sy = viewportH / g;
        for (let gx = 0; gx <= g; gx++)for (let gy = 0; gy <= g; gy++) {
            const px = gx * sx, py = gy * sy, w = p2w(px, py), e = eF(w.x, w.y), m = Math.hypot(e.x, e.y);
            if (m < 10) continue; const lm = Math.log10(m + 1), len = Math.min(sx * .45, lm * 5), a = Math.atan2(-e.y, e.x);
            const t = Math.min(1, lm / 8), rv = 118 + 137 * t | 0, gv = 255 - 100 * t | 0, bv = 3 + 50 * t | 0, al = .3 + .5 * t;
            c.save(); c.translate(px, py); c.rotate(a); c.beginPath(); c.moveTo(-len / 2, 0); c.lineTo(len / 2 - 4, 0);
            c.strokeStyle = `rgba(${rv},${gv},${bv},${al})`; c.lineWidth = 1.5; c.stroke();
            c.beginPath(); c.moveTo(len / 2, 0); c.lineTo(len / 2 - 5, -3); c.lineTo(len / 2 - 5, 3); c.closePath();
            c.fillStyle = `rgba(${rv},${gv},${bv},${al + .1})`; c.fill(); c.restore();
        }
    }

    // ═══ 3D POTENTIAL LANDSCAPE (filled quads, isometric, cached) ═══
    function cacheLandscape() {
        const c = CC.lx;
        c.clearRect(0, 0, CC.lc.width, CC.lc.height);
        const N = S.set.quality >= 2 ? 50 : 30, span = 3.5;
        const cx = viewportW / 2 + S.pan.x, cy = viewportH * 0.55 + S.pan.y;
        const sc = (viewportW / 12) * S.zoom;
        // Isometric projection: X goes right-down, Y goes left-down, Z goes up
        const iso = (wx, wy, h) => ({
            x: cx + (wx - wy) * sc * 0.87,
            y: cy + (wx + wy) * sc * 0.5 - h * sc * 3
        });
        // Height function with log compression
        const hFn = v => Math.sign(v) * Math.min(1.5, Math.log(Math.abs(v / 5e3) + 1) * 0.4);
        // Color function: deep blue (-) → dark gray (0) → red-orange (+)
        const colFn = v => {
            const vn = Math.max(-1, Math.min(1, v / 1.5e5));
            let rv, gv, bv;
            if (vn >= 0) {
                rv = 60 + 195 * vn | 0; gv = 25 + 80 * Math.pow(vn, 0.5) * (1 - vn * 0.5) | 0;
                bv = 40 * (1 - vn) | 0;
            } else {
                const t = -vn;
                rv = 20 * (1 - t) | 0; gv = 40 * (1 - t * 0.7) | 0;
                bv = 60 + 195 * t | 0;
            }
            return { rv, gv, bv };
        };
        // Build grid
        const grid = [];
        for (let i = 0; i <= N; i++) {
            grid[i] = [];
            for (let j = 0; j <= N; j++) {
                const wx = (i / N - .5) * span * 2, wy = (j / N - .5) * span * 2;
                const v = eP(wx, wy), h = hFn(v);
                grid[i][j] = { wx, wy, h, v, p: iso(wx, wy, h) };
            }
        }
        // Draw filled quads back-to-front (painter's algorithm)
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const g00 = grid[i][j], g10 = grid[i + 1][j], g11 = grid[i + 1][j + 1], g01 = grid[i][j + 1];
            const avgV = (g00.v + g10.v + g11.v + g01.v) / 4;
            const { rv, gv, bv } = colFn(avgV);
            // Filled quad
            c.beginPath();
            c.moveTo(g00.p.x, g00.p.y); c.lineTo(g10.p.x, g10.p.y);
            c.lineTo(g11.p.x, g11.p.y); c.lineTo(g01.p.x, g01.p.y);
            c.closePath();
            c.fillStyle = `rgba(${rv},${gv},${bv},0.7)`;
            c.fill();
            // Wireframe edges
            c.strokeStyle = `rgba(${Math.min(255, rv + 40)},${Math.min(255, gv + 40)},${Math.min(255, bv + 40)},0.25)`;
            c.lineWidth = 0.5;
            c.stroke();
        }
        // Charge markers on surface with glow
        for (const ch of S.charges) {
            const v = eP(ch.x, ch.y), h = hFn(v), p = iso(ch.x, ch.y, h);
            const col = ch.q > 0 ? '#00e5ff' : '#ff006e';
            const gc = ch.q > 0 ? 'rgba(0,229,255,' : 'rgba(255,0,110,';
            // Glow
            const gr = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
            gr.addColorStop(0, gc + '0.4)'); gr.addColorStop(1, gc + '0)');
            c.fillStyle = gr; c.fillRect(p.x - 25, p.y - 25, 50, 50);
            // Dot
            c.beginPath(); c.arc(p.x, p.y, 6, 0, Math.PI * 2);
            c.fillStyle = col; c.fill();
            c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5; c.stroke();
            // Label
            c.font = '10px "JetBrains Mono"'; c.textAlign = 'center';
            c.fillStyle = 'rgba(255,255,255,0.7)';
            c.fillText((ch.q > 0 ? '+' : '') + ch.q.toFixed(1) + ' μC', p.x, p.y - 12);
        }
        // Title
        c.font = '600 13px Inter'; c.textAlign = 'left'; c.fillStyle = 'rgba(255,255,255,0.25)';
        c.fillText('Paysage du potentiel V(x,y)', 16, 24);
        c.font = '10px Inter'; c.fillStyle = 'rgba(255,255,255,0.15)';
        c.fillText('↑ V > 0 (collines)   ↓ V < 0 (puits)', 16, 40);
    }

    // ═══ GAUSS'S LAW SURFACE ═══
    const EPS0 = 8.854e-12;
    function computeGauss(gx, gy, gr) {
        let flux = 0; const Ns = PERF.gaussSamples;
        for (let i = 0; i < Ns; i++) {
            const theta = 2 * Math.PI * i / Ns;
            const x = gx + gr * Math.cos(theta), y = gy + gr * Math.sin(theta), e = eF(x, y);
            flux += (e.x * Math.cos(theta) + e.y * Math.sin(theta)) * (2 * Math.PI * gr / Ns);
        }
        let qenc = 0; for (const c of S.charges) if (Math.hypot(c.x - gx, c.y - gy) < gr) qenc += c.q;
        return { flux, qenc, qencEps: qenc * MU / EPS0 };
    }
    function renderGauss() {
        if (!S.gauss) return; const g = S.gauss, p = w2p(g.x, g.y), rPx = g.r * SC * S.zoom;
        // Draw dashed circle
        ctx.beginPath(); ctx.arc(p.x, p.y, rPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(118,255,3,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -S.frame * .5; ctx.stroke(); ctx.setLineDash([]);
        // Fill
        const gf = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rPx);
        gf.addColorStop(0, 'rgba(118,255,3,0.04)'); gf.addColorStop(1, 'rgba(118,255,3,0.01)');
        ctx.fillStyle = gf; ctx.beginPath(); ctx.arc(p.x, p.y, rPx, 0, Math.PI * 2); ctx.fill();
        // Flux arrows
        const Ns = 16; for (let i = 0; i < Ns; i++) {
            const theta = 2 * Math.PI * i / Ns;
            const wx = g.x + g.r * Math.cos(theta), wy = g.y + g.r * Math.sin(theta);
            const e = eF(wx, wy), en = e.x * Math.cos(theta) + e.y * Math.sin(theta);
            const ap = w2p(wx, wy), aDir = en >= 0 ? theta : theta + Math.PI;
            const pixDir = Math.atan2(-Math.sin(aDir), Math.cos(aDir));
            const len = Math.min(18, Math.abs(en) * 1e-4);
            if (len > 1) arrow(ctx, ap.x + len * Math.cos(pixDir), ap.y + len * Math.sin(pixDir), pixDir, 4, en >= 0 ? 'rgba(118,255,3,0.6)' : 'rgba(255,100,100,0.6)');
        }
        // Update readout
        const res = computeGauss(g.x, g.y, g.r);
        DOM['gauss-flux'].textContent = fmtSI(res.flux, 'N·m²/C');
        DOM['gauss-qenc'].textContent = fmtSI(res.qencEps, 'N·m²/C');
        DOM['gauss-q'].textContent = res.qenc.toFixed(2) + ' μC';
        const err = res.qencEps !== 0 ? Math.abs((res.flux - res.qencEps) / res.qencEps * 100) : (Math.abs(res.flux) < 1 ? 0 : 100);
        DOM['gauss-verify'].textContent = err < 5 ? '✓ Vérifié (' + err.toFixed(1) + '%)' : '≈ ' + err.toFixed(1) + '% erreur';
        DOM['gauss-verify'].style.color = err < 5 ? '#76ff03' : err < 15 ? '#ffd600' : '#ff4444';
    }

    // ═══ UNDO/REDO ═══
    function saveHistory() {
        S.history = S.history.slice(0, S.historyIdx + 1);
        S.history.push(JSON.stringify(S.charges));
        if (S.history.length > 50) S.history.shift();
        S.historyIdx = S.history.length - 1;
    }
    function undo() { if (S.historyIdx > 0) { S.historyIdx--; S.charges = JSON.parse(S.history[S.historyIdx]); S.sel = null; hideEd(); markDirty(); updSt(); initP(); } }
    function redo() { if (S.historyIdx < S.history.length - 1) { S.historyIdx++; S.charges = JSON.parse(S.history[S.historyIdx]); S.sel = null; hideEd(); markDirty(); updSt(); initP(); } }
    function snapGrid(v) { return S.shiftKey ? Math.round(v * 4) / 4 : v; }

    let _cacheHash = '';
    function computeCacheHash() {
        return S.charges.map(c => c.x.toFixed(4) + c.y.toFixed(4) + c.q.toFixed(2)).join(',') + '|' +
            S.zoom.toFixed(4) + '|' + S.pan.x.toFixed(1) + ',' + S.pan.y.toFixed(1) + '|' +
            S.set.quality + '|' + S.set.density + '|' + S.set.arrowGrid;
    }
    function recomputeCache() {
        if (S.charges.length === 0) return;
        const h = computeCacheHash();
        if (h === _cacheHash) return;
        _cacheHash = h;
        if (S.viz.fieldlines || fieldFlowEnabled) cacheFieldLines(); if (S.viz.equipotential) cacheEquipot(); if (S.viz.vectors) cacheVectors();
        if (S.viz.landscape) cacheLandscape();
    }

    // ═══ WEBGL HEATMAP ═══
    function renderGL() {
        // Determine effective mode: when chromatic is on and no heatmap selected, use mode 5 (standalone chromatic)
        let effectiveMode = S.viz.heatmap;
        if (chromaticEnabled && effectiveMode === 0) effectiveMode = 5;
        if (!hasGL || effectiveMode === 0 || !S.charges.length) { if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } return; }
        gl.useProgram(prog); const d = pixelRatio;
        gl.uniform1i(uL.uN, S.charges.length); gl.uniform1i(uL.uMode, effectiveMode);
        gl.uniform2f(uL.uRes, glCanvas.width, glCanvas.height); gl.uniform2f(uL.uPan, S.pan.x * d, S.pan.y * d);
        gl.uniform1f(uL.uZoom, S.zoom); gl.uniform1f(uL.uScale, SC * d); gl.uniform1f(uL.uTime, S.frame * .016);
        gl.uniform1f(uL.uChromatic, chromaticEnabled ? 1.0 : 0.0);
        // Adaptive V scaling: scales with total |q| so colors stay vivid with many charges
        const totalAbsQ = S.charges.reduce((s, c) => s + Math.abs(c.q), 0);
        const vScale = Math.max(5e4, 1.5e4 * totalAbsQ);
        gl.uniform1f(uL.uVScale, vScale);
        const n = S.charges.length;
        for (let i = 0; i < n; i++) { const c = S.charges[i]; gl.uniform3f(uL['uC' + i], c.x, c.y, c.q); }
        gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // ═══ GRID ═══
    function isLightTheme() { return document.body.classList.contains('light-theme'); }
    function renderGrid() {
        const gs = SC * S.zoom, o = w2p(0, 0);
        const lt = isLightTheme();
        // Minor grid lines — skip on ultra-low tier
        if (S.set.quality >= 2 && !PERF.skipMinorGrid) {
            ctx.strokeStyle = lt ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.025)'; ctx.lineWidth = 0.5; ctx.beginPath();
            const halfGs = gs / 2;
            for (let x = (o.x % halfGs + halfGs) % halfGs; x < viewportW; x += halfGs) { ctx.moveTo(x, 0); ctx.lineTo(x, viewportH); }
            for (let y = (o.y % halfGs + halfGs) % halfGs; y < viewportH; y += halfGs) { ctx.moveTo(0, y); ctx.lineTo(viewportW, y); }
            ctx.stroke();
        }
        // Major grid lines
        ctx.strokeStyle = lt ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let x = (o.x % gs + gs) % gs; x < viewportW; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, viewportH); }
        for (let y = (o.y % gs + gs) % gs; y < viewportH; y += gs) { ctx.moveTo(0, y); ctx.lineTo(viewportW, y); } ctx.stroke();
        // Axis lines with subtle glow
        ctx.strokeStyle = lt ? 'rgba(0,119,182,0.12)' : 'rgba(0,229,255,0.06)'; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(o.x, 0); ctx.lineTo(o.x, viewportH); ctx.moveTo(0, o.y); ctx.lineTo(viewportW, o.y); ctx.stroke();
        // Origin dot
        ctx.beginPath(); ctx.arc(o.x, o.y, 3, 0, Math.PI * 2); ctx.fillStyle = lt ? 'rgba(0,119,182,0.2)' : 'rgba(0,229,255,0.12)'; ctx.fill();
    }

    // ═══ PARTICLES (per-frame, speed-scaled) ═══
    function initP() {
        S.particles = [];
        const n = Math.round(S.set.particleN * S.qualMult[S.set.quality]);
        for (let i = 0; i < n; i++)S.particles.push(mkP());
    }
    function mkP() {
        const pos = S.charges.filter(c => c.q > 0);
        if (pos.length && Math.random() < .7) {
            const c = pos[Math.random() * pos.length | 0]; const a = Math.random() * Math.PI * 2;
            return { x: c.x + (.12 + Math.random() * .2) * Math.cos(a), y: c.y + (.12 + Math.random() * .2) * Math.sin(a), life: 0, maxL: 120 + Math.random() * 200, spd: .6 + Math.random() * 1.4, trail: [] };
        }
        const w = p2w(Math.random() * viewportW, Math.random() * viewportH);
        return { x: w.x, y: w.y, life: Math.random() * 180, maxL: 120 + Math.random() * 200, spd: .6 + Math.random() * 1.4, trail: [] };
    }

    // Skip counter for potato mode — update particles every other frame
    let _particleSkip = 0;
    function updateP() {
        // On tier 0/1: skip every other frame for 2x speedup
        if (S.set.quality <= 1) { _particleSkip++; if (_particleSkip & 1) { _renderParticleCache(); return; } }
        const sp = S.set.speed;
        const invZ = 1 / (SC * S.zoom);
        const bxn = -viewportW * .5 * invZ - 1, bxx = viewportW * .5 * invZ + 1;
        const byn = -viewportH * .5 * invZ - 1, byx = viewportH * .5 * invZ + 1;
        const maxTrail = PERF.trailLen;
        const showTrails = !PERF.skipTrails;
        const showGlow = !PERF.skipGlow;
        // Batch: collect all dot positions and glow positions first
        const dots = _pDots, glows = _pGlows, trails = _pTrails;
        dots.length = 0; glows.length = 0; trails.length = 0;
        const chs = S.charges, nC = chs.length;
        for (let i = 0; i < S.particles.length; i++) {
            const p = S.particles[i]; p.life += sp;
            const e = eF(p.x, p.y), ex = e.x, ey = e.y;
            const m = Math.sqrt(ex * ex + ey * ey);
            if (m > 1e-3) { const ms = p.spd * .0075 * sp / m; p.x += ex * ms; p.y += ey * ms; }
            if (showTrails) { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > maxTrail) p.trail.shift(); }
            let sink = false;
            for (let ci = 0; ci < nC; ci++) {
                const c = chs[ci]; if (c.q >= 0) continue;
                const dx = p.x - c.x, dy = p.y - c.y;
                if (dx * dx + dy * dy < .0064) { sink = true; break; }
            }
            if (p.life > p.maxL || sink || p.x < bxn || p.x > bxx || p.y < byn || p.y > byx) { S.particles[i] = mkP(); continue; }
            const lr = p.life / p.maxL, al = lr < .1 ? lr * 10 : lr > .8 ? (1 - lr) * 5 : 1;
            if (al < 0.02) continue;
            const px = w2p(p.x, p.y);
            dots.push({ x: px.x, y: px.y, al });
            if (showGlow && al > .4) glows.push({ x: px.x, y: px.y, al });
            // Collect trail segments
            if (showTrails && p.trail.length > 2) {
                const t0 = w2p(p.trail[0].x, p.trail[0].y);
                const tPts = [t0];
                for (let j = 1; j < p.trail.length; j++) tPts.push(w2p(p.trail[j].x, p.trail[j].y));
                trails.push({ pts: tPts, al });
            }
        }
        // Draw all trails with gradient alpha
        if (showTrails) {
            for (const tr of trails) {
                if (tr.pts.length < 2) continue;
                const al = tr.al;
                ctx.beginPath();
                ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
                for (let j = 1; j < tr.pts.length; j++) ctx.lineTo(tr.pts[j].x, tr.pts[j].y);
                ctx.strokeStyle = `rgba(0,200,255,${0.06 + 0.12 * al})`; ctx.lineWidth = 1.5 + al;
                ctx.stroke();
            }
        }
        // Draw all dots in one batch
        ctx.fillStyle = 'rgba(0,220,255,0.75)';
        ctx.beginPath();
        for (const d of dots) { ctx.moveTo(d.x + 2, d.y); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); }
        ctx.fill();
        // Draw glows in one batch (outer glow) — skip on low-end
        if (showGlow && S.set.quality >= 1) {
            ctx.fillStyle = 'rgba(0,200,255,0.05)';
            ctx.beginPath();
            for (const g of glows) { ctx.moveTo(g.x + 5, g.y); ctx.arc(g.x, g.y, 5, 0, Math.PI * 2); }
            ctx.fill();
        }
        // Inner bright core — skip on ultra-low
        if (S.set.quality >= 1) {
            ctx.fillStyle = 'rgba(180,240,255,0.35)';
            ctx.beginPath();
            for (const d of dots) { if (d.al > 0.6) { ctx.moveTo(d.x + 1, d.y); ctx.arc(d.x, d.y, 1, 0, Math.PI * 2); } }
            ctx.fill();
        }
    }
    // Particle render cache for frame-skipping
    const _pDots = [], _pGlows = [], _pTrails = [];
    function _renderParticleCache() {
        // Re-draw last computed positions without recalculating physics
        const showTrails = !PERF.skipTrails, showGlow = !PERF.skipGlow;
        if (showTrails) {
            for (const tr of _pTrails) {
                if (tr.pts.length < 2) continue;
                ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
                for (let j = 1; j < tr.pts.length; j++) ctx.lineTo(tr.pts[j].x, tr.pts[j].y);
                ctx.strokeStyle = `rgba(0,200,255,${0.06 + 0.12 * tr.al})`; ctx.lineWidth = 1.5 + tr.al; ctx.stroke();
            }
        }
        ctx.fillStyle = 'rgba(0,220,255,0.75)'; ctx.beginPath();
        for (const d of _pDots) { ctx.moveTo(d.x + 2, d.y); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); }
        ctx.fill();
    }

    // ═══ ARCS ═══
    function genArc(x1, y1, x2, y2, d, dp) {
        if (dp <= 0 || d < 1) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        const mx = (x1 + x2) / 2 + (Math.random() - .5) * d, my = (y1 + y2) / 2 + (Math.random() - .5) * d;
        const l = genArc(x1, y1, mx, my, d * .55, dp - 1), r = genArc(mx, my, x2, y2, d * .55, dp - 1); return [...l.slice(0, -1), ...r];
    }
    function updateArcs() {
        S.arcT++;
        const freq = S.set.quality <= 0 ? PERF.arcFreq * 3 : PERF.arcFreq;
        if (S.arcT % freq !== 0) return; S.arcCache = [];
        const maxDepth = S.set.quality <= 0 ? Math.max(2, PERF.arcDepth - 1) : PERF.arcDepth;
        for (let i = 0; i < S.charges.length; i++)for (let j = i + 1; j < S.charges.length; j++) {
            const a = S.charges[i], b = S.charges[j]; if (a.q * b.q >= 0) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 3) continue;
            const pa = w2p(a.x, a.y), pb = w2p(b.x, b.y), dp = Math.max(10, 40 * (1 - d / 3));
            S.arcCache.push({ pts: genArc(pa.x, pa.y, pb.x, pb.y, dp, maxDepth), i: 1 - d / 3 });
        }
    }
    function renderArcs() {
        const layers = S.set.quality >= 2 ? [[6, .08], [1.5, .35], [.5, .5]] : [[2, .3], [.5, .5]];  // fewer passes on low-end
        for (const a of S.arcCache) {
            if (a.pts.length < 2) continue;
            for (const [w, al] of layers) {
                ctx.beginPath(); ctx.moveTo(a.pts[0].x, a.pts[0].y);
                for (let i = 1; i < a.pts.length; i++)ctx.lineTo(a.pts[i].x, a.pts[i].y);
                ctx.strokeStyle = w > .5 ? `rgba(${w > 2 ? 100 : 180},${w > 2 ? 200 : 230},255,${al * a.i})` : `rgba(255,255,255,${al * a.i})`; ctx.lineWidth = w; ctx.stroke();
            }
        }
    }

    // ═══ SPAWN FX (skipped on potato tier) ═══
    function addFX(x, y, pos) {
        if (PERF.skipSpawnFX) return;  // skip completely on potato
        const nRings = S.set.quality >= 2 ? 3 : 2;
        const nDots = S.set.quality >= 2 ? 12 : 6;
        for (let i = 0; i < nRings; i++) S.spawnFX.push({ t: 'r', x, y, r: 0, mr: 60 + i * 25, l: 0, ml: 30 + i * 10, c: pos ? '0,229,255' : '255,0,110' });
        for (let i = 0; i < nDots; i++) {
            const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
            S.spawnFX.push({ t: 'd', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 0, ml: 20 + Math.random() * 15, c: pos ? '0,229,255' : '255,0,110' });
        }
    }
    function updateFX() {
        for (let i = S.spawnFX.length - 1; i >= 0; i--) {
            const f = S.spawnFX[i]; f.l++;
            if (f.l > f.ml) { S.spawnFX.splice(i, 1); continue; } const al = 1 - f.l / f.ml;
            if (f.t === 'r') { f.r += (f.mr - f.r) * .15; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${f.c},${al * .4})`; ctx.lineWidth = 2; ctx.stroke(); }
            else { f.x += f.vx; f.y += f.vy; f.vx *= .95; f.vy *= .95; ctx.beginPath(); ctx.arc(f.x, f.y, 2 * al, 0, Math.PI * 2); ctx.fillStyle = `rgba(${f.c},${al * .7})`; ctx.fill(); }
        }
    }

    // ═══ TEST CHARGE ═══
    function updateTC() {
        const chs = S.charges, nC = chs.length;
        const maxTrail = S.set.quality <= 0 ? 200 : 500;
        for (const tc of S.testCharges) {
            const e = eF(tc.x, tc.y), ex = e.x, ey = e.y;
            const m = Math.sqrt(ex * ex + ey * ey);
            if (m > 1e-3) { const sp = Math.min(.015, m * 1e-7) * S.set.speed; const inv = sp / m; tc.x += ex * inv; tc.y += ey * inv; }
            tc.trail.push({ x: tc.x, y: tc.y }); if (tc.trail.length > maxTrail) tc.trail.shift();
            let kill = false;
            for (let ci = 0; ci < nC; ci++) {
                const c = chs[ci]; if (c.q >= 0) continue;
                const dx = tc.x - c.x, dy = tc.y - c.y;
                if (dx * dx + dy * dy < .01) { kill = true; break; }
            }
            if (kill) { tc.dead = true; continue; }
            // Batched trail drawing
            if (tc.trail.length > 2) {
                ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,200,0,0.3)';
                ctx.beginPath();
                const tp0 = w2p(tc.trail[0].x, tc.trail[0].y);
                ctx.moveTo(tp0.x, tp0.y);
                for (let i = 1; i < tc.trail.length; i++) {
                    const tp = w2p(tc.trail[i].x, tc.trail[i].y);
                    ctx.lineTo(tp.x, tp.y);
                }
                ctx.stroke();
            }
            const p = w2p(tc.x, tc.y); ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,200,0,0.8)'; ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]); ctx.lineDashOffset = -S.frame; ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,200,0,0.6)'; ctx.fill();
        }
        S.testCharges = S.testCharges.filter(t => !t.dead);
    }

    // ═══ FORCE VECTORS ═══
    function renderForces() {
        for (let i = 0; i < S.charges.length; i++)for (let j = i + 1; j < S.charges.length; j++) {
            const a = S.charges[i], b = S.charges[j], dx = b.x - a.x, dy = b.y - a.y, r = Math.hypot(dx, dy); if (r < MR) continue;
            const F = K * a.q * MU * b.q * MU / (r * r), pa = w2p(a.x, a.y), pb = w2p(b.x, b.y), ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
            const len = Math.min(35, Math.log10(Math.abs(F) + 1) * 6), dir = F < 0 ? 1 : -1;
            for (const [pt, an] of [[pa, dir > 0 ? ang : ang + Math.PI], [pb, dir > 0 ? ang + Math.PI : ang]]) {
                ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt.x + len * Math.cos(an), pt.y + len * Math.sin(an));
                ctx.strokeStyle = 'rgba(255,136,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
                arrow(ctx, pt.x + len * Math.cos(an), pt.y + len * Math.sin(an), an, 5, 'rgba(255,136,0,0.7)');
            }
            const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2; ctx.font = '9px "JetBrains Mono"'; ctx.fillStyle = 'rgba(255,136,0,0.5)';
            ctx.textAlign = 'center'; ctx.fillText(fmtSI(Math.abs(F), 'N'), mx, my - 6);
        }
    }

    // ═══ CHARGES (quality-adaptive rendering) ═══
    function renderCh() {
        const highQ = S.set.quality >= 2;
        const medQ = S.set.quality >= 1;
        for (let i = 0; i < S.charges.length; i++) {
            const ch = S.charges[i], px = w2p(ch.x, ch.y);
            const pos = ch.q > 0, sel = S.sel === i, col = pos ? '#00e5ff' : '#ff006e', gc = pos ? 'rgba(0,229,255,' : 'rgba(255,0,110,';
            const sc = Math.min(2, .6 + Math.abs(ch.q) * .15), rad = CR * sc;
            if (highQ) {
                // Full premium glow (only on high-end)
                const pulse = .5 + .5 * Math.sin(S.frame * .03 + i * 1.5);
                const gr0 = ctx.createRadialGradient(px.x, px.y, rad * .2, px.x, px.y, rad * 5);
                gr0.addColorStop(0, gc + (.15 + .08 * pulse) + ')'); gr0.addColorStop(.4, gc + (.05 + .03 * pulse) + ')'); gr0.addColorStop(1, gc + '0)');
                ctx.fillStyle = gr0; ctx.fillRect(px.x - rad * 5, px.y - rad * 5, rad * 10, rad * 10);
                const gr = ctx.createRadialGradient(px.x, px.y, rad * .3, px.x, px.y, rad * 3);
                gr.addColorStop(0, gc + (.4 + .2 * pulse) + ')'); gr.addColorStop(.5, gc + (.1 + .06 * pulse) + ')'); gr.addColorStop(1, gc + '0)');
                ctx.fillStyle = gr; ctx.fillRect(px.x - rad * 3, px.y - rad * 3, rad * 6, rad * 6);
            } else if (medQ) {
                // Medium: single simple glow circle
                ctx.beginPath(); ctx.arc(px.x, px.y, rad * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = gc + '0.08)'; ctx.fill();
            }
            // else: no glow at all on potato
            if (sel) {
                ctx.beginPath(); ctx.arc(px.x, px.y, rad + 8, 0, Math.PI * 2); ctx.strokeStyle = col; ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]); ctx.lineDashOffset = -S.frame * .5; ctx.stroke(); ctx.setLineDash([]);
            }
            // Main body: simple gradient on medium+, flat circle on potato
            if (medQ) {
                const mg = ctx.createRadialGradient(px.x - rad * .25, px.y - rad * .25, 0, px.x, px.y, rad);
                mg.addColorStop(0, pos ? '#66f5ff' : '#ff6099'); mg.addColorStop(.5, col); mg.addColorStop(1, pos ? '#007888' : '#8a003a');
                ctx.beginPath(); ctx.arc(px.x, px.y, rad, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
            } else {
                // Potato: flat colored circle, no gradients at all
                ctx.beginPath(); ctx.arc(px.x, px.y, rad, 0, Math.PI * 2);
                ctx.fillStyle = col; ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke();
            }
            if (highQ) {
                // Specular highlight only on high quality
                const hl = ctx.createRadialGradient(px.x - rad * .3, px.y - rad * .35, 0, px.x - rad * .15, px.y - rad * .2, rad * .6);
                hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(px.x, px.y, rad, 0, Math.PI * 2); ctx.fill();
            }
            // Sign label
            ctx.fillStyle = '#fff'; ctx.font = `bold ${12 * sc | 0}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(pos ? '+' : '−', px.x, px.y + 1);
            // Color-blind indicators only on medium+
            if (medQ) {
                ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
                if (pos) {
                    ctx.beginPath();
                    ctx.moveTo(px.x, px.y - rad - 2); ctx.lineTo(px.x + 4, px.y - rad - 6);
                    ctx.lineTo(px.x, px.y - rad - 10); ctx.lineTo(px.x - 4, px.y - rad - 6);
                    ctx.closePath(); ctx.stroke();
                } else {
                    ctx.strokeRect(px.x - 3, px.y - rad - 9, 6, 6);
                }
            }
            ctx.font = '10px "JetBrains Mono"'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText((ch.q > 0 ? '+' : '') + ch.q.toFixed(1) + ' μC', px.x, px.y + rad + 14);
        }
    }

    // ═══ PROBE ═══
    function renderPr() {
        if (S.tool !== 'probe') return; const mx = S.mouse.x, my = S.mouse.y;
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath();
        ctx.moveTo(mx, 0); ctx.lineTo(mx, viewportH); ctx.moveTo(0, my); ctx.lineTo(viewportW, my); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,229,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        const w = p2w(mx, my), e = eF(w.x, w.y), em = Math.hypot(e.x, e.y);
        if (em > 10) {
            const al = Math.atan2(-e.y, e.x), len = Math.min(60, Math.log10(em) * 12), ex = mx + len * Math.cos(al), ey = my + len * Math.sin(al);
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ex, ey); const vg = ctx.createLinearGradient(mx, my, ex, ey);
            vg.addColorStop(0, 'rgba(0,229,255,0.8)'); vg.addColorStop(1, 'rgba(170,0,255,0.8)'); ctx.strokeStyle = vg; ctx.lineWidth = 2.5; ctx.stroke();
            arrow(ctx, ex, ey, al, 8, 'rgba(170,0,255,0.9)');
        }
    }

    // ═══ BLOOM ═══
    function renderBloom() {
        if (PERF.skipBloom && S.set.quality <= 0) return; // Hard skip on ultra-low
        const div = (S.set.quality <= 1 ? Math.max(PERF.bloomDownscale, 10) : PERF.bloomDownscale);
        const w = Math.ceil(viewportW / div), h = Math.ceil(viewportH / div);
        if (w < 4 || h < 4) return;
        // Only resize bloom canvas if needed
        if (CC.bc.width !== w || CC.bc.height !== h) { CC.bc.width = w; CC.bc.height = h; }
        CC.bx.clearRect(0, 0, w, h); CC.bx.drawImage(canvas, 0, 0, w, h);
        const blurPx = S.set.quality >= 2 ? '6px' : '4px';
        CC.bx.filter = `blur(${blurPx})`; CC.bx.drawImage(CC.bc, 0, 0); CC.bx.filter = 'none';
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .3; ctx.drawImage(CC.bc, 0, 0, viewportW, viewportH);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.restore();
    }

    // ═══ AUTO-ADAPT (aggressive: targets 30fps minimum, reacts faster on potato) ═══
    let adaptT = 0, lowFpsStreak = 0;
    function autoAdapt() {
        if (!S.set.autoAdapt) return;
        adaptT++;
        const checkInterval = S.set.quality <= 1 ? 10 : 15;  // check more often on low-end
        if (adaptT % checkInterval !== 0) return;

        if (S.fps < 20) {
            // EMERGENCY: fps critically low
            lowFpsStreak += 2;
            if (S.set.quality > 0) { S.set.quality = 0; applyQuality(); S.dirty = true; }
            if (S.viz.bloom) { S.viz.bloom = false; const el = document.getElementById('viz-bloom'); if (el) el.checked = false; }
            if (S.viz.arcs) { S.viz.arcs = false; const el = document.getElementById('viz-arcs'); if (el) el.checked = false; }
            if (S.set.particleN > 50) { S.set.particleN = Math.max(30, S.set.particleN - 80); initP(); }
        } else if (S.fps < 28) {
            lowFpsStreak++;
            if (S.set.quality > 0) { S.set.quality--; applyQuality(); S.dirty = true; }
            else if (lowFpsStreak > 2) {
                if (S.set.particleN > 50) { S.set.particleN = Math.max(30, S.set.particleN - 40); initP(); }
                if (S.viz.bloom) { S.viz.bloom = false; const el = document.getElementById('viz-bloom'); if (el) el.checked = false; }
                if (S.viz.arcs && lowFpsStreak > 4) { S.viz.arcs = false; const el = document.getElementById('viz-arcs'); if (el) el.checked = false; }
                lowFpsStreak = 0;
            }
        } else if (S.fps > 58 && S.set.quality < 3) {
            lowFpsStreak = 0;
            S.set.quality++; applyQuality(); S.dirty = true;
        } else {
            lowFpsStreak = Math.max(0, lowFpsStreak - 1);
        }
    }
    function applyQuality() {
        DOM['setting-quality'].value = S.set.quality;
        DOM['val-quality'].textContent = S.qualNames[S.set.quality];
    }

    // ═══ MAIN LOOP (optimized with frame budget & static-frame skip) ═══
    let lastT = performance.now(), frameBudgetOver = false;
    let _staticFrames = 0;  // count frames where nothing animates
    function render(t) {
        const frameStart = performance.now();
        updateViewport();
        const dt = (t - lastT) / 1e3; lastT = t; S.frame++;
        S.fpsF++; if (t - S.fpsT > 500) {
            S.fps = Math.round(S.fpsF / ((t - S.fpsT) / 1e3));
            DOM['status-fps'].textContent = S.fps + ' fps'; S.fpsT = t; S.fpsF = 0;
        }
        // Smooth zoom interpolation
        const zoomDelta = Math.abs(zoomTarget - S.zoom);
        if (zoomDelta > 0.001) {
            zoomVelocity += (zoomTarget - S.zoom) * ZOOM_SPRING;
            zoomVelocity *= ZOOM_DAMP;
            S.zoom += zoomVelocity;
            markDirty();
            if (DOM['zoom-display']) DOM['zoom-display'].textContent = Math.round(S.zoom * 100) + '%';
        } else { S.zoom = zoomTarget; zoomVelocity = 0; }
        autoAdapt();
        // Static scene detection: if no particles, arcs, test charges, or animations, skip re-rendering
        const hasAnim = S.viz.particles || S.viz.arcs || S.testCharges.length > 0 || S.freeCharge || S.spawnFX.length > 0 || zoomDelta > 0.001;
        if (!hasAnim && !S.dirty && _staticFrames > 2) {
            // Skip render entirely — scene is static
            requestAnimationFrame(render); return;
        }
        if (!hasAnim) _staticFrames++; else _staticFrames = 0;
        ctx.clearRect(0, 0, viewportW, viewportH);
        renderGL();
        if (S.charges.length > 0) {
            if (S.dirty) { recomputeCache(); S.dirty = false; }
            if (S.viz.landscape) {
                // 3D mode: exclusive view — only landscape + charges
                ctx.drawImage(CC.lc, 0, 0);
            } else {
                renderGrid();
                if (S.viz.equipotential) ctx.drawImage(CC.eqc, 0, 0);
                if (S.viz.fieldlines) ctx.drawImage(CC.flc, 0, 0);
                if (S.viz.vectors) ctx.drawImage(CC.vc, 0, 0);
                if (S.viz.arcs && !frameBudgetOver) { updateArcs(); renderArcs(); }
                if (S.viz.particles) updateP();
                updateTC();
                if (S.viz.forces) renderForces();
                renderCh(); renderPr(); if (S.viz.superposition && S.tool !== 'probe') renderSuperposition(); renderGauss(); renderWork(); updateFreeCharge(dt); updateFX();
                if (S.viz.bloom && S.set.quality >= 1 && !frameBudgetOver) renderBloom();
            }
            if (S.tool === 'probe') {
                const w = p2w(S.mouse.x, S.mouse.y), e = eF(w.x, w.y), v = eP(w.x, w.y), em = Math.hypot(e.x, e.y);
                DOM['probe-pos'].textContent = `(${w.x.toFixed(2)}, ${w.y.toFixed(2)}) m`;
                DOM['probe-e'].textContent = fmtSI(em, 'N/C'); DOM['probe-v'].textContent = fmtSI(v, 'V');
                DOM['probe-dir'].textContent = (Math.atan2(e.y, e.x) * 180 / Math.PI).toFixed(1) + '°';
            }
            if (S.frame % 30 === 0) {
                DOM['readout-energy'].textContent = fmtSI(sysE(), 'J');
                DOM['readout-totalq'].textContent = S.charges.reduce((s, c) => s + c.q, 0).toFixed(1) + ' μC';
                updateCoulombPanel();
                updateCapacitorPanel();
            }
        } else {
            renderGrid();
            // Animated empty state with breathing pulse
            const pulse = 0.5 + 0.5 * Math.sin(S.frame * 0.02);
            const bPulse = 0.04 + 0.025 * pulse;
            // Pulsing ring
            ctx.beginPath(); ctx.arc(viewportW / 2, viewportH / 2, 50 + 10 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,229,255,${0.04 + 0.03 * pulse})`; ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 6]); ctx.lineDashOffset = -S.frame * 0.3; ctx.stroke(); ctx.setLineDash([]);
            // Icon hint
            ctx.save(); ctx.globalAlpha = bPulse * 3;
            ctx.font = '600 18px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(0,229,255,0.5)';
            ctx.fillText('⊕', viewportW / 2, viewportH / 2 - 2);
            ctx.restore();
            // Text
            const lt = isLightTheme();
            ctx.fillStyle = lt ? `rgba(0,0,0,${bPulse * 2})` : `rgba(255,255,255,${bPulse})`; ctx.font = '500 16px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Cliquez pour placer des charges', viewportW / 2, viewportH / 2 + 40);
            ctx.font = '400 11px Inter'; ctx.fillStyle = lt ? `rgba(0,0,0,${bPulse * 1.2})` : `rgba(255,255,255,${bPulse * 0.6})`;
            ctx.fillText('Sélectionnez un outil (2/3) ou un préréglage dans la barre latérale', viewportW / 2, viewportH / 2 + 58);
        }
        // Frame budget guard: if this frame took > 18ms, skip expensive stuff next frame
        const frameTime = performance.now() - frameStart;
        frameBudgetOver = frameTime > 18;
        // On potato, also force-skip if frame > 25ms
        if (S.set.quality <= 0 && frameTime > 25) frameBudgetOver = true;
        // Run post-render hooks (mirror plane, snap grid, field flow, etc.)
        for (let hi = 0; hi < postRenderHooks.length; hi++) {
            try { postRenderHooks[hi](); } catch (e) { console.warn('PostRender hook error:', e); }
        }
        requestAnimationFrame(render);
    }

    // ═══ INTERACTION ═══
    function updSt() {
        DOM['status-charges'].textContent = S.charges.length + ' charge' + (S.charges.length !== 1 ? 's' : '');
        const m = []; if (S.viz.fieldlines) m.push('Lignes'); if (S.viz.heatmap) m.push('GPU'); if (S.viz.vectors) m.push('Vecteurs');
        if (S.viz.equipotential) m.push('Équipot.'); if (S.viz.particles) m.push('Part.'); if (S.viz.arcs) m.push('Arcs'); if (S.viz.forces) m.push('Forces');
        DOM['status-mode'].textContent = m.join('+') || 'Aucun';
    }
    function chAt(px, py) {
        for (let i = S.charges.length - 1; i >= 0; i--) {
            const c = S.charges[i], p = w2p(c.x, c.y);
            const sc = Math.min(2, .6 + Math.abs(c.q) * .15), hr = CR * sc + 6; if ((px - p.x) ** 2 + (py - p.y) ** 2 < hr * hr) return i;
        } return -1;
    }
    function markDirty() { S.dirty = true; }

    // ═══ WORK CALCULATOR (W = q·ΔV) ═══
    function renderWork() {
        if (!S.workA) return;
        const pA = w2p(S.workA.x, S.workA.y);
        // Draw point A
        ctx.beginPath(); ctx.arc(pA.x, pA.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffab00'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,171,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = '600 11px "JetBrains Mono"'; ctx.fillStyle = '#ffab00'; ctx.textAlign = 'center';
        ctx.fillText('A', pA.x, pA.y - 10);

        if (S.workB) {
            const pB = w2p(S.workB.x, S.workB.y);
            // Draw point B
            ctx.beginPath(); ctx.arc(pB.x, pB.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffab00'; ctx.fill();
            ctx.strokeStyle = 'rgba(255,171,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#ffab00'; ctx.textAlign = 'center';
            ctx.fillText('B', pB.x, pB.y - 10);
            // Dashed line A→B
            ctx.beginPath(); ctx.setLineDash([6, 4]); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = 'rgba(255,171,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
            // Arrow
            const ang = Math.atan2(pB.y - pA.y, pB.x - pA.x);
            arrow(ctx, pB.x, pB.y, ang, 7, 'rgba(255,171,0,0.7)');
        } else if (S.tool === 'work') {
            // Preview line to mouse
            const mx = S.mouse.x, my = S.mouse.y;
            ctx.beginPath(); ctx.setLineDash([4, 4]); ctx.moveTo(pA.x, pA.y); ctx.lineTo(mx, my);
            ctx.strokeStyle = 'rgba(255,171,0,0.25)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
        }
    }

    function computeWork() {
        if (!S.workA || !S.workB) return;
        const vA = eP(S.workA.x, S.workA.y), vB = eP(S.workB.x, S.workB.y);
        const dV = vB - vA, q = 1e-6, W = q * dV;
        DOM['work-va'].textContent = fmtSI(vA, 'V');
        DOM['work-vb'].textContent = fmtSI(vB, 'V');
        DOM['work-dv'].textContent = fmtSI(dV, 'V');
        DOM['work-w'].textContent = fmtSI(W, 'J');
        DOM['work-readout'].style.display = 'flex';
    }

    // ═══ FREE CHARGE TRAJECTORY ═══
    function updateFreeCharge(dt) {
        if (!S.freeCharge) return;
        const fc = S.freeCharge;
        const dtSim = Math.min(dt, 0.02) * S.set.speed;
        // Verlet: a = F/m = qE/m (use m = 1e-9 kg for visible motion)
        const e = eF(fc.x, fc.y), m = 1e-9, q = fc.q * MU;
        const ax = q * e.x / m, ay = q * e.y / m;
        fc.vx += ax * dtSim; fc.vy += ay * dtSim;
        // Limit speed
        const spd = Math.hypot(fc.vx, fc.vy);
        if (spd > 50) { fc.vx *= 50 / spd; fc.vy *= 50 / spd; }
        fc.x += fc.vx * dtSim; fc.y += fc.vy * dtSim;
        fc.t += dtSim;
        // Trail
        if (S.frame % 2 === 0) S.freeTrail.push({ x: fc.x, y: fc.y, t: fc.t });
        if (S.freeTrail.length > 500) S.freeTrail.shift();
        // Check bounds
        if (Math.abs(fc.x) > 10 || Math.abs(fc.y) > 10) {
            S.freeCharge = null; S.freeTrail = [];
            DOM['freecharge-readout'].style.display = 'none';
            return;
        }
        // Draw trail
        if (S.freeTrail.length > 1) {
            for (let i = 1; i < S.freeTrail.length; i++) {
                const p0 = w2p(S.freeTrail[i - 1].x, S.freeTrail[i - 1].y);
                const p1 = w2p(S.freeTrail[i].x, S.freeTrail[i].y);
                const alpha = 0.05 + 0.5 * (i / S.freeTrail.length);
                ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
                ctx.strokeStyle = `rgba(105,240,174,${alpha})`; ctx.lineWidth = 2; ctx.stroke();
            }
        }
        // Draw charge
        const p = w2p(fc.x, fc.y);
        if (S.set.quality >= 1) {
            const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
            gr.addColorStop(0, 'rgba(105,240,174,0.4)'); gr.addColorStop(1, 'rgba(105,240,174,0)');
            ctx.fillStyle = gr; ctx.fillRect(p.x - 18, p.y - 18, 36, 36);
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#69f0ae'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        // Velocity arrow
        const vLen = Math.min(30, spd * 0.5);
        if (vLen > 2) {
            const vAng = Math.atan2(fc.vy, fc.vx);
            ctx.beginPath(); ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + vLen * Math.cos(vAng), p.y - vLen * Math.sin(vAng));
            ctx.strokeStyle = 'rgba(105,240,174,0.6)'; ctx.lineWidth = 2; ctx.stroke();
            arrow(ctx, p.x + vLen * Math.cos(vAng), p.y - vLen * Math.sin(vAng), -vAng, 5, 'rgba(105,240,174,0.7)');
        }
        // Update readout
        if (S.frame % 10 === 0) {
            DOM['fc-pos'].textContent = `(${fc.x.toFixed(2)}, ${fc.y.toFixed(2)}) m`;
            DOM['fc-vel'].textContent = fmtSI(spd, 'm/s');
            const ek = 0.5 * m * spd * spd;
            DOM['fc-ek'].textContent = fmtSI(ek, 'J');
            let ep = 0;
            for (const c of S.charges) {
                const rr = Math.hypot(fc.x - c.x, fc.y - c.y);
                if (rr > MR) ep += K * q * c.q * MU / rr;
            }
            const etot = ek + ep;
            if (DOM['fc-ep']) DOM['fc-ep'].textContent = fmtSI(ep, 'J');
            if (DOM['fc-etot']) DOM['fc-etot'].textContent = fmtSI(etot, 'J');
        }
    }

    // ═══ COULOMB PANEL (auto when 2 charges) ═══
    function updateCoulombPanel() {
        const panel = DOM['coulomb-panel'];
        if (S.charges.length === 2) {
            const a = S.charges[0], b = S.charges[1];
            const r = Math.hypot(b.x - a.x, b.y - a.y);
            const F = K * Math.abs(a.q * MU) * Math.abs(b.q * MU) / (r * r);
            const type = (a.q * b.q < 0) ? 'Attractive' : 'Répulsive';
            DOM['coulomb-q1'].textContent = (a.q > 0 ? '+' : '') + a.q.toFixed(1) + ' μC';
            DOM['coulomb-q2'].textContent = (b.q > 0 ? '+' : '') + b.q.toFixed(1) + ' μC';
            DOM['coulomb-r'].textContent = r.toFixed(3) + ' m';
            DOM['coulomb-f'].textContent = fmtSI(F, 'N');
            DOM['coulomb-type'].textContent = type;
            // Step-by-step derivation
            const derivEl = document.getElementById('coulomb-derivation');
            if (derivEl) {
                const q1 = Math.abs(a.q * MU), q2 = Math.abs(b.q * MU);
                derivEl.innerHTML = `<div style="font-size:10px;color:var(--text-muted);line-height:1.6;margin-top:4px;font-family:'JetBrains Mono',monospace">`
                    + `F = k·|q₁·q₂|/r²<br>`
                    + `F = ${K.toExponential(2)} × ${q1.toExponential(2)} × ${q2.toExponential(2)} / (${r.toFixed(3)})²<br>`
                    + `F = ${K.toExponential(2)} × ${(q1 * q2).toExponential(2)} / ${(r * r).toExponential(2)}<br>`
                    + `<span style="color:#ff8800;font-weight:700">F = ${fmtSI(F, 'N')}</span></div>`;
            }
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    // ═══ CAPACITOR OVERLAY (auto on capacitor preset) ═══
    function updateCapacitorPanel() {
        const panel = DOM['capacitor-panel'];
        // Detect capacitor: at least 4 charges, separated into two groups by x
        if (S.charges.length >= 4) {
            const xs = S.charges.map(c => c.x).sort((a, b) => a - b);
            const xMin = xs[0], xMax = xs[xs.length - 1];
            const gap = xMax - xMin;
            if (gap > 0.5) {
                const midX = (xMin + xMax) / 2;
                const left = S.charges.filter(c => c.x < midX);
                const right = S.charges.filter(c => c.x >= midX);
                if (left.length >= 2 && right.length >= 2) {
                    // Check if they're roughly aligned (capacitor-like)
                    const leftX = left.reduce((s, c) => s + c.x, 0) / left.length;
                    const rightX = right.reduce((s, c) => s + c.x, 0) / right.length;
                    const d = Math.abs(rightX - leftX);
                    const vLeft = eP(leftX, 0), vRight = eP(rightX, 0);
                    const dV = Math.abs(vRight - vLeft);
                    const E = dV / d;
                    DOM['cap-dv'].textContent = fmtSI(dV, 'V');
                    DOM['cap-d'].textContent = d.toFixed(2) + ' m';
                    DOM['cap-e'].textContent = fmtSI(E, 'V/m');
                    panel.style.display = 'block';
                    return;
                }
            }
        }
        panel.style.display = 'none';
    }

    canvas.addEventListener('mousedown', e => {
        const r = container.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        if (e.button === 2) { return; } // Right-click handled by contextmenu for locking
        if (S.tool === 'pointer') {
            const i = chAt(mx, my);
            if (i >= 0 && S.charges[i].locked) { S.sel = i; showEd(i); return; } // Locked: select but don't drag
            if (i >= 0) { const p = w2p(S.charges[i].x, S.charges[i].y); S.drag = { ci: i, ox: p.x - mx, oy: p.y - my }; S.sel = i; showEd(i); canvas.style.cursor = 'grabbing'; }
            else { S.sel = null; hideEd(); S.drag = { pan: true, sx: mx, sy: my, px: S.pan.x, py: S.pan.y }; canvas.style.cursor = 'grabbing'; }
        }
        else if (S.tool === 'positive' || S.tool === 'negative') {
            const w = p2w(mx, my), q = S.tool === 'positive' ? 1 : -1;
            const sx = snapGrid(w.x), sy = snapGrid(w.y);
            S.charges.push({ x: sx, y: sy, q }); addFX(mx, my, q > 0); saveHistory(); markDirty(); updSt(); initP();
        }
        else if (S.tool === 'testcharge') { const w = p2w(mx, my); S.testCharges.push({ x: w.x, y: w.y, trail: [], dead: false }); addFX(mx, my, true); }
        else if (S.tool === 'gauss') { const w = p2w(mx, my); S.gaussDraw = { x: w.x, y: w.y }; }
        else if (S.tool === 'work') {
            const w = p2w(mx, my);
            if (!S.workA) {
                S.workA = { x: w.x, y: w.y }; S.workB = null;
                document.getElementById('work-readout').style.display = 'none';
            } else if (!S.workB) {
                S.workB = { x: w.x, y: w.y };
                computeWork();
            } else {
                S.workA = { x: w.x, y: w.y }; S.workB = null;
                document.getElementById('work-readout').style.display = 'none';
            }
        }
        else if (S.tool === 'freecharge') {
            const w = p2w(mx, my);
            S.freeCharge = { x: w.x, y: w.y, vx: 0, vy: 0, q: 1, t: 0 };
            S.freeTrail = [{ x: w.x, y: w.y, t: 0 }];
            document.getElementById('freecharge-readout').style.display = 'flex';
            addFX(mx, my, true);
        }
    });
    canvas.addEventListener('mousemove', e => {
        const r = container.getBoundingClientRect(); S.mouse.x = e.clientX - r.left; S.mouse.y = e.clientY - r.top;
        if (S.drag) {
            if (S.drag.pan) { S.pan.x = S.drag.px + (S.mouse.x - S.drag.sx); S.pan.y = S.drag.py + (S.mouse.y - S.drag.sy); markDirty(); }
            else {
                const np = { x: S.mouse.x + S.drag.ox, y: S.mouse.y + S.drag.oy }, w = p2w(np.x, np.y);
                S.charges[S.drag.ci].x = snapGrid(w.x); S.charges[S.drag.ci].y = snapGrid(w.y); markDirty();
            }
        }
        if (!S.drag && S.tool === 'pointer') canvas.style.cursor = chAt(S.mouse.x, S.mouse.y) >= 0 ? 'grab' : 'crosshair';
    });
    canvas.addEventListener('mouseup', () => {
        if (S.drag && !S.drag.pan) { saveHistory(); initP(); } S.drag = null;
        if (S.tool === 'pointer') canvas.style.cursor = 'crosshair';
        if (S.tool === 'gauss' && S.gaussDraw) {
            const w = p2w(S.mouse.x, S.mouse.y), r = Math.hypot(w.x - S.gaussDraw.x, w.y - S.gaussDraw.y);
            if (r > 0.05) {
                S.gauss = { x: S.gaussDraw.x, y: S.gaussDraw.y, r };
                document.getElementById('gauss-readout').style.display = 'flex';
            }
            else { S.gauss = null; document.getElementById('gauss-readout').style.display = 'none'; }
            S.gaussDraw = null;
        }
    });
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoomTarget = Math.max(.2, Math.min(5, zoomTarget * (e.deltaY > 0 ? .9 : 1.1))); }, { passive: false });
    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (e.shiftKey) return; // Shift+right-click handled by locking handler
        // Right-click on charge: delete if not locked
        const rect2 = container.getBoundingClientRect();
        const cx2 = e.clientX - rect2.left, cy2 = e.clientY - rect2.top;
        const ci2 = chAt(cx2, cy2);
        if (ci2 >= 0 && !S.charges[ci2].locked) {
            S.charges.splice(ci2, 1); S.sel = null; hideEd(); saveHistory(); markDirty(); updSt(); initP();
        }
    });

    function showEd(i) {
        const c = S.charges[i], p = w2p(c.x, c.y); chargeEditor.style.display = 'flex';
        chargeEditor.style.left = Math.min(p.x + 30, container.getBoundingClientRect().width - 280) + 'px';
        chargeEditor.style.top = Math.max(10, p.y - 50) + 'px'; document.getElementById('charge-slider').value = c.q;
        document.getElementById('charge-value').textContent = (c.q > 0 ? '+' : '') + c.q.toFixed(1) + ' μC';
    }
    function hideEd() { chargeEditor.style.display = 'none'; }

    document.getElementById('charge-slider').addEventListener('input', e => {
        if (S.sel === null) return; const v = +e.target.value; if (!v) return;
        S.charges[S.sel].q = v; document.getElementById('charge-value').textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' μC'; markDirty(); initP();
    });
    document.getElementById('btn-delete-charge').addEventListener('click', () => { if (S.sel !== null) { S.charges.splice(S.sel, 1); S.sel = null; hideEd(); markDirty(); updSt(); initP(); } });
    document.getElementById('btn-close-editor').addEventListener('click', () => { S.sel = null; hideEd(); });

    document.querySelectorAll('.tool-btn').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(x => x.classList.remove('active')); b.classList.add('active');
        S.tool = b.dataset.tool; S.sel = null; hideEd(); probeReadout.style.display = S.tool === 'probe' ? 'flex' : 'none';
        if (S.tool !== 'gauss') { S.gauss = null; S.gaussDraw = null; document.getElementById('gauss-readout').style.display = 'none'; }
        if (S.tool !== 'work') { S.workA = null; S.workB = null; document.getElementById('work-readout').style.display = 'none'; }
        if (S.tool !== 'freecharge') { S.freeCharge = null; S.freeTrail = []; document.getElementById('freecharge-readout').style.display = 'none'; }
        canvas.style.cursor = S.tool === 'probe' ? 'none' : ['positive', 'negative', 'testcharge', 'gauss', 'work', 'freecharge'].includes(S.tool) ? 'cell' : 'crosshair';
    }));

    const presets = {
        dipole: [{ x: -.8, y: 0, q: 2 }, { x: .8, y: 0, q: -2 }],
        capacitor: (() => { const c = []; for (let i = -3; i <= 3; i++) { c.push({ x: -1.5, y: i * .35, q: 1 }, { x: 1.5, y: i * .35, q: -1 }); } return c; })(),
        quadrupole: [{ x: -.7, y: .7, q: 2 }, { x: .7, y: .7, q: -2 }, { x: -.7, y: -.7, q: -2 }, { x: .7, y: -.7, q: 2 }],
        triangle: [{ x: 0, y: .8, q: 2 }, { x: -.7, y: -.4, q: -2 }, { x: .7, y: -.4, q: 2 }],
        ring: (() => { const c = []; for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8; c.push({ x: .9 * Math.cos(a), y: .9 * Math.sin(a), q: i % 2 ? -1.5 : 1.5 }); } return c; })(),
        random: null,
        faraday: (() => { const c = []; for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; c.push({ x: 1.2 * Math.cos(a), y: 1.2 * Math.sin(a), q: -1 }); } return c; })()
    };
    function generateRandom() {
        const c = []; for (let i = 0; i < 6; i++) c.push({ x: (Math.random() - .5) * 3, y: (Math.random() - .5) * 2, q: Math.round((Math.random() * 4 - 2) * 2) / 2 || 1 });
        return c;
    }
    document.querySelectorAll('.preset-btn').forEach(b => b.addEventListener('click', () => {
        const n = b.dataset.preset;
        if (n === 'random') { presets.random = generateRandom(); }
        if (!presets[n]) return;
        canvas.style.transition = 'opacity 0.3s'; canvas.style.opacity = '0'; glCanvas.style.transition = 'opacity 0.3s'; glCanvas.style.opacity = '0';
        setTimeout(() => {
            S.charges = presets[n].map(c => ({ ...c })); S.sel = null; S.testCharges = []; hideEd(); S.pan = { x: 0, y: 0 }; zoomTarget = 1; S.zoom = 1; zoomVelocity = 0;
            markDirty(); updSt(); initP(); canvas.style.opacity = '1'; glCanvas.style.opacity = '1';
            S.charges.forEach(c => { const p = w2p(c.x, c.y); addFX(p.x, p.y, c.q > 0); });
        }, 300);
    }));

    const vizMap = {
        'viz-fieldlines': 'fieldlines', 'viz-vectors': 'vectors', 'viz-equipotential': 'equipotential',
        'viz-particles': 'particles', 'viz-arcs': 'arcs', 'viz-bloom': 'bloom', 'viz-forces': 'forces', 'viz-landscape': 'landscape', 'viz-superposition': 'superposition'
    };
    for (const [id, key] of Object.entries(vizMap)) {
        const el = document.getElementById(id); if (el) el.addEventListener('change', e => {
            S.viz[key] = e.target.checked; markDirty(); updSt(); if (key === 'particles' && e.target.checked) initP();
        });
    }
    document.querySelectorAll('input[name="heatmap-mode"]').forEach(r => r.addEventListener('change', e => {
        S.viz.heatmap = +e.target.value; updSt(); if (!S.viz.heatmap && gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    }));

    document.getElementById('setting-quality').addEventListener('input', e => {
        S.set.quality = +e.target.value;
        document.getElementById('val-quality').textContent = S.qualNames[S.set.quality]; markDirty(); initP();
    });
    document.getElementById('setting-speed').addEventListener('input', e => {
        S.set.speed = +e.target.value;
        document.getElementById('val-speed').textContent = S.set.speed.toFixed(1) + '×';
    });
    document.getElementById('setting-density').addEventListener('input', e => { S.set.density = +e.target.value; document.getElementById('val-density').textContent = e.target.value; markDirty(); });
    document.getElementById('setting-particles').addEventListener('input', e => { S.set.particleN = +e.target.value; document.getElementById('val-particles').textContent = e.target.value; initP(); });
    document.getElementById('setting-arrows').addEventListener('input', e => { S.set.arrowGrid = +e.target.value; document.getElementById('val-arrows').textContent = e.target.value; markDirty(); });
    document.getElementById('setting-autoadapt').addEventListener('change', e => { S.set.autoAdapt = e.target.checked; });
    const perfToggle = document.getElementById('setting-perfmode');
    if (perfToggle) {
        perfToggle.checked = S.perfMode;
        document.body.classList.toggle('perf-mode', S.perfMode);
        perfToggle.addEventListener('change', e => {
            S.perfMode = e.target.checked;
            document.body.classList.toggle('perf-mode', S.perfMode);
            resize();
            markDirty();
            initP();
        });
    }

    document.getElementById('btn-clear').addEventListener('click', () => {
        S.charges = []; S.sel = null; S.particles = []; S.testCharges = []; S.spawnFX = [];
        hideEd(); markDirty(); updSt(); if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    });
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnRedo) btnRedo.addEventListener('click', redo);
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => { zoomTarget = Math.min(5, zoomTarget * 1.2); });
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => { zoomTarget = Math.max(0.2, zoomTarget * 0.84); });
    if (btnZoomReset) btnZoomReset.addEventListener('click', () => { zoomTarget = 1; S.pan = { x: 0, y: 0 }; markDirty(); });
    document.getElementById('btn-screenshot').addEventListener('click', () => {
        const exp = document.createElement('canvas');
        const r = container.getBoundingClientRect(); exp.width = r.width * 2; exp.height = r.height * 2; const ec = exp.getContext('2d');
        ec.fillStyle = isLightTheme() ? '#f5f7fb' : '#060a14'; ec.fillRect(0, 0, exp.width, exp.height); ec.drawImage(glCanvas, 0, 0, exp.width, exp.height);
        ec.drawImage(canvas, 0, 0, exp.width, exp.height); const a = document.createElement('a'); a.download = 'champ_electrostatique.png'; a.href = exp.toDataURL('image/png'); a.click();
    });
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().then(() => { document.body.classList.add('fullscreen'); resize(); }).catch(() => { });
        else document.exitFullscreen().then(() => { document.body.classList.remove('fullscreen'); resize(); }).catch(() => { });
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) { document.body.classList.remove('fullscreen'); resize(); } });
    document.addEventListener('keydown', e => {
        if (e.key === 'Shift') S.shiftKey = true;
        if (e.target.tagName === 'INPUT') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
        switch (e.key) {
            case '1': document.getElementById('tool-pointer').click(); break; case '2': document.getElementById('tool-positive').click(); break;
            case '3': document.getElementById('tool-negative').click(); break; case '4': document.getElementById('tool-probe').click(); break;
            case '5': document.getElementById('tool-testcharge').click(); break; case '6': document.getElementById('tool-gauss').click(); break;
            case '7': document.getElementById('tool-work').click(); break; case '8': document.getElementById('tool-freecharge').click(); break;
            case 'Delete': case 'Backspace': if (S.sel !== null) { S.charges.splice(S.sel, 1); S.sel = null; hideEd(); saveHistory(); markDirty(); updSt(); initP(); } break;
            case 'Escape': S.sel = null; hideEd(); break; case 'r': case 'R': S.pan = { x: 0, y: 0 }; zoomTarget = 1; markDirty(); break;
            case 'c': case 'C': document.getElementById('btn-clear').click(); break; case 's': case 'S': document.getElementById('btn-screenshot').click(); break;
            case 'f': case 'F': document.getElementById('btn-fullscreen').click(); break;
            case 'p': case 'P': document.getElementById('btn-present').click(); break;
            case 'l': case 'L': document.getElementById('btn-light').click(); break;
            case 'a': case 'A':
                annActive = !annActive;
                annBar.style.display = annActive ? 'flex' : 'none';
                annCanvas.style.pointerEvents = annActive ? 'auto' : 'none';
                break;
            case 'd': case 'D': {
                S.viz.superposition = !S.viz.superposition;
                const sp = document.getElementById('viz-superposition');
                if (sp) sp.checked = S.viz.superposition;
                break;
            }
        }
    });
    document.addEventListener('keyup', e => { if (e.key === 'Shift') S.shiftKey = false; });

    // ═══════════════════════════════════════════════════════════════
    // ═══ FEATURE 1: SAVE / LOAD (5 localStorage slots + JSON) ═══
    // ═══════════════════════════════════════════════════════════════
    function getSlotData() {
        const slots = [];
        for (let i = 0; i < 5; i++) {
            const raw = localStorage.getItem('esim_slot_' + i);
            slots.push(raw ? JSON.parse(raw) : null);
        }
        return slots;
    }
    function renderSlots() {
        const cont = document.getElementById('save-slots');
        cont.innerHTML = '';
        const slots = getSlotData();
        for (let i = 0; i < 5; i++) {
            const d = slots[i];
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px';
            const label = document.createElement('span');
            label.style.cssText = 'flex:1;font-size:12px;color:var(--text-secondary)';
            label.textContent = d ? `Slot ${i + 1}: ${d.charges.length} charges — ${new Date(d.ts).toLocaleString()}` : `Slot ${i + 1}: (vide)`;
            const saveBtn = document.createElement('button');
            saveBtn.className = 'modal-btn';
            saveBtn.style.cssText = 'font-size:11px;padding:4px 10px';
            saveBtn.textContent = '💾';
            saveBtn.onclick = () => {
                localStorage.setItem('esim_slot_' + i, JSON.stringify({ charges: S.charges, viz: S.viz, ts: Date.now() }));
                renderSlots();
            };
            const loadBtn = document.createElement('button');
            loadBtn.className = 'modal-btn';
            loadBtn.style.cssText = 'font-size:11px;padding:4px 10px';
            loadBtn.textContent = '📂';
            loadBtn.disabled = !d;
            loadBtn.onclick = () => { if (d) { S.charges = d.charges.map(c => ({ ...c })); S.sel = null; hideEd(); markDirty(); updSt(); initP(); saveHistory(); } };
            div.append(label, saveBtn, loadBtn);
            cont.appendChild(div);
        }
    }
    document.getElementById('btn-save').addEventListener('click', () => {
        document.getElementById('modal-saveload').style.display = 'flex';
        renderSlots();
    });
    document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('modal-saveload').style.display = 'flex';
        renderSlots();
    });
    document.getElementById('btn-save-file').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({ charges: S.charges, viz: S.viz, pan: S.pan, zoom: S.zoom })], { type: 'application/json' });
        const a = document.createElement('a'); a.download = 'champ_config.json'; a.href = URL.createObjectURL(blob); a.click();
    });
    document.getElementById('btn-load-file').addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const d = JSON.parse(ev.target.result);
                if (d.charges) { S.charges = d.charges.map(c => ({ ...c })); if (d.viz) Object.assign(S.viz, d.viz); if (d.pan) S.pan = d.pan; if (d.zoom) { S.zoom = d.zoom; zoomTarget = d.zoom; zoomVelocity = 0; } S.sel = null; hideEd(); markDirty(); updSt(); initP(); saveHistory(); }
            } catch (err) { console.error('Invalid JSON', err); }
        };
        reader.readAsText(f);
    });
    // Close modals
    document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => {
        b.closest('.modal-overlay').style.display = 'none';
    }));
    document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => {
        if (e.target === m) m.style.display = 'none';
    }));

    // ═══════════════════════════════════════════
    // ═══ FEATURE 2: PRESENTATION MODE ═══
    // ═══════════════════════════════════════════
    document.getElementById('btn-present').addEventListener('click', () => {
        document.body.classList.toggle('presentation');
        if (document.body.classList.contains('presentation') && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
        resize();
    });

    // ═══════════════════════════════════════
    // ═══ FEATURE 3: LIGHT / PRINT MODE ═══
    // ═══════════════════════════════════════
    document.getElementById('btn-light').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        _cacheHash = ''; // Force cache rebuild for new colors
        markDirty();
    });

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE 4: POTENTIAL PROFILE GRAPH V(x) ═══
    // ═══════════════════════════════════════════════════
    let profileLine = null;
    const profileCanvas = document.getElementById('profile-canvas');
    const profilePanel = document.getElementById('profile-panel');
    // Attach to tool-probe: when user shift-clicks, set profile line
    canvas.addEventListener('dblclick', e => {
        if (S.tool !== 'probe' || S.charges.length === 0) return;
        const r = container.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        const w = p2w(mx, my);
        if (!profileLine) { profileLine = { x1: w.x, y1: w.y }; }
        else {
            profileLine.x2 = w.x; profileLine.y2 = w.y;
            drawProfile();
            profilePanel.style.display = 'block';
            profileLine = null;
        }
    });
    function drawProfile() {
        if (!profileLine || profileLine.x2 === undefined) return;
        const pc = profileCanvas.getContext('2d'), W = profileCanvas.width, H = profileCanvas.height;
        pc.clearRect(0, 0, W, H);
        const N = 80, vVals = [], eVals = [];
        for (let i = 0; i <= N; i++) {
            const t = i / N;
            const x = profileLine.x1 + (profileLine.x2 - profileLine.x1) * t;
            const y = profileLine.y1 + (profileLine.y2 - profileLine.y1) * t;
            vVals.push(eP(x, y));
            const ef = eF(x, y); eVals.push(Math.hypot(ef.x, ef.y));
        }
        let vMin = Math.min(...vVals), vMax = Math.max(...vVals);
        if (vMax - vMin < 100) { vMin -= 50; vMax += 50; }
        let eMin = Math.min(...eVals), eMax = Math.max(...eVals);
        if (eMax - eMin < 10) { eMin -= 5; eMax += 5; }
        // Background grid
        pc.strokeStyle = 'rgba(255,255,255,0.06)'; pc.lineWidth = 0.5;
        for (let i = 1; i < 4; i++) {
            const gy = 10 + (i / 4) * (H - 35);
            pc.beginPath(); pc.moveTo(30, gy); pc.lineTo(W - 10, gy); pc.stroke();
        }
        // Axes
        pc.strokeStyle = 'rgba(255,255,255,0.15)'; pc.lineWidth = 1;
        pc.beginPath(); pc.moveTo(30, 10); pc.lineTo(30, H - 20); pc.lineTo(W - 10, H - 20); pc.stroke();
        pc.font = '9px Inter'; pc.fillStyle = 'rgba(255,255,255,0.4)'; pc.textAlign = 'left';
        pc.fillText(fmtSI(vMax, 'V'), 2, 16); pc.fillText(fmtSI(vMin, 'V'), 2, H - 22);
        pc.fillText('A', 30, H - 6); pc.textAlign = 'right'; pc.fillText('B', W - 10, H - 6);
        // V(x) curve
        pc.beginPath();
        for (let i = 0; i <= N; i++) {
            const x = 30 + (i / N) * (W - 40), y = 10 + (1 - (vVals[i] - vMin) / (vMax - vMin)) * (H - 35);
            i === 0 ? pc.moveTo(x, y) : pc.lineTo(x, y);
        }
        pc.strokeStyle = '#00e5ff'; pc.lineWidth = 2; pc.stroke();
        // E(x) curve (right axis)
        pc.beginPath();
        for (let i = 0; i <= N; i++) {
            const x = 30 + (i / N) * (W - 40), y = 10 + (1 - (eVals[i] - eMin) / (eMax - eMin)) * (H - 35);
            i === 0 ? pc.moveTo(x, y) : pc.lineTo(x, y);
        }
        pc.strokeStyle = '#ff6b6b'; pc.lineWidth = 1.5; pc.setLineDash([4, 3]); pc.stroke(); pc.setLineDash([]);
        // Legend
        pc.font = '9px Inter'; pc.textAlign = 'right';
        pc.fillStyle = '#00e5ff'; pc.fillText('V(x)', W - 12, 16);
        pc.fillStyle = '#ff6b6b'; pc.fillText('|E|(x)', W - 12, 28);
        pc.fillStyle = 'rgba(255,255,255,0.3)'; pc.fillText(fmtSI(eMax, 'N/C'), W - 12, 40);
        // Store data for CSV export
        S._lastProfile = { vVals, eVals, line: { ...profileLine } };
    }
    document.getElementById('profile-close').addEventListener('click', () => { profilePanel.style.display = 'none'; });
    // CSV Export for profile data
    function exportCSV() {
        if (!S._lastProfile) return;
        const { vVals, eVals, line } = S._lastProfile;
        const N = vVals.length - 1;
        let csv = 'Position (m),V (V),|E| (N/C)\n';
        for (let i = 0; i <= N; i++) {
            const t = i / N;
            const x = line.x1 + (line.x2 - line.x1) * t;
            const y = line.y1 + (line.y2 - line.y1) * t;
            const d = Math.hypot((line.x2 - line.x1) * t, (line.y2 - line.y1) * t);
            csv += `${d.toFixed(4)},${vVals[i].toExponential(4)},${eVals[i].toExponential(4)}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.download = 'profile_data.csv'; a.href = URL.createObjectURL(blob); a.click();
    }
    const csvBtn = document.getElementById('profile-csv');
    if (csvBtn) csvBtn.addEventListener('click', exportCSV);
    // Global CSV export for charge config
    function exportChargesCSV() {
        let csv = 'Index,x (m),y (m),q (μC),V (V),|E| (N/C)\n';
        S.charges.forEach((c, i) => {
            const v = eP(c.x, c.y), ef = eF(c.x, c.y), em = Math.hypot(ef.x, ef.y);
            csv += `${i + 1},${c.x.toFixed(4)},${c.y.toFixed(4)},${c.q.toFixed(2)},${v.toExponential(4)},${em.toExponential(4)}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.download = 'charges_data.csv'; a.href = URL.createObjectURL(blob); a.click();
    }
    const csvChargesBtn = document.getElementById('btn-export-csv');
    if (csvChargesBtn) csvChargesBtn.addEventListener('click', exportChargesCSV);

    // ═══════════════════════════════════════════════════════
    // ═══ FEATURE 5: SUPERPOSITION DECOMPOSITION ═══
    // ═══════════════════════════════════════════════════════
    S.viz.superposition = false;
    function renderSuperposition() {
        if (!S.viz.superposition || S.charges.length < 2) return;
        const mx = S.mouse.x, my = S.mouse.y, w = p2w(mx, my);
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8', '#00cec9', '#fab1a0', '#6c5ce7'];
        let totalEx = 0, totalEy = 0;
        for (let i = 0; i < S.charges.length; i++) {
            const ch = S.charges[i];
            const dx = w.x - ch.x, dy = w.y - ch.y, r = Math.max(Math.hypot(dx, dy), MR);
            const em = K * ch.q * MU / (r * r);
            const ex = em * dx / r, ey = em * dy / r;
            totalEx += ex; totalEy += ey;
            const emag = Math.hypot(ex, ey);
            if (emag < 10) continue;
            const al = Math.atan2(-ey, ex), len = Math.min(40, Math.log10(emag) * 10);
            const col = colors[i % colors.length];
            ctx.beginPath(); ctx.moveTo(mx, my);
            ctx.lineTo(mx + len * Math.cos(al), my + len * Math.sin(al));
            ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
            arrow(ctx, mx + len * Math.cos(al), my + len * Math.sin(al), al, 6, col);
            // Label
            ctx.font = '8px JetBrains Mono'; ctx.fillStyle = col;
            ctx.fillText('q' + (i + 1), mx + (len + 8) * Math.cos(al), my + (len + 8) * Math.sin(al));
        }
        // Resultant
        const rm = Math.hypot(totalEx, totalEy);
        if (rm > 10) {
            const al = Math.atan2(-totalEy, totalEx), len = Math.min(50, Math.log10(rm) * 12);
            ctx.beginPath(); ctx.moveTo(mx, my);
            ctx.lineTo(mx + len * Math.cos(al), my + len * Math.sin(al));
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
            arrow(ctx, mx + len * Math.cos(al), my + len * Math.sin(al), al, 8, '#fff');
        }
    }
    // Superposition is rendered directly inside renderPr() when enabled.

    // ═══════════════════════════════════════════════
    // ═══ FEATURE 6: CANVAS ANNOTATIONS ═══
    // ═══════════════════════════════════════════════
    const annCanvas = document.getElementById('annotation-canvas');
    const annCtx = annCanvas.getContext('2d');
    const annBar = document.getElementById('annotation-bar');
    let annTool = 'pen', annDrawing = false, annStart = null, annTexts = [];
    function resizeAnn() {
        const r = container.getBoundingClientRect();
        annCanvas.width = r.width; annCanvas.height = r.height;
    }
    resizeAnn();
    window.addEventListener('resize', resizeAnn);
    // Toggle annotation mode with toolbar button — we add an annotation tool btn
    // The annotation bar shows/hides via a button we create or existing logic
    // Let's use btn-save area — actually the annotation bar has open/close in HTML
    let annActive = false;
    document.querySelectorAll('.ann-btn').forEach(b => b.addEventListener('click', () => {
        const act = b.dataset.ann;
        if (act === 'close') { annActive = false; annBar.style.display = 'none'; annCanvas.style.pointerEvents = 'none'; return; }
        if (act === 'clear') { annCtx.clearRect(0, 0, annCanvas.width, annCanvas.height); annTexts = []; return; }
        document.querySelectorAll('.ann-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        annTool = act;
    }));
    // Double-click on screenshot btn to toggle annotations (or we add keyboard shortcut 'A')
    // Let keyboard 'a' toggle
    annCanvas.addEventListener('mousedown', e => {
        if (!annActive) return;
        const r = annCanvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (annTool === 'pen') {
            annDrawing = true;
            annCtx.beginPath(); annCtx.moveTo(x, y);
            annCtx.strokeStyle = document.getElementById('ann-color').value;
            annCtx.lineWidth = 3; annCtx.lineCap = 'round';
        } else if (annTool === 'eraser') {
            annDrawing = true;
            annCtx.globalCompositeOperation = 'destination-out';
            annCtx.beginPath(); annCtx.moveTo(x, y);
            annCtx.lineWidth = 20; annCtx.lineCap = 'round';
        } else if (annTool === 'arrow' || annTool === 'text') {
            annStart = { x, y };
        }
    });
    annCanvas.addEventListener('mousemove', e => {
        if (!annDrawing) return;
        const r = annCanvas.getBoundingClientRect();
        annCtx.lineTo(e.clientX - r.left, e.clientY - r.top);
        annCtx.stroke();
    });
    annCanvas.addEventListener('mouseup', e => {
        const r = annCanvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (annDrawing) {
            annDrawing = false;
            annCtx.globalCompositeOperation = 'source-over';
        }
        if (annStart && annTool === 'arrow') {
            const col = document.getElementById('ann-color').value;
            annCtx.beginPath(); annCtx.moveTo(annStart.x, annStart.y); annCtx.lineTo(x, y);
            annCtx.strokeStyle = col; annCtx.lineWidth = 3; annCtx.stroke();
            const ang = Math.atan2(y - annStart.y, x - annStart.x);
            annCtx.beginPath();
            annCtx.moveTo(x, y);
            annCtx.lineTo(x - 12 * Math.cos(ang - 0.4), y - 12 * Math.sin(ang - 0.4));
            annCtx.moveTo(x, y);
            annCtx.lineTo(x - 12 * Math.cos(ang + 0.4), y - 12 * Math.sin(ang + 0.4));
            annCtx.stroke();
            annStart = null;
        }
        if (annStart && annTool === 'text') {
            // Inline text input instead of prompt()
            const inputDiv = document.createElement('div');
            inputDiv.style.cssText = 'position:absolute;z-index:100;';
            inputDiv.style.left = (annStart.x + container.getBoundingClientRect().left) + 'px';
            inputDiv.style.top = (annStart.y + container.getBoundingClientRect().top - 20) + 'px';
            const inp = document.createElement('input');
            inp.type = 'text'; inp.placeholder = 'Texte...';
            inp.style.cssText = 'background:rgba(0,0,0,0.8);color:#fff;border:1px solid #00e5ff;border-radius:4px;padding:4px 8px;font:14px Inter;outline:none;min-width:120px;';
            inputDiv.appendChild(inp);
            document.body.appendChild(inputDiv);
            inp.focus();
            const sx = annStart.x, sy = annStart.y;
            const commit = () => {
                const txt = inp.value.trim();
                if (txt) {
                    annCtx.font = '16px Inter'; annCtx.fillStyle = document.getElementById('ann-color').value;
                    annCtx.fillText(txt, sx, sy);
                }
                inputDiv.remove();
            };
            inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') commit(); if (ev.key === 'Escape') inputDiv.remove(); });
            inp.addEventListener('blur', commit);
            annStart = null;
        }
    });

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE 7: FRENCH / ARABIC i18n ═══
    // ═══════════════════════════════════════════════════
    const i18n = {
        fr: {
            title: 'Champ Électrostatique', subtitle: 'GPU Accelerated · WebGL2',
            tools: 'Outils', select: 'Sélection', chargePos: 'Charge +', chargeNeg: 'Charge −',
            probe: 'Sonde', testQ: 'Test q', gauss: 'Gauss', work: 'Travail W', freeCharge: 'Charge libre',
            presets: 'Préréglages', dipole: 'Dipôle', capacitor: 'Condensateur', quadrupole: 'Quadripôle',
            triangle: 'Triangle', ring: 'Anneau', random: 'Aléatoire', faraday: 'Cage Faraday',
            actions: 'Actions', clearAll: 'Effacer tout', visualization: 'Visualisation',
            fieldlines: 'Lignes de champ', particles: 'Particules animées', vectors: 'Champ vectoriel',
            equipotential: 'Équipotentielles', arcs: 'Arcs électriques', bloom: 'Effet bloom',
            forces: 'Forces Coulomb', landscape: 'Paysage 3D', superposition: 'Superposition',
            gpuMap: 'Carte GPU',
            off: 'Désactivée', potentialV: 'Potentiel V', magnitude: 'Magnitude |E⃗|',
            direction: 'Direction E⃗', settings: 'Paramètres', quality: 'Qualité',
            animSpeed: 'Vitesse anim.', lineDensity: 'Densité lignes', particlesN: 'Particules',
            vectorGrid: 'Grille vecteurs', autoAdapt: 'Auto-adapt FPS',
            perfMode: 'Mode performance', physics: 'Physique',
            energy: 'Énergie', totalCharge: 'Charge totale', formulas: 'Formules',
            clickToPlace: 'Cliquez pour placer des charges', selectTool: 'Sélectionnez un outil ou un préréglage',
            position: 'Position', editCharge: 'Modifier la charge', deleteBtn: 'Supprimer', closeBtn: 'Fermer',
            coulombLaw: 'Loi de Coulomb', uniformField: 'Champ uniforme', verification: 'Vérification',
            saveLoad: '💾 Sauvegarder / Charger', downloadJSON: '📥 Télécharger JSON',
            importJSON: '📤 Importer JSON', shareConfig: '📱 Partager la configuration',
            copyLink: '📋 Copier le lien', quizTitle: '🎯 Quiz — Électrostatique',
            guidedExp: '📖 Expériences Guidées', next: 'Suivant →', prev: '← Précédent',
            close: 'Fermer', score: 'Score',
            fCoulomb: 'Loi de Coulomb', fField: 'Champ électrique', fPotential: 'Potentiel électrique',
            fWork: 'Travail de la force', fUniform: 'Champ uniforme', fEnergy: 'Énergie potentielle',
            fGauss: 'Théorème de Gauss',
            probeE: '|E⃗|', probeV: 'V', probeDir: 'Direction',
            gaussTitle: '⊘ Théorème de Gauss', gaussFlux: 'Φ (flux)', gaussQencEps: 'Q_enc / ε₀',
            gaussQ: 'Q_enc', gaussVerify: 'Vérification',
            workTitle: '⚡ Travail W = q·ΔV', workVA: 'V(A)', workVB: 'V(B)',
            workDV: 'ΔV = V(B)−V(A)', workW: 'W = q·ΔV',
            fcTitle: '🚀 Charge libre', fcVelocity: 'Vitesse', fcEK: 'Énergie K',
            fcEP: 'Énergie P', fcETot: 'Énergie totale',
            guideDipole: '🔬 Exp. 1 : Explorer le dipôle',
            guideCoulomb: '⚡ Exp. 2 : Loi de Coulomb',
            guideCapacitor: '🔋 Exp. 3 : Condensateur — champ uniforme'
        },
        ar: {
            title: 'الحقل الكهروستاتيكي', subtitle: 'تسريع GPU · WebGL2',
            tools: 'الأدوات', select: 'تحديد', chargePos: 'شحنة +', chargeNeg: 'شحنة −',
            probe: 'مسبار', testQ: 'شحنة اختبار', gauss: 'غاوس', work: 'شغل W', freeCharge: 'شحنة حرة',
            presets: 'الإعدادات', dipole: 'ثنائي القطب', capacitor: 'مكثف', quadrupole: 'رباعي الأقطاب',
            triangle: 'مثلث', ring: 'حلقة', random: 'عشوائي', faraday: 'قفص فاراداي',
            actions: 'الإجراءات', clearAll: 'مسح الكل', visualization: 'التمثيل البصري',
            fieldlines: 'خطوط الحقل', particles: 'جسيمات متحركة', vectors: 'حقل شعاعي',
            equipotential: 'متساوية الجهد', arcs: 'أقواس كهربائية', bloom: 'تأثير التوهج',
            forces: 'قوى كولوم', landscape: 'مشهد ثلاثي الأبعاد', superposition: 'التراكب',
            gpuMap: 'خريطة GPU',
            off: 'معطلة', potentialV: 'الجهد V', magnitude: '|E⃗| الشدة',
            direction: 'E⃗ الاتجاه', settings: 'الإعدادات', quality: 'الجودة',
            animSpeed: 'سرعة الحركة', lineDensity: 'كثافة الخطوط', particlesN: 'الجسيمات',
            vectorGrid: 'شبكة الأشعة', autoAdapt: 'تكيف تلقائي FPS',
            perfMode: 'وضع الأداء', physics: 'الفيزياء',
            energy: 'الطاقة', totalCharge: 'الشحنة الكلية', formulas: 'الصيغ',
            clickToPlace: 'انقر لوضع الشحنات', selectTool: 'اختر أداة أو إعداد مسبق',
            position: 'الموقع', editCharge: 'تعديل الشحنة', deleteBtn: 'حذف', closeBtn: 'إغلاق',
            coulombLaw: 'قانون كولوم', uniformField: 'حقل منتظم', verification: 'التحقق',
            saveLoad: '💾 حفظ / تحميل', downloadJSON: '📥 تنزيل JSON',
            importJSON: '📤 استيراد JSON', shareConfig: '📱 مشاركة التكوين',
            copyLink: '📋 نسخ الرابط', quizTitle: '🎯 اختبار — الكهرباء الساكنة',
            guidedExp: '📖 تجارب موجهة', next: 'التالي ←', prev: '→ السابق',
            close: 'إغلاق', score: 'النتيجة',
            fCoulomb: 'قانون كولوم', fField: 'الحقل الكهربائي', fPotential: 'الجهد الكهربائي',
            fWork: 'شغل القوة', fUniform: 'حقل منتظم', fEnergy: 'طاقة الوضع',
            fGauss: 'نظرية غاوس',
            probeE: '|E⃗|', probeV: 'V', probeDir: 'الاتجاه',
            gaussTitle: '⊘ نظرية غاوس', gaussFlux: 'Φ (التدفق)', gaussQencEps: 'Q_enc / ε₀',
            gaussQ: 'Q_enc', gaussVerify: 'التحقق',
            workTitle: '⚡ شغل W = q·ΔV', workVA: 'V(A)', workVB: 'V(B)',
            workDV: 'ΔV = V(B)−V(A)', workW: 'W = q·ΔV',
            fcTitle: '🚀 شحنة حرة', fcVelocity: 'السرعة', fcEK: 'الطاقة الحركية',
            fcEP: 'طاقة الوضع', fcETot: 'الطاقة الكلية',
            guideDipole: '🔬 تجربة 1 : استكشاف ثنائي القطب',
            guideCoulomb: '⚡ تجربة 2 : قانون كولوم',
            guideCapacitor: '🔋 تجربة 3 : المكثف — حقل منتظم'
        }
    };
    let currentLang = 'fr';

    function applyLang(lang) {
        currentLang = lang;
        const t = i18n[lang];

        // ── HTML lang & dir attributes ──
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        // ── RTL class on body (drives CSS rules) ──
        document.body.classList.toggle('rtl', lang === 'ar');

        // ── Page title ──
        document.title = t.title + ' — Simulation Interactive GPU';

        // ── Header ──
        const h1 = document.querySelector('.header-title h1');
        if (h1) h1.textContent = t.title;
        const sub = document.querySelector('.header-subtitle');
        if (sub) sub.textContent = t.subtitle;

        // ── Toolbar labels ──
        const labels = document.querySelectorAll('.toolbar-label');
        if (labels[0]) labels[0].textContent = t.tools;
        if (labels[1]) labels[1].textContent = t.presets;
        if (labels[2]) labels[2].textContent = t.actions;

        // ── Tool button spans ──
        const toolSpans = document.querySelectorAll('.tool-btn span');
        const toolTexts = [t.select, t.chargePos, t.chargeNeg, t.probe, t.testQ, t.gauss, t.work, t.freeCharge];
        toolSpans.forEach((s, i) => { if (toolTexts[i]) s.textContent = toolTexts[i]; });

        // ── Preset spans ──
        const presetSpans = document.querySelectorAll('.preset-btn span:last-child');
        const presetTexts = [t.dipole, t.capacitor, t.quadrupole, t.triangle, t.ring, t.random, t.faraday];
        presetSpans.forEach((s, i) => { if (presetTexts[i]) s.textContent = presetTexts[i]; });

        // ── Panel headers ──
        const headers = document.querySelectorAll('.panel-header h2');
        const hTexts = [t.visualization, t.gpuMap, t.settings, t.physics, t.coulombLaw, t.uniformField, t.formulas];
        headers.forEach((h, i) => { if (hTexts[i]) h.textContent = hTexts[i]; });

        // ── Clear button ──
        const clearSpan = document.querySelector('#btn-clear span');
        if (clearSpan) clearSpan.textContent = t.clearAll;

        // ── Visualisation toggle labels (by checkbox ID) ──
        const vizIds = {
            'viz-fieldlines': t.fieldlines, 'viz-particles': t.particles,
            'viz-vectors': t.vectors, 'viz-equipotential': t.equipotential,
            'viz-arcs': t.arcs, 'viz-bloom': t.bloom,
            'viz-forces': t.forces, 'viz-landscape': t.landscape,
            'viz-superposition': t.superposition
        };
        for (const [id, text] of Object.entries(vizIds)) {
            const el = document.getElementById(id);
            if (el) { const lbl = el.closest('.toggle-row')?.querySelector('.toggle-label'); if (lbl) lbl.textContent = text; }
        }

        // ── GPU heatmap radio labels ──
        const heatIds = {
            'heatmap-off': t.off, 'heatmap-potential': t.potentialV,
            'heatmap-fieldmag': t.magnitude, 'heatmap-direction': t.direction
        };
        for (const [id, text] of Object.entries(heatIds)) {
            const el = document.getElementById(id);
            if (el) { const lbl = el.closest('.toggle-row')?.querySelector('.toggle-label'); if (lbl) lbl.textContent = text; }
        }

        // ── Slider labels ──
        const sliderIds = {
            'setting-quality': t.quality, 'setting-speed': t.animSpeed,
            'setting-density': t.lineDensity, 'setting-particles': t.particlesN,
            'setting-arrows': t.vectorGrid
        };
        for (const [id, text] of Object.entries(sliderIds)) {
            const el = document.getElementById(id);
            if (el) { const lbl = el.closest('.slider-row')?.querySelector('label'); if (lbl) lbl.textContent = text; }
        }

        // ── Toggle labels: auto-adapt & perf-mode ──
        const autoLbl = document.getElementById('setting-autoadapt')?.closest('.toggle-row')?.querySelector('.toggle-label');
        if (autoLbl) autoLbl.textContent = t.autoAdapt;
        const perfLbl = document.getElementById('setting-perfmode')?.closest('.toggle-row')?.querySelector('.toggle-label');
        if (perfLbl) perfLbl.textContent = t.perfMode;

        // ── Physics readouts ──
        const rpanel = document.getElementById('right-panel');
        if (rpanel) {
            const readouts = rpanel.querySelectorAll('.physics-readout .readout-label');
            if (readouts[0]) readouts[0].textContent = t.energy;
            if (readouts[1]) readouts[1].textContent = t.totalCharge;
        }

        // ── Charge editor ──
        const edTitle = document.querySelector('.editor-title');
        if (edTitle) edTitle.textContent = t.editCharge;
        const delBtn = document.getElementById('btn-delete-charge');
        if (delBtn) delBtn.textContent = t.deleteBtn;
        const clsBtn = document.getElementById('btn-close-editor');
        if (clsBtn) clsBtn.textContent = t.closeBtn;

        // ── Probe readout labels ──
        const probeLabels = document.querySelectorAll('#probe-readout .probe-label');
        if (probeLabels[0]) probeLabels[0].textContent = t.position;
        if (probeLabels[1]) probeLabels[1].textContent = t.probeE;
        if (probeLabels[2]) probeLabels[2].textContent = t.probeV;
        if (probeLabels[3]) probeLabels[3].textContent = t.probeDir;

        // ── Gauss readout labels ──
        const gaussLabels = document.querySelectorAll('#gauss-readout .probe-label');
        if (gaussLabels[0]) gaussLabels[0].textContent = t.gaussTitle;
        if (gaussLabels[1]) gaussLabels[1].textContent = t.gaussFlux;
        if (gaussLabels[2]) gaussLabels[2].textContent = t.gaussQencEps;
        if (gaussLabels[3]) gaussLabels[3].textContent = t.gaussQ;
        if (gaussLabels[4]) gaussLabels[4].textContent = t.gaussVerify;

        // ── Work readout labels ──
        const workLabels = document.querySelectorAll('#work-readout .probe-label');
        if (workLabels[0]) workLabels[0].textContent = t.workTitle;
        if (workLabels[1]) workLabels[1].textContent = t.workVA;
        if (workLabels[2]) workLabels[2].textContent = t.workVB;
        if (workLabels[3]) workLabels[3].textContent = t.workDV;
        if (workLabels[4]) workLabels[4].textContent = t.workW;

        // ── Free charge readout labels ──
        const fcLabels = document.querySelectorAll('#freecharge-readout .probe-label');
        if (fcLabels[0]) fcLabels[0].textContent = t.fcTitle;
        if (fcLabels[1]) fcLabels[1].textContent = t.position;
        if (fcLabels[2]) fcLabels[2].textContent = t.fcVelocity;
        if (fcLabels[3]) fcLabels[3].textContent = t.fcEK;
        if (fcLabels[4]) fcLabels[4].textContent = t.fcEP;
        if (fcLabels[5]) fcLabels[5].textContent = t.fcETot;

        // ── Formula card names ──
        const fNames = document.querySelectorAll('.formula-name');
        const fTexts = [t.fCoulomb, t.fField, t.fPotential, t.fWork, t.fUniform, t.fEnergy, t.fGauss];
        fNames.forEach((fn, i) => { if (fTexts[i]) fn.textContent = fTexts[i]; });

        // ── Save/Load modal ──
        const saveTitle = document.querySelector('#modal-saveload .modal-title');
        if (saveTitle) saveTitle.textContent = t.saveLoad;
        const btnSaveFile = document.getElementById('btn-save-file');
        if (btnSaveFile) btnSaveFile.textContent = t.downloadJSON;
        const importWrap = document.querySelector('#btn-load-file')?.closest('.modal-btn');
        if (importWrap) {
            const fileInput = importWrap.querySelector('input');
            importWrap.textContent = t.importJSON;
            if (fileInput) importWrap.appendChild(fileInput);
        }

        // ── QR modal ──
        const qrTitle = document.querySelector('#modal-qr .modal-title');
        if (qrTitle) qrTitle.textContent = t.shareConfig;
        const btnCopy = document.getElementById('btn-copy-url');
        if (btnCopy) btnCopy.textContent = t.copyLink;

        // ── Modal close buttons ──
        document.querySelectorAll('.modal-close').forEach(btn => btn.textContent = t.close);

        // ── Quiz panel ──
        const qt = document.getElementById('quiz-title');
        if (qt) qt.textContent = t.quizTitle;
        const qn = document.getElementById('quiz-next');
        if (qn) qn.textContent = t.next;
        const qc = document.getElementById('quiz-close');
        if (qc) qc.textContent = t.close;

        // ── Guide panel ──
        const gSelTitle = document.querySelector('#guide-selector .modal-title');
        if (gSelTitle) gSelTitle.textContent = t.guidedExp;
        const gn = document.getElementById('guide-next');
        if (gn) gn.textContent = t.next;
        const gp = document.getElementById('guide-prev');
        if (gp) gp.textContent = t.prev;
        // Guide selector buttons
        document.querySelectorAll('.guide-start-btn').forEach(btn => {
            const g = btn.dataset.guide;
            if (g === 'dipole') btn.textContent = t.guideDipole;
            else if (g === 'coulomb') btn.textContent = t.guideCoulomb;
            else if (g === 'capacitor') btn.textContent = t.guideCapacitor;
        });

        // ── Language toggle button — shows the OTHER language ──
        document.getElementById('btn-lang').textContent = lang === 'fr' ? 'عر' : 'FR';
    }

    document.getElementById('btn-lang').addEventListener('click', () => {
        applyLang(currentLang === 'fr' ? 'ar' : 'fr');
    });

    // ═══════════════════════════════════════════
    // ═══ FEATURE 8: QR CODE SHARE ═══
    // ═══════════════════════════════════════════
    function encodeConfig() {
        const data = S.charges.map(c => [Math.round(c.x * 100) / 100, Math.round(c.y * 100) / 100, Math.round(c.q * 10) / 10]);
        return btoa(JSON.stringify(data));
    }
    function decodeConfig(hash) {
        try {
            const data = JSON.parse(atob(hash));
            return data.map(d => ({ x: d[0], y: d[1], q: d[2] }));
        } catch (e) { return null; }
    }
    // URL share (QR removed — use copy-link instead)
    document.getElementById('btn-qr').addEventListener('click', () => {
        const config = encodeConfig();
        const url = location.origin + location.pathname + '#config=' + config;
        document.getElementById('qr-url').value = url;
        document.getElementById('modal-qr').style.display = 'flex';
    });
    document.getElementById('btn-copy-url').addEventListener('click', () => {
        const input = document.getElementById('qr-url');
        input.select(); navigator.clipboard.writeText(input.value).catch(() => document.execCommand('copy'));
    });
    // Load config from URL hash on init
    function loadFromHash() {
        const hash = location.hash;
        if (hash.startsWith('#config=')) {
            const charges = decodeConfig(hash.slice(8));
            if (charges && charges.length) {
                S.charges = charges; S.sel = null; hideEd(); markDirty(); updSt(); initP(); saveHistory();
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // ═══ FEATURE 9: GUIDED EXPERIMENTS ═══
    // ═══════════════════════════════════════════════════════
    const guides = {
        dipole: {
            title: '🔬 Explorer le dipôle',
            steps: [
                { text: 'Étape 1 : Placez une charge positive (+2 μC) à gauche du canvas.', validate: () => S.charges.some(c => c.q > 0) },
                { text: 'Étape 2 : Placez une charge négative (−2 μC) à droite.', validate: () => S.charges.length >= 2 && S.charges.some(c => c.q < 0) },
                { text: 'Étape 3 : Activez les lignes de champ et observez le motif du dipôle.', validate: () => S.viz.fieldlines },
                { text: 'Étape 4 : Utilisez la sonde (outil 4) pour mesurer le champ entre les charges. Notez que E est maximal entre elles.', validate: () => S.tool === 'probe' },
                { text: '✅ Bravo ! Vous avez exploré le dipôle électrique. Le champ va de + vers −.', validate: () => true }
            ]
        },
        coulomb: {
            title: '⚡ Loi de Coulomb',
            steps: [
                { text: 'Étape 1 : Effacez le canvas et placez exactement 2 charges positives.', validate: () => S.charges.length === 2 && S.charges.every(c => c.q > 0) },
                { text: 'Étape 2 : Activez l\'affichage des forces (panneau Visualisation → Forces Coulomb).', validate: () => S.viz.forces },
                { text: 'Étape 3 : Rapprochez les charges et observez que la force augmente (F ∝ 1/r²).', validate: () => { if (S.charges.length === 2) { const d = Math.hypot(S.charges[0].x - S.charges[1].x, S.charges[0].y - S.charges[1].y); return d < 1; } return false; } },
                { text: '✅ La loi de Coulomb est vérifiée : F = k·|q₁q₂|/r². Plus r est petit, plus F est grande.', validate: () => true }
            ]
        },
        capacitor: {
            title: '🔋 Condensateur — Champ uniforme',
            steps: [
                { text: 'Étape 1 : Cliquez sur le préréglage "Condensateur" dans la barre d\'outils.', validate: () => S.charges.length >= 10 },
                { text: 'Étape 2 : Activez la carte GPU "Potentiel V" pour visualiser la différence de potentiel.', validate: () => S.viz.heatmap === 1 },
                { text: 'Étape 3 : Activez les équipotentielles. Observez qu\'elles sont parallèles entre les plaques.', validate: () => S.viz.equipotential },
                { text: '✅ Entre les plaques, le champ est quasi-uniforme : E = ΔV/d. Les équipotentielles sont parallèles.', validate: () => true }
            ]
        }
    };
    let activeGuide = null, guideStep = 0;
    function startGuide(name) {
        activeGuide = guides[name]; guideStep = 0;
        document.getElementById('guide-selector').style.display = 'none';
        document.getElementById('guide-panel').style.display = 'block';
        updateGuideUI();
    }
    function updateGuideUI() {
        if (!activeGuide) return;
        const g = activeGuide;
        document.getElementById('guide-title').textContent = g.title;
        document.getElementById('guide-instruction').textContent = g.steps[guideStep].text;
        // Step dots
        const dots = document.getElementById('guide-step-indicator');
        dots.innerHTML = '';
        for (let i = 0; i < g.steps.length; i++) {
            const dot = document.createElement('span');
            dot.style.cssText = `width:8px;height:8px;border-radius:50%;display:inline-block;${i === guideStep ? 'background:var(--accent-green)' : i < guideStep ? 'background:var(--positive)' : 'background:rgba(255,255,255,0.15)'}`;
            dots.appendChild(dot);
        }
        document.getElementById('guide-prev').style.display = guideStep > 0 ? 'inline-block' : 'none';
        document.getElementById('guide-next').textContent = guideStep === g.steps.length - 1 ? 'Terminer' : 'Suivant →';
    }
    document.getElementById('guide-next').addEventListener('click', () => {
        if (!activeGuide) return;
        const step = activeGuide.steps[guideStep];
        if (!step.validate()) {
            document.getElementById('guide-instruction').style.color = '#ff4444';
            setTimeout(() => { document.getElementById('guide-instruction').style.color = ''; }, 1000);
            return;
        }
        if (guideStep < activeGuide.steps.length - 1) { guideStep++; updateGuideUI(); }
        else { activeGuide = null; document.getElementById('guide-panel').style.display = 'none'; }
    });
    document.getElementById('guide-prev').addEventListener('click', () => {
        if (guideStep > 0) { guideStep--; updateGuideUI(); }
    });
    document.getElementById('guide-close').addEventListener('click', () => {
        activeGuide = null; document.getElementById('guide-panel').style.display = 'none';
    });
    document.getElementById('btn-guide').addEventListener('click', () => {
        document.getElementById('guide-selector').style.display = 'flex';
    });
    document.querySelectorAll('.guide-start-btn').forEach(b => b.addEventListener('click', () => {
        startGuide(b.dataset.guide);
    }));
    // Auto-validate periodically
    setInterval(() => {
        if (activeGuide && activeGuide.steps[guideStep].validate()) {
            document.getElementById('guide-instruction').style.color = '#76ff03';
        }
    }, 1000);

    // ═══════════════════════════════════════════
    // ═══ FEATURE 10: QUIZ MODE ═══
    // ═══════════════════════════════════════════
    const quizData = {
        fr: [
            { q: 'Quelle est la relation entre le champ électrique et la force sur une charge q ?', choices: ['E = F/q', 'E = F·q', 'E = q/F', 'E = F·r²'], correct: 0 },
            { q: 'Dans un condensateur plan, les équipotentielles sont :', choices: ['Circulaires', 'Parallèles aux plaques', 'Perpendiculaires aux plaques', 'Inexistantes'], correct: 1 },
            { q: 'La constante de Coulomb k vaut approximativement :', choices: ['6.67 × 10⁻¹¹', '8.99 × 10⁹', '1.6 × 10⁻¹⁹', '3 × 10⁸'], correct: 1 },
            { q: 'Si on double la distance entre deux charges, la force de Coulomb :', choices: ['Double', 'Quadruple', 'Est divisée par 4', 'Est divisée par 2'], correct: 2 },
            { q: 'À l\'intérieur d\'une cage de Faraday, le champ électrique est :', choices: ['Maximal', 'Double du champ extérieur', 'Quasi-nul', 'Égal au champ extérieur'], correct: 2 },
            { q: 'Le travail de la force électrique pour déplacer q de A à B est :', choices: ['W = q·E·d', 'W = q·(V_A − V_B)', 'W = k·q/r²', 'W = F/d'], correct: 1 },
            { q: 'Les lignes de champ électrique vont :', choices: ['Du − vers le +', 'Du + vers le −', 'Toujours verticalement', 'En cercles fermés'], correct: 1 },
            { q: 'L\'énergie potentielle de deux charges de même signe est :', choices: ['Négative', 'Nulle', 'Positive', 'Infinie'], correct: 2 },
            { q: 'Le flux du champ E à travers une surface fermée est proportionnel à :', choices: ['La charge extérieure', 'La charge intérieure Q_enc', 'Le rayon de la surface', 'La surface totale'], correct: 1 },
            { q: 'Quelle unité mesure le potentiel électrique ?', choices: ['Newton', 'Coulomb', 'Volt', 'Ampère'], correct: 2 }
        ],
        ar: [
            { q: 'ما العلاقة بين الحقل الكهربائي والقوة على شحنة q ؟', choices: ['E = F/q', 'E = F·q', 'E = q/F', 'E = F·r²'], correct: 0 },
            { q: 'في مكثف مستوٍ، خطوط تساوي الجهد تكون :', choices: ['دائرية', 'موازية للصفائح', 'عمودية على الصفائح', 'غير موجودة'], correct: 1 },
            { q: 'ثابت كولوم k يساوي تقريباً :', choices: ['6.67 × 10⁻¹¹', '8.99 × 10⁹', '1.6 × 10⁻¹⁹', '3 × 10⁸'], correct: 1 },
            { q: 'إذا تضاعفت المسافة بين شحنتين، فإن قوة كولوم :', choices: ['تتضاعف', 'تتضاعف أربع مرات', 'تنقسم على 4', 'تنقسم على 2'], correct: 2 },
            { q: 'داخل قفص فاراداي، الحقل الكهربائي يكون :', choices: ['أقصى', 'ضعف الحقل الخارجي', 'شبه معدوم', 'مساوياً للحقل الخارجي'], correct: 2 },
            { q: 'شغل القوة الكهربائية لنقل q من A إلى B هو :', choices: ['W = q·E·d', 'W = q·(V_A − V_B)', 'W = k·q/r²', 'W = F/d'], correct: 1 },
            { q: 'خطوط الحقل الكهربائي تتجه :', choices: ['من − إلى +', 'من + إلى −', 'دائماً عمودياً', 'في دوائر مغلقة'], correct: 1 },
            { q: 'طاقة الوضع لشحنتين متماثلتين الإشارة تكون :', choices: ['سالبة', 'معدومة', 'موجبة', 'لا نهائية'], correct: 2 },
            { q: 'تدفق الحقل E عبر سطح مغلق يتناسب مع :', choices: ['الشحنة الخارجية', 'الشحنة الداخلية Q_enc', 'نصف قطر السطح', 'المساحة الكلية'], correct: 1 },
            { q: 'ما الوحدة التي تقيس الجهد الكهربائي ؟', choices: ['نيوتن', 'كولوم', 'فولت', 'أمبير'], correct: 2 }
        ]
    };
    let quizIdx = 0, quizScore = 0, quizAnswered = false;
    function getQuizQuestions() { return quizData[currentLang] || quizData.fr; }
    function showQuiz() {
        quizIdx = 0; quizScore = 0; quizAnswered = false;
        document.getElementById('quiz-panel').style.display = 'flex';
        renderQuiz();
    }
    function renderQuiz() {
        const questions = getQuizQuestions();
        const q = questions[quizIdx];
        const t = i18n[currentLang] || i18n.fr;
        document.getElementById('quiz-title').textContent = `🎯 ${currentLang === 'ar' ? 'السؤال' : 'Question'} ${quizIdx + 1} / ${questions.length}`;
        document.getElementById('quiz-question').textContent = q.q;
        document.getElementById('quiz-feedback').textContent = '';
        document.getElementById('quiz-score').textContent = `${t.score}: ${quizScore} / ${questions.length}`;
        quizAnswered = false;
        const cont = document.getElementById('quiz-choices');
        cont.innerHTML = '';
        q.choices.forEach((ch, i) => {
            const btn = document.createElement('button');
            btn.className = 'modal-btn';
            btn.style.cssText = 'text-align:left;padding:10px 14px;font-size:13px';
            btn.textContent = String.fromCharCode(65 + i) + '. ' + ch;
            btn.onclick = () => {
                if (quizAnswered) return;
                quizAnswered = true;
                const correctMsg = currentLang === 'ar' ? '✅ صحيح !' : '✅ Correct !';
                const wrongMsg = currentLang === 'ar' ? '❌ خطأ. الإجابة الصحيحة هي ' : '❌ Incorrect. La bonne réponse est ';
                const finalMsg = currentLang === 'ar' ? ' — النتيجة النهائية : ' : ' — Score final : ';
                if (i === q.correct) {
                    quizScore++;
                    btn.style.background = 'rgba(118,255,3,0.2)'; btn.style.borderColor = '#76ff03';
                    document.getElementById('quiz-feedback').textContent = correctMsg;
                    document.getElementById('quiz-feedback').style.color = '#76ff03';
                } else {
                    btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = '#ff4444';
                    cont.children[q.correct].style.background = 'rgba(118,255,3,0.2)';
                    cont.children[q.correct].style.borderColor = '#76ff03';
                    document.getElementById('quiz-feedback').textContent = wrongMsg + String.fromCharCode(65 + q.correct) + '.';
                    document.getElementById('quiz-feedback').style.color = '#ff4444';
                }
                document.getElementById('quiz-score').textContent = `${t.score}: ${quizScore} / ${questions.length}`;
                document.getElementById('quiz-next').style.display = quizIdx < questions.length - 1 ? 'inline-block' : 'none';
                if (quizIdx === questions.length - 1) {
                    document.getElementById('quiz-feedback').textContent += finalMsg + `${quizScore}/${questions.length}`;
                }
            };
            cont.appendChild(btn);
        });
        document.getElementById('quiz-next').style.display = 'none';
    }
    document.getElementById('quiz-next').addEventListener('click', () => {
        const questions = getQuizQuestions();
        if (quizIdx < questions.length - 1) { quizIdx++; renderQuiz(); }
    });
    document.getElementById('quiz-close').addEventListener('click', () => {
        document.getElementById('quiz-panel').style.display = 'none';
    });
    document.getElementById('btn-quiz').addEventListener('click', showQuiz);

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE 11: FARADAY CAGE RENDERING ═══
    // ═══════════════════════════════════════════════════
    // When Faraday preset is active, render E≈0 indicator inside
    function renderFaradayIndicator() {
        // Detect if current config looks like a Faraday cage (ring of same-sign charges)
        if (S.charges.length < 8) return;
        const allSame = S.charges.every(c => c.q * S.charges[0].q > 0);
        if (!allSame) return;
        // Check if arranged in a ring
        const cx = S.charges.reduce((s, c) => s + c.x, 0) / S.charges.length;
        const cy = S.charges.reduce((s, c) => s + c.y, 0) / S.charges.length;
        const radii = S.charges.map(c => Math.hypot(c.x - cx, c.y - cy));
        const avgR = radii.reduce((s, r) => s + r, 0) / radii.length;
        const spread = Math.max(...radii) - Math.min(...radii);
        if (spread > avgR * 0.3) return; // Not a ring
        // Draw E≈0 zone
        const center = w2p(cx, cy);
        const rPx = avgR * 0.5 * SC * S.zoom;
        const gr = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, rPx);
        gr.addColorStop(0, 'rgba(118,255,3,0.08)'); gr.addColorStop(1, 'rgba(118,255,3,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2); ctx.fill();
        // Label
        ctx.font = '600 12px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(118,255,3,0.5)';
        ctx.fillText('E ≈ 0', center.x, center.y - 5);
        // Compute actual E at center (extract primitives before next eF call — shared _ef object)
        const _ei = eF(cx, cy), eix = _ei.x, eiy = _ei.y;
        const _eo = eF(cx + avgR * 1.5, cy);
        const eIn = Math.hypot(eix, eiy), eOut = Math.hypot(_eo.x, _eo.y);
        ctx.font = '9px JetBrains Mono'; ctx.fillStyle = 'rgba(118,255,3,0.35)';
        ctx.fillText(`E_in: ${fmtSI(eIn, 'N/C')}`, center.x, center.y + 10);
        ctx.fillText(`E_out: ${fmtSI(eOut, 'N/C')}`, center.x, center.y + 22);
    }
    // Patch render to include Faraday indicator
    const _origRenderCh = renderCh;
    renderCh = function () { _origRenderCh(); renderFaradayIndicator(); };

    // ═══════════════════════════════════════════════════════
    // ═══ FEATURE 12: MOBILE TOUCH EVENTS ═══
    // ═══════════════════════════════════════════════════════
    let touches = {}, pinchDist = 0;
    let _longPressTimer = null, _touchMoved = false, _touchStartPos = null;

    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const r = container.getBoundingClientRect();
        _touchMoved = false;

        if (e.touches.length === 1) {
            const t = e.touches[0];
            const mx = t.clientX - r.left, my = t.clientY - r.top;
            S.mouse.x = mx; S.mouse.y = my;
            _touchStartPos = { x: mx, y: my };

            // Long-press: delete selected charge after 500ms
            clearTimeout(_longPressTimer);
            _longPressTimer = setTimeout(() => {
                if (!_touchMoved && S.selected !== null) {
                    // Haptic feedback if available
                    if (navigator.vibrate) navigator.vibrate(30);
                    S.charges.splice(S.selected, 1);
                    S.selected = null;
                    markDirty();
                }
            }, 500);

            // Simulate mousedown
            const evt = new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY, button: 0 });
            canvas.dispatchEvent(evt);
        } else if (e.touches.length === 2) {
            clearTimeout(_longPressTimer);
            pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const r = container.getBoundingClientRect();

        if (e.touches.length === 1) {
            const t = e.touches[0];
            const mx = t.clientX - r.left, my = t.clientY - r.top;
            S.mouse.x = mx; S.mouse.y = my;

            // Cancel long-press if finger moved more than 10px
            if (_touchStartPos && Math.hypot(mx - _touchStartPos.x, my - _touchStartPos.y) > 10) {
                _touchMoved = true;
                clearTimeout(_longPressTimer);
            }

            const evt = new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY });
            canvas.dispatchEvent(evt);
        } else if (e.touches.length === 2) {
            clearTimeout(_longPressTimer);
            const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (pinchDist > 0) {
                const scale = newDist / pinchDist;
                zoomTarget = Math.max(0.2, Math.min(5, zoomTarget * scale));
                markDirty();
            }
            pinchDist = newDist;

            // Two-finger pan
            const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            if (touches._panCx !== undefined) {
                S.panX += (cx - touches._panCx);
                S.panY += (cy - touches._panCy);
                markDirty();
            }
            touches._panCx = cx; touches._panCy = cy;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        clearTimeout(_longPressTimer);
        const evt = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(evt);
        pinchDist = 0;
        touches._panCx = undefined; touches._panCy = undefined;
        _touchStartPos = null;
    }, { passive: false });

    function syncUIFromState() {
        if (DOM['setting-quality']) DOM['setting-quality'].value = String(S.set.quality);
        if (DOM['val-quality']) DOM['val-quality'].textContent = S.qualNames[S.set.quality];
        const sp = document.getElementById('setting-speed');
        const vsp = document.getElementById('val-speed');
        if (sp) sp.value = String(S.set.speed);
        if (vsp) vsp.textContent = S.set.speed.toFixed(1) + '×';
        const den = document.getElementById('setting-density');
        const vden = document.getElementById('val-density');
        if (den) den.value = String(S.set.density);
        if (vden) vden.textContent = String(S.set.density);
        const part = document.getElementById('setting-particles');
        const vpart = document.getElementById('val-particles');
        if (part) part.value = String(S.set.particleN);
        if (vpart) vpart.textContent = String(S.set.particleN);
        const arr = document.getElementById('setting-arrows');
        const varr = document.getElementById('val-arrows');
        if (arr) arr.value = String(S.set.arrowGrid);
        if (varr) varr.textContent = String(S.set.arrowGrid);
        const aa = document.getElementById('setting-autoadapt');
        if (aa) aa.checked = !!S.set.autoAdapt;
        const pf = document.getElementById('setting-perfmode');
        if (pf) pf.checked = !!S.perfMode;
        const sup = document.getElementById('viz-superposition');
        if (sup) sup.checked = !!S.viz.superposition;
        // Sync all viz checkboxes with tier defaults
        const vizMap = { 'viz-fieldlines': 'fieldlines', 'viz-particles': 'particles', 'viz-vectors': 'vectors',
            'viz-equipotential': 'equipotential', 'viz-arcs': 'arcs', 'viz-bloom': 'bloom',
            'viz-forces': 'forces', 'viz-landscape': 'landscape' };
        for (const [id, key] of Object.entries(vizMap)) {
            const el = document.getElementById(id);
            if (el) el.checked = !!S.viz[key];
        }
    }

    // ═══ INIT ═══
    initDOM(); syncUIFromState(); updSt(); initP(); saveHistory(); loadFromHash(); requestAnimationFrame(render);
    if (DOM['zoom-display']) DOM['zoom-display'].textContent = Math.round(S.zoom * 100) + '%';

    // GPU detection for badge — use already-detected PERF data
    {
        const gpuBadge = document.querySelector('.gpu-badge');
        if (gpuBadge) {
            const tierLabel = ['Ultra-Low', 'Low-Mid', 'Mid-High', 'Ultra'][PERF.tier];
            const tierColors = ['#ff4444','#ff8800','#44bbff','#44ff88'];
            gpuBadge.style.borderColor = tierColors[PERF.tier];
            if (PERF.gpuModel) {
                const short = PERF.gpuModel.length > 18 ? PERF.gpuModel.slice(0, 18) + '…' : PERF.gpuModel;
                gpuBadge.textContent = short + ' [' + tierLabel + ']';
                gpuBadge.title = PERF.gpuRenderer + '\nTier: ' + tierLabel + ' (' + PERF.tier + '/3)\nCPU: ' + PERF.cores + ' cores, ' + PERF.memory + 'GB\nGPU: ' + PERF.gpuVendor + ' (' + (PERF.isDiscrete ? 'discrete' : 'integrated') + ')\nQuality: ' + S.qualNames[S.set.quality] + '\nParticles: ' + S.set.particleN;
            } else {
                gpuBadge.textContent = 'WebGL2 [' + tierLabel + ']';
                gpuBadge.title = 'Tier: ' + tierLabel + ' (' + PERF.tier + '/3)\nCPU: ' + PERF.cores + ' cores, ' + PERF.memory + 'GB';
            }
        }
        // Auto-enable perf mode for low-end hardware
        if (PERF.tier <= 1) {
            console.log('[PERF] Low-end hardware detected — performance mode auto-enabled');
            const perfToggle = document.getElementById('setting-perfmode');
            if (perfToggle && !perfToggle.checked) {
                perfToggle.checked = true;
                perfToggle.dispatchEvent(new Event('change'));
            }
        }
    }

    // ═══ MOBILE TOOLBAR ═══
    const mobileToolbar = document.getElementById('mobile-toolbar');
    const btnMobilePanel = document.getElementById('btn-mobile-panel');
    const rightPanel = document.getElementById('right-panel');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const mobPresetsBtn = document.getElementById('mob-presets');
    const mobPresetsPopup = document.getElementById('mob-presets-popup');
    const mobDeleteBtn = document.getElementById('mob-delete');

    function closeMobilePanel() {
        if (rightPanel) rightPanel.classList.remove('mobile-open');
        if (btnMobilePanel) btnMobilePanel.classList.remove('active');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    }

    function closeMobilePresets() {
        if (mobPresetsPopup) mobPresetsPopup.style.display = 'none';
        if (mobPresetsBtn) mobPresetsBtn.classList.remove('active');
    }

    if (mobileToolbar) {
        // Mobile tool buttons — map to desktop tool buttons
        mobileToolbar.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
            const toolName = b.dataset.tool;
            // Map mobile tool names to desktop button IDs
            const toolMap = { pointer: 'tool-pointer', positive: 'tool-positive', negative: 'tool-negative', probe: 'tool-probe' };
            const toolBtn = document.getElementById(toolMap[toolName]);
            if (toolBtn) toolBtn.click();
            mobileToolbar.querySelectorAll('[data-tool]').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            closeMobilePresets();
        }));
    }

    // Mobile delete button
    if (mobDeleteBtn) {
        mobDeleteBtn.addEventListener('click', () => {
            if (S.selected !== null) {
                S.charges.splice(S.selected, 1);
                S.selected = null;
                markDirty();
            }
        });
    }

    // Mobile presets popup
    if (mobPresetsBtn && mobPresetsPopup) {
        mobPresetsBtn.addEventListener('click', () => {
            const isOpen = mobPresetsPopup.style.display !== 'none';
            if (isOpen) {
                closeMobilePresets();
            } else {
                mobPresetsPopup.style.display = 'grid';
                mobPresetsBtn.classList.add('active');
            }
        });
        mobPresetsPopup.querySelectorAll('.mob-preset-item').forEach(item => {
            item.addEventListener('click', () => {
                const preset = item.dataset.preset;
                if (preset === 'clear') {
                    S.charges.length = 0; S.selected = null; markDirty();
                } else {
                    // Find and click the matching desktop preset button
                    const desktopPreset = document.querySelector(`.preset-btn[data-preset="${preset}"]`) || document.getElementById('preset-' + preset);
                    if (desktopPreset) desktopPreset.click();
                }
                closeMobilePresets();
            });
        });
        // Close presets when tapping outside
        document.addEventListener('click', e => {
            if (mobPresetsPopup.style.display !== 'none' && !mobPresetsPopup.contains(e.target) && e.target !== mobPresetsBtn && !mobPresetsBtn.contains(e.target)) {
                closeMobilePresets();
            }
        });
    }

    // Mobile panel with backdrop
    if (btnMobilePanel && rightPanel) {
        btnMobilePanel.addEventListener('click', () => {
            const isOpen = rightPanel.classList.contains('mobile-open');
            if (isOpen) {
                closeMobilePanel();
            } else {
                rightPanel.classList.add('mobile-open');
                btnMobilePanel.classList.add('active');
                if (mobileBackdrop) mobileBackdrop.classList.add('active');
                closeMobilePresets();
            }
        });
    }

    // Backdrop tap closes panel
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeMobilePanel);
    }

    // ═══ ONBOARDING ═══
    const onboarding = document.getElementById('onboarding-overlay');
    if (onboarding && !localStorage.getItem('esim_onboarded')) {
        onboarding.style.display = 'flex';
        const dismissOnboard = () => {
            onboarding.classList.add('fade-out');
            setTimeout(() => { onboarding.style.display = 'none'; }, 400);
            localStorage.setItem('esim_onboarded', '1');
        };
        const nextTip = onboarding.querySelector('.onboard-next');
        const tips = onboarding.querySelectorAll('.onboard-tip');
        const dotsEl = onboarding.querySelector('.onboard-dots');
        let tipIdx = 0;
        // Create dot indicators
        if (dotsEl && tips.length > 0) {
            for (let i = 0; i < tips.length; i++) {
                const d = document.createElement('span');
                d.className = 'dot' + (i === 0 ? ' active' : '');
                dotsEl.appendChild(d);
            }
        }
        const updateDots = () => { if (dotsEl) dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === tipIdx)); };
        if (nextTip && tips.length > 0) {
            tips.forEach((t, i) => t.style.display = i === 0 ? 'block' : 'none');
            nextTip.addEventListener('click', () => {
                tips[tipIdx].style.display = 'none';
                tipIdx++;
                if (tipIdx >= tips.length) { dismissOnboard(); }
                else { tips[tipIdx].style.display = 'block'; updateDots(); }
            });
        }
        const skipBtn = onboarding.querySelector('.onboard-skip');
        if (skipBtn) skipBtn.addEventListener('click', dismissOnboard);
    }

    // ═══ NUMERIC CHARGE INPUT ═══
    const numericInput = document.getElementById('charge-numeric');
    if (numericInput) {
        numericInput.addEventListener('change', () => {
            if (S.sel === null) return;
            let v = parseFloat(numericInput.value);
            if (isNaN(v)) return;
            v = Math.max(-10, Math.min(10, v));
            if (v === 0) v = 0.5;
            S.charges[S.sel].q = v;
            document.getElementById('charge-slider').value = v;
            document.getElementById('charge-value').textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' μC';
            numericInput.value = v;
            markDirty(); initP();
        });
        // Sync numeric from slider
        document.getElementById('charge-slider').addEventListener('input', () => {
            if (numericInput && S.sel !== null) numericInput.value = S.charges[S.sel].q;
        });
    }
    // Credits screen: shows before splash, auto-dismiss after 4.5s or click
    const _credits = document.getElementById('credits-screen');
    const _splash = document.getElementById('splash-screen');
    if (_credits) {
        // Spawn floating particles
        const particlesContainer = document.getElementById('credits-particles');
        if (particlesContainer) {
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'credits-particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.animationDelay = (Math.random() * 5) + 's';
                p.style.animationDuration = (4 + Math.random() * 4) + 's';
                if (Math.random() > 0.5) p.style.background = 'rgba(124, 77, 255, 0.5)';
                particlesContainer.appendChild(p);
            }
        }
        const dismissCredits = () => {
            if (_credits.classList.contains('credits-out')) return;
            _credits.classList.add('credits-out');
            // Show splash after credits fade
            if (_splash) {
                _splash.style.display = 'flex';
                _splash.style.animation = 'none'; // reset the auto-dismiss timer
                void _splash.offsetWidth; // force reflow
                _splash.style.animation = 'splashOut 0.8s var(--ease-out) 3s forwards';
            }
            setTimeout(() => {
                _credits.remove();
                // Now set up splash dismiss
                if (_splash) {
                    const dismissSplash = () => { _splash.classList.add('splash-out'); setTimeout(() => _splash.remove(), 400); };
                    _splash.addEventListener('click', dismissSplash);
                    _splash.addEventListener('keydown', dismissSplash);
                    setTimeout(dismissSplash, 3000);
                }
            }, 800);
        };
        _credits.addEventListener('click', dismissCredits);
        document.addEventListener('keydown', function _creditsKey(e) {
            dismissCredits();
            document.removeEventListener('keydown', _creditsKey);
        });
        setTimeout(dismissCredits, 4500);
    } else if (_splash) {
        // Fallback if no credits screen
        const dismissSplash = () => { _splash.classList.add('splash-out'); setTimeout(() => _splash.remove(), 400); };
        _splash.addEventListener('click', dismissSplash);
        _splash.addEventListener('keydown', dismissSplash);
        setTimeout(dismissSplash, 3000);
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: COMMAND PALETTE (Ctrl+K) ═══
    // ═══════════════════════════════════════════════════
    const cmdPalette = document.getElementById('command-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');
    let cmdSelectedIdx = 0;
    const cmdActions = [
        { icon: '⊕', label: 'Charge positive', shortcut: '2', action: () => document.getElementById('tool-positive').click() },
        { icon: '⊖', label: 'Charge négative', shortcut: '3', action: () => document.getElementById('tool-negative').click() },
        { icon: '🔍', label: 'Sonde', shortcut: '4', action: () => document.getElementById('tool-probe').click() },
        { icon: '↗', label: 'Sélection', shortcut: '1', action: () => document.getElementById('tool-pointer').click() },
        { icon: '⚡', label: 'Charge test', shortcut: '5', action: () => document.getElementById('tool-testcharge').click() },
        { icon: '⊘', label: 'Surface de Gauss', shortcut: '6', action: () => document.getElementById('tool-gauss').click() },
        { icon: '⚙', label: 'Travail W = qΔV', shortcut: '7', action: () => document.getElementById('tool-work').click() },
        { icon: '🚀', label: 'Charge libre', shortcut: '8', action: () => document.getElementById('tool-freecharge').click() },
        { icon: '🔲', label: 'Dipôle', shortcut: '', action: () => document.querySelector('[data-preset="dipole"]')?.click() },
        { icon: '🔋', label: 'Condensateur', shortcut: '', action: () => document.querySelector('[data-preset="capacitor"]')?.click() },
        { icon: '◇', label: 'Quadrupôle', shortcut: '', action: () => document.querySelector('[data-preset="quadrupole"]')?.click() },
        { icon: '△', label: 'Triangle', shortcut: '', action: () => document.querySelector('[data-preset="triangle"]')?.click() },
        { icon: '○', label: 'Anneau / Cage Faraday', shortcut: '', action: () => document.querySelector('[data-preset="ring"]')?.click() },
        { icon: '🎲', label: 'Configuration aléatoire', shortcut: '', action: () => document.querySelector('[data-preset="random"]')?.click() },
        { icon: '📷', label: 'Capture d\'écran', shortcut: 'S', action: () => document.getElementById('btn-screenshot').click() },
        { icon: '⛶', label: 'Plein écran', shortcut: 'F', action: () => document.getElementById('btn-fullscreen').click() },
        { icon: '☀', label: 'Mode clair', shortcut: 'L', action: () => document.getElementById('btn-light').click() },
        { icon: '🎤', label: 'Mode présentation', shortcut: 'P', action: () => document.getElementById('btn-present').click() },
        { icon: '💾', label: 'Sauvegarder / Charger', shortcut: '', action: () => document.getElementById('btn-save').click() },
        { icon: '🧹', label: 'Effacer tout', shortcut: 'C', action: () => document.getElementById('btn-clear').click() },
        { icon: '↩', label: 'Annuler', shortcut: 'Ctrl+Z', action: undo },
        { icon: '↪', label: 'Rétablir', shortcut: 'Ctrl+Y', action: redo },
        { icon: '🎯', label: 'Quiz', shortcut: '', action: () => document.getElementById('btn-quiz').click() },
        { icon: '📖', label: 'Expériences guidées', shortcut: '', action: () => document.getElementById('btn-guide').click() },
        { icon: '🔄', label: 'Réinitialiser vue', shortcut: 'R', action: () => { zoomTarget = 1; S.pan = { x: 0, y: 0 }; markDirty(); } },
        { icon: '🔎', label: 'Zoom ajusté', shortcut: '', action: () => doZoomFit() },
        { icon: '🗺', label: 'Mini-carte', shortcut: 'M', action: () => toggleMinimap() },
        { icon: '📐', label: 'Grille magnétique', shortcut: 'G', action: () => { const el = document.getElementById('setting-snap'); if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); } } },
        { icon: '🔊', label: 'Effets sonores', shortcut: '', action: () => { const el = document.getElementById('setting-sound'); if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); } } },
        { icon: '🪞', label: 'Plan miroir (terre)', shortcut: '', action: () => { const el = document.getElementById('setting-mirror'); if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); } } },
        { icon: '⌨', label: 'Raccourcis clavier', shortcut: '?', action: () => showShortcuts() },
        { icon: '🔗', label: 'Copier lien de partage', shortcut: '', action: () => { const config = encodeConfig(); const url = location.origin + location.pathname + '#config=' + config; navigator.clipboard.writeText(url).catch(() => {}); } },
    ];

    function renderCmdPalette(filter) {
        cmdResults.innerHTML = '';
        const f = (filter || '').toLowerCase();
        const filtered = cmdActions.filter(a => a.label.toLowerCase().includes(f) || a.icon.includes(f));
        cmdSelectedIdx = 0;
        filtered.forEach((a, i) => {
            const div = document.createElement('div');
            div.className = 'cmd-item' + (i === 0 ? ' selected' : '');
            div.innerHTML = `<span class="cmd-icon">${a.icon}</span><span class="cmd-label">${a.label}</span>${a.shortcut ? `<span class="cmd-shortcut">${a.shortcut}</span>` : ''}`;
            div.addEventListener('click', () => { a.action(); closeCmdPalette(); });
            div.addEventListener('mouseenter', () => {
                cmdResults.querySelectorAll('.cmd-item').forEach(x => x.classList.remove('selected'));
                div.classList.add('selected');
                cmdSelectedIdx = i;
            });
            cmdResults.appendChild(div);
        });
        return filtered;
    }

    function openCmdPalette() {
        cmdPalette.style.display = 'block';
        cmdInput.value = '';
        renderCmdPalette('');
        setTimeout(() => cmdInput.focus(), 50);
    }
    function closeCmdPalette() {
        cmdPalette.style.display = 'none';
        cmdInput.value = '';
    }

    if (cmdInput) {
        cmdInput.addEventListener('input', () => renderCmdPalette(cmdInput.value));
        cmdInput.addEventListener('keydown', e => {
            const items = cmdResults.querySelectorAll('.cmd-item');
            if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelectedIdx = Math.min(cmdSelectedIdx + 1, items.length - 1); items.forEach((x, i) => x.classList.toggle('selected', i === cmdSelectedIdx)); items[cmdSelectedIdx]?.scrollIntoView({ block: 'nearest' }); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelectedIdx = Math.max(cmdSelectedIdx - 1, 0); items.forEach((x, i) => x.classList.toggle('selected', i === cmdSelectedIdx)); items[cmdSelectedIdx]?.scrollIntoView({ block: 'nearest' }); }
            else if (e.key === 'Enter') { e.preventDefault(); items[cmdSelectedIdx]?.click(); }
            else if (e.key === 'Escape') { closeCmdPalette(); }
        });
    }
    if (cmdPalette) cmdPalette.addEventListener('click', e => { if (e.target === cmdPalette) closeCmdPalette(); });

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: KEYBOARD SHORTCUTS OVERLAY ═══
    // ═══════════════════════════════════════════════════
    const shortcutsOverlay = document.getElementById('shortcuts-overlay');
    const shortcutsData = [
        ['1', 'Sélection'], ['2', 'Charge +'], ['3', 'Charge −'], ['4', 'Sonde'],
        ['5', 'Charge test'], ['6', 'Surface Gauss'], ['7', 'Travail W'], ['8', 'Charge libre'],
        ['Ctrl+Z', 'Annuler'], ['Ctrl+Y', 'Rétablir'], ['Ctrl+K', 'Palette commandes'],
        ['?', 'Raccourcis'], ['S', 'Capture d\'écran'], ['F', 'Plein écran'],
        ['L', 'Mode clair'], ['P', 'Présentation'], ['R', 'Reset vue'],
        ['C', 'Effacer tout'], ['A', 'Annotations'], ['D', 'Superposition'],
        ['M', 'Mini-carte'], ['G', 'Grille magnétique'], ['Del', 'Supprimer charge'],
        ['Esc', 'Désélectionner'], ['Molette', 'Zoom'], ['Shift+Drag', 'Snap grille']
    ];
    function showShortcuts() {
        if (!shortcutsOverlay) return;
        const list = document.getElementById('shortcuts-list');
        if (list) {
            list.innerHTML = '';
            shortcutsData.forEach(([key, desc]) => {
                const row = document.createElement('div');
                row.className = 'shortcut-row';
                row.innerHTML = `<span class="shortcut-desc">${desc}</span><span class="shortcut-key">${key}</span>`;
                list.appendChild(row);
            });
        }
        shortcutsOverlay.style.display = 'flex';
    }
    if (shortcutsOverlay) {
        shortcutsOverlay.addEventListener('click', e => { if (e.target === shortcutsOverlay) shortcutsOverlay.style.display = 'none'; });
        const closeBtn = document.getElementById('shortcuts-close');
        if (closeBtn) closeBtn.addEventListener('click', () => shortcutsOverlay.style.display = 'none');
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: ZOOM-TO-FIT ═══
    // ═══════════════════════════════════════════════════
    function doZoomFit() {
        if (S.charges.length === 0) { zoomTarget = 1; S.pan = { x: 0, y: 0 }; markDirty(); return; }
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const c of S.charges) {
            if (c.x < minX) minX = c.x; if (c.x > maxX) maxX = c.x;
            if (c.y < minY) minY = c.y; if (c.y > maxY) maxY = c.y;
        }
        const padW = 1.5, padH = 1.5;
        const spanX = Math.max(maxX - minX + padW * 2, 2);
        const spanY = Math.max(maxY - minY + padH * 2, 2);
        const zx = viewportW / (spanX * SC);
        const zy = viewportH / (spanY * SC);
        zoomTarget = Math.max(0.2, Math.min(3, Math.min(zx, zy)));
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        S.pan.x = -cx * SC * zoomTarget;
        S.pan.y = cy * SC * zoomTarget;
        markDirty();
    }
    const btnZoomFit = document.getElementById('btn-zoomfit');
    if (btnZoomFit) btnZoomFit.addEventListener('click', doZoomFit);

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: SNAP-TO-GRID ═══
    // ═══════════════════════════════════════════════════
    let snapEnabled = false;
    const SNAP_SIZE = 0.25;
    const snapToggle = document.getElementById('setting-snap');
    if (snapToggle) {
        snapToggle.addEventListener('change', () => { snapEnabled = snapToggle.checked; markDirty(); });
    }
    // Patch the existing snapGrid to respect the toggle
    const _origSnapGrid = snapGrid;
    snapGrid = function (v) {
        if (snapEnabled) return Math.round(v / SNAP_SIZE) * SNAP_SIZE;
        return _origSnapGrid(v);
    };

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CHARGE LOCKING ═══
    // ═══════════════════════════════════════════════════
    // 'locked' property on charges: Shift+right-click to toggle lock
    canvas.addEventListener('contextmenu', e => {
        if (!e.shiftKey) return; // Only lock on Shift+right-click
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const px = e.clientX - rect.left, py = e.clientY - rect.top;
        const idx = chAt(px, py);
        if (idx >= 0) {
            S.charges[idx].locked = !S.charges[idx].locked;
            markDirty();
            if (soundEnabled) playTone(S.charges[idx].locked ? 600 : 400, 0.08, 0.06);
        }
    });

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: URL DEEP-LINKING ENHANCED ═══
    // ═══════════════════════════════════════════════════
    // Encode viz state in URL too
    function updateURLHash() {
        if (S.charges.length === 0) { history.replaceState(null, '', location.pathname); return; }
        const config = encodeConfig();
        history.replaceState(null, '', '#config=' + config);
    }
    // Auto-update hash when charges change (debounced)
    let _hashTimer = null;
    const origSaveHistory = saveHistory;
    saveHistory = function () {
        origSaveHistory();
        clearTimeout(_hashTimer);
        _hashTimer = setTimeout(updateURLHash, 1000);
    };

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: SOUND EFFECTS ═══
    // ═══════════════════════════════════════════════════
    let soundEnabled = false;
    let audioCtx = null;
    const soundToggle = document.getElementById('setting-sound');
    if (soundToggle) {
        soundToggle.addEventListener('change', () => {
            soundEnabled = soundToggle.checked;
            if (soundEnabled) {
                if (!audioCtx) {
                    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { soundEnabled = false; }
                }
                // Resume suspended AudioContext (browser autoplay policy)
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            }
            // Play confirmation tone so user knows sound is working
            if (soundEnabled) setTimeout(() => playTone(660, 0.15, 0.15), 80);
        });
    }
    function playTone(freq, dur, vol) {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(vol || 0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            osc.start(); osc.stop(audioCtx.currentTime + dur);
        } catch (e) { /* silent fail */ }
    }
    // Hook into charge placement for sound
    const _origCanvasDown = canvas.onmousedown;
    canvas.addEventListener('mousedown', () => {
        if (S.tool === 'positive' || S.tool === 'negative') {
            playTone(S.tool === 'positive' ? 523 : 330, 0.15, 0.06);
        }
    }, true);

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CONFETTI ON QUIZ 100% ═══
    // ═══════════════════════════════════════════════════
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    function launchConfetti() {
        if (!confettiCanvas || !confettiCtx) return;
        confettiCanvas.style.display = 'block';
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        const pieces = [];
        const colors = ['#00e5ff', '#ff006e', '#76ff03', '#ffd600', '#aa00ff', '#ff8800'];
        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * confettiCanvas.width,
                y: -20 - Math.random() * 100,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                vx: (Math.random() - 0.5) * 6,
                vy: 2 + Math.random() * 5,
                rot: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }
        let frames = 0;
        function animConfetti() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = 0;
            for (const p of pieces) {
                p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.rv;
                p.life -= 0.005;
                if (p.life <= 0 || p.y > confettiCanvas.height + 20) continue;
                alive++;
                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate(p.rot);
                confettiCtx.globalAlpha = Math.max(0, p.life);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                confettiCtx.restore();
            }
            frames++;
            if (alive > 0 && frames < 300) requestAnimationFrame(animConfetti);
            else { confettiCanvas.style.display = 'none'; }
        }
        requestAnimationFrame(animConfetti);
        playTone(784, 0.3, 0.08);
        setTimeout(() => playTone(988, 0.3, 0.08), 150);
        setTimeout(() => playTone(1175, 0.5, 0.1), 300);
    }
    // Patch quiz to trigger confetti on 100%
    const _origQuizNext = document.getElementById('quiz-next');
    if (_origQuizNext) {
        const origNextHandler = _origQuizNext.onclick;
        _origQuizNext.addEventListener('click', () => {
            const questions = getQuizQuestions();
            if (quizIdx === questions.length - 1 && quizAnswered && quizScore === questions.length) {
                setTimeout(launchConfetti, 300);
            }
        });
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: ANIMATED FIELD-LINE FLOW ═══
    // ═══════════════════════════════════════════════════
    let fieldFlowEnabled = false;
    const fieldFlowToggle = document.getElementById('setting-fieldflow');
    if (fieldFlowToggle) {
        fieldFlowToggle.addEventListener('change', () => {
            fieldFlowEnabled = fieldFlowToggle.checked;
            _cacheHash = ''; // Force rebuild to cache flow paths
            markDirty();
        });
    }
    // The field-line dash offset animation is done in the render loop patch below

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: MINIMAP ═══
    // ═══════════════════════════════════════════════════
    let minimapVisible = false;
    const minimapEl = document.getElementById('minimap');
    const minimapCanvas = document.getElementById('minimap-canvas');
    const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    function toggleMinimap() {
        minimapVisible = !minimapVisible;
        if (minimapEl) minimapEl.style.display = minimapVisible ? 'block' : 'none';
    }
    const btnMinimap2 = document.getElementById('btn-minimap');
    if (btnMinimap2) btnMinimap2.addEventListener('click', toggleMinimap);

    function renderMinimap() {
        if (!minimapVisible || !minimapCtx || !minimapCanvas) return;
        const mw = minimapCanvas.width, mh = minimapCanvas.height;
        minimapCtx.clearRect(0, 0, mw, mh);
        minimapCtx.fillStyle = 'rgba(5,9,16,0.85)';
        minimapCtx.fillRect(0, 0, mw, mh);
        if (S.charges.length === 0) return;
        // Calculate bounds
        let minX = -3, maxX = 3, minY = -3, maxY = 3;
        for (const c of S.charges) {
            if (c.x - 1 < minX) minX = c.x - 1;
            if (c.x + 1 > maxX) maxX = c.x + 1;
            if (c.y - 1 < minY) minY = c.y - 1;
            if (c.y + 1 > maxY) maxY = c.y + 1;
        }
        const spanX = maxX - minX, spanY = maxY - minY;
        const scale = Math.min(mw / spanX, mh / spanY) * 0.85;
        const ox = mw / 2 - ((minX + maxX) / 2) * scale;
        const oy = mh / 2 + ((minY + maxY) / 2) * scale;
        // Draw charges
        for (const c of S.charges) {
            const mx = ox + c.x * scale, my = oy - c.y * scale;
            minimapCtx.beginPath();
            minimapCtx.arc(mx, my, Math.max(2, 3 * Math.abs(c.q) * 0.3), 0, Math.PI * 2);
            minimapCtx.fillStyle = c.q > 0 ? '#00e5ff' : '#ff006e';
            minimapCtx.fill();
        }
        // Draw viewport rectangle
        const vpCx = viewportW / 2, vpCy = viewportH / 2;
        const topLeft = p2w(0, 0), botRight = p2w(viewportW, viewportH);
        const rx = ox + topLeft.x * scale, ry = oy - topLeft.y * scale;
        const rw = (botRight.x - topLeft.x) * scale, rh = (topLeft.y - botRight.y) * scale;
        minimapCtx.strokeStyle = 'rgba(0,229,255,0.5)';
        minimapCtx.lineWidth = 1;
        minimapCtx.strokeRect(rx, ry, rw, rh);
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: ENERGY DENSITY HEATMAP ═══
    // ═══════════════════════════════════════════════════
    // Energy density u = ½ε₀E² — rendered as soft overlay via the existing GPU pipeline
    // We add it as heatmap mode 4 in the radio group dynamically
    function addEnergyDensityOption() {
        const heatGroup = document.querySelector('[name="heatmap-mode"]')?.closest('.toggle-group');
        if (!heatGroup) return;
        const row = document.createElement('label');
        row.className = 'toggle-row';
        row.innerHTML = `<input type="radio" name="heatmap-mode" id="heatmap-energy" value="4">
            <span class="radio-dot"></span><span class="toggle-label">Densité énergie u</span>
            <span class="toggle-color" style="background:linear-gradient(90deg,#000,#ff8800,#ffff00)"></span>`;
        heatGroup.appendChild(row);
        row.querySelector('input').addEventListener('change', e => {
            S.viz.heatmap = parseInt(e.target.value);
            markDirty();
        });
    }
    addEnergyDensityOption();

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: MIRROR CHARGE / GROUNDED PLANE ═══
    // ═══════════════════════════════════════════════════
    let mirrorEnabled = false;
    const mirrorToggle = document.getElementById('setting-mirror');
    if (mirrorToggle) {
        mirrorToggle.addEventListener('change', () => {
            mirrorEnabled = mirrorToggle.checked;
            _cacheHash = ''; // Force full cache rebuild with/without mirror charges
            markDirty();
        });
    }
    function getMirrorCharges() {
        if (!mirrorEnabled) return [];
        return S.charges.map(c => ({ x: c.x, y: -c.y, q: -c.q, mirror: true }));
    }
    // Patch eF and eP to include mirror charges
    const _eF = eF, _eP = eP;
    eF = function (x, y) {
        const base = _eF(x, y);
        if (!mirrorEnabled) return base;
        const mc = getMirrorCharges();
        let Ex = base.x, Ey = base.y;
        for (const c of mc) {
            const dx = x - c.x, dy = y - c.y, d = Math.max(Math.hypot(dx, dy), MR);
            const e = K * c.q * MU / (d * d);
            Ex += e * dx / d; Ey += e * dy / d;
        }
        return { x: Ex, y: Ey };
    };
    eP = function (x, y) {
        let v = _eP(x, y);
        if (!mirrorEnabled) return v;
        const mc = getMirrorCharges();
        for (const c of mc) {
            const d = Math.max(Math.hypot(x - c.x, y - c.y), MR);
            v += K * c.q * MU / d;
        }
        return v;
    };

    // Render mirror plane and ghost charges
    function renderMirror() {
        if (!mirrorEnabled) return;
        // Draw ground plane at y=0
        const left = p2w(0, viewportH / 2), right = p2w(viewportW, viewportH / 2);
        const py0 = w2p(0, 0).y;
        ctx.save();
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'rgba(118,255,3,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, py0);
        ctx.lineTo(viewportW, py0);
        ctx.stroke();
        ctx.setLineDash([]);
        // Ground hatching
        for (let x = 0; x < viewportW; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, py0);
            ctx.lineTo(x - 8, py0 + 10);
            ctx.strokeStyle = 'rgba(118,255,3,0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        // Draw mirror charges as ghosts
        const mc = getMirrorCharges();
        for (const c of mc) {
            const p = w2p(c.x, c.y);
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, CR * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = c.q > 0 ? 'rgba(0,229,255,0.3)' : 'rgba(255,0,110,0.3)';
            ctx.fill();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = c.q > 0 ? 'rgba(0,229,255,0.4)' : 'rgba(255,0,110,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '600 10px Inter';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText((c.q > 0 ? '+' : '') + c.q.toFixed(1), p.x, p.y + 3);
            ctx.globalAlpha = 1;
        }
        // Label
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(118,255,3,0.4)';
        ctx.textAlign = 'left';
        ctx.fillText('⏚ V = 0 (plan de masse)', 8, py0 - 6);
        ctx.restore();
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CAPACITOR ENERGY PANEL ═══
    // ═══════════════════════════════════════════════════
    const _origUpdateCap = typeof updateCapacitorPanel === 'function' ? updateCapacitorPanel : null;
    if (typeof updateCapacitorPanel === 'function') {
        const _baseUpdateCap = updateCapacitorPanel;
        updateCapacitorPanel = function () {
            _baseUpdateCap();
            if (S.charges.length < 4) return;
            const pos = S.charges.filter(c => c.q > 0);
            const neg = S.charges.filter(c => c.q < 0);
            if (pos.length === 0 || neg.length === 0) return;
            const cp = pos.reduce((s, c) => ({ x: s.x + c.x, y: s.y + c.y }), { x: 0, y: 0 });
            cp.x /= pos.length; cp.y /= pos.length;
            const cn = neg.reduce((s, c) => ({ x: s.x + c.x, y: s.y + c.y }), { x: 0, y: 0 });
            cn.x /= neg.length; cn.y /= neg.length;
            const d = Math.hypot(cp.x - cn.x, cp.y - cn.y);
            if (d < 0.01) return;
            const VA = eP(cp.x, cp.y), VB = eP(cn.x, cn.y);
            const DV = Math.abs(VA - VB);
            // Rough planar capacitance: C ≈ ε₀ A/d (assume unit area for demonstration)
            const A_est = 0.01; // 1 cm² demo area
            const C_est = EPS0 * A_est / (d * 0.01);
            const U_est = 0.5 * C_est * DV * DV;
            const Q_total = pos.reduce((s, c) => s + Math.abs(c.q), 0);
            const sigma = Q_total * MU / A_est;
            const capC = document.getElementById('cap-c');
            const capU = document.getElementById('cap-u');
            const capSigma = document.getElementById('cap-sigma');
            if (capC) capC.textContent = fmtSI(C_est, 'F');
            if (capU) capU.textContent = fmtSI(U_est, 'J');
            if (capSigma) capSigma.textContent = fmtSI(sigma, 'C/m²');
        };
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: ENHANCED ELECTRIC FLUX COUNTER ═══
    // ═══════════════════════════════════════════════════
    // Flux is already computed in Gauss. Enhance the display with auto-computed flux lines
    // This patches renderGauss to also show flux line count
    const _origRenderGauss = renderGauss;
    renderGauss = function () {
        _origRenderGauss();
        if (!S.gauss) return;
        const res = computeGauss(S.gauss.x, S.gauss.y, S.gauss.r);
        const p = w2p(S.gauss.x, S.gauss.y);
        const rPx = S.gauss.r * SC * S.zoom;
        // Draw flux value near circle
        ctx.font = '600 10px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(118,255,3,0.6)';
        ctx.fillText('Φ = ' + fmtSI(res.flux, 'N·m²/C'), p.x, p.y - rPx - 8);
        // Number of enclosed charges
        let nEnc = 0;
        for (const c of S.charges) if (Math.hypot(c.x - S.gauss.x, c.y - S.gauss.y) < S.gauss.r) nEnc++;
        ctx.fillText(nEnc + ' charge' + (nEnc !== 1 ? 's' : '') + ' encl.', p.x, p.y - rPx - 20);
    };

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: DIELECTRIC REGIONS (VISUAL) ═══
    // ═══════════════════════════════════════════════════
    // Simple visual dielectric zone — rendered as a tinted rectangle
    // Users can see the effect of reduced field in dielectric
    // For a visual demo, we draw a hatched region where E is scaled by 1/εr
    let dielectricRegion = null; // { x, y, w, h, er }
    function renderDielectric() {
        if (!dielectricRegion) return;
        const dr = dielectricRegion;
        const tl = w2p(dr.x, dr.y), br = w2p(dr.x + dr.w, dr.y - dr.h);
        const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;
        ctx.save();
        ctx.fillStyle = 'rgba(170,0,255,0.06)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = 'rgba(170,0,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);
        // Cross-hatch pattern
        ctx.strokeStyle = 'rgba(170,0,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let x = rx; x < rx + rw; x += 12) {
            ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x + rh * 0.5, ry + rh); ctx.stroke();
        }
        // Label
        ctx.font = '600 10px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(170,0,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('εr = ' + dr.er.toFixed(1), rx + rw / 2, ry + rh / 2);
        ctx.fillText('E\' = E / εr', rx + rw / 2, ry + rh / 2 + 14);
        ctx.restore();
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: TIMELINE SCRUBBER ═══
    // ═══════════════════════════════════════════════════
    // Allows scrubbing through undo history like a timeline
    function getTimelineData() {
        return S.history.map((h, i) => {
            const charges = JSON.parse(h);
            return { idx: i, n: charges.length, current: i === S.historyIdx };
        });
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CUSTOM COLOR THEMES ═══
    // ═══════════════════════════════════════════════════
    const colorThemes = {
        default: { accent: '#00e5ff', positive: '#00e5ff', negative: '#ff006e', bg: '#050910' },
        ocean: { accent: '#00bcd4', positive: '#26c6da', negative: '#ef5350', bg: '#0a1929' },
        forest: { accent: '#76ff03', positive: '#69f0ae', negative: '#ff6e40', bg: '#0a1a0a' },
        sunset: { accent: '#ffd600', positive: '#ffab00', negative: '#d500f9', bg: '#1a0a05' },
        mono: { accent: '#90a4ae', positive: '#b0bec5', negative: '#78909c', bg: '#0a0a0a' }
    };
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    function applyTheme(name) {
        const t = colorThemes[name];
        if (!t) return;
        document.documentElement.style.setProperty('--text-accent', t.accent);
        document.documentElement.style.setProperty('--positive', t.positive);
        document.documentElement.style.setProperty('--positive-glow', hexToRgba(t.positive, 0.35));
        document.documentElement.style.setProperty('--negative', t.negative);
        document.documentElement.style.setProperty('--bg-primary', t.bg);
        markDirty();
    }

    // ═══════════════════════════════════════════════════
    // ═══ RENDER LOOP PATCHES ═══
    // ═══════════════════════════════════════════════════
    // Register core post-render hooks
    postRenderHooks.push(renderMirror);
    postRenderHooks.push(renderDielectric);
    postRenderHooks.push(renderMinimap);

    // Store traced field-line paths for animated flow overlay
    let _cachedFlowPaths = [];
    const _origCacheFL = cacheFieldLines;
    cacheFieldLines = function () {
        _origCacheFL();
        _cachedFlowPaths = [];
        if (!fieldFlowEnabled) return;
        const dn = Math.round(S.set.density * S.qualMult[S.set.quality]);
        for (const ch of S.charges) {
            if (ch.q <= 0) continue;
            const n = Math.max(4, Math.round(dn * Math.abs(ch.q)));
            for (let i = 0; i < n; i++) {
                const a = 2 * Math.PI * i / n;
                const pts = trace(ch.x + .09 * Math.cos(a), ch.y + .09 * Math.sin(a), 1);
                if (pts.length < 2) continue;
                _cachedFlowPaths.push(pts.map(p => w2p(p.x, p.y)));
            }
        }
        if (!S.charges.some(q => q.q > 0)) {
            for (const ch of S.charges) {
                if (ch.q >= 0) continue;
                const n = Math.max(4, Math.round(dn * Math.abs(ch.q)));
                for (let i = 0; i < n; i++) {
                    const a = 2 * Math.PI * i / n;
                    const pts = trace(ch.x + .09 * Math.cos(a), ch.y + .09 * Math.sin(a), -1);
                    if (pts.length < 2) continue;
                    _cachedFlowPaths.push(pts.map(p => w2p(p.x, p.y)));
                }
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ═══ ADDITIONAL KEYBOARD SHORTCUTS ═══
    // ═══════════════════════════════════════════════════════════
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        // Ctrl+K or Cmd+K → command palette
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (cmdPalette.style.display === 'none') openCmdPalette();
            else closeCmdPalette();
            return;
        }
        // ? → shortcuts overlay
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (shortcutsOverlay) {
                if (shortcutsOverlay.style.display === 'none' || shortcutsOverlay.style.display === '') showShortcuts();
                else shortcutsOverlay.style.display = 'none';
            }
            return;
        }
        // M → minimap
        if (e.key === 'm' || e.key === 'M') {
            if (!e.ctrlKey && !e.metaKey) toggleMinimap();
            return;
        }
        // G → snap grid
        if (e.key === 'g' || e.key === 'G') {
            if (!e.ctrlKey && !e.metaKey) {
                const el = document.getElementById('setting-snap');
                if (el) { el.checked = !el.checked; snapEnabled = el.checked; markDirty(); }
            }
            return;
        }
    });

    // ═══════════════════════════════════════════════════
    // ═══ ENHANCED 3D SURFACE: ROTATION ═══
    // ═══════════════════════════════════════════════════
    // The landscape already has isometric view. We enhance it with a subtle auto-rotation hint
    // This is done by slowly varying the camera angle in cacheLandscape
    // We add a rotation angle that increments slowly
    // Landscape rendering uses the standard cache (no rotation patch needed)

    // ═══════════════════════════════════════════════════
    // ═══ CHARGE LOCK RENDERING PATCH ═══
    // ═══════════════════════════════════════════════════
    // Draw lock icons on locked charges in post-render
    postRenderHooks.push(function renderLockIcons() {
        for (const c of S.charges) {
            if (!c.locked) continue;
            const p = w2p(c.x, c.y);
            ctx.font = '10px serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,214,0,0.7)';
            ctx.fillText('🔒', p.x + CR * 0.6, p.y - CR * 0.6);
        }
    });

    // ═══════════════════════════════════════════════════
    // ═══ SNAP GRID VISUAL OVERLAY ═══
    // ═══════════════════════════════════════════════════
    postRenderHooks.push(function renderSnapGrid() {
        if (!snapEnabled) return;
        const gs = SNAP_SIZE * SC * S.zoom;
        if (gs < 10) return; // Too small to draw
        ctx.save();
        ctx.strokeStyle = 'rgba(118,255,3,0.15)';
        ctx.lineWidth = 0.5;
        const o = w2p(0, 0);
        ctx.beginPath();
        for (let x = (o.x % gs + gs) % gs; x < viewportW; x += gs) {
            ctx.moveTo(x, 0); ctx.lineTo(x, viewportH);
        }
        for (let y = (o.y % gs + gs) % gs; y < viewportH; y += gs) {
            ctx.moveTo(0, y); ctx.lineTo(viewportW, y);
        }
        ctx.stroke();
        ctx.restore();
    });

    // ═══════════════════════════════════════════════════
    // ═══ FIELD FLOW ANIMATED DASHES ═══
    // ═══════════════════════════════════════════════════
    // Field flow: draw cached paths with animated dash offset
    postRenderHooks.push(function renderFieldFlow() {
        if (!fieldFlowEnabled || S.charges.length === 0 || _cachedFlowPaths.length === 0) return;
        const offset = -S.frame * 0.8;
        ctx.save();
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = offset;
        ctx.strokeStyle = 'rgba(0,229,255,0.3)';
        ctx.lineWidth = 2.5;
        for (const path of _cachedFlowPaths) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
    });

    // ═══════════════════════════════════════════════════
    // ═══ ENERGY DENSITY OVERLAY (mode 4) ═══
    // ═══════════════════════════════════════════════════
    // When heatmap mode is 4, we render energy density u = ½ε₀E² on a cached canvas
    let _energyCache = null, _energyCacheHash = '';
    // Energy density is called EARLY in postRenderHooks (index 0 via unshift) so it draws under charges
    postRenderHooks.unshift(function renderEnergyDensity() {
        if (S.viz.heatmap !== 4 || S.charges.length === 0) return;
        const h = computeCacheHash() + '|energy4';
        if (h !== _energyCacheHash) {
            _energyCacheHash = h;
            if (!_energyCache) { _energyCache = document.createElement('canvas'); }
            _energyCache.width = viewportW; _energyCache.height = viewportH;
            const ec = _energyCache.getContext('2d');
            const step = S.set.quality >= 2 ? 8 : 14;
            for (let px = 0; px < viewportW; px += step) {
                for (let py = 0; py < viewportH; py += step) {
                    const w = p2w(px, py);
                    const e = _eF(w.x, w.y);
                    const em = Math.hypot(e.x, e.y);
                    const u = 0.5 * EPS0 * em * em;
                    const logU = Math.log10(u + 1);
                    const t = Math.min(1, logU / 6);
                    if (t < 0.01) continue;
                    let rv, gv, bv;
                    if (t < 0.33) { const s = t / 0.33; rv = 255 * s | 0; gv = 136 * s | 0; bv = 0; }
                    else if (t < 0.66) { const s = (t - 0.33) / 0.33; rv = 255; gv = 136 + 119 * s | 0; bv = 0; }
                    else { const s = (t - 0.66) / 0.34; rv = 255; gv = 255; bv = 255 * s | 0; }
                    ec.fillStyle = `rgba(${rv},${gv},${bv},${0.3 * t})`;
                    ec.fillRect(px, py, step, step);
                }
            }
        }
        if (_energyCache) ctx.drawImage(_energyCache, 0, 0);
    });

    // Lock drag prevention is now handled directly in the main mousedown handler above

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CHROMATIC ABERRATION TOGGLE ═══
    // ═══════════════════════════════════════════════════
    let chromaticEnabled = false;
    const chromaticToggle = document.getElementById('setting-chromatic');
    if (chromaticToggle) {
        chromaticToggle.addEventListener('change', () => {
            chromaticEnabled = chromaticToggle.checked;
            markDirty(); // Force re-render so chromatic effect appears/disappears immediately
        });
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: SYNESTHETIC THEREMIN AUDIO ═══
    // ═══════════════════════════════════════════════════
    let thereminEnabled = false;
    let thereminOsc = null, thereminGain = null, thereminFilter = null;
    const thereminToggle = document.getElementById('setting-theremin');
    function ensureTheremin() {
        if (thereminOsc) return true;
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
        }
        // Resume suspended AudioContext (browser autoplay policy)
        if (audioCtx.state === 'suspended') audioCtx.resume();
        thereminOsc = audioCtx.createOscillator();
        thereminGain = audioCtx.createGain();
        thereminFilter = audioCtx.createBiquadFilter();
        thereminFilter.type = 'lowpass';
        thereminFilter.frequency.value = 2000;
        thereminOsc.connect(thereminFilter);
        thereminFilter.connect(thereminGain);
        thereminGain.connect(audioCtx.destination);
        thereminOsc.type = 'sine';
        thereminOsc.frequency.value = 440;
        thereminGain.gain.value = 0;
        thereminOsc.start();
        return true;
    }
    function killTheremin() {
        if (!thereminOsc) return;
        try { thereminOsc.stop(); } catch (e) { }
        thereminOsc.disconnect(); thereminFilter.disconnect(); thereminGain.disconnect();
        thereminOsc = null; thereminGain = null; thereminFilter = null;
    }
    if (thereminToggle) {
        thereminToggle.addEventListener('change', () => {
            thereminEnabled = thereminToggle.checked;
            if (thereminEnabled) {
                // Also enable sound if not already
                if (!soundEnabled && soundToggle) { soundToggle.checked = true; soundToggle.dispatchEvent(new Event('change')); }
                ensureTheremin();
            } else {
                killTheremin();
            }
        });
    }
    // Theremin indicator element
    const thereminIndicator = document.getElementById('theremin-indicator');
    const thereminFreqBar = document.getElementById('theremin-freq');
    const thereminVolBar = document.getElementById('theremin-vol');
    postRenderHooks.push(function updateTheremin() {
        if (!thereminEnabled || S.charges.length === 0) {
            if (thereminGain) {
                try { thereminGain.gain.linearRampToValueAtTime(0, (audioCtx ? audioCtx.currentTime : 0) + 0.05); } catch(e){}
            }
            if (thereminIndicator) thereminIndicator.style.display = 'none';
            return;
        }
        if (!ensureTheremin()) return;
        const w = p2w(S.mouse.x, S.mouse.y);
        const ef = eF(w.x, w.y), v = eP(w.x, w.y), em = Math.hypot(ef.x, ef.y);
        // Potential → pitch: log-compressed, mapped to 80–2400 Hz
        const vNorm = Math.max(-1, Math.min(1, v / 3e5));
        const freq = 80 * Math.pow(30, (vNorm + 1) * 0.5);
        // Field magnitude → volume: 0–0.6 (audible!)
        const vol = Math.min(0.6, Math.log10(em + 1) / 8);
        // Field magnitude → filter cutoff
        const cutoff = 400 + Math.min(6000, em * 0.08);
        // Field magnitude → waveform morphing
        if (em > 5e4) thereminOsc.type = 'sawtooth';
        else if (em > 1e4) thereminOsc.type = 'triangle';
        else thereminOsc.type = 'sine';
        const t = audioCtx.currentTime;
        thereminOsc.frequency.linearRampToValueAtTime(freq, t + 0.04);
        thereminGain.gain.linearRampToValueAtTime(vol, t + 0.04);
        thereminFilter.frequency.linearRampToValueAtTime(cutoff, t + 0.04);
        // Update visual indicator
        if (thereminIndicator) {
            thereminIndicator.style.display = 'flex';
            const freqPct = Math.round(((vNorm + 1) * 0.5) * 100);
            const volPct = Math.round((vol / 0.6) * 100);
            if (thereminFreqBar) thereminFreqBar.style.width = freqPct + '%';
            if (thereminVolBar) thereminVolBar.style.width = volPct + '%';
        }
    });
    // Clean up theremin when sound is toggled off
    if (soundToggle) {
        soundToggle.addEventListener('change', () => {
            if (!soundToggle.checked) { killTheremin(); thereminEnabled = false; if (thereminToggle) thereminToggle.checked = false; }
        });
    }

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: ELECTRIC GOLF MODE ⛳ ═══
    // ═══════════════════════════════════════════════════
    const golfLevels = [
        {
            name: 'Ligne Droite',
            desc: 'Placez des charges pour guider la balle vers le trou !',
            start: { x: -2.5, y: 0 },
            target: { x: 2.5, y: 0 },
            maxCharges: 2,
            par: 1,
            walls: []
        },
        {
            name: 'Le Virage',
            desc: 'Créez un champ qui courbe la trajectoire autour du mur.',
            start: { x: -2, y: -1 },
            target: { x: 2, y: 1.5 },
            maxCharges: 3,
            par: 2,
            walls: [{ x1: 0, y1: -2.5, x2: 0, y2: 0.8 }]
        },
        {
            name: 'Le Slalom',
            desc: 'Naviguez entre les portes avec précision.',
            start: { x: -2.5, y: 0 },
            target: { x: 2.5, y: 0 },
            maxCharges: 4,
            par: 2,
            walls: [
                { x1: -1, y1: -2.5, x2: -1, y2: -0.4 },
                { x1: -1, y1: 0.4, x2: -1, y2: 2.5 },
                { x1: 1, y1: -2.5, x2: 1, y2: -0.4 },
                { x1: 1, y1: 0.4, x2: 1, y2: 2.5 }
            ]
        },
        {
            name: 'Le Puits',
            desc: 'Évitez le piège à charge négative au centre !',
            start: { x: -2.5, y: 0 },
            target: { x: 2.5, y: 0 },
            maxCharges: 4,
            par: 2,
            walls: [],
            obstacles: [{ x: 0, y: 0, q: -3 }]
        },
        {
            name: 'Le Labyrinthe',
            desc: 'Trouvez le chemin à travers le labyrinthe électrique.',
            start: { x: -2.5, y: -1.5 },
            target: { x: 2.5, y: 1.5 },
            maxCharges: 5,
            par: 3,
            walls: [
                { x1: -1.5, y1: -2.5, x2: -1.5, y2: 0.5 },
                { x1: 0, y1: -0.5, x2: 0, y2: 2.5 },
                { x1: 1.5, y1: -2.5, x2: 1.5, y2: 0.5 }
            ]
        }
    ];

    let golfState = null; // null = not in golf mode
    // golfState shape: { level, attempts, phase:'place'|'launch'|'win'|'fail', ball, trail }

    function enterGolf(levelIdx) {
        const lv = golfLevels[levelIdx];
        if (!lv) return;
        // Clear sim charges
        S.charges = []; S.sel = null; hideEd(); S.testCharges = []; S.freeCharge = null; S.freeTrail = [];
        S.pan = { x: 0, y: 0 }; zoomTarget = 1; S.zoom = 1; zoomVelocity = 0;
        // Place obstacle charges if any
        if (lv.obstacles) {
            for (const o of lv.obstacles) S.charges.push({ x: o.x, y: o.y, q: o.q, locked: true, golfObstacle: true });
        }
        golfState = {
            level: levelIdx,
            attempts: 0,
            phase: 'place',
            ball: null,
            trail: [],
            maxCharges: lv.maxCharges
        };
        // Switch to positive charge tool
        document.getElementById('tool-positive').click();
        markDirty(); updSt(); initP();
        updateGolfHUD();
        document.getElementById('golf-hud').style.display = 'flex';
        document.getElementById('golf-selector').style.display = 'none';
        if (soundEnabled) playTone(523, 0.15, 0.08);
    }

    function exitGolf() {
        golfState = null;
        S.charges = []; S.sel = null; hideEd(); S.freeCharge = null; S.freeTrail = [];
        markDirty(); updSt(); initP();
        document.getElementById('golf-hud').style.display = 'none';
        document.getElementById('tool-pointer').click();
    }

    function golfLaunch() {
        if (!golfState || golfState.phase !== 'place') return;
        const lv = golfLevels[golfState.level];
        golfState.phase = 'launch';
        golfState.attempts++;
        golfState.ball = { x: lv.start.x, y: lv.start.y, vx: 0, vy: 0 };
        golfState.trail = [{ x: lv.start.x, y: lv.start.y }];
        updateGolfHUD();
        if (soundEnabled) playTone(880, 0.1, 0.06);
    }

    function golfReset() {
        if (!golfState) return;
        // Keep user-placed charges, reset ball
        golfState.phase = 'place';
        golfState.ball = null;
        golfState.trail = [];
        updateGolfHUD();
    }

    function golfRetry() {
        if (!golfState) return;
        const lv = golfLevels[golfState.level];
        // Remove non-obstacle charges
        S.charges = S.charges.filter(c => c.golfObstacle);
        golfState.phase = 'place';
        golfState.ball = null;
        golfState.trail = [];
        markDirty(); updSt(); initP();
        updateGolfHUD();
        document.getElementById('tool-positive').click();
    }

    function updateGolfHUD() {
        if (!golfState) return;
        const lv = golfLevels[golfState.level];
        const el = (id) => document.getElementById(id);
        el('golf-level-name').textContent = `⛳ Niv. ${golfState.level + 1}: ${lv.name}`;
        el('golf-par').textContent = `Par: ${lv.par}`;
        el('golf-attempts').textContent = `Essais: ${golfState.attempts}`;
        const userCharges = S.charges.filter(c => !c.golfObstacle).length;
        el('golf-charges-left').textContent = `Charges: ${userCharges}/${lv.maxCharges}`;
        el('golf-instructions').textContent = golfState.phase === 'place' ? lv.desc
            : golfState.phase === 'launch' ? 'La balle est en mouvement...'
            : golfState.phase === 'win' ? '🎉 Bravo ! Trou en ' + golfState.attempts + ' !'
            : '💥 Raté ! Essayez encore.';
        el('golf-launch').textContent = golfState.phase === 'place' ? '🚀 Lancer' : golfState.phase === 'fail' ? '🔄 Réessayer' : '🚀 Lancer';
        el('golf-launch').disabled = golfState.phase === 'launch' || golfState.phase === 'win';
    }

    // Intercept charge placement in golf mode
    const _origMousedownGolf = canvas.onmousedown;
    canvas.addEventListener('mousedown', e => {
        if (!golfState || golfState.phase !== 'place') return;
        if (S.tool !== 'positive' && S.tool !== 'negative') return;
        const lv = golfLevels[golfState.level];
        const userCharges = S.charges.filter(c => !c.golfObstacle).length;
        if (userCharges >= lv.maxCharges) {
            e.stopImmediatePropagation();
            // Flash the HUD
            const hud = document.getElementById('golf-charges-left');
            if (hud) { hud.style.color = '#ff4444'; setTimeout(() => hud.style.color = '', 400); }
            if (soundEnabled) playTone(200, 0.2, 0.1);
        }
    }, true); // capture phase so it fires before the main handler

    // Golf physics & rendering in postRenderHooks
    const GOLF_TARGET_R = 0.3;
    postRenderHooks.push(function renderGolfMode() {
        if (!golfState) return;
        const lv = golfLevels[golfState.level];

        // === Draw target zone ===
        const tp = w2p(lv.target.x, lv.target.y);
        const trPx = GOLF_TARGET_R * SC * S.zoom;
        // Animated pulsing halo
        const pulse = 0.5 + 0.5 * Math.sin(S.frame * 0.05);
        const gr = ctx.createRadialGradient(tp.x, tp.y, trPx * 0.2, tp.x, tp.y, trPx * (1 + 0.3 * pulse));
        gr.addColorStop(0, 'rgba(118,255,3,0.25)');
        gr.addColorStop(0.6, 'rgba(118,255,3,0.08)');
        gr.addColorStop(1, 'rgba(118,255,3,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, trPx * (1 + 0.3 * pulse), 0, Math.PI * 2); ctx.fill();
        // Inner circle
        ctx.beginPath(); ctx.arc(tp.x, tp.y, trPx * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(118,255,3,0.3)'; ctx.fill();
        // Flag icon
        ctx.font = `${16 + 4 * pulse | 0}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('⛳', tp.x, tp.y);
        // "HOLE" label
        ctx.font = '600 9px "JetBrains Mono"'; ctx.fillStyle = 'rgba(118,255,3,0.5)';
        ctx.fillText('TROU', tp.x, tp.y + trPx + 12);

        // === Draw start zone ===
        const sp = w2p(lv.start.x, lv.start.y);
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,255,0.2)'; ctx.fill();
        ctx.strokeStyle = 'rgba(0,229,255,0.5)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = '600 9px "JetBrains Mono"'; ctx.fillStyle = 'rgba(0,229,255,0.5)';
        ctx.textAlign = 'center'; ctx.fillText('DÉPART', sp.x, sp.y + 18);

        // === Draw walls ===
        if (lv.walls) for (const w of lv.walls) {
            const wp1 = w2p(w.x1, w.y1), wp2 = w2p(w.x2, w.y2);
            ctx.beginPath(); ctx.moveTo(wp1.x, wp1.y); ctx.lineTo(wp2.x, wp2.y);
            ctx.strokeStyle = 'rgba(255,68,68,0.7)'; ctx.lineWidth = 3; ctx.stroke();
            // Glow
            ctx.strokeStyle = 'rgba(255,68,68,0.15)'; ctx.lineWidth = 10; ctx.stroke();
        }

        // === Ball physics & rendering ===
        if (golfState.phase === 'launch' && golfState.ball) {
            const b = golfState.ball;
            const SUB_STEPS = 6;
            const dtFull = 0.016 * Math.min(S.set.speed, 2);
            const dtSub = dtFull / SUB_STEPS;
            const SENSITIVITY = 0.00035; // tuned: gentle curves, not chaos
            const E_CAP = 25000;          // cap field so near-charges don't nuke the ball
            const DRAG = 0.993;           // friction per sub-step
            const SPEED_LIM = 4.0;        // world units/s max
            for (let ss = 0; ss < SUB_STEPS; ss++) {
                const ef = eF(b.x, b.y);
                const em = Math.hypot(ef.x, ef.y);
                const eCapped = Math.min(em, E_CAP);
                const eNx = em > 0.001 ? ef.x / em : 0;
                const eNy = em > 0.001 ? ef.y / em : 0;
                b.vx += SENSITIVITY * eCapped * eNx * dtSub;
                b.vy += SENSITIVITY * eCapped * eNy * dtSub;
                b.vx *= DRAG; b.vy *= DRAG;
                const spd = Math.hypot(b.vx, b.vy);
                if (spd > SPEED_LIM) { b.vx *= SPEED_LIM / spd; b.vy *= SPEED_LIM / spd; }
                b.x += b.vx * dtSub; b.y += b.vy * dtSub;
                // Inline wall + OOB + win checks each sub-step for accuracy
                if (Math.hypot(b.x - lv.target.x, b.y - lv.target.y) < GOLF_TARGET_R) {
                    golfState.phase = 'win'; updateGolfHUD();
                    if (soundEnabled) { playTone(784,0.2,0.1); setTimeout(()=>playTone(988,0.2,0.1),120); setTimeout(()=>playTone(1318,0.4,0.12),240); }
                    if (typeof launchConfetti === 'function') setTimeout(launchConfetti, 200);
                    break;
                }
                if (lv.walls) for (const w of lv.walls) {
                    const dx2=w.x2-w.x1,dy2=w.y2-w.y1,len2=dx2*dx2+dy2*dy2;
                    let t2=len2>0?((b.x-w.x1)*dx2+(b.y-w.y1)*dy2)/len2:0;
                    t2=Math.max(0,Math.min(1,t2));
                    if(Math.hypot(b.x-(w.x1+t2*dx2),b.y-(w.y1+t2*dy2))<0.08){golfState.phase='fail';updateGolfHUD();if(soundEnabled)playTone(150,0.3,0.12);break;}
                }
                if (golfState.phase !== 'launch') break;
                if (Math.abs(b.x) > 5.5 || Math.abs(b.y) > 5.5) { golfState.phase = 'fail'; updateGolfHUD(); if (soundEnabled) playTone(150,0.3,0.12); break; }
            }
            // Trail (after sub-steps)
            if (golfState.phase === 'launch' && S.frame % 2 === 0) golfState.trail.push({ x: b.x, y: b.y });
            if (golfState.trail.length > 600) golfState.trail.shift();

            // === Draw trail (win/fail/OOB checks handled in sub-step loop above) ===
            if (golfState.phase !== 'launch') return; // exit early if win/fail occurred

            // === Draw trail ===
            if (golfState.trail.length > 1) {
                ctx.beginPath();
                const tp0 = w2p(golfState.trail[0].x, golfState.trail[0].y);
                ctx.moveTo(tp0.x, tp0.y);
                for (let i = 1; i < golfState.trail.length; i++) {
                    const tp2 = w2p(golfState.trail[i].x, golfState.trail[i].y);
                    ctx.lineTo(tp2.x, tp2.y);
                }
                ctx.strokeStyle = 'rgba(0,229,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
            }

            // === Draw ball ===
            const bp = w2p(b.x, b.y);
            // Motion glow
            const bSpd = Math.hypot(b.vx, b.vy);
            const glowR = 8 + Math.min(12, bSpd * 0.15);
            const bg = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, glowR);
            bg.addColorStop(0, 'rgba(0,229,255,0.5)'); bg.addColorStop(1, 'rgba(0,229,255,0)');
            ctx.fillStyle = bg; ctx.fillRect(bp.x - glowR, bp.y - glowR, glowR * 2, glowR * 2);
            // Ball body
            ctx.beginPath(); ctx.arc(bp.x, bp.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff'; ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
            // Velocity arrow
            if (bSpd > 5) {
                const vAng = Math.atan2(b.vy, b.vx);
                const vLen = Math.min(25, bSpd * 0.3);
                arrow(ctx, bp.x + vLen * Math.cos(vAng), bp.y - vLen * Math.sin(vAng), -vAng, 5, 'rgba(0,229,255,0.6)');
            }
        }

        // === Draw ghost trail on fail ===
        if (golfState.phase === 'fail' && golfState.trail.length > 1) {
            ctx.beginPath();
            const fp0 = w2p(golfState.trail[0].x, golfState.trail[0].y);
            ctx.moveTo(fp0.x, fp0.y);
            for (let i = 1; i < golfState.trail.length; i++) {
                const fp = w2p(golfState.trail[i].x, golfState.trail[i].y);
                ctx.lineTo(fp.x, fp.y);
            }
            ctx.strokeStyle = 'rgba(255,68,68,0.3)'; ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
            // X mark at end
            const lastP = golfState.trail[golfState.trail.length - 1];
            const lp = w2p(lastP.x, lastP.y);
            ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,68,68,0.7)';
            ctx.fillText('💥', lp.x, lp.y);
        }
    });

    // Golf HUD button handlers
    const golfLaunchBtn = document.getElementById('golf-launch');
    const golfResetBtn = document.getElementById('golf-reset');
    const golfQuitBtn = document.getElementById('golf-quit');
    if (golfLaunchBtn) golfLaunchBtn.addEventListener('click', () => {
        if (!golfState) return;
        if (golfState.phase === 'place') golfLaunch();
        else if (golfState.phase === 'fail') golfReset();
        else if (golfState.phase === 'win') {
            // Next level
            const next = golfState.level + 1;
            if (next < golfLevels.length) enterGolf(next);
            else { exitGolf(); alert('🏆 Félicitations ! Vous avez terminé tous les niveaux !'); }
        }
    });
    if (golfResetBtn) golfResetBtn.addEventListener('click', golfRetry);
    if (golfQuitBtn) golfQuitBtn.addEventListener('click', exitGolf);

    // Golf level selector
    const golfLevelsEl = document.getElementById('golf-levels');
    if (golfLevelsEl) {
        golfLevels.forEach((lv, i) => {
            const btn = document.createElement('button');
            btn.className = 'golf-level-btn';
            btn.innerHTML = `<span class="golf-level-num">${i + 1}</span><div><strong>${lv.name}</strong><br><span style="font-size:11px;opacity:0.6">${lv.desc}</span><br><span style="font-size:10px;color:var(--text-accent)">Par: ${lv.par} · Max charges: ${lv.maxCharges}</span></div>`;
            btn.addEventListener('click', () => enterGolf(i));
            golfLevelsEl.appendChild(btn);
        });
    }
    document.getElementById('btn-golf')?.addEventListener('click', () => {
        document.getElementById('golf-selector').style.display = 'flex';
    });
    document.getElementById('golf-selector-close')?.addEventListener('click', () => {
        document.getElementById('golf-selector').style.display = 'none';
    });
    document.getElementById('golf-selector')?.addEventListener('click', e => {
        if (e.target.id === 'golf-selector') e.target.style.display = 'none';
    });

    // Add golf to command palette
    cmdActions.push(
        { icon: '⛳', label: 'Electric Golf', shortcut: '', action: () => document.getElementById('btn-golf')?.click() }
    );

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: VOICE CONTROL (Web Speech API) ═══
    // ═══════════════════════════════════════════════════
    const voiceOverlay = document.getElementById('voice-overlay');
    const voiceStatus = document.getElementById('voice-status');
    const voiceTranscript = document.getElementById('voice-transcript');
    const voiceActionEl = document.getElementById('voice-action');
    const voiceToast = document.getElementById('voice-toast');
    let voiceActive = false;
    let recognition = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceSupported = !!SpeechRecognition;

    function showVoiceToast(msg, icon) {
        if (!voiceToast) return;
        voiceToast.innerHTML = `<span class="voice-toast-icon">${icon || '🎤'}</span> ${msg}`;
        voiceToast.style.display = 'flex';
        voiceToast.classList.remove('voice-toast-out');
        voiceToast.classList.add('voice-toast-in');
        clearTimeout(voiceToast._timer);
        voiceToast._timer = setTimeout(() => {
            voiceToast.classList.remove('voice-toast-in');
            voiceToast.classList.add('voice-toast-out');
            setTimeout(() => { voiceToast.style.display = 'none'; }, 400);
        }, 2500);
    }

    // Voice command definitions: [regex pattern, action function, description]
    const voiceCommands = [
        // Charge placement
        [/charge\s*positiv|ajoute.*positiv|place.*positiv|\+/i, () => {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const w = p2w(cx, cy);
            S.charges.push({ x: snapGrid(w.x), y: snapGrid(w.y), q: 1 });
            addFX(cx, cy, true); saveHistory(); markDirty(); updSt(); initP();
            playTone(523, 0.15, 0.1);
            return 'Charge +1 μC ajoutée';
        }],
        [/charge\s*n[eé]gativ|ajoute.*n[eé]gativ|place.*n[eé]gativ|\-.*charge/i, () => {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const w = p2w(cx, cy);
            S.charges.push({ x: snapGrid(w.x), y: snapGrid(w.y), q: -1 });
            addFX(cx, cy, false); saveHistory(); markDirty(); updSt(); initP();
            playTone(330, 0.15, 0.1);
            return 'Charge −1 μC ajoutée';
        }],
        // Clear
        [/efface|supprime|nettoie|vide|clear|reset/i, () => {
            document.getElementById('btn-clear').click();
            return 'Tout effacé';
        }],
        // Visualization toggles
        [/ligne.*champ|field.*line/i, () => {
            const el = document.getElementById('viz-fieldlines');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Lignes de champ activées' : 'Lignes de champ désactivées';
        }],
        [/particule|particle/i, () => {
            const el = document.getElementById('viz-particles');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Particules activées' : 'Particules désactivées';
        }],
        [/vecteur|vector/i, () => {
            const el = document.getElementById('viz-vectors');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Champ vectoriel activé' : 'Champ vectoriel désactivé';
        }],
        [/[eé]quipotentiel/i, () => {
            const el = document.getElementById('viz-equipotential');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Équipotentielles activées' : 'Équipotentielles désactivées';
        }],
        [/arc|[eé]clair|lightning/i, () => {
            const el = document.getElementById('viz-arcs');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Arcs activés' : 'Arcs désactivés';
        }],
        [/bloom/i, () => {
            const el = document.getElementById('viz-bloom');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Bloom activé' : 'Bloom désactivé';
        }],
        [/force|coulomb/i, () => {
            const el = document.getElementById('viz-forces');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Forces de Coulomb affichées' : 'Forces masquées';
        }],
        [/3d|paysage|landscape|relief/i, () => {
            const el = document.getElementById('viz-landscape');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Paysage 3D activé' : 'Paysage 3D désactivé';
        }],
        [/superposition/i, () => {
            const el = document.getElementById('viz-superposition');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Superposition activée' : 'Superposition désactivée';
        }],
        // GPU heatmap modes
        [/potentiel|potential/i, () => {
            const r = document.querySelector('input[name="heatmap-mode"][value="1"]');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            return 'Carte GPU : Potentiel V';
        }],
        [/magnitude|intensit/i, () => {
            const r = document.querySelector('input[name="heatmap-mode"][value="2"]');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            return 'Carte GPU : Magnitude |E|';
        }],
        [/direction/i, () => {
            const r = document.querySelector('input[name="heatmap-mode"][value="3"]');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            return 'Carte GPU : Direction';
        }],
        [/densit[eé].*[eé]nergie|energy.*density/i, () => {
            const r = document.querySelector('input[name="heatmap-mode"][value="4"]');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            return 'Carte GPU : Densité d\'énergie';
        }],
        [/d[eé]sactive.*carte|arr[eê]te.*carte|carte.*off|heatmap.*off/i, () => {
            const r = document.querySelector('input[name="heatmap-mode"][value="0"]');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            return 'Carte GPU désactivée';
        }],
        // Presets
        [/dip[oô]le/i, () => {
            document.querySelector('[data-preset="dipole"]')?.click();
            return 'Preset : Dipôle';
        }],
        [/condensateur|capacitor/i, () => {
            document.querySelector('[data-preset="capacitor"]')?.click();
            return 'Preset : Condensateur';
        }],
        [/quadrup[oô]le/i, () => {
            document.querySelector('[data-preset="quadrupole"]')?.click();
            return 'Preset : Quadrupôle';
        }],
        [/triangle/i, () => {
            document.querySelector('[data-preset="triangle"]')?.click();
            return 'Preset : Triangle';
        }],
        [/anneau|ring|cage.*faraday/i, () => {
            document.querySelector('[data-preset="ring"]')?.click();
            return 'Preset : Anneau';
        }],
        [/al[eé]atoire|random/i, () => {
            document.querySelector('[data-preset="random"]')?.click();
            return 'Preset : Aléatoire';
        }],
        // Zoom
        [/zoom.*avant|zoom.*in|agrand/i, () => {
            zoomTarget = Math.min(5, zoomTarget * 1.5);
            return 'Zoom avant';
        }],
        [/zoom.*arri[eè]re|zoom.*out|r[eé]tr[eé]ci|d[eé]zoom/i, () => {
            zoomTarget = Math.max(0.2, zoomTarget * 0.67);
            return 'Zoom arrière';
        }],
        [/zoom.*ajust[eé]|fit|recentre/i, () => {
            doZoomFit();
            return 'Vue ajustée';
        }],
        // Modes
        [/golf/i, () => {
            document.getElementById('btn-golf')?.click();
            return 'Electric Golf lancé ⛳';
        }],
        [/quiz/i, () => {
            document.getElementById('btn-quiz')?.click();
            return 'Quiz lancé';
        }],
        [/exp[eé]rience|guide/i, () => {
            document.getElementById('btn-guide')?.click();
            return 'Expériences guidées';
        }],
        [/pr[eé]sentation/i, () => {
            document.getElementById('btn-present')?.click();
            return 'Mode présentation';
        }],
        // Tools
        [/sonde|probe/i, () => {
            document.getElementById('tool-probe')?.click();
            return 'Outil : Sonde';
        }],
        [/gauss/i, () => {
            document.getElementById('tool-gauss')?.click();
            return 'Outil : Surface de Gauss';
        }],
        [/travail|work/i, () => {
            document.getElementById('tool-work')?.click();
            return 'Outil : Travail W = qΔV';
        }],
        // Other
        [/plein.*[eé]cran|fullscreen/i, () => {
            document.getElementById('btn-fullscreen')?.click();
            return 'Plein écran';
        }],
        [/capture|screenshot/i, () => {
            document.getElementById('btn-screenshot')?.click();
            return 'Capture d\'écran enregistrée 📷';
        }],
        [/mini.*carte|minimap/i, () => {
            toggleMinimap();
            return 'Mini-carte basculée';
        }],
        [/son|audio|mute/i, () => {
            const el = document.getElementById('setting-sound');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Son activé 🔊' : 'Son désactivé 🔇';
        }],
        [/miroir|mirror/i, () => {
            const el = document.getElementById('setting-mirror');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Plan miroir activé' : 'Plan miroir désactivé';
        }],
        [/annule|undo/i, () => { undo(); return 'Annulé ↶'; }],
        [/r[eé]tabli|redo/i, () => { redo(); return 'Rétabli ↷'; }],
        [/th[eé]r[eé]min/i, () => {
            const el = document.getElementById('setting-theremin');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Thérémine activé 🎵' : 'Thérémine désactivé';
        }],
        [/chromatique|chromatic/i, () => {
            const el = document.getElementById('setting-chromatic');
            if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change')); }
            return el?.checked ? 'Distorsion chromatique activée' : 'Distorsion chromatique désactivée';
        }],
        // Help
        [/aide|help|raccourci|shortcut/i, () => {
            showShortcuts();
            return 'Raccourcis clavier affichés';
        }],
        [/sauvegarde|save/i, () => {
            document.getElementById('btn-save')?.click();
            return 'Fenêtre de sauvegarde ouverte';
        }],
    ];

    function processVoiceCommand(text) {
        const t = text.toLowerCase().trim();
        for (const [pattern, action, _desc] of voiceCommands) {
            if (pattern.test(t)) {
                const result = action();
                return result || 'Commande exécutée';
            }
        }
        return null;
    }

    function startVoice() {
        if (!voiceSupported) {
            showVoiceToast('Commande vocale non supportée par ce navigateur', '⚠️');
            return;
        }
        if (voiceActive) { stopVoice(); return; }

        // Show overlay immediately so user sees feedback
        voiceActive = true;
        if (voiceOverlay) voiceOverlay.style.display = 'flex';
        if (voiceStatus) voiceStatus.textContent = 'Demande d\'accès au micro…';
        document.getElementById('btn-voice')?.classList.add('voice-active');

        // Ensure AudioContext exists for confirmation tones
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        // Step 1: Request mic permission explicitly via getUserMedia
        // This triggers Chrome's permission prompt which SpeechRecognition alone may not
        const micPromise = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
            ? navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    // Got permission — stop the stream immediately (we just needed the prompt)
                    stream.getTracks().forEach(t => t.stop());
                    return true;
                })
                .catch(err => {
                    console.warn('[Voice] Mic permission denied:', err.name, err.message);
                    return false;
                })
            : Promise.resolve(true); // No getUserMedia (old browser) — try anyway

        micPromise.then(permitted => {
            if (!permitted) {
                showVoiceToast('Microphone refusé — autorisez l\'accès dans les paramètres du navigateur', '🚫');
                stopVoice();
                return;
            }

            // Step 2: Start SpeechRecognition now that mic is permitted
            try {
                recognition = new SpeechRecognition();
                recognition.lang = 'fr-FR';
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;

                recognition.onresult = (event) => {
                    let interim = '', final = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const t = event.results[i][0].transcript;
                        if (event.results[i].isFinal) final += t;
                        else interim += t;
                    }
                    if (voiceTranscript) {
                        voiceTranscript.textContent = interim || final;
                        voiceTranscript.classList.toggle('voice-final', !!final);
                    }
                    if (final) {
                        const result = processVoiceCommand(final);
                        if (result) {
                            if (voiceActionEl) {
                                voiceActionEl.textContent = '✓ ' + result;
                                voiceActionEl.classList.add('voice-action-show');
                                setTimeout(() => voiceActionEl.classList.remove('voice-action-show'), 2000);
                            }
                            showVoiceToast(result, '✓');
                            playTone(880, 0.08, 0.12);
                            setTimeout(() => playTone(1100, 0.08, 0.12), 80);
                        } else {
                            if (voiceActionEl) {
                                voiceActionEl.textContent = '? Commande non reconnue';
                                voiceActionEl.classList.add('voice-action-show');
                                setTimeout(() => voiceActionEl.classList.remove('voice-action-show'), 2000);
                            }
                            playTone(300, 0.15, 0.08);
                        }
                    }
                };

                recognition.onstart = () => {
                    console.log('[Voice] Recognition started');
                    if (voiceStatus) voiceStatus.textContent = 'En écoute…';
                    playTone(660, 0.1, 0.1);
                    setTimeout(() => playTone(880, 0.1, 0.1), 100);
                };

                recognition.onerror = (event) => {
                    console.warn('[Voice] Error:', event.error);
                    if (event.error === 'no-speech') {
                        if (voiceStatus) voiceStatus.textContent = 'Aucune voix détectée… parlez !';
                    } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        showVoiceToast('Microphone refusé — autorisez l\'accès', '🚫');
                        stopVoice();
                    } else if (event.error === 'network') {
                        showVoiceToast('Erreur réseau — la reconnaissance vocale nécessite internet', '📡');
                        stopVoice();
                    } else if (event.error === 'aborted') {
                        // Normal when stopping, ignore
                    } else {
                        if (voiceStatus) voiceStatus.textContent = 'Erreur: ' + event.error;
                    }
                };

                recognition.onend = () => {
                    console.log('[Voice] Recognition ended, active:', voiceActive);
                    if (voiceActive) {
                        try { recognition.start(); } catch(e) { stopVoice(); }
                    }
                };

                recognition.start();
                console.log('[Voice] Recognition starting…');
            } catch(e) {
                console.error('[Voice] Failed to start:', e);
                showVoiceToast('Erreur démarrage reconnaissance vocale', '⚠️');
                stopVoice();
            }
        });
    }

    function stopVoice() {
        voiceActive = false;
        if (recognition) { try { recognition.stop(); } catch(e) {} recognition = null; }
        if (voiceOverlay) voiceOverlay.style.display = 'none';
        document.getElementById('btn-voice')?.classList.remove('voice-active');
        if (voiceTranscript) voiceTranscript.textContent = '';
        if (voiceActionEl) voiceActionEl.textContent = '';
        playTone(880, 0.1, 0.1);
        setTimeout(() => playTone(660, 0.1, 0.1), 100);
    }

    // Button handler
    document.getElementById('btn-voice')?.addEventListener('click', startVoice);

    // Keyboard shortcut: V
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'v' || e.key === 'V') {
            if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                startVoice();
            }
        }
        // Escape to stop voice
        if (e.key === 'Escape' && voiceActive) {
            stopVoice();
        }
    });

    // Close overlay by clicking outside the ring
    voiceOverlay?.addEventListener('click', e => {
        if (e.target === voiceOverlay) stopVoice();
    });

    // Add to command palette
    cmdActions.push(
        { icon: '🎤', label: 'Commande vocale', shortcut: 'V', action: startVoice }
    );

    // ═══════════════════════════════════════════════════
    // ═══ FEATURE: CINEMATIC AUTO-TOUR ═══
    // ═══════════════════════════════════════════════════
    const tourOverlay = document.getElementById('tour-overlay');
    const tourSpotlight = document.getElementById('tour-spotlight');
    const tourCard = document.getElementById('tour-card');
    const tourStepLabel = document.getElementById('tour-step-label');
    const tourTitle = document.getElementById('tour-title');
    const tourDesc = document.getElementById('tour-desc');
    const tourProgressBar = document.getElementById('tour-progress-bar');
    const tourNextBtn = document.getElementById('tour-next');
    const tourSkipBtn = document.getElementById('tour-skip');
    let tourIdx = 0;
    let tourRunning = false;
    let tourAutoTimer = null;
    let tourUtterance = null;

    // ── TTS (Text-to-Speech) narrator ──
    const synth = window.speechSynthesis;
    let tourVoice = null;
    let tourTTSReady = false;

    function scoreFrenchVoice(v) {
        // Score voices: higher = better / more natural
        let s = 0;
        const n = v.name.toLowerCase();
        const l = (v.lang || '').toLowerCase();
        if (!l.startsWith('fr')) return -1;
        // Exact fr-FR preferred over fr-CA etc.
        if (l === 'fr-fr') s += 5;
        // Premium/neural/natural voices (Edge, Chrome, etc.)
        if (/online|natural|neural|wavenet|premium|enhanced/i.test(n)) s += 30;
        // Microsoft voices on Edge (high quality)
        if (/microsoft.*denise|microsoft.*henri|microsoft.*julie|microsoft.*paul/i.test(n)) s += 20;
        // Google French voices
        if (/google.*fran[cç]/i.test(n)) s += 15;
        // Prefer female voices for narration
        if (/female|denise|julie|céline|celine|amelie|caroline|sylvie/i.test(n)) s += 8;
        // Local voices are a fallback
        if (v.localService === false) s += 3; // remote = usually better quality
        return s;
    }

    function pickFrenchVoice() {
        const voices = synth?.getVoices() || [];
        if (!voices.length) return;
        tourTTSReady = true;
        // Rank all French voices by quality score
        const frVoices = voices
            .map(v => ({ v, score: scoreFrenchVoice(v) }))
            .filter(x => x.score >= 0)
            .sort((a, b) => b.score - a.score);
        tourVoice = frVoices.length ? frVoices[0].v : null;
        if (tourVoice) console.log('[Tour TTS] Selected voice:', tourVoice.name, tourVoice.lang, '(score:', frVoices[0].score + ')');
    }
    if (synth) {
        pickFrenchVoice();
        synth.onvoiceschanged = pickFrenchVoice;
        // Some browsers need a delay to populate voices
        setTimeout(pickFrenchVoice, 500);
        setTimeout(pickFrenchVoice, 2000);
    }

    function tourSpeak(text) {
        if (!synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
        if (!clean) return;
        tourUtterance = new SpeechSynthesisUtterance(clean);
        tourUtterance.lang = 'fr-FR';
        tourUtterance.rate = 0.92;
        tourUtterance.pitch = 1.05;
        tourUtterance.volume = 1.0;
        if (tourVoice) tourUtterance.voice = tourVoice;
        // Chrome bug: long utterances get cut off. Workaround: keep-alive resume timer
        let keepAlive = setInterval(() => { if (synth.speaking) synth.resume(); }, 4000);
        tourUtterance.onend = () => clearInterval(keepAlive);
        tourUtterance.onerror = () => clearInterval(keepAlive);
        synth.speak(tourUtterance);
    }

    // ── Helper: resolve target element ──
    // Some targets are tiny inputs; we want the visible parent row/section
    function resolveTourTarget(selector) {
        let el = null;
        try { el = document.querySelector(selector); } catch(e) {}
        if (!el) return null;
        // If it's a checkbox or radio inside a toggle-row, target the label row
        if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
            const row = el.closest('.toggle-row') || el.closest('label') || el.parentElement;
            if (row) return row;
        }
        return el;
    }

    const tourSteps = [
        {
            target: '#app-header',
            title: 'Bienvenue dans Champ Électrostatique !',
            desc: 'Une simulation interactive du champ électrostatique, <strong>accélérée par GPU</strong> avec WebGL2. Ce tour va vous montrer toutes les fonctionnalités en quelques minutes.',
            speech: 'Bienvenue dans Champ Électrostatique ! Une simulation interactive accélérée par GPU avec WebGL2. Ce tour va vous montrer toutes les fonctionnalités.',
            pos: 'below',
            onEnter: () => {
                document.getElementById('btn-clear')?.click();
            }
        },
        {
            target: '#toolbar .toolbar-section:first-child',
            title: '8 Outils interactifs',
            desc: '<strong>Sélection</strong> pour déplacer, <strong>Charge +/-</strong> pour placer, <strong>Sonde</strong> pour mesurer E et V, <strong>Charge test</strong> pour visualiser les trajectoires, <strong>Surface de Gauss</strong> pour vérifier le théorème, <strong>Travail W</strong> pour calculer q·ΔV, et <strong>Charge libre</strong> pour suivre la dynamique.',
            speech: '8 outils interactifs : Sélection pour déplacer, Charge plus et moins pour placer, Sonde pour mesurer le champ et le potentiel, Charge test pour les trajectoires, Surface de Gauss pour vérifier le théorème, Travail W pour calculer l\'énergie, et Charge libre pour la dynamique.',
            pos: 'right'
        },
        {
            target: '[data-preset="dipole"]',
            title: 'Préréglages instantanés',
            desc: 'Un clic charge une configuration prête. Essayons le <strong>dipôle</strong> — la base de l\'électrostatique.',
            speech: 'Des préréglages instantanés. Un clic charge une configuration. Regardez, on charge un dipôle, la base de l\'électrostatique.',
            pos: 'right',
            delay: 800,
            onEnter: () => {
                setTimeout(() => document.querySelector('[data-preset="dipole"]')?.click(), 600);
            }
        },
        {
            target: '#sim-canvas',
            title: 'Canevas de simulation',
            desc: 'Les <strong>lignes de champ</strong> partent des charges positives vers les négatives. Les <strong>particules animées</strong> suivent le champ en temps réel. Glissez une charge pour voir tout se recalculer instantanément.',
            speech: 'Voici le canevas de simulation. Les lignes de champ partent des charges positives vers les négatives. Les particules animées suivent le champ en temps réel. On peut glisser une charge et tout se recalcule instantanément.',
            pos: 'center',
        },
        {
            target: '#viz-vectors',
            title: '9 modes de visualisation',
            desc: 'Lignes de champ, particules, vecteurs, équipotentielles, arcs électriques, bloom, forces de Coulomb, <strong>paysage 3D</strong>, et superposition — tous combinables.',
            speech: '9 modes de visualisation, tous combinables : lignes de champ, particules, vecteurs, équipotentielles, arcs électriques, bloom, forces de Coulomb, paysage 3D, et superposition.',
            pos: 'left',
            onEnter: () => {
                const v = document.getElementById('viz-vectors');
                if (v && !v.checked) { v.checked = true; v.dispatchEvent(new Event('change')); }
            },
            onExit: () => {
                const v = document.getElementById('viz-vectors');
                if (v && v.checked) { v.checked = false; v.dispatchEvent(new Event('change')); }
            }
        },
        {
            target: '#heatmap-potential',
            title: 'Carte GPU en temps réel',
            desc: '4 modes de heatmap calculés sur la carte graphique : <strong>Potentiel V</strong> (bleu négatif, rouge positif), Magnitude |E|, Direction (roue chromatique), et Densité d\'énergie.',
            speech: 'La carte GPU. 4 modes de heatmap calculés sur la carte graphique. Ici le potentiel V, avec le bleu pour le négatif et le rouge pour le positif.',
            pos: 'left',
            onEnter: () => {
                const r = document.querySelector('input[name="heatmap-mode"][value="1"]');
                if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            }
        },
        {
            target: '#heatmap-direction',
            title: 'Direction du champ — HSV',
            desc: 'Chaque direction de E est codée par une couleur sur la roue chromatique. On voit immédiatement la <strong>symétrie du dipôle</strong>.',
            speech: 'La direction du champ, codée par une roue chromatique de couleurs. On voit immédiatement la symétrie du dipôle.',
            pos: 'left',
            onEnter: () => {
                const r = document.querySelector('input[name="heatmap-mode"][value="3"]');
                if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            },
            onExit: () => {
                const r = document.querySelector('input[name="heatmap-mode"][value="0"]');
                if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            }
        },
        {
            target: '#viz-landscape',
            title: 'Paysage 3D du potentiel',
            desc: 'Le potentiel V tracé comme une <strong>surface 3D isométrique</strong>. Les puits représentent les charges négatives, les sommets les positives.',
            speech: 'Le paysage 3D du potentiel. Le potentiel V tracé comme une surface isométrique. Les puits représentent les charges négatives, les sommets les positives.',
            pos: 'left',
            onEnter: () => {
                const el = document.getElementById('viz-landscape');
                if (el && !el.checked) { el.checked = true; el.dispatchEvent(new Event('change')); }
            },
            onExit: () => {
                const el = document.getElementById('viz-landscape');
                if (el && el.checked) { el.checked = false; el.dispatchEvent(new Event('change')); }
            }
        },
        {
            target: '#coulomb-panel',
            title: 'Loi de Coulomb automatique',
            desc: 'Avec exactement 2 charges, le panneau affiche automatiquement <strong>F = k|q₁q₂|/r²</strong> avec le calcul détaillé étape par étape et le type de force.',
            speech: 'La loi de Coulomb automatique. Avec exactement 2 charges, le panneau affiche F égale k fois q1 q2 sur r carré, avec le calcul détaillé étape par étape.',
            pos: 'left',
            fallback: '#right-panel'
        },
        {
            target: '#btn-golf',
            title: '⛳ Electric Golf — Mode jeu',
            desc: '5 niveaux de difficulté croissante. Placez des charges pour courber la trajectoire d\'une balle vers le trou. <strong>Apprenez F = qE intuitivement</strong> en jouant !',
            speech: 'Electric Golf ! Un mode jeu avec 5 niveaux. Placez des charges pour courber la trajectoire d\'une balle vers le trou. On apprend la force électrique intuitivement en jouant.',
            pos: 'left'
        },
        {
            target: '#btn-quiz',
            title: 'Quiz interactif',
            desc: '10 questions à choix multiples sur l\'électrostatique. Bilingue <strong>français/arabe</strong>. Score final avec confetti pour 100% !',
            speech: 'Un quiz interactif. 10 questions à choix multiples, bilingue français et arabe. Et des confettis pour un score parfait !',
            pos: 'left'
        },
        {
            target: '#btn-guide',
            title: 'Expériences guidées',
            desc: '3 expériences pas-à-pas avec validation : <strong>Exploration du dipôle</strong>, <strong>Loi de Coulomb</strong>, et <strong>Condensateur plan</strong>.',
            speech: '3 expériences guidées pas à pas : exploration du dipôle, loi de Coulomb, et condensateur plan. La simulation vérifie chaque étape.',
            pos: 'left'
        },
        {
            target: '#setting-theremin',
            title: 'Audio & Theremin synesthésique',
            desc: '<strong>Effets sonores</strong> sur chaque action + un <strong>thérémine</strong> qui convertit le potentiel en fréquence et le champ en volume.',
            speech: 'L\'audio ! Des effets sonores sur chaque action, plus un thérémine synesthésique qui convertit le potentiel en fréquence et le champ en volume. Le son de la physique.',
            pos: 'left'
        },
        {
            target: '#setting-chromatic',
            title: 'Distorsion chromatique',
            desc: 'Aberration chromatique basée sur la <strong>direction du champ</strong> — les canaux RGB sont décalés le long de E.',
            speech: 'La distorsion chromatique. Aberration basée sur la direction du champ. Les canaux rouge, vert et bleu sont décalés le long du vecteur E. Purement esthétique, mais impressionnant.',
            pos: 'left'
        },
        {
            target: '.formulas-section',
            title: 'Formules LaTeX',
            desc: 'Les 7 formules fondamentales de l\'électrostatique rendues en <strong>vrai LaTeX</strong> via KaTeX : Coulomb, champ, potentiel, travail, Gauss…',
            speech: '7 formules fondamentales, rendues en vrai LaTeX. Coulomb, champ électrique, potentiel, travail, énergie, et le théorème de Gauss.',
            pos: 'left'
        },
        {
            target: '#btn-voice',
            title: '🎤 Commande vocale',
            desc: 'Dites <strong>« ajoute une charge positive »</strong>, <strong>« montre le potentiel »</strong>, ou <strong>« lance le golf »</strong> — la simulation obéit à la voix.',
            speech: 'Commande vocale. On peut parler à la simulation : ajoute une charge positive, montre le potentiel, lance le golf. Elle obéit à la voix.',
            pos: 'left'
        },
        {
            target: '#btn-screenshot',
            title: 'Export & Partage',
            desc: '<strong>Capture PNG</strong> haute résolution, <strong>export CSV</strong> des données, <strong>5 emplacements</strong> de sauvegarde, <strong>import/export JSON</strong>, et <strong>lien QR</strong>.',
            speech: 'Export et partage. Capture PNG haute résolution, export CSV des données, 5 emplacements de sauvegarde, import et export JSON, et un lien Q R encodant toute la configuration.',
            pos: 'left'
        },
        {
            target: '#sim-canvas',
            title: 'À vous de jouer !',
            desc: 'Explorez librement. <strong>Ctrl+K</strong> pour la palette de commandes, <strong>?</strong> pour les raccourcis. Plus de <strong>50 fonctionnalités</strong>. Bonne exploration !',
            speech: 'Et voilà ! Plus de 50 fonctionnalités vous attendent. Contrôle K pour la palette de commandes, point d\'interrogation pour les raccourcis clavier. Bonne exploration !',
            pos: 'center',
            onEnter: () => {
                document.querySelector('[data-preset="quadrupole"]')?.click();
                const r = document.querySelector('input[name="heatmap-mode"][value="1"]');
                if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
            }
        }
    ];

    function positionSpotlight(targetEl, isCenter) {
        // For center/canvas steps, use a generous centered window so the sim is visible
        if (isCenter || !targetEl) {
            const ww = window.innerWidth, wh = window.innerHeight;
            const sw = Math.min(ww * 0.65, 700), sh = Math.min(wh * 0.6, 500);
            tourSpotlight.style.top = ((wh - sh) / 2) + 'px';
            tourSpotlight.style.left = ((ww - sw) / 2) + 'px';
            tourSpotlight.style.width = sw + 'px';
            tourSpotlight.style.height = sh + 'px';
            return;
        }
        const rect = targetEl.getBoundingClientRect();
        const pad = 12;
        tourSpotlight.style.top = (rect.top - pad) + 'px';
        tourSpotlight.style.left = (rect.left - pad) + 'px';
        tourSpotlight.style.width = (rect.width + pad * 2) + 'px';
        tourSpotlight.style.height = (rect.height + pad * 2) + 'px';
    }

    function positionTourCard(targetEl, pos) {
        const rect = targetEl
            ? targetEl.getBoundingClientRect()
            : { top: window.innerHeight/2 - 40, left: window.innerWidth/2 - 40, width: 80, height: 80, right: window.innerWidth/2 + 40, bottom: window.innerHeight/2 + 40 };
        const cardW = Math.min(380, window.innerWidth - 32);
        const cardH = tourCard.offsetHeight || 220;
        const pad = 16;
        let top, left;

        if (pos === 'right') {
            top = rect.top + rect.height / 2 - cardH / 2;
            left = rect.right + pad;
            if (left + cardW > window.innerWidth - pad) left = rect.left - cardW - pad;
        } else if (pos === 'left') {
            top = rect.top + rect.height / 2 - cardH / 2;
            left = rect.left - cardW - pad;
            if (left < pad) left = rect.right + pad;
        } else if (pos === 'below') {
            top = rect.bottom + pad;
            left = rect.left + rect.width / 2 - cardW / 2;
        } else {
            // Center: position card below the centered spotlight window
            const spotH = Math.min(window.innerHeight * 0.6, 500);
            const spotBottom = (window.innerHeight + spotH) / 2;
            top = spotBottom + pad;
            left = window.innerWidth / 2 - cardW / 2;
            // If card would go off-screen, put it above the spotlight instead
            if (top + cardH > window.innerHeight - pad) {
                const spotTop = (window.innerHeight - spotH) / 2;
                top = spotTop - cardH - pad;
            }
        }

        top = Math.max(pad, Math.min(window.innerHeight - cardH - pad, top));
        left = Math.max(pad, Math.min(window.innerWidth - cardW - pad, left));

        tourCard.style.top = top + 'px';
        tourCard.style.left = left + 'px';
    }

    function showTourStep(idx) {
        const step = tourSteps[idx];
        if (!step) { endTour(); return; }

        // Exit previous step
        if (idx > 0 && tourSteps[idx - 1].onExit) tourSteps[idx - 1].onExit();

        // Remove previous highlight & right-panel z-lift
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        const rp = document.getElementById('right-panel');
        if (rp) rp.style.removeProperty('z-index');

        // Hide card during transition for clean re-entrance
        tourCard.classList.remove('tour-card-visible');

        // Run onEnter first (may change DOM layout)
        if (step.onEnter) step.onEnter();

        // Delay to let DOM update (preset loads, toggles, etc.)
        const delay = step.delay || 300;
        setTimeout(() => {
            // Find target — resolve inputs to their parent row
            let targetEl = resolveTourTarget(step.target);

            // Fallback if hidden
            if (targetEl && targetEl.offsetParent === null && targetEl.id !== 'sim-canvas') {
                if (step.fallback) {
                    try { targetEl = document.querySelector(step.fallback); } catch(e) {}
                }
                if (!targetEl || targetEl.offsetParent === null) {
                    targetEl = document.getElementById('sim-canvas');
                }
            }

            // If target lives inside right-panel, lift the panel's z-index
            const rightPanel = document.getElementById('right-panel');
            if (targetEl && rightPanel && rightPanel.contains(targetEl)) {
                rightPanel.style.zIndex = '10002';
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // For small targets (icon buttons), expand the spotlight to parent flex container
            let spotlightTarget = targetEl;
            if (targetEl && targetEl.classList?.contains('icon-btn')) {
                const parent = targetEl.parentElement;
                if (parent && parent.children.length <= 8) spotlightTarget = parent;
            }

            // Animate spotlight move
            const isCenter = step.pos === 'center';
            positionSpotlight(spotlightTarget, isCenter);
            tourSpotlight.style.display = 'block';
            if (targetEl && !isCenter) targetEl.classList.add('tour-highlight');

            // Update card content with entrance animation
            tourStepLabel.textContent = `${idx + 1} / ${tourSteps.length}`;
            tourTitle.textContent = step.title;
            tourDesc.innerHTML = step.desc;
            tourProgressBar.style.width = ((idx + 1) / tourSteps.length * 100) + '%';
            tourNextBtn.textContent = idx === tourSteps.length - 1 ? '✓ Terminer' : 'Suivant →';

            // Position card after spotlight settles, with entrance animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    positionTourCard(targetEl, step.pos);
                    tourCard.classList.add('tour-card-visible');
                });
            });

            // Speak the description
            if (step.speech) tourSpeak(step.speech);
            else tourSpeak(step.desc);

            // Auto-advance: TTS-aware timing
            clearTimeout(tourAutoTimer);
            const speechLen = (step.speech || step.desc.replace(/<[^>]*>/g, '')).length;
            const advanceDelay = Math.max(speechLen * 80, 8000);
            tourAutoTimer = setTimeout(() => {
                if (tourRunning && tourIdx === idx) {
                    tourIdx++;
                    showTourStep(tourIdx);
                }
            }, Math.min(advanceDelay, 20000));

        }, delay);
    }

    function startTour() {
        if (tourRunning) return;
        tourRunning = true;
        tourIdx = 0;
        if (tourOverlay) {
            tourOverlay.style.display = 'block';
            tourOverlay.classList.add('tour-active');
        }
        // Hide spotlight initially with no transition, then enable animation
        tourSpotlight.style.transition = 'none';
        tourSpotlight.style.display = 'none';
        tourCard.classList.remove('tour-card-visible');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tourSpotlight.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
        showTourStep(0);
    }

    function endTour() {
        tourRunning = false;
        clearTimeout(tourAutoTimer);
        if (synth) synth.cancel();
        // Fade out
        if (tourOverlay) {
            tourOverlay.classList.remove('tour-active');
            tourOverlay.style.display = 'none';
        }
        tourSpotlight.style.display = 'none';
        tourCard.classList.remove('tour-card-visible');
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        // Restore right-panel z-index
        const rp = document.getElementById('right-panel');
        if (rp) rp.style.removeProperty('z-index');
        const lastStep = tourSteps[tourIdx];
        if (lastStep && lastStep.onExit) lastStep.onExit();
        localStorage.setItem('esim_toured', '1');
    }

    // Tour controls
    tourNextBtn?.addEventListener('click', () => {
        if (synth) synth.cancel();
        clearTimeout(tourAutoTimer);
        tourIdx++;
        showTourStep(tourIdx);
    });
    tourSkipBtn?.addEventListener('click', endTour);

    // Escape to end tour
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && tourRunning) endTour();
    });

    // Re-position on resize
    window.addEventListener('resize', () => {
        if (tourRunning) {
            const step = tourSteps[tourIdx];
            const targetEl = resolveTourTarget(step?.target);
            const isCenter = step?.pos === 'center';
            positionSpotlight(targetEl, isCenter);
            positionTourCard(targetEl, step?.pos);
        }
    });

    // Auto-start tour on first visit (after splash dismisses)
    if (!localStorage.getItem('esim_toured')) {
        setTimeout(() => {
            startTour();
        }, 8500); // After credits (4.5s) + splash (3s) + buffer
    }

    // Add tour button and command palette entry
    cmdActions.push(
        { icon: '🎬', label: 'Visite guidée', shortcut: '', action: startTour }
    );

    // Expose startTour on the guide button if re-touring
    document.getElementById('btn-tour')?.addEventListener('click', () => {
        localStorage.removeItem('esim_toured');
        startTour();
    });

    console.log('%c⚡ Champ Électrostatique v3 — All features loaded', 'color:#00e5ff;font-weight:bold;font-size:12px');
})();