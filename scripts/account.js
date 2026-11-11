import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config=window.BETHS_SUPABASE_CONFIG||{};
const configured=Boolean(config.url&&config.anonKey);
const $=selector=>document.querySelector(selector);
const show=(selector,visible)=>{const node=$(selector);if(node)node.hidden=!visible;};
const message=(selector,text,error=false)=>{const node=$(selector);if(!node)return;node.textContent=text||"";node.classList.toggle("error",Boolean(error));};
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value||0));
const year=$("#year");if(year)year.textContent=new Date().getFullYear();

if(!configured){
  show("#account-config-notice",true);
  $("#account-auth-form").querySelectorAll("input,button").forEach(control=>control.disabled=true);
  $("#account-signup").disabled=true;
  $("#account-reset").disabled=true;
}else boot();

async function boot(){
  const supabase=createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  $("#account-auth-form").addEventListener("submit",async event=>{
    event.preventDefault();message("#account-auth-message","Signing in…");
    const {error}=await supabase.auth.signInWithPassword({email:$("#account-email").value.trim(),password:$("#account-password").value});
    message("#account-auth-message",error?.message||"Signed in.",Boolean(error));
  });
  $("#account-signup").addEventListener("click",async()=>{
    const form=$("#account-auth-form");
    $("#account-password").setAttribute("autocomplete","new-password");
    if(!form.reportValidity())return;
    message("#account-auth-message","Creating account…");
    const {data,error}=await supabase.auth.signUp({email:$("#account-email").value.trim(),password:$("#account-password").value,options:{emailRedirectTo:location.origin+"/account.html"}});
    message("#account-auth-message",error?.message||(data.session?"Account created and signed in.":"Account created. Check your email to confirm it before signing in."),Boolean(error));
  });
  $("#account-reset").addEventListener("click",async()=>{
    const email=$("#account-email").value.trim();
    if(!email){message("#account-auth-message","Enter your email address first.",true);return;}
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/account.html"});
    message("#account-auth-message",error?.message||"If an account exists for that address, a reset email has been sent.",Boolean(error));
  });
  $("#account-signout").addEventListener("click",async()=>{
    const {error}=await supabase.auth.signOut();
    if(error)message("#customer-message",error.message,true);
  });
  $("#customer-profile-form").addEventListener("submit",saveProfile);
  supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>render(session),0);});
  await render((await supabase.auth.getSession()).data.session);

  async function render(session){
    show("#account-auth",!session);show("#customer-workspace",Boolean(session));
    if(!session)return;
    $("#customer-email").textContent=session.user.email||"Signed-in account";
    message("#customer-message","Loading your account…");
    await Promise.all([loadProfile(session.user),loadFavorites(session.user),loadOrders()]);
    message("#customer-message","Your account is ready. Saved products and profile details are private to your account.");
  }

  async function loadProfile(user){
    const {data,error}=await supabase.from("profiles").select("display_name,country_code").eq("id",user.id).maybeSingle();
    if(error){message("#customer-message",error.message,true);return;}
    $("#customer-display-name").value=data?.display_name||"";
    $("#customer-country").value=data?.country_code||"";
  }

  async function saveProfile(event){
    event.preventDefault();
    const user=(await supabase.auth.getUser()).data.user;
    if(!user){message("#customer-message","Please sign in again.",true);return;}
    const countryCode=$("#customer-country").value.trim().toUpperCase();
    if(countryCode&&!/^[A-Z]{2}$/.test(countryCode)){message("#customer-message","Enter a valid two-letter country code, such as US, NG or GB.",true);return;}
    $("#customer-country").value=countryCode;
    const payload={id:user.id,display_name:$("#customer-display-name").value.trim()||null,country_code:countryCode||null};
    const {data:existing,error:lookupError}=await supabase.from("profiles").select("id").eq("id",user.id).maybeSingle();
    if(lookupError){message("#customer-message",lookupError.message,true);return;}
    const {error}=existing
      ?await supabase.from("profiles").update({display_name:payload.display_name,country_code:payload.country_code}).eq("id",user.id)
      :await supabase.from("profiles").insert(payload);
    message("#customer-message",error?.message||"Profile saved.",Boolean(error));
  }

  async function loadFavorites(user){
    const local=(()=>{try{return JSON.parse(localStorage.getItem("beths-preview-wishlist")||"[]")}catch{return []}})();
    const liveIds=[...new Set(local.filter(id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)))];
    if(liveIds.length){
      const rows=liveIds.map(product_id=>({user_id:user.id,product_id}));
      const {error}=await supabase.from("favorites").upsert(rows,{onConflict:"user_id,product_id",ignoreDuplicates:true});
      if(error)message("#customer-message","Some locally saved products could not be synced: "+error.message,true);
    }
    const {data:favorites,error}=await supabase.from("favorites").select("product_id").eq("user_id",user.id);
    if(error){$("#customer-favorites").textContent=error.message;return;}
    const ids=(favorites||[]).map(item=>item.product_id);
    if(!ids.length){$("#customer-favorites").innerHTML='<p class="empty-cell">No live seller products saved yet. Use the heart on an approved seller listing while signed in, then visit this page to sync it.</p>';return;}
    const {data:products, error:productError}=await supabase.from("products").select("id,name,slug,price_usd,image_urls").in("id",ids).eq("status","active");
    if(productError){$("#customer-favorites").textContent=productError.message;return;}
    $("#customer-favorites").innerHTML=products?.length?products.map(product=>'<div class="account-favorite"><img src="'+escapeHtml(product.image_urls?.[0]||"assets/beths-mark.svg")+'" alt=""><div><a href="product.html?slug='+encodeURIComponent(product.slug)+'">'+escapeHtml(product.name)+'</a><strong>'+money(product.price_usd)+'</strong></div><button type="button" class="table-action danger" data-remove-favorite="'+product.id+'">Remove</button></div>').join(""):'<p class="empty-cell">Your saved listings are no longer active or available.</p>';
    $("#customer-favorites").querySelectorAll("[data-remove-favorite]").forEach(button=>button.addEventListener("click",async()=>{
      const {error}=await supabase.from("favorites").delete().eq("user_id",user.id).eq("product_id",button.dataset.removeFavorite);
      if(error){message("#customer-message",error.message,true);return;}
      await loadFavorites(user);
    }));
  }

  async function loadOrders(){
    const {data,error}=await supabase.from("orders").select("id,order_number,status,grand_total,currency,created_at").order("created_at",{ascending:false}).limit(50);
    if(error){$("#customer-orders").innerHTML='<tr><td colspan="4">'+escapeHtml(error.message)+'</td></tr>';return;}
    $("#customer-orders").innerHTML=data?.length?data.map(order=>'<tr><td>'+escapeHtml(order.order_number)+'</td><td>'+new Date(order.created_at).toLocaleDateString()+'</td><td><span class="status-pill">'+escapeHtml(order.status.replaceAll("_"," "))+'</span></td><td>'+money(order.grand_total)+'</td></tr>').join(""):'<tr><td class="empty-cell" colspan="4">No orders yet. Order history will appear here after checkout is introduced.</td></tr>';
  }
}
