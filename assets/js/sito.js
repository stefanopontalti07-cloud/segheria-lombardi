/* Segheria Lombardi — script condiviso. Ogni blocco parte solo se nella pagina c'è il suo pezzo. */
(function(){
  var d=document;
  var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL='info@segheria-lombardi.it';

  // aperto dal disco (file://): i link alle cartelle non aprono index.html da soli
  if(location.protocol==='file:'){
    d.querySelectorAll('a[href]').forEach(function(a){
      var h=a.getAttribute('href');
      if(!/^[a-z]+:/i.test(h) && !h.startsWith('#')){
        var p=h.split(/([?#].*)/);
        if(p[0]==='' || p[0].endsWith('/')) a.setAttribute('href',(p[0]||'./')+'index.html'+(p[1]||''));
      }
    });
  }

  d.querySelectorAll('.anno-corrente').forEach(function(e){e.textContent=new Date().getFullYear();});

  // menu sul telefono
  var btn=d.querySelector('.menu-btn'), nav=d.getElementById('menu');
  if(btn && nav){
    btn.addEventListener('click',function(){
      var aperto=nav.classList.toggle('aperto');
      btn.setAttribute('aria-expanded',aperto);
    });
    d.addEventListener('keydown',function(e){
      if(e.key==='Escape' && nav.classList.contains('aperto')){nav.classList.remove('aperto');btn.setAttribute('aria-expanded','false');btn.focus();}
    });
  }

  // barra fissa del telefono: sparisce finché si vedono i bottoni dell'apertura
  var barra=d.querySelector('.barra'), azioni=d.querySelector('.apertura .azioni, .testa-pagina .azioni');
  if('IntersectionObserver' in window && barra && azioni){
    new IntersectionObserver(function(v){ barra.classList.toggle('via', v[0].isIntersecting); }).observe(azioni);
  }

  // momento firma (solo home): la lama taglia e la foto si apre. Se non parte, la foto è comunque visibile
  var foto=d.querySelector('.apertura-foto');
  if(foto && !calma && d.visibilityState==='visible'){
    foto.classList.add('taglio');
    setTimeout(function(){foto.classList.remove('taglio');},2200);
  }

  // catalogo: i prodotti salgono in fila quando entrano in vista (sono visibili anche senza)
  var cat=d.querySelector('.catalogo');
  if(cat && !calma && 'IntersectionObserver' in window && cat.getBoundingClientRect().top>window.innerHeight){
    cat.classList.add('pre');
    var io=new IntersectionObserver(function(v){
      if(v[0].isIntersecting){cat.classList.add('in');io.disconnect();}
    },{rootMargin:'0px 0px -10% 0px'});
    io.observe(cat);
  }

  function apriPosta(oggetto, corpo){
    location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(oggetto)+'&body='+encodeURIComponent(corpo);
  }

  // modulo semplice (contatti): compone l'email, non manda niente da solo
  var f=d.getElementById('modulo');
  if(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.website_url.value) return; // campo trappola: lo riempiono solo i programmi automatici
      var nome=f.nome.value.trim(), rec=f.recapito.value.trim(), msg=f.messaggio.value.trim();
      var nota=d.getElementById('nota-modulo');
      if(!nome||!rec){ (nome?f.recapito:f.nome).focus(); nota.textContent='Mancano il nome o un recapito: servono per rispondervi.'; return; }
      apriPosta('Messaggio dal sito', 'Nome: '+nome+'\nRecapito: '+rec+(msg?'\n\n'+msg:''));
    });
  }

  // preventivo guidato: tre passi, poi compone l'email. Senza JavaScript è un modulo unico.
  var g=d.getElementById('guidato');
  if(g){
    g.classList.add('js');
    var passi=[].slice.call(g.querySelectorAll('.passo'));
    var barretta=g.querySelector('.avanzamento i'), testoAv=g.querySelector('.avanzamento span');
    var err=g.querySelector('.errore-passo'), n=0;
    d.querySelector('.avanzamento').hidden=false;
    passi.forEach(function(p){ p.querySelector('.pulsanti').hidden=false; });

    var tipoLegname=['Legname da costruzione','Perlinati o pavimenti'];
    function tipo(){ var c=g.querySelector('input[name=tipo]:checked'); return c?c.value:''; }
    function adattaDettagli(){
      var leg=tipoLegname.indexOf(tipo())>-1;
      g.querySelectorAll('.per-tetti').forEach(function(x){x.hidden=leg; x.querySelectorAll('input,select,textarea').forEach(function(i){i.disabled=leg;});});
      g.querySelectorAll('.per-legname').forEach(function(x){x.hidden=!leg; x.querySelectorAll('input,select,textarea').forEach(function(i){i.disabled=!leg;});});
    }
    function mostra(i, focus){
      n=i;
      passi.forEach(function(p,k){p.hidden=(k!==i);});
      barretta.style.width=((i+1)/passi.length*100)+'%';
      testoAv.textContent='Passo '+(i+1)+' di '+passi.length;
      if(err) err.textContent='';
      if(i===1) adattaDettagli();
      if(i===2) riepilogo();
      if(focus){ var l=passi[i].querySelector('legend'); l.setAttribute('tabindex','-1'); l.focus(); g.scrollIntoView({block:'start',behavior:calma?'auto':'smooth'}); }
    }
    function testo(el){ return el && !el.disabled && el.value.trim() ? el.value.trim() : ''; }
    function righe(){
      var r=['Richiesta: '+tipo()];
      [['comune','Comune del cantiere'],['misure','Misure indicative'],['progetto','Progetto'],['quando','Quando'],
       ['prodotto','Prodotto'],['essenza','Essenza'],['quantita','Quantità e misure'],['dettagli','Note']].forEach(function(c){
        var v=testo(g.elements[c[0]]); if(v) r.push(c[1]+': '+v);
      });
      return r;
    }
    function riepilogo(){ var box=g.querySelector('.riepilogo'); if(box) box.textContent=righe().join('\n'); }

    g.addEventListener('click',function(e){
      var b=e.target.closest('button[data-vai]'); if(!b) return;
      var dove=b.getAttribute('data-vai');
      if(dove==='avanti'){
        if(n===0 && !tipo()){ err.textContent='Scegliete che cosa vi serve.'; g.querySelector('input[name=tipo]').focus(); return; }
        mostra(n+1,true);
      } else mostra(n-1,true);
    });
    g.addEventListener('submit',function(e){
      e.preventDefault();
      if(g.website_url.value) return;
      var nome=g.nome.value.trim(), tel=g.telefono.value.trim();
      var nota=d.getElementById('nota-guidato');
      if(!tipo()){ mostra(0,true); err.textContent='Scegliete che cosa vi serve.'; return; }
      if(!nome||!tel){ (nome?g.telefono:g.nome).focus(); nota.textContent='Mancano nome o telefono: servono per richiamarvi.'; return; }
      var corpo='Nome: '+nome+'\nTelefono: '+tel+(testo(g.email)?'\nEmail: '+testo(g.email):'')+'\n\n'+righe().join('\n');
      apriPosta('Richiesta di preventivo: '+tipo(), corpo);
    });
    // arrivando da "Chiedi disponibilità" il tipo è già scelto
    var q=new URLSearchParams(location.search).get('tipo');
    if(q==='legname'){ var r=g.querySelector('input[value="Legname da costruzione"]'); if(r) r.checked=true; }
    mostra(0,false);
  }

  // calcolo dei metri cubi
  var calc=d.getElementById('calcolo');
  if(calc){
    var out=calc.querySelector('output');
    var num=function(x){ return parseFloat(String(x).replace(',','.'))||0; };
    var aggiorna=function(){
      var v=function(n){ return num(calc.querySelector('[name='+n+']').value); };
      var m3=v('pezzi')*v('spessore')/100*v('larghezza')/100*v('lunghezza');
      out.textContent=m3.toLocaleString('it-IT',{minimumFractionDigits:3,maximumFractionDigits:3})+' m³';
    };
    calc.addEventListener('input',aggiorna);
    aggiorna();
  }

  // realizzazioni: filtri e foto a tutto schermo
  var gal=d.querySelector('.galleria[data-filtrabile]');
  if(gal){
    var figure=[].slice.call(gal.querySelectorAll('figure'));
    var conta=d.querySelector('.conta');
    d.querySelectorAll('.filtri button').forEach(function(b){
      b.addEventListener('click',function(){
        var c=b.getAttribute('data-cat'), visibili=0;
        d.querySelectorAll('.filtri button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});
        figure.forEach(function(fig){
          var si=(c==='tutte'||fig.getAttribute('data-cat').split(' ').indexOf(c)>-1);
          fig.hidden=!si; if(si) visibili++;
          fig.classList.remove('grande');
        });
        var vis=figure.filter(function(x){return !x.hidden;});
        [0,7,14].forEach(function(i){ if(vis[i]) vis[i].classList.add('grande'); });
        if(conta) conta.textContent=visibili+(visibili===1?' lavoro':' lavori');
      });
    });

    var lb=d.getElementById('lightbox');
    if(lb && typeof lb.showModal==='function'){
      var lbImg=d.createElement('img'), lbDida=lb.querySelector('.lb-dida'), lbConta=lb.querySelector('.lb-conta'), attuale=0, lista=[];
      var mostraLb=function(i){
        if(!lbImg.parentNode) lb.querySelector('.lb-foto').appendChild(lbImg);
        attuale=(i+lista.length)%lista.length;
        var fig=lista[attuale], a=fig.querySelector('a'), im=fig.querySelector('img');
        lbImg.src=a.getAttribute('href'); lbImg.alt=im.alt;
        lbImg.width=+a.getAttribute('data-larga'); lbImg.height=+a.getAttribute('data-alta');
        lbDida.textContent=fig.querySelector('figcaption').textContent;
        lbConta.textContent=(attuale+1)+' di '+lista.length;
      };
      gal.addEventListener('click',function(e){
        var a=e.target.closest('a.cornice'); if(!a) return;
        e.preventDefault();
        lista=figure.filter(function(x){return !x.hidden;});
        mostraLb(lista.indexOf(a.closest('figure')));
        lb.showModal();
      });
      lb.querySelector('.lb-prec').addEventListener('click',function(){mostraLb(attuale-1);});
      lb.querySelector('.lb-succ').addEventListener('click',function(){mostraLb(attuale+1);});
      lb.querySelector('.lb-chiudi').addEventListener('click',function(){lb.close();});
      lb.addEventListener('keydown',function(e){
        if(e.key==='ArrowLeft') mostraLb(attuale-1);
        if(e.key==='ArrowRight') mostraLb(attuale+1);
      });
      lb.addEventListener('click',function(e){ if(e.target===lb || e.target.classList.contains('lb-foto')) lb.close(); });
    }
  }

  // mappa a due click: Google riceve qualcosa solo se la persona preme il bottone
  d.querySelectorAll('.due-click').forEach(function(box){
    box.querySelector('.due-click__bottone').addEventListener('click',function(){
      var fr=d.createElement('iframe');
      fr.src=box.getAttribute('data-src');
      fr.title=box.getAttribute('data-titolo')||'Mappa';
      fr.loading='lazy';
      fr.referrerPolicy='no-referrer-when-downgrade';
      fr.allowFullscreen=true;
      box.appendChild(fr);
      box.querySelector('.due-click__dentro').hidden=true;
      fr.focus();
    });
  });
})();
