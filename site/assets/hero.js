'use strict';
(() => {
  let config=null,index=0,list=[],screens=new Map(),suppressClickUntil=0,start=null;
  const root=()=>document.getElementById('hero-showcase');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const local=value=>typeof value==='object'&&value!==null?value[config.lang]??value.en:value;
  const text=key=>config.ui[key];
  const selected=()=>list[index];
  const media=p=>p.media?.screens?.length?p.media.screens:[{label:{en:'Overview',ru:'Обзор'},layout:'workspace',...(p.image||{})}];
  const screenIndex=p=>Math.min(screens.get(p.id)||0,media(p).length-1);
  const context=p=>({lang:config.lang,ui:config.ui,eager:p.id===selected()?.id,color:config.colors[config.projects.indexOf(p)%config.colors.length]});
  const content=p=>({...p.hero,...p.hero?.profiles?.[config.profile]});
  function frame(p){return window.PortfolioShowcase.renderDevice(p,media(p)[screenIndex(p)],context(p));}
  function thumbnails(){
    const p=selected(),active=screenIndex(p),icons={documents:'▤',scan:'⊞',search:'⌕',video:'▷',player:'▷',episodes:'▷',finance:'◈',assets:'◈',loans:'↗',coinhold:'◈',research:'⌁',property:'⌂'};
    root().querySelector('.hero-screen-nav').innerHTML=media(p).map((screen,i)=>`<button type="button" class="hero-screen-choice" data-hero-screen="${i}" aria-pressed="${i===active}" aria-label="${esc(local(screen.label))}"><span class="hero-screen-thumb" aria-hidden="true">${screen.src?`<img src="${esc(screen.src)}" alt="" loading="lazy" draggable="false">`:`<span>${icons[screen.layout]||'⊞'}</span><i></i><i></i>`}</span><span>${esc(local(screen.label))}</span></button>`).join('');
    root().querySelector('.hero-screen-disclosure').textContent=media(p)[active].src?text('actualScreen'):text('screenSketch');
  }
  function paint(announce=false){
    const p=selected(),copy=content(p),count=list.length;
    root().style.setProperty('--hero-accent',context(p).color);
    root().querySelectorAll('[data-hero-project-frame]').forEach((button,i)=>{
      const distance=(i-index+count)%count,position=distance===0?'center':distance===1?'right':distance===count-1?'left':'hidden';
      button.dataset.position=position;button.tabIndex=position==='center'?0:-1;button.setAttribute('aria-hidden',String(position==='hidden'));
      button.setAttribute('aria-label',position==='center'?`${text('enlarge')}: ${local(list[i].name)}`:text('heroShowProject').replace('{name}',local(list[i].name)));
    });
    root().querySelectorAll('[data-hero-project]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    root().querySelector('.hero-product-caption').innerHTML=`<div class="hero-product-meta"><span class="hero-ownership">${esc(local(copy.ownership))}</span><span class="badge ${p.status}">${esc(text(p.status))}</span></div><h2 id="hero-project-name">${esc(local(p.hero?.label||p.name))}</h2><p class="hero-product-summary">${esc(local(copy.summary))}</p><div class="hero-product-contribution"><span class="mono">${text('heroContribution')}</span><p>${esc(local(copy.contribution))}</p></div><div class="hero-product-actions"><button type="button" class="hero-case-link" data-project="${p.id}">${text('caseStudy')} <span aria-hidden="true">↗</span></button><a href="#work">${text('heroCatalog')} <span aria-hidden="true">↓</span></a></div>`;
    root().querySelector('.hero-project-counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;
    root().querySelector('.hero-project-counter').setAttribute('aria-label',text('heroCounter').replace('{current}',index+1).replace('{total}',count));
    root().querySelector('.hero-stage-note').textContent=local(p.domain);
    thumbnails();
    if(announce)root().querySelector('.hero-announcement').textContent=`${text('heroCounter').replace('{current}',index+1).replace('{total}',count)}. ${local(p.name)}. ${local(copy.ownership)}`;
  }
  function choose(next,announce=true){
    index=(next+list.length)%list.length;paint(announce);
    const nav=root().querySelector('.hero-project-nav'),button=nav.querySelector(`[data-hero-project="${index}"]`);
    if(button)nav.scrollTo({left:Math.max(0,button.offsetLeft-nav.offsetLeft-nav.clientWidth/2+button.offsetWidth/2),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function chooseScreen(next){
    const p=selected(),items=media(p);next=(next+items.length)%items.length;screens.set(p.id,next);
    root().querySelector(`[data-hero-project-frame="${index}"]`).innerHTML=frame(p);thumbnails();
    root().querySelector('.hero-announcement').textContent=`${local(p.name)}. ${local(items[next].label)}`;
  }
  function enlarge(){const p=selected();window.PortfolioShowcase.openScreen(p,screenIndex(p),context(p),chooseScreen);}
  function mount(options){
    const previous=config?.profile===options.profile?selected()?.id:null;config=options;
    list=options.ids.map(id=>options.projects.find(p=>p.id===id)).filter(Boolean);
    if(!list.length){root().hidden=true;return;}root().hidden=false;
    index=Math.max(0,list.findIndex(p=>p.id===previous));
    root().setAttribute('aria-roledescription',text('heroCarouselRole'));
    root().innerHTML=`<div class="hero-stage-top"><p class="mono">${text('heroProjects')}</p><span class="hero-project-counter mono"></span><span class="hero-stage-note"></span></div><div class="hero-device-stage" aria-label="${esc(text('heroProjects'))}"><span class="hero-stage-orbit" aria-hidden="true"></span>${list.map((p,i)=>`<button type="button" class="hero-project-frame" data-hero-project-frame="${i}">${frame(p)}</button>`).join('')}</div><div class="hero-project-controls"><button type="button" class="gallery-arrow" data-hero-step="-1" aria-label="${esc(text('previousProject'))}" ${list.length<2?'disabled':''}>←</button><span class="sr-only">${text('heroSwipe')}</span><button type="button" class="gallery-arrow" data-hero-step="1" aria-label="${esc(text('nextProject'))}" ${list.length<2?'disabled':''}>→</button></div><div class="hero-screen-nav" role="group" aria-label="${esc(text('heroScreens'))}"></div><p class="hero-screen-disclosure"></p><div class="hero-product-caption"></div><nav class="hero-project-nav" aria-label="${esc(text('heroSelectProject'))}">${list.map((p,i)=>`<button type="button" data-hero-project="${i}">${esc(local(p.hero?.label||p.name))}</button>`).join('')}</nav><p class="sr-only hero-announcement" role="status" aria-live="polite" aria-atomic="true"></p>`;
    root().querySelectorAll('img').forEach(image=>image.draggable=false);paint();
  }
  function init(){
    root().addEventListener('click',event=>{
      if(Date.now()<suppressClickUntil&&event.target.closest('.hero-device-stage')){event.preventDefault();event.stopPropagation();return;}
      const step=event.target.closest('[data-hero-step]'),project=event.target.closest('[data-hero-project]'),screen=event.target.closest('[data-hero-screen]'),device=event.target.closest('[data-hero-project-frame]');
      if(step)choose(index+Number(step.dataset.heroStep));
      else if(project)choose(Number(project.dataset.heroProject));
      else if(screen){chooseScreen(Number(screen.dataset.heroScreen));root().querySelector(`[data-hero-screen="${screen.dataset.heroScreen}"]`).focus({preventScroll:true});}
      else if(device){if(Number(device.dataset.heroProjectFrame)===index)enlarge();else choose(Number(device.dataset.heroProjectFrame));}
    });
    root().addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||!event.target.closest('[data-hero-screen],[data-hero-project],[data-hero-step],[data-hero-project-frame]'))return;
      const screen=event.target.closest('[data-hero-screen]'),direction=event.key==='ArrowLeft'?-1:1;
      event.preventDefault();event.stopPropagation();
      if(screen){const next=event.key==='Home'?0:event.key==='End'?media(selected()).length-1:screenIndex(selected())+direction;chooseScreen(next);root().querySelector(`[data-hero-screen="${screenIndex(selected())}"]`).focus({preventScroll:true});}
      else{choose(event.key==='Home'?0:event.key==='End'?list.length-1:index+direction);if(event.target.closest('[data-hero-project]'))root().querySelector(`[data-hero-project="${index}"]`).focus({preventScroll:true});else if(event.target.closest('[data-hero-project-frame]'))root().querySelector(`[data-hero-project-frame="${index}"]`).focus({preventScroll:true});}
    });
    root().addEventListener('pointerdown',event=>{if(event.target.closest('.hero-device-stage')&&event.button===0)start={x:event.clientX,y:event.clientY};});
    document.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){choose(index+(dx<0?1:-1));suppressClickUntil=Date.now()+350;}start=null;});
    document.addEventListener('pointercancel',()=>{start=null;});
  }
  window.PortfolioHero={mount,init};
})();
