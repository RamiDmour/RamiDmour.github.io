'use strict';
(() => {
  const projects=new Map();
  let serial=0,opener=null,suppressClickUntil=0;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local=(value,lang)=>typeof value==='object'&&value!==null?value[lang]??value.en:value;
  const lines=(n=4)=>`<span class="sketch-lines">${'<i></i>'.repeat(n)}</span>`;
  function sketch(project,screen,ctx){
    const name=escape(local(project.name,ctx.lang)),label=escape(local(screen.label,ctx.lang));
    const header=`<div class="sketch-appbar"><span class="sketch-logo">${escape(name.slice(0,1))}</span><b>${name}</b><span class="sketch-menu">···</span></div>`;
    const paper=`<div class="sketch-paper"><span class="paper-emblem">✦</span>${lines(6)}<span class="paper-signature"></span></div>`;
    let body='';
    switch(screen.layout){
      case 'scan':body=`<div class="sketch-camera"><span class="camera-glow"></span><div class="camera-corners">${paper}</div><div class="camera-tools"><i>↯</i><i>⊞</i><i>◉</i></div><span class="shutter"></span></div>`;break;
      case 'documents':body=`<h4>${label}</h4><div class="sketch-search">⌕<span></span></div><div class="document-tiles">${[0,1,2,3].map(()=>`<div>${paper}${lines(1)}</div>`).join('')}</div><div class="sketch-fab">+</div>`;break;
      case 'search':body=`<h4>${label}</h4><div class="sketch-search">⌕<span></span></div>${[0,1,2].map(()=>`<div class="search-result"><span class="file-icon">▤</span>${lines(3)}</div>`).join('')}<div class="search-highlight">${lines(3)}</div>`;break;
      case 'player':body=`<div class="cinema-scene"><span class="cinema-orbit"></span><span class="cinema-mountain"></span><span class="cinema-play">▷</span><div class="cinema-copy"><small>${name}</small><h4>${label}</h4>${lines(2)}</div><div class="cinema-timeline"><i></i></div></div>`;break;
      case 'video':body=`<h4>${label}</h4><div class="cinema-poster"><span class="cinema-orbit"></span><span class="cinema-play">▷</span></div><div class="poster-row">${[0,1,2].map(()=>'<span></span>').join('')}</div>${lines(2)}`;break;
      case 'episodes':body=`<h4>${label}</h4>${[0,1,2,3].map((_,i)=>`<div class="episode-row"><span class="episode-cover">▷</span><div><b>0${i+1}</b>${lines(2)}</div></div>`).join('')}`;break;
      case 'assets':case 'finance':body=`<h4>${label}</h4><div class="finance-balance"><small>${escape(ctx.ui.mockOverview)}</small><strong>—</strong><svg viewBox="0 0 220 72" aria-hidden="true"><path d="M0 62L20 52 43 57 61 36 82 42 104 23 128 29 151 9 176 17 199 5 220 8"/></svg></div><div class="finance-actions"><span>↗</span><span>⇄</span><span>↙</span></div>${['BTC','ETH','USDT'].map((v,i)=>`<div class="asset-row"><span class="asset-coin coin-${i}">${v.slice(0,1)}</span><b>${v}</b><span>—</span></div>`).join('')}`;break;
      case 'loans':case 'coinhold':body=`<h4>${label}</h4><div class="finance-orb"><span>${screen.layout==='loans'?'↗':'◈'}</span><i></i><i></i></div><div class="finance-product"><b>${label}</b>${lines(2)}<div class="sketch-slider"><i></i></div><div class="finance-pair"><span>BTC</span><span>USDT</span></div></div><div class="sketch-primary">${escape(ctx.ui.mockDetails)} ↗</div>`;break;
      case 'market':case 'property':body=`<h4>${label}</h4><div class="sketch-search">⌕<span></span></div><div class="property-scene"><span></span><i></i><b></b></div><div class="sketch-chips"><i></i><i></i><i></i></div>${lines(3)}<div class="sketch-primary">${escape(ctx.ui.mockDetails)} ↗</div>`;break;
      case 'research':body=`<h4>${label}</h4><div class="research-grid"><svg viewBox="0 0 220 135" aria-hidden="true"><path d="M0 110Q28 120 44 82T88 58 125 46 160 23 220 12"/><path d="M0 124Q30 92 53 98T100 65 150 55 220 25"/></svg></div><div class="research-cells"><span>${lines(2)}</span><span>${lines(2)}</span></div>${lines(3)}`;break;
      default:body=`<h4>${label}</h4><div class="workspace-feature"><span>${screen.layout==='learning'?'✦':screen.layout==='postal'?'⌁':'⊞'}</span>${lines(2)}</div>${[0,1,2].map(()=>`<div class="workspace-row"><span></span>${lines(2)}<i>↗</i></div>`).join('')}<div class="sketch-primary">${escape(ctx.ui.mockDetails)} ↗</div>`;
    }
    return `${header}<div class="sketch-content layout-${escape(screen.layout)}">${body}</div><div class="sketch-tabbar"><span>⌂</span><span>⊞</span><span>○</span></div>`;
  }
  function device(project,screen,ctx,extra=''){
    const isBrowser=project.media?.device==='browser';
    const label=`${local(project.name,ctx.lang)} · ${local(screen.label,ctx.lang)}`;
    const visual=screen.src?`<img class="device-capture" src="${escape(screen.src)}" alt="${escape(local(screen.alt,ctx.lang)||label)}" loading="lazy" decoding="async">`:`<div class="device-sketch" aria-hidden="true">${sketch(project,screen,ctx)}</div>`;
    return `<span class="device-frame ${isBrowser?'browser-frame':'phone-frame'} ${extra}" data-visual-theme="${escape(project.media?.theme||'workspace')}">${isBrowser?'<span class="browser-chrome"><i></i><i></i><i></i><span></span></span>':'<span class="phone-island" aria-hidden="true"></span>'}<span class="device-screen">${visual}</span>${isBrowser?'':'<span class="phone-home" aria-hidden="true"></span>'}</span>`;
  }
  function gallery(project,ctx){
    const screens=project.media?.screens?.length?project.media.screens:[{label:{en:'Overview',ru:'Обзор'},layout:'workspace',...(project.image||{})}];
    const key=`gallery-${++serial}`;projects.set(project.id,{project,screens,ctx});
    return `<section class="project-gallery ${ctx.large?'gallery-large':''}" style="--gallery-accent:${ctx.color}" data-gallery="${key}" data-gallery-project="${project.id}" data-current="0" aria-label="${escape(ctx.ui.screenGallery+': '+local(project.name,ctx.lang))}"><div class="gallery-topline"><span class="mono">${escape(project.media?.device==='browser'?ctx.ui.webPreview:ctx.ui.mobilePreview)}</span><button type="button" class="gallery-zoom-hint" data-gallery-open aria-label="${escape(ctx.ui.enlarge+': '+local(project.name,ctx.lang))}">↗ ${escape(ctx.ui.enlarge)}</button></div><div class="device-stage" data-gallery-stage>${screens.map((screen,i)=>`<button type="button" class="device-item" data-screen="${i}" data-position="${i===0?'center':i===1?'right':i===screens.length-1?'left':'hidden'}" aria-label="${escape((i===0?ctx.ui.enlarge+': ':'')+local(screen.label,ctx.lang))}" ${i===0?'':'tabindex="-1"'}>${device(project,screen,ctx)}</button>`).join('')}</div><div class="gallery-controls"><button class="gallery-arrow" type="button" data-gallery-step="-1" aria-label="${escape(ctx.ui.previousScreen)}" ${screens.length<2?'disabled':''}>←</button><div class="gallery-caption"><span data-gallery-caption>${escape(local(screens[0].label,ctx.lang))}</span><span class="gallery-dots">${screens.map((s,i)=>`<button type="button" data-gallery-index="${i}" aria-label="${escape(local(s.label,ctx.lang))}" aria-pressed="${i===0}"><span></span></button>`).join('')}</span></div><button class="gallery-arrow" type="button" data-gallery-step="1" aria-label="${escape(ctx.ui.nextScreen)}" ${screens.length<2?'disabled':''}>→</button></div><p class="gallery-disclosure" data-gallery-disclosure>${escape(screens[0].src?ctx.ui.actualScreen:ctx.ui.screenSketch)}</p></section>`;
  }
  function select(gallery,index){
    const {screens,ctx}=projects.get(gallery.dataset.galleryProject),count=screens.length;
    index=(index+count)%count;gallery.dataset.current=String(index);
    gallery.querySelectorAll('[data-screen]').forEach((el,i)=>{const diff=(i-index+count)%count;el.dataset.position=diff===0?'center':diff===1?'right':diff===count-1?'left':'hidden';el.tabIndex=diff===0?0:-1;el.setAttribute('aria-label',(diff===0?ctx.ui.enlarge+': ':'')+local(screens[i].label,ctx.lang));});
    gallery.querySelectorAll('[data-gallery-index]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
    gallery.querySelector('[data-gallery-caption]').textContent=local(screens[index].label,ctx.lang);
    gallery.querySelector('[data-gallery-disclosure]').textContent=screens[index].src?ctx.ui.actualScreen:ctx.ui.screenSketch;
    const status=gallery.querySelector('[data-gallery-caption]');status.setAttribute('role','status');
  }
  function open(gallery){
    const {project,ctx,screens}=projects.get(gallery.dataset.galleryProject),index=Number(gallery.dataset.current);
    if(!document.getElementById('screen-dialog')?.open)opener=document.activeElement;
    let dialog=document.getElementById('screen-dialog');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='screen-dialog';dialog.className='screen-dialog';dialog.setAttribute('aria-labelledby','screen-dialog-title');document.body.append(dialog);dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
    dialog.innerHTML=`<div class="screen-viewer-heading"><div><p class="eyebrow">${escape(local(project.name,ctx.lang))}</p><h2 id="screen-dialog-title">${escape(local(screens[index].label,ctx.lang))}</h2></div><button type="button" class="icon-button" data-screen-close aria-label="${escape(ctx.ui.close)}">×</button></div><div class="screen-viewer-device" style="--gallery-accent:${ctx.color}">${device(project,screens[index],ctx)}</div><div class="viewer-controls"><button type="button" class="gallery-arrow" data-viewer-step="-1" aria-label="${escape(ctx.ui.previousScreen)}" ${screens.length<2?'disabled':''}>←</button><p>${index+1} / ${screens.length}</p><button type="button" class="gallery-arrow" data-viewer-step="1" aria-label="${escape(ctx.ui.nextScreen)}" ${screens.length<2?'disabled':''}>→</button></div><p class="gallery-disclosure">${escape(screens[index].src?ctx.ui.actualScreen:ctx.ui.screenSketch)}</p>`;
    dialog._gallery=gallery;
    if(!dialog.open)dialog.showModal();
  }
  function init(){
    document.addEventListener('click',event=>{
      if(Date.now()<suppressClickUntil&&event.target.closest('[data-gallery]')){event.preventDefault();event.stopImmediatePropagation();return;}
      if(event.target.closest('[data-screen-close]')){document.getElementById('screen-dialog').close();return;}
      const viewer=event.target.closest('[data-viewer-step]');
      if(viewer){const dialog=viewer.closest('dialog'),gallery=dialog._gallery;select(gallery,Number(gallery.dataset.current)+Number(viewer.dataset.viewerStep));open(gallery);dialog.querySelector(`[data-viewer-step="${viewer.dataset.viewerStep}"]`).focus();return;}
      const gallery=event.target.closest('[data-gallery]');if(!gallery)return;
      const step=event.target.closest('[data-gallery-step]'),dot=event.target.closest('[data-gallery-index]'),screen=event.target.closest('[data-screen]');
      if(event.target.closest('[data-gallery-open]'))open(gallery);
      else if(step)select(gallery,Number(gallery.dataset.current)+Number(step.dataset.galleryStep));
      else if(dot)select(gallery,Number(dot.dataset.galleryIndex));
      else if(screen){if(Number(screen.dataset.screen)===Number(gallery.dataset.current))open(gallery);else select(gallery,Number(screen.dataset.screen));}
    });
    document.addEventListener('keydown',event=>{
      const viewer=document.getElementById('screen-dialog');const gallery=viewer?.open?viewer._gallery:event.target.closest('[data-gallery]');
      if(!gallery||!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();select(gallery,Number(gallery.dataset.current)+(event.key==='ArrowLeft'?-1:1));
      if(viewer?.open)open(gallery);
    });
    let start=null;
    document.addEventListener('pointerdown',event=>{const stage=event.target.closest('[data-gallery-stage]');if(stage&&event.pointerType!=='mouse')start={gallery:stage.closest('[data-gallery]'),x:event.clientX,y:event.clientY};});
    document.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){select(start.gallery,Number(start.gallery.dataset.current)+(dx<0?1:-1));suppressClickUntil=Date.now()+350;}start=null;});
    document.addEventListener('pointercancel',()=>{start=null;});
  }
  window.PortfolioShowcase={render:gallery,init};
})();
