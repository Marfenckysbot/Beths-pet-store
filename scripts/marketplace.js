const PRODUCTS=[
{id:"preview-food-01",name:"Premium Everyday Dog Food",category:"food",price:29.99,was:39.99,image:"images/products/dogfoodpremium.webp",alt:"Premium dog food bag",tag:"NOURISH"},
{id:"preview-bed-01",name:"Cloud-Soft Round Pet Bed",category:"comfort",price:24.99,was:34.99,image:"images/products/petbedround.webp",alt:"Round cushioned pet bed",tag:"COSY PICK"},
{id:"preview-collar-01",name:"Classic Red Comfort Collar",category:"accessories",price:8.99,was:12.99,image:"images/products/colar_red.webp",alt:"Red pet collar",tag:"EVERYDAY"},
{id:"preview-aquarium-01",name:"Starter Aquarium Set",category:"habitats",price:59.99,was:79.99,image:"images/products/fishtankstarter.jpeg",alt:"Aquarium starter kit",tag:"DISCOVER"}
];
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
const countryName=code=>{try{return code?new Intl.DisplayNames(["en"],{type:"region"}).of(String(code).toUpperCase()):""}catch{return ""}};
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=k=>{try{const value=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(value)?value:[]}catch{return []}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const setPageMetadata=(title,description)=>{
 document.title=title;
 const clean=String(description||"Explore approved independent pet products and sellers at Beth's Pet Store.").replace(/\s+/g," ").trim().slice(0,160);
 const setMeta=(selector,attributes)=>{
  let node=document.head.querySelector(selector);
  if(!node){node=document.createElement("meta");document.head.append(node);}
  for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);
 };
 setMeta('meta[name="description"]',{name:"description",content:clean});
 setMeta('meta[property="og:title"]',{"property":"og:title",content:title});
 setMeta('meta[property="og:description"]',{"property":"og:description",content:clean});
 const canonical=document.head.querySelector('link[rel="canonical"]');
 if(canonical)canonical.href=location.origin+location.pathname+location.search;
};
document.addEventListener("DOMContentLoaded",()=>{
 const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
 document.addEventListener("error",event=>{const img=event.target;if(img instanceof HTMLImageElement&&!img.dataset.fallbackTried&&/^https?:/i.test(img.getAttribute("src")||"")){img.dataset.fallbackTried="true";img.src="images/animals/dog_golden.webp";img.alt=img.alt||"Pet image";}},true);
 const toggle=document.querySelector(".menu-toggle"),nav=document.getElementById("primary-nav");
 if(toggle&&nav)toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));nav.classList.toggle("is-open",!open)});
 let cart=read("beths-preview-cart"),wish=read("beths-preview-wishlist"),filter="all",term="",minPrice="",maxPrice="";
 const count=()=>document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=cart.reduce((n,x)=>n+x.qty,0));
 const productHref=p=>"product.html?slug="+encodeURIComponent(p.slug||p.id);
 const storeHref=p=>"store.html?slug="+encodeURIComponent(p.sellerSlug||p.sellerId||"");
 const sellerLink=p=>p.sellerSlug?'<a class="seller-inline-link" href="'+storeHref(p)+'">Visit '+safe(p.sellerName||"seller")+(p.sellerCountry?' · Seller in '+safe(countryName(p.sellerCountry)):"")+' ↗</a>':"";
 const card=p=>{const saved=wish.includes(p.id),pct=p.was>p.price?Math.round((1-p.price/p.was)*100):0;return '<article class="product-card"><div class="product-visual"><span class="preview-tag">'+(p.isLive?"SELLER LISTING":"PREVIEW · "+pct+"% OFF*")+'</span><button class="wish-button '+(saved?"is-wished":"")+'" data-wish="'+safe(p.id)+'" aria-pressed="'+saved+'" aria-label="'+(saved?"Remove from":"Add to")+' wishlist">'+(saved?"♥":"♡")+'</button><div class="product-image-3d"><img src="'+safe(p.image)+'" alt="'+safe(p.alt||p.name)+'" loading="lazy"></div><span class="product-category">'+safe(p.tag||"PET ESSENTIALS")+'</span></div><div class="product-info"><h3><a href="'+productHref(p)+'">'+safe(p.name)+'</a></h3><p class="product-subline">'+(p.isLive?"Sold by "+safe(p.sellerName||"Marketplace seller"):"Concept listing · Seller to be confirmed")+'</p>'+sellerLink(p)+'<div class="price-row"><strong>'+money(p.price)+'</strong>'+(p.was>p.price?'<del>'+money(p.was)+'</del>':"")+'</div><small class="price-disclaimer">'+(p.isLive?"Seller listing · Preview checkout only":"Illustrative price only")+'</small><button class="add-button" data-add="'+safe(p.id)+'">Add to preview bag <span>＋</span></button><a class="product-open-link" href="'+productHref(p)+'">View details ↗</a></div></article>'};
 const matches=()=>PRODUCTS.filter(p=>(filter==="all"||p.category===filter)&&(`${p.name} ${p.category} ${p.sellerName||""}`.toLowerCase().includes(term))&&(!minPrice||p.price>=Number(minPrice))&&(!maxPrice||p.price<=Number(maxPrice)));
 const render=()=>{document.querySelectorAll("[data-product-grid]").forEach(grid=>{let items=matches();if(grid.dataset.productGrid==="home"){const live=items.filter(p=>p.isLive);items=(live.length?live:items).slice(0,4);}if(grid.dataset.productGrid==="shop"){const s=document.getElementById("sort-products")?.value;if(s==="price-low")items.sort((a,b)=>a.price-b.price);if(s==="price-high")items.sort((a,b)=>b.price-a.price);if(s==="name")items.sort((a,b)=>a.name.localeCompare(b.name))}grid.innerHTML=items.map(card).join("")});const result=document.querySelector("[data-result-count]");if(result)result.textContent=matches().length+" items shown";const empty=document.querySelector("[data-empty-state]");if(empty)empty.hidden=matches().length>0};
 const notice=message=>{let el=document.querySelector(".site-notice");if(!el){el=document.createElement("div");el.className="site-notice";el.setAttribute("role","status");document.body.append(el)}el.textContent=message;el.classList.add("visible");clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.classList.remove("visible"),2600)};
 const saveCart=()=>{write("beths-preview-cart",cart);count()};
 const drawer=(id,title,inside)=>{document.getElementById(id)?.remove();const panel=document.createElement("div");panel.id=id;panel.className="drawer-backdrop";panel.innerHTML=inside;document.body.append(panel);panel.addEventListener("click",e=>{if(e.target===panel||e.target.closest("[data-close-drawer]"))panel.remove()});return panel};
 const openCart=()=>{const panel=drawer("cart-panel","Your bag",'<section class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><button class="drawer-close" data-close-drawer aria-label="Close">×</button><p class="eyebrow">YOUR LITTLE PREVIEW BAG</p><h2 id="cart-title">Your bag</h2><div data-cart-lines></div><div class="cart-total"><span>Preview subtotal</span><b data-cart-total>$0.00</b></div><p class="checkout-note">This is a design-preview bag only. Checkout and payment collection are not enabled.</p><button class="btn btn-primary checkout-disabled" type="button" disabled>Checkout opens after payment setup</button></section>');const lines=panel.querySelector("[data-cart-lines]");lines.innerHTML=cart.length?cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return p?`<div class="cart-line"><img src="${p.image}" alt=""><div><b>${safe(p.name)}</b><small>${money(p.price)} · Qty ${i.qty}</small><button data-remove="${p.id}">Remove</button></div></div>`:""}).join(""):'<p class="cart-empty">Your preview bag is empty. Add a concept product to try the experience.</p>';panel.querySelector("[data-cart-total]").textContent=money(cart.reduce((n,i)=>n+(PRODUCTS.find(p=>p.id===i.id)?.price||0)*i.qty,0))};
 const openWishlist=()=>{const panel=drawer("wishlist-panel","Wishlist",'<section class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="wishlist-title"><button class="drawer-close" data-close-drawer aria-label="Close">×</button><p class="eyebrow">YOUR SAVED FINDS</p><h2 id="wishlist-title">Wishlist</h2><div data-wishlist-lines></div><p class="checkout-note">Your preview wishlist is stored on this device only.</p></section>');const lines=panel.querySelector("[data-wishlist-lines]");const saved=PRODUCTS.filter(p=>wish.includes(p.id));lines.innerHTML=saved.length?saved.map(p=>`<div class="cart-line"><img src="${p.image}" alt=""><div><b>${safe(p.name)}</b><small>${money(p.price)} · Preview price</small><button data-wish-remove="${p.id}">Remove</button></div></div>`).join(""):'<p class="cart-empty">No saved preview items yet. Tap the heart on a product to keep it here.</p>'};
 document.addEventListener("click",e=>{const add=e.target.closest("[data-add]");if(add){const id=add.dataset.add,item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart();notice("Added to your preview bag — no payment has been taken.");}
 const remove=e.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);saveCart();openCart()}
 const wishRemove=e.target.closest("[data-wish-remove]");if(wishRemove){wish=wish.filter(x=>x!==wishRemove.dataset.wishRemove);write("beths-preview-wishlist",wish);render();openWishlist()}
 const heart=e.target.closest("[data-wish]");if(heart){const id=heart.dataset.wish;wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];write("beths-preview-wishlist",wish);render();notice(wish.includes(id)?"Saved to your preview wishlist.":"Removed from wishlist.")}
 if(e.target.closest("[data-open-cart]"))openCart();if(e.target.closest("[data-open-wishlist]")){e.preventDefault();openWishlist()}
 });
 document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));render()}));
 document.querySelectorAll('input[type="search"][name="q"]').forEach(input=>{const params=new URLSearchParams(location.search);input.value=params.get("q")||"";term=input.value.toLowerCase().trim();input.addEventListener("input",()=>{term=input.value.toLowerCase().trim();render()});input.closest("form")?.addEventListener("submit",e=>{if(document.querySelector('[data-product-grid="shop"]')){e.preventDefault();term=input.value.toLowerCase().trim();render()}})});
 const params=new URLSearchParams(location.search),cat=params.get("category");if(cat&&["food","accessories","comfort","habitats","care"].includes(cat)){filter=cat;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x.dataset.filter===cat))}
 document.getElementById("sort-products")?.addEventListener("change",render);
 document.getElementById("min-price")?.addEventListener("input",e=>{minPrice=e.target.value;render()});
 document.getElementById("max-price")?.addEventListener("input",e=>{maxPrice=e.target.value;render()});
 document.querySelector("[data-clear-filters]")?.addEventListener("click",()=>{filter="all";term="";minPrice="";maxPrice="";document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x.dataset.filter==="all"));document.querySelectorAll('input[name="q"]').forEach(x=>x.value="");const low=document.getElementById("min-price"),high=document.getElementById("max-price");if(low)low.value="";if(high)high.value="";render()});
 document.querySelector("[data-open-quiz]")?.addEventListener("click",()=>{const panel=drawer("quiz-panel","Pet Match",'<section class="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title"><button class="drawer-close" data-close-drawer aria-label="Close">×</button><p class="eyebrow">A JUST-FOR-FUN MATCH</p><h2 id="quiz-title">What does your everyday look like?</h2><label>How active is your household?<select id="quiz-energy"><option value="calm">Mostly calm and cosy</option><option value="mixed">A little bit of everything</option><option value="active">Very active and outdoorsy</option></select></label><label>How much time can you give daily?<select id="quiz-time"><option value="little">A little time</option><option value="some">A steady amount</option><option value="lots">Lots of time and attention</option></select></label><button class="btn btn-primary" id="quiz-submit">Show my ideas ↗</button><p class="quiz-result" aria-live="polite"></p><small>This is a playful starting point, not veterinary or adoption advice. Research each species carefully and consult reputable welfare organisations.</small></section>');panel.querySelector("#quiz-submit").addEventListener("click",()=>{const energy=panel.querySelector("#quiz-energy").value,time=panel.querySelector("#quiz-time").value;panel.querySelector(".quiz-result").textContent=energy==="active"&&time!=="little"?"You may enjoy researching active dogs, playful companions or outdoor enrichment routines.":energy==="calm"&&time==="little"?"You may prefer researching lower-intensity companionship options — remember every animal still needs daily care and attention.":"Several kinds of companion could fit. Compare care needs, lifespan, space, costs and local welfare guidance before deciding."})});
 render();count();
 const loadLiveProducts=async()=>{
   const cfg=window.BETHS_SUPABASE_CONFIG||{};
   if(!cfg.url||!cfg.anonKey||!document.querySelector("[data-product-grid]"))return;
   try{
     const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
     const client=createClient(cfg.url,cfg.anonKey);
     const {data,error}=await client.from("products").select("id,slug,name,description,price_usd,compare_at_usd,image_urls,model_url,inventory_quantity,categories(name,slug),sellers(id,store_name,slug,country_code)").eq("status","active").order("created_at",{ascending:false}).limit(60);
     if(error){console.warn("Live marketplace catalogue unavailable:",error.message);return;}
     const categoryMap={"food-treats":"food","accessories-toys":"accessories","beds-comfort":"comfort","habitats-aquatics":"habitats","grooming-care":"care"};
     for(const item of data||[]){
       if(PRODUCTS.some(existing=>existing.id===item.id))continue;
       PRODUCTS.push({id:item.id,name:item.name,category:categoryMap[item.categories?.slug]||"all",price:Number(item.price_usd),was:Number(item.compare_at_usd||item.price_usd),image:item.image_urls?.[0]||"assets/beths-mark.svg",alt:item.name,tag:item.categories?.name||"PET ESSENTIALS",sellerName:item.sellers?.store_name||"Marketplace seller",sellerId:item.sellers?.id,sellerSlug:item.sellers?.slug,sellerCountry:item.sellers?.country_code,slug:item.slug,description:item.description,images:item.image_urls||[],modelUrl:item.model_url||"",inventory:Number(item.inventory_quantity||0),isLive:true});
     }
     render();
   }catch(error){console.warn("Live marketplace catalogue could not be loaded.",error);}
 };
 loadLiveProducts();

 const detailRoot=document.querySelector("[data-product-detail]");
 if(detailRoot){
  const slug=new URLSearchParams(location.search).get("slug");
  const sample=PRODUCTS.find(p=>p.id===slug||p.slug===slug);
  const drawDetail=p=>{
   if(p&&!PRODUCTS.some(item=>item.id===p.id))PRODUCTS.push(p);
   if(!p){setPageMetadata("Product unavailable | Beth's Pet Store","This product listing is unavailable or has not been published.");detailRoot.innerHTML='<section class="detail-empty"><h1>Product not found</h1><p>This listing may be unavailable or not yet published.</p><a class="btn btn-primary" href="shop.html">Back to marketplace</a></section>';return;}
   setPageMetadata(p.name+" | Beth's Pet Store",p.description||("Explore "+p.name+" from an independent seller at Beth's Pet Store."));
   const photos=(p.images&&p.images.length?p.images:[p.image]).filter(Boolean);
   detailRoot.innerHTML='<div class="detail-breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Marketplace</a> / '+safe(p.name)+'</div><div class="product-detail-layout"><div><div class="detail-main-image"><img data-detail-main src="'+safe(photos[0])+'" alt="'+safe(p.alt||p.name)+'"></div><div class="detail-thumbnails">'+photos.map((src,i)=>'<button type="button" data-detail-photo="'+i+'" class="'+(i===0?'active':'')+'" aria-label="Show photo '+(i+1)+'"><img src="'+safe(src)+'" alt=""></button>').join("")+'</div></div><article class="detail-copy"><p class="eyebrow">'+(p.isLive?'APPROVED SELLER LISTING':'CONCEPT PRODUCT PREVIEW')+'</p><h1>'+safe(p.name)+'</h1><div class="detail-price">'+money(p.price)+(p.was>p.price?' <del>'+money(p.was)+'</del>':'')+'</div><p class="detail-disclaimer">'+(p.isLive?'Seller-submitted listing. Checkout is not enabled.':'Illustrative product and price only — not an active offer or confirmed stock.')+'</p><p class="detail-description">'+safe(p.description||'A sample product description for this marketplace preview. Confirm specifications and suitability before purchase.')+'</p><div class="detail-meta"><span>Category</span><b>'+safe(p.tag||p.category||'Pet essentials')+'</b><span>Availability</span><b>'+(p.isLive?'Availability to confirm':'Preview only')+'</b></div>'+sellerLink(p)+'<button class="btn btn-primary detail-add" data-add="'+safe(p.id)+'">Add to preview bag</button><p class="checkout-note">The preview bag does not place an order or collect payment.</p></article></div><section class="detail-related"><div class="section-heading"><div><p class="eyebrow">MORE TO EXPLORE</p><h2>Related finds.</h2></div><a class="under-link" href="shop.html">Browse all ↗</a></div><div class="product-grid" data-related-grid></div></section>';
   if(p.modelUrl){const media=detailRoot.querySelector(".product-detail-layout > div");const viewer=document.createElement("model-viewer");viewer.setAttribute("src",p.modelUrl);viewer.setAttribute("alt","Interactive 3D model of "+p.name);viewer.setAttribute("camera-controls","");viewer.setAttribute("auto-rotate","");viewer.setAttribute("shadow-intensity","1");viewer.setAttribute("ar","");viewer.setAttribute("ar-modes","webxr scene-viewer quick-look");viewer.className="beth-model-viewer";const panel=document.createElement("section");panel.className="model-viewer-panel";const heading=document.createElement("p");heading.className="eyebrow";heading.textContent="INTERACTIVE 3D MODEL";const note=document.createElement("small");note.textContent="Drag to rotate · Pinch or scroll to zoom · AR on compatible devices";panel.append(heading,viewer,note);media.prepend(panel);const loader=document.createElement("script");loader.type="module";loader.src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";document.head.append(loader);}
   detailRoot.querySelectorAll("[data-detail-photo]").forEach(btn=>btn.addEventListener("click",()=>{detailRoot.querySelector("[data-detail-main]").src=photos[Number(btn.dataset.detailPhoto)];detailRoot.querySelectorAll("[data-detail-photo]").forEach(x=>x.classList.toggle("active",x===btn));}));
   detailRoot.querySelector("[data-related-grid]").innerHTML=PRODUCTS.filter(x=>x.id!==p.id&&x.category===p.category).slice(0,4).map(card).join("");
  };
  if(sample)drawDetail(sample);
  else{
   const cfg=window.BETHS_SUPABASE_CONFIG||{};
   if(!slug||!cfg.url||!cfg.anonKey)drawDetail(null);
   else import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm").then(({createClient})=>createClient(cfg.url,cfg.anonKey).from("products").select("id,slug,name,description,price_usd,compare_at_usd,image_urls,model_url,inventory_quantity,categories(name,slug),sellers(id,store_name,slug,country_code)").eq("slug",slug).eq("status","active").maybeSingle()).then(({data,error})=>{
    if(error||!data){drawDetail(null);return;}
    drawDetail({id:data.id,slug:data.slug,name:data.name,description:data.description,price:Number(data.price_usd),was:Number(data.compare_at_usd||data.price_usd),images:data.image_urls||[],modelUrl:data.model_url||"",image:data.image_urls?.[0]||"assets/beths-mark.svg",alt:data.name,category:data.categories?.slug||"all",tag:data.categories?.name||"PET ESSENTIALS",sellerName:data.sellers?.store_name,sellerId:data.sellers?.id,sellerSlug:data.sellers?.slug,sellerCountry:data.sellers?.country_code,isLive:true,inventory:Number(data.inventory_quantity||0)});
   }).catch(()=>drawDetail(null));
  }
 }
 const storeRoot=document.querySelector("[data-store-detail]");
 if(storeRoot){
  const slug=new URLSearchParams(location.search).get("slug"),cfg=window.BETHS_SUPABASE_CONFIG||{};
  const showStore=(seller,items)=>{
   if(!seller){storeRoot.innerHTML='<section class="detail-empty"><h1>Storefront unavailable</h1><p>Approved seller storefronts will appear when the live marketplace is configured.</p><a class="btn btn-primary" href="shop.html">Browse marketplace</a></section>';return;}
   const mapped=items.map(x=>({id:x.id,slug:x.slug,name:x.name,description:x.description,price:Number(x.price_usd),was:Number(x.compare_at_usd||x.price_usd),images:x.image_urls||[],image:x.image_urls?.[0]||"assets/beths-mark.svg",alt:x.name,category:x.categories?.slug||"all",tag:x.categories?.name||"PET ESSENTIALS",sellerName:seller.store_name,sellerId:seller.id,sellerSlug:seller.slug,sellerCountry:seller.country_code,isLive:true}));
   setPageMetadata(seller.store_name+" | Beth's Pet Store",seller.description||("Shop approved pet products from "+seller.store_name+" on Beth's Pet Store."));
   mapped.forEach(p=>{if(!PRODUCTS.some(item=>item.id===p.id))PRODUCTS.push(p)});
   storeRoot.innerHTML='<section class="store-hero"><p class="eyebrow">APPROVED MARKETPLACE SELLER</p><h1>'+safe(seller.store_name)+'</h1><p>'+safe(seller.description||'An independent pet business on Beth’s Pet Store.')+'</p><span>'+safe(seller.country_code?countryName(seller.country_code):'Location not specified')+' · Approved storefront</span></section><section class="store-products"><div class="section-heading"><div><p class="eyebrow">SHOP THIS SELLER</p><h2>Available listings.</h2></div><span>'+mapped.length+' approved products</span></div><div class="product-grid">'+(mapped.length?mapped.map(card).join(""):'<p>No approved products are listed yet.</p>')+'</div></section>';
  };
  if(!slug||!cfg.url||!cfg.anonKey)showStore(null,[]);
  else import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm").then(async({createClient})=>{
   const client=createClient(cfg.url,cfg.anonKey);
   const {data:seller,error}=await client.from("sellers").select("id,store_name,slug,description,logo_url,country_code").eq("slug",slug).eq("status","active").maybeSingle();
   if(error||!seller){showStore(null,[]);return;}
   const {data,error:productError}=await client.from("products").select("id,slug,name,description,price_usd,compare_at_usd,image_urls,categories(name,slug)").eq("seller_id",seller.id).eq("status","active").order("created_at",{ascending:false});
   if(productError)throw productError;showStore(seller,data||[]);
  }).catch(()=>showStore(null,[]));
 }

});