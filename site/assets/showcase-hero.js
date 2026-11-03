'use strict';
(() => {
  const projects=new Map();
  let serial=0,opener=null,suppressClickUntil=0;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local=(value,lang)=>typeof value==='object'&&value!==null?value[lang]??value.en:value;
  const getScreens=project=>(project.media?.screens||[]).filter(screen=>screen.src||screen.kind==='concept');
  function disclosure(screen,ctx){
    return screen.kind==='concept'?escape(ctx.ui.ndaConcept):'';
  }
  function capture(screen,ctx,thumbnail=false){
    const c=screen.crop,w=screen.width,h=screen.height;
    const style=c?` style="width:${w/c.width*100}%;height:${h/c.height*100}%;left:${-c.x/c.width*100}%;top:${-c.y/c.height*100}%"`:'';
    return `<span class="capture-viewport${c?' is-cropped':''}"><img class="device-capture" src="${escape(screen.src)}" alt="${thumbnail?'':escape(local(screen.alt,ctx.lang))}" width="${w}" height="${h}" loading="${ctx.eager&&!thumbnail?'eager':'lazy'}" fetchpriority="${ctx.eager&&!thumbnail?'high':'auto'}" decoding="async" draggable="false"${style}></span>`;
  }
  function concept(screen,ctx){
    const t=key=>escape(ctx.ui[key]);
    const mascot='<img class="octy-mascot" src="assets/projects/octy-mascot.png" alt="" loading="lazy" draggable="false">';
    const status='<div class="octy-status"><span>9:41</span><span>▮▮▮ ▰</span></div>';
    const nav=`<div class="octy-nav"><span>⌂<small>${t('octyShop')}</small></span><span>✦<small>${t('octyGames')}</small></span><span>◈<small>${t('octyBalance')}</small></span><span>○<small>${t('octyProfile')}</small></span></div>`;
    if(screen.layout==='octy-feed')return `<div class="octy-screen octy-feed">${status}<div class="octy-feed-tabs"><b>${t('octyForYou')}</b><span>${t('octyFollowing')}</span><i>⌕</i></div><div class="octy-video-art"><span class="octy-halo"></span><span class="octy-headphones"><i></i><b></b></span><span class="octy-play">▷</span><small>${t('octyDemo')}</small></div><div class="octy-reactions"><span>♡<small>128</small></span><span>◌<small>24</small></span><span>↗</span></div><div class="octy-feed-copy"><strong>@octy.studio</strong><p>${t('octyProductDetail')}</p><span>#design #sound</span></div><div class="octy-product"><span class="octy-product-icon">♬</span><div><strong>${t('octyProduct')}</strong><small>${t('octyPrice')} · 24 TON</small></div><b>${t('octyBuy')} ↗</b></div>${nav}</div>`;
    if(screen.layout==='octy-game'){
      const coins=['₿','◆','₮','Ð','◈','◎'];
      // A settled opening board: no existing lines of 3, with legal matching swaps.
      const board=[
        [0,2,0,1,3,5,2,0],
        [3,0,2,5,4,0,1,3],
        [2,4,1,1,2,3,5,4],
        [1,3,5,4,0,2,4,1],
        [4,0,3,2,5,5,3,5],
        [5,2,0,3,1,4,4,2],
        [0,5,4,1,2,0,0,3],
        [3,1,2,4,0,5,1,4]
      ];
      return `<div class="octy-screen octy-game">${status}<div class="octy-game-head"><span>‹</span><b>Crypto Match-3</b><span>ⓘ</span></div><div class="octy-game-title">${mascot}<p>${t('octyGameTag')}</p></div><div class="octy-game-stats"><span><small>${t('octyScore')}</small><b>0 <i>/ 1 000</i></b><em></em></span><span><small>${t('octyTime')}</small><b>02:00</b></span></div><div class="octy-board">${board.flat().map(n=>{return `<span class="token token-${n}">${coins[n]}</span>`;}).join('')}</div><p class="octy-game-goal">${t('octyGoal')}</p><div class="octy-start"><strong>${t('octyReady')}</strong><span>${t('octyStart')} →</span></div><small class="octy-fine">${t('octyNoLive')}</small></div>`;
    }
    return `<div class="octy-screen octy-intro">${status}<div class="octy-brand"><strong>OCTY<span>✦</span></strong><small>${t('octyIntro')}</small></div><div class="octy-mascot-stage"><span class="octy-mascot-orbit"></span><i>₿</i><i>◆</i><i>₮</i>${mascot}</div><h4>${t('octyTagline')}</h4><div class="octy-feature"><span>✦</span><div><b>${t('octyEarn')}</b><small>${t('octyEarnText')}</small></div></div><div class="octy-feature"><span>◈</span><div><b>${t('octyWallet')}</b><small>${t('octyWalletText')}</small></div></div><div class="octy-primary">${t('octyExplore')} ↗</div><small class="octy-fine">${t('octyDemo')}</small></div>`;
  }
  function device(project,screen,ctx,extra=''){
    const isBrowser=project.media?.device==='browser',poster=screen.presentation==='poster';
    const c=screen.crop,aspect=screen.src?(c?c.width/c.height:screen.width/screen.height):null;
    // Short portrait captures use the same shell as modern phones, without stretching or cropping UI.
    const fitted=screen.src&&!isBrowser&&!poster&&aspect>.5;
    const visual=screen.src?capture(screen,ctx):concept(screen,ctx);
    return `<span class="device-frame ${poster?'poster-frame':isBrowser?'browser-frame':'phone-frame'} ${screen.src?'has-capture':''} ${fitted?'fitted-capture':''} ${extra}" data-visual-theme="${escape(project.media?.theme||'workspace')}"${aspect?` style="--capture-aspect:${aspect}"`:''}>${isBrowser?'<span class="browser-chrome"><i></i><i></i><i></i><span></span></span>':screen.src?'':'<span class="phone-island" aria-hidden="true"></span>'}<span class="device-screen">${visual}</span>${isBrowser||screen.src?'':'<span class="phone-home" aria-hidden="true"></span>'}</span>`;
  }
  function gallery(project,ctx){
    const screens=getScreens(project);if(!screens.length)return '';
    const key=`gallery-${++serial}`;projects.set(project.id,{project,screens,ctx});
    return `<section class="project-gallery ${ctx.large?'gallery-large':''}" style="--gallery-accent:${ctx.color}" data-gallery="${key}" data-gallery-project="${project.id}" data-current="0" aria-label="${escape(ctx.ui.screenGallery+': '+local(project.name,ctx.lang))}"><div class="gallery-topline"><span class="mono">${escape(project.media?.device==='browser'?ctx.ui.webPreview:ctx.ui.mobilePreview)}</span><button type="button" class="gallery-zoom-hint" data-gallery-open aria-label="${escape(ctx.ui.enlarge+': '+local(project.name,ctx.lang))}">↗ ${escape(ctx.ui.enlarge)}</button></div><div class="device-stage" data-gallery-stage>${screens.map((screen,i)=>`<button type="button" class="device-item" data-screen="${i}" data-position="${i===0?'center':i===1?'right':i===screens.length-1?'left':'hidden'}" aria-label="${escape((i===0?ctx.ui.enlarge+': ':'')+local(screen.label,ctx.lang))}" ${i===0?'':'tabindex="-1"'}>${device(project,screen,ctx)}</button>`).join('')}</div><div class="gallery-controls"><button class="gallery-arrow" type="button" data-gallery-step="-1" aria-label="${escape(ctx.ui.previousScreen)}" ${screens.length<2?'disabled':''}>←</button><div class="gallery-caption"><span data-gallery-caption>${escape(local(screens[0].label,ctx.lang))}</span><span class="gallery-dots">${screens.map((s,i)=>`<button type="button" data-gallery-index="${i}" aria-label="${escape(local(s.label,ctx.lang))}" aria-pressed="${i===0}"><span></span></button>`).join('')}</span></div><button class="gallery-arrow" type="button" data-gallery-step="1" aria-label="${escape(ctx.ui.nextScreen)}" ${screens.length<2?'disabled':''}>→</button></div><p class="gallery-disclosure" data-gallery-disclosure>${disclosure(screens[0],ctx)}</p></section>`;
  }
  function select(gallery,index){
    const {screens,ctx}=projects.get(gallery.dataset.galleryProject),count=screens.length;
    index=(index+count)%count;gallery.dataset.current=String(index);
    gallery.querySelectorAll('[data-screen]').forEach((el,i)=>{const diff=(i-index+count)%count;el.dataset.position=diff===0?'center':diff===1?'right':diff===count-1?'left':'hidden';el.tabIndex=diff===0?0:-1;el.setAttribute('aria-label',(diff===0?ctx.ui.enlarge+': ':'')+local(screens[i].label,ctx.lang));});
    gallery.querySelectorAll('[data-gallery-index]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
    gallery.querySelector('[data-gallery-caption]').textContent=local(screens[index].label,ctx.lang);
    gallery.querySelector('[data-gallery-disclosure]').innerHTML=disclosure(screens[index],ctx);
    const status=gallery.querySelector('[data-gallery-caption]');status.setAttribute('role','status');
  }
  function open(gallery){
    const {project,ctx,screens}=projects.get(gallery.dataset.galleryProject);
    view(project,screens,ctx,Number(gallery.dataset.current),i=>select(gallery,i));
  }
  function view(project,screens,ctx,index,onChange=null){
    if(!screens.length)return;
    if(!document.getElementById('screen-dialog')?.open)opener=document.activeElement;
    let dialog=document.getElementById('screen-dialog');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='screen-dialog';dialog.className='screen-dialog';dialog.setAttribute('aria-labelledby','screen-dialog-title');document.body.append(dialog);dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
    dialog.innerHTML=`<div class="screen-viewer-heading"><div><p class="eyebrow">${escape(local(project.name,ctx.lang))}</p><h2 id="screen-dialog-title">${escape(local(screens[index].label,ctx.lang))}</h2></div><button type="button" class="icon-button" data-screen-close aria-label="${escape(ctx.ui.close)}">×</button></div><div class="screen-viewer-device" style="--gallery-accent:${ctx.color}">${device(project,screens[index],ctx)}</div><div class="viewer-controls"><button type="button" class="gallery-arrow" data-viewer-step="-1" aria-label="${escape(ctx.ui.previousScreen)}" ${screens.length<2?'disabled':''}>←</button><p>${index+1} / ${screens.length}</p><button type="button" class="gallery-arrow" data-viewer-step="1" aria-label="${escape(ctx.ui.nextScreen)}" ${screens.length<2?'disabled':''}>→</button></div><p class="gallery-disclosure">${disclosure(screens[index],ctx)}</p>`;
    dialog._screenState={project,screens,ctx,index,onChange};
    if(!dialog.open)dialog.showModal();
  }
  function moveViewer(step){
    const current=document.getElementById('screen-dialog')._screenState;
    const next=(current.index+step+current.screens.length)%current.screens.length;
    if(current.onChange)current.onChange(next);
    view(current.project,current.screens,current.ctx,next,current.onChange);
  }
  function init(){
    document.addEventListener('click',event=>{
      if(Date.now()<suppressClickUntil&&event.target.closest('[data-gallery]')){event.preventDefault();event.stopImmediatePropagation();return;}
      if(event.target.closest('[data-screen-close]')){document.getElementById('screen-dialog').close();return;}
      const viewer=event.target.closest('[data-viewer-step]');
      if(viewer){const step=viewer.dataset.viewerStep;moveViewer(Number(step));document.getElementById('screen-dialog').querySelector(`[data-viewer-step="${step}"]`).focus();return;}
      const gallery=event.target.closest('[data-gallery]');if(!gallery)return;
      const step=event.target.closest('[data-gallery-step]'),dot=event.target.closest('[data-gallery-index]'),screen=event.target.closest('[data-screen]');
      if(event.target.closest('[data-gallery-open]'))open(gallery);
      else if(step)select(gallery,Number(gallery.dataset.current)+Number(step.dataset.galleryStep));
      else if(dot)select(gallery,Number(dot.dataset.galleryIndex));
      else if(screen){if(Number(screen.dataset.screen)===Number(gallery.dataset.current))open(gallery);else select(gallery,Number(screen.dataset.screen));}
    });
    document.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      const viewer=document.getElementById('screen-dialog');
      if(viewer?.open){event.preventDefault();moveViewer(event.key==='ArrowLeft'?-1:1);return;}
      const gallery=event.target.closest('[data-gallery]');if(!gallery)return;
      event.preventDefault();select(gallery,Number(gallery.dataset.current)+(event.key==='ArrowLeft'?-1:1));
    });
    let start=null;
    document.addEventListener('pointerdown',event=>{const stage=event.target.closest('[data-gallery-stage]');if(stage&&event.pointerType!=='mouse')start={gallery:stage.closest('[data-gallery]'),x:event.clientX,y:event.clientY};});
    document.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){select(start.gallery,Number(start.gallery.dataset.current)+(dx<0?1:-1));suppressClickUntil=Date.now()+350;}start=null;});
    document.addEventListener('pointercancel',()=>{start=null;});
  }
  window.PortfolioShowcase={getScreens,disclosure,renderCapture:capture,render:gallery,renderDevice:device,openScreen:(project,index,ctx,onChange)=>view(project,getScreens(project),ctx,index,onChange),init};
})();
